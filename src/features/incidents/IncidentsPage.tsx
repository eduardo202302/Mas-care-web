import { useEffect, useMemo, useState } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Activity,
  Building2,
  CalendarDays,
  FileText,
  Plus,
  Search,
  TriangleAlert,
  User,
  UserRound,
} from 'lucide-react'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  filterControlClass,
  type ActiveFilterChip,
} from '@/components/ui/AdvancedFilter'
import { PageHeader } from '@/components/ui/PageHeader'
import { useToast } from '@/components/ui/Toast'
import { KanbanBoard, type KanbanMove } from '@/components/kanban/KanbanBoard'
import { api } from '@/lib/http'
import { useCan, useMe } from '@/lib/permissions'
import {
  incidentColumnLabels,
  incidentColumns,
  incidentFiltersFromSearch,
  incidentFiltersToSearch,
  incidentQueryKey,
  incidentTypeLabels,
  incidentTypeOptions,
  type Incident,
  type IncidentFilters,
  type IncidentListResponse,
  type IncidentStatus,
} from '@/lib/incidents'
import type { paths } from '@/lib/api-types'
import { IncidentCard } from './IncidentCard'
import {
  AssignIncidentDialog,
  IncidentDetailDialog,
  ResolveIncidentDialog,
} from './IncidentDialogs'
import { IncidentFormDialog } from './IncidentFormDialog'

type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']

type IncidentExtraFilters = {
  status: '' | IncidentStatus
  description: string
  patient: string
  from: string
  to: string
}

const emptyExtra: IncidentExtraFilters = {
  status: '',
  description: '',
  patient: '',
  from: '',
  to: '',
}

const extraLabels: Record<keyof IncidentExtraFilters, string> = {
  status: 'Estado',
  description: 'Descripción',
  patient: 'Paciente',
  from: 'Creada desde',
  to: 'Creada hasta',
}

function uniqueSorted(
  values: (string | null | undefined)[],
  ...selected: string[]
) {
  const set = new Set(values.filter((value): value is string => !!value))
  for (const value of selected) if (value) set.add(value)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

function incidentsPath(
  status: IncidentStatus,
  filters: IncidentFilters,
  cursor?: string,
) {
  const params = incidentFiltersToSearch(filters)
  params.set('status', status)
  params.set('limit', '30')
  if (cursor) params.set('cursor', cursor)
  return `/api/v1/incidents?${params.toString()}`
}

export default function IncidentsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: me } = useMe()
  const canMove = useCan('incident:move')
  const canResolve = useCan('incident:resolve')
  const canCreate = useCan('incident:create')

  const filters = useMemo(
    () => incidentFiltersFromSearch(searchParams),
    [searchParams],
  )
  const privileged = me?.allBranches === true
  const branches = me?.branches ?? []
  const lockedBranch =
    !privileged && branches.length === 1 ? branches[0]?.id : undefined
  const defaultBranch =
    !privileged && branches.length > 0 ? branches[0]?.id : undefined
  const effectiveFilters = useMemo<IncidentFilters>(
    () => ({
      ...filters,
      branch_id: filters.branch_id ?? lockedBranch ?? defaultBranch,
    }),
    [defaultBranch, filters, lockedBranch],
  )
  const branchReady =
    Boolean(me) &&
    (privileged || branches.length === 0 || Boolean(effectiveFilters.branch_id))

  useEffect(() => {
    const wanted = lockedBranch ?? defaultBranch
    if (!me || privileged || !wanted || searchParams.get('branch_id')) return
    const next = new URLSearchParams(searchParams)
    next.set('branch_id', wanted)
    setSearchParams(next, { replace: true })
  }, [
    defaultBranch,
    lockedBranch,
    me,
    privileged,
    searchParams,
    setSearchParams,
  ])

  const users = useQuery({
    queryKey: ['users', 'incidents-filter'],
    queryFn: () => api<UserList>('/api/v1/users?limit=100'),
  })

  const newIncidents = useInfiniteQuery({
    queryKey: incidentQueryKey('new', effectiveFilters),
    queryFn: ({ pageParam }) =>
      api<IncidentListResponse>(
        incidentsPath('new', effectiveFilters, pageParam || undefined),
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: branchReady,
  })
  const inProgressIncidents = useInfiniteQuery({
    queryKey: incidentQueryKey('in_progress', effectiveFilters),
    queryFn: ({ pageParam }) =>
      api<IncidentListResponse>(
        incidentsPath('in_progress', effectiveFilters, pageParam || undefined),
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: branchReady,
  })
  const resolvedIncidents = useInfiniteQuery({
    queryKey: incidentQueryKey('resolved', effectiveFilters),
    queryFn: ({ pageParam }) =>
      api<IncidentListResponse>(
        incidentsPath('resolved', effectiveFilters, pageParam || undefined),
      ),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: branchReady,
  })

  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [filterDraft, setFilterDraft] = useState<IncidentFilters | null>(null)
  // La API no filtra por estado, texto ni fecha: se aplican a las tarjetas cargadas.
  const [extra, setExtra] = useState<IncidentExtraFilters>(emptyExtra)
  const [extraDraft, setExtraDraft] = useState<IncidentExtraFilters>(emptyExtra)
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null)
  const [assignTarget, setAssignTarget] = useState<Incident | null>(null)
  const [detailTarget, setDetailTarget] = useState<Incident | null>(null)

  const incidentParam = searchParams.get('incident')
  const linkedIncident = useQuery({
    queryKey: ['incidents', 'detail', incidentParam],
    queryFn: () =>
      api<Incident>(
        `/api/v1/incidents/${encodeURIComponent(incidentParam ?? '')}`,
      ),
    enabled: Boolean(incidentParam),
  })

  useEffect(() => {
    if (linkedIncident.data) setDetailTarget(linkedIncident.data)
  }, [linkedIncident.data])

  function closeDetail() {
    setDetailTarget(null)
    if (incidentParam) {
      const next = new URLSearchParams(searchParams)
      next.delete('incident')
      setSearchParams(next, { replace: true })
    }
  }

  const move = useMutation({
    mutationFn: (variables: {
      incident: Incident
      to: IncidentStatus
      afterId: string | null
      beforeId: string | null
    }) =>
      api<Incident>(
        `/api/v1/incidents/${encodeURIComponent(variables.incident.id)}/move`,
        {
          method: 'POST',
          body: JSON.stringify({
            to_status: variables.to,
            after_id: variables.afterId,
            before_id: variables.beforeId,
          }),
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  function updateFilters(next: IncidentFilters) {
    const params = incidentFiltersToSearch(next, searchParams)
    setSearchParams(params, { replace: true })
  }

  function handleMove(moveRequest: KanbanMove<Incident>) {
    if (moveRequest.to === 'resolved') {
      setResolveTarget(moveRequest.item)
      return
    }
    move.mutate({
      incident: moveRequest.item,
      to: moveRequest.to as IncidentStatus,
      afterId: moveRequest.afterId,
      beforeId: moveRequest.beforeId,
    })
  }

  // La API no tiene `q`: la búsqueda se aplica a las tarjetas ya cargadas.
  const needle = search.trim().toLowerCase()
  const loadedIncidents = [
    newIncidents,
    inProgressIncidents,
    resolvedIncidents,
  ].flatMap((query) => query.data?.pages.flatMap((page) => page.data) ?? [])
  const descriptionOptions = uniqueSorted(
    loadedIncidents.map((incident) => incident.description),
    extra.description,
    extraDraft.description,
  )
  const patientOptions = uniqueSorted(
    loadedIncidents.map((incident) => incident.patient?.fullName),
    extra.patient,
    extraDraft.patient,
  )
  const matchesExtra = (incident: Incident) => {
    const created = new Date(incident.createdAt).toLocaleDateString('en-CA')
    return (
      (!extra.status || incident.status === extra.status) &&
      (!extra.description || incident.description === extra.description) &&
      (!extra.patient || incident.patient?.fullName === extra.patient) &&
      (!extra.from || created >= extra.from) &&
      (!extra.to || created <= extra.to)
    )
  }
  const matchSearch = (all: Incident[]) => {
    const cards = all.filter(matchesExtra)
    return needle
      ? cards.filter((incident) =>
          [
            incident.description,
            incident.patient?.fullName,
            incident.branch?.name,
            incident.assignee?.name,
            incidentTypeLabels[incident.type],
          ]
            .join(' ')
            .toLowerCase()
            .includes(needle),
        )
      : cards
  }
  const datasets: Record<
    IncidentStatus,
    { cards: Incident[]; hasMore: boolean; loading: boolean; more: () => void }
  > = {
    new: {
      cards: matchSearch(
        newIncidents.data?.pages.flatMap((page) => page.data) ?? [],
      ),
      hasMore: Boolean(newIncidents.hasNextPage),
      loading: newIncidents.isFetchingNextPage,
      more: () => void newIncidents.fetchNextPage(),
    },
    in_progress: {
      cards: matchSearch(
        inProgressIncidents.data?.pages.flatMap((page) => page.data) ?? [],
      ),
      hasMore: Boolean(inProgressIncidents.hasNextPage),
      loading: inProgressIncidents.isFetchingNextPage,
      more: () => void inProgressIncidents.fetchNextPage(),
    },
    resolved: {
      cards: matchSearch(
        resolvedIncidents.data?.pages.flatMap((page) => page.data) ?? [],
      ),
      hasMore: Boolean(resolvedIncidents.hasNextPage),
      loading: resolvedIncidents.isFetchingNextPage,
      more: () => void resolvedIncidents.fetchNextPage(),
    },
  }

  const isLoading =
    newIncidents.isLoading ||
    inProgressIncidents.isLoading ||
    resolvedIncidents.isLoading
  const error =
    newIncidents.error ?? inProgressIncidents.error ?? resolvedIncidents.error
  const total = incidentColumns.reduce(
    (sum, status) => sum + datasets[status].cards.length,
    0,
  )
  const hasFilters = Boolean(
    filters.branch_id || filters.type || filters.assigned_to,
  )
  const extraKeys = Object.keys(emptyExtra) as (keyof IncidentExtraFilters)[]
  const filterCount =
    [filters.branch_id, filters.type, filters.assigned_to].filter(Boolean)
      .length + extraKeys.filter((key) => extra[key]).length
  const draftHasFilters = filterDraft
    ? Boolean(
        filterDraft.branch_id || filterDraft.type || filterDraft.assigned_to,
      ) || extraKeys.some((key) => extraDraft[key])
    : false
  const extraValue = (key: keyof IncidentExtraFilters) =>
    key === 'status' && extra.status
      ? incidentColumnLabels[extra.status]
      : extra[key]
  function filterChipValue(key: 'branch_id' | 'type' | 'assigned_to') {
    if (key === 'branch_id')
      return branches.find((b) => b.id === filters.branch_id)?.name ?? '—'
    if (key === 'type')
      return (
        incidentTypeOptions.find((o) => o.value === filters.type)?.label ?? '—'
      )
    return (
      users.data?.data.find((u) => u.id === filters.assigned_to)?.name ?? '—'
    )
  }
  const activeFilterChips: ActiveFilterChip[] = [
    ...(
      [
        ['branch_id', 'Sucursal'],
        ['type', 'Tipo'],
        ['assigned_to', 'Responsable'],
      ] as const
    )
      .filter(([key]) => Boolean(filters[key]))
      .map(([key, label]) => ({
        key,
        label,
        value: filterChipValue(key),
      })),
    ...extraKeys
      .filter((key) => extra[key])
      .map((key) => ({
        key,
        label: extraLabels[key],
        value: extraValue(key),
      })),
  ]

  return (
    <div className="animate-in">
      <PageHeader
        title="Incidencias"
        subtitle="Nueva → En curso → Resuelta. Para resolver una incidencia se exige una resolución escrita."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nueva incidencia
            </Button>
          )
        }
      />

      <FilterBarRow aria-label="Filtros de incidencias">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar incidencias"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Descripción, paciente, sucursal o responsable"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => {
            setFilterDraft({ ...filters })
            setExtraDraft(extra)
          }}
        />
        <TableToolbarActions
          title="Incidencias"
          filename="incidencias"
          branchScoped
          headers={[
            'Estado',
            'Tipo',
            'Descripción',
            'Paciente',
            'Sucursal',
            'Responsable',
            'Creada',
          ]}
          rows={incidentColumns.flatMap((status) =>
            datasets[status].cards.map((incident) => [
              incidentColumnLabels[status],
              incidentTypeLabels[incident.type],
              incident.description,
              incident.patient?.fullName ?? '',
              incident.branch?.name ?? '',
              incident.assignee?.name ?? '',
              new Date(incident.createdAt).toLocaleString('es'),
            ]),
          )}
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={activeFilterChips}
        onRemove={(key) => {
          if (key === 'branch_id' || key === 'type' || key === 'assigned_to')
            updateFilters({ ...filters, [key]: undefined })
          else setExtra((current) => ({ ...current, [key]: '' }))
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar el pipeline."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft({})
            setExtraDraft(emptyExtra)
            setExtra(emptyExtra)
            updateFilters({})
          }}
          clearDisabled={!filterCount && !hasFilters && !draftHasFilters}
          onApply={() => {
            updateFilters(filterDraft)
            setExtra(extraDraft)
            setFilterDraft(null)
          }}
        >
          <FilterField label="Sucursal" icon={<Building2 className="size-4" />}>
            <select
              aria-label="Sucursal"
              value={filterDraft.branch_id ?? ''}
              disabled={Boolean(lockedBranch)}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  branch_id: event.target.value || undefined,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {privileged && <option value="">Todas las sucursales</option>}
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Tipo" icon={<TriangleAlert className="size-4" />}>
            <select
              aria-label="Tipo de incidencia"
              value={filterDraft.type ?? ''}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  type: (event.target.value ||
                    undefined) as IncidentFilters['type'],
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {incidentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Responsable" icon={<User className="size-4" />}>
            <select
              aria-label="Responsable"
              value={filterDraft.assigned_to ?? ''}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  assigned_to: event.target.value || undefined,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {(users.data?.data ?? []).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Estado" icon={<Activity className="size-4" />}>
            <select
              aria-label="Estado de la incidencia"
              value={extraDraft.status}
              onChange={(event) =>
                setExtraDraft({
                  ...extraDraft,
                  status: event.target.value as IncidentExtraFilters['status'],
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {incidentColumns.map((status) => (
                <option key={status} value={status}>
                  {incidentColumnLabels[status]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField
            label="Descripción"
            icon={<FileText className="size-4" />}
          >
            <select
              aria-label="Descripción de la incidencia"
              value={extraDraft.description}
              onChange={(event) =>
                setExtraDraft({
                  ...extraDraft,
                  description: event.target.value,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {descriptionOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Paciente" icon={<UserRound className="size-4" />}>
            <select
              aria-label="Paciente de la incidencia"
              value={extraDraft.patient}
              onChange={(event) =>
                setExtraDraft({ ...extraDraft, patient: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {patientOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField
            label="Creada desde"
            icon={<CalendarDays className="size-4" />}
          >
            <input
              type="date"
              aria-label="Creada desde"
              value={extraDraft.from}
              onChange={(event) =>
                setExtraDraft({ ...extraDraft, from: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
          <FilterField
            label="Creada hasta"
            icon={<CalendarDays className="size-4" />}
          >
            <input
              type="date"
              aria-label="Creada hasta"
              value={extraDraft.to}
              onChange={(event) =>
                setExtraDraft({ ...extraDraft, to: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
        </AdvancedFilterDialog>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <TriangleAlert className="size-4" />
          No pudimos cargar las incidencias. {error.message}
        </div>
      )}

      {isLoading || !branchReady ? (
        <div className="flex gap-4" role="status" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-border w-[min(85vw,320px)] shrink-0 rounded-xl border bg-white p-3 xl:w-auto xl:flex-1"
            >
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-3 h-36 w-full" />
              <Skeleton className="mt-3 h-36 w-full" />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="Sin incidencias"
          description="Cuando se cree una incidencia o falten existencias, aparecerá en este pipeline."
        />
      ) : (
        <KanbanBoard<Incident>
          columns={incidentColumns.map((status) => ({
            key: status,
            title: incidentColumnLabels[status],
            cards: datasets[status].cards,
            droppable: true,
            hasMore: datasets[status].hasMore,
            loadingMore: datasets[status].loading,
            onLoadMore: datasets[status].more,
            emptyText:
              status === 'resolved'
                ? 'Aún no hay incidencias resueltas.'
                : 'Sin incidencias en esta columna.',
          }))}
          getId={(incident) => incident.id}
          getLabel={(incident) => incident.description.slice(0, 60)}
          canDragItem={(incident, columnKey) =>
            canMove &&
            incident.status !== 'resolved' &&
            (columnKey !== 'resolved' || canResolve)
          }
          onMove={handleMove}
          testIdPrefix="incidents"
          ariaLabel="Pipeline de incidencias"
          renderCard={(incident, options) => (
            <IncidentCard
              incident={incident}
              canMove={canMove}
              canResolve={canResolve}
              dragHandleProps={options.dragHandleProps}
              onResolve={() => setResolveTarget(incident)}
              onAssign={() => setAssignTarget(incident)}
              onOpen={() => setDetailTarget(incident)}
            />
          )}
        />
      )}

      {createOpen && (
        <IncidentFormDialog
          defaultBranchId={effectiveFilters.branch_id}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {resolveTarget && (
        <ResolveIncidentDialog
          incident={resolveTarget}
          onClose={() => setResolveTarget(null)}
        />
      )}
      {assignTarget && (
        <AssignIncidentDialog
          incident={assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}
      {detailTarget && (
        <IncidentDetailDialog incident={detailTarget} onClose={closeDetail} />
      )}
    </div>
  )
}
