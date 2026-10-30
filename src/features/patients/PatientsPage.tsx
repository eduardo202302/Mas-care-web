import { useMemo, useState, type ReactNode } from 'react'
import { ExportButton } from '@/components/ExportButton'
import { ImportButton } from '@/components/ImportButton'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, CalendarDays, Plus, Search, UserRound } from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { CustomPropertyFilter } from '@/components/CustomFields'
import { ColumnPicker, SortEditor } from '@/features/board/CycleTableControls'
import {
  useColumnPrefs,
  type ColumnDef,
  type SortPart,
} from '@/lib/cycle-table'
import { Pagination } from '@/components/Pagination'
import { formatPhone } from '@/lib/phone'
import { Dialog } from '@/components/ui/Dialog'
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
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { TextField } from '@/components/ui/TextField'
import { useActiveBranch } from '@/lib/active-branch'
import { api } from '@/lib/http'
import { formatCustomValue, useCustomProperties } from '@/lib/custom-properties'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan, useMe } from '@/lib/permissions'
import { compareValues } from '@/lib/table-sort'
import type { components, paths } from '@/lib/api-types'
import type { PatientFormValues } from '@/schemas/patient'
import { PatientForm } from './PatientForm'

type PatientList =
  paths['/api/v1/patients']['get']['responses'][200]['content']['application/json']
type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type SavedViewList =
  paths['/api/v1/saved-views']['get']['responses'][200]['content']['application/json']
type PatientCreateResult =
  paths['/api/v1/patients']['post']['responses'][201]['content']['application/json']
type PatientQuery = NonNullable<
  paths['/api/v1/patients']['get']['parameters']['query']
> &
  Record<string, string | number | boolean | undefined>

const patientColumns: ColumnDef[] = [
  { key: 'branch', label: 'Sucursal' },
  { key: 'name', label: 'Paciente' },
  { key: 'contact', label: 'WhatsApp' },
  { key: 'document', label: 'ID' },
  { key: 'status', label: 'Estado' },
  { key: 'created', label: 'Creado' },
]

const patientSortFields = [
  { value: 'full_name', label: 'Nombre' },
  { value: 'created_at', label: 'Fecha de creación' },
  { value: 'document_id', label: 'Documento' },
  { value: 'birth_date', label: 'Fecha de nacimiento' },
]

/** Column keys that map to a backend-sortable field; columns without an entry sort client-side (current page only). */
const columnSortField: Record<string, string> = {
  name: 'full_name',
  document: 'document_id',
  created: 'created_at',
}

const dateFilterLabels = [
  ['created_from', 'created_to', 'Creación'],
  ['activity_from', 'activity_to', 'Última actividad'],
  ['expected_from', 'expected_to', 'Fecha prevista'],
  ['coverage_from', 'coverage_to', 'Fin de cobertura'],
] as const

function queryString(query: PatientQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return params.toString()
}

function stringFilter(
  filters: components['schemas']['SavedView']['filters'],
  key: string,
) {
  const value = filters[key]
  return typeof value === 'string' ? value : ''
}

function activeFilterCount(
  responsibleUserId: string,
  archived: string,
  dates: Record<string, string>,
  sort: SortPart[],
) {
  const dateCount = Object.entries(dates).filter(
    ([key, value]) => value && key !== 'cp_value',
  ).length
  return (
    (responsibleUserId ? 1 : 0) +
    (archived === 'true' ? 1 : 0) +
    dateCount +
    (sort.length ? 1 : 0)
  )
}

export default function PatientsPage() {
  const canCreate = useCan('patients:write')
  const canUpdate = useCan('patients:write')
  const canCreateTreatments = useCan('treatments:write')
  const { data: me } = useMe()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [responsibleUserId, setResponsibleUserId] = useState('')
  const [archived, setArchived] = useState<'true' | 'false'>('false')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<
    components['schemas']['Patient'] | null
  >(null)
  const [viewName, setViewName] = useState('')
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedView, setSelectedView] = useState('')
  const [dates, setDates] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<SortPart[]>([])
  const [clientSort, setClientSort] = useState<{
    key: string
    dir: 'asc' | 'desc'
  } | null>(null)
  const sortedField = sort.length === 1 ? sort[0] : null
  const activeSortKey = sortedField
    ? Object.entries(columnSortField).find(
        ([, field]) => field === sortedField.field,
      )?.[0]
    : clientSort?.key
  const activeSortDir = sortedField
    ? sortedField.dir
    : (clientSort?.dir ?? null)
  const toggleColumnSort = (key: string) => {
    const dir =
      activeSortKey === key && activeSortDir === 'asc' ? 'desc' : 'asc'
    const field = columnSortField[key]
    if (field) {
      setSort([{ field, dir }])
      setClientSort(null)
    } else {
      setSort([])
      setClientSort({ key, dir })
    }
    setPage(1)
  }
  const [filterDraft, setFilterDraft] = useState<{
    responsibleUserId: string
    archived: 'true' | 'false'
    dates: Record<string, string>
    sort: SortPart[]
  } | null>(null)
  // Patient properties defined by the organization can be added as columns (key `custom:<key>`).
  const properties = useCustomProperties('patient').data?.data ?? []
  const allColumns = useMemo<ColumnDef[]>(
    () => [
      ...patientColumns,
      ...properties.map((property) => ({
        key: `custom:${property.key}`,
        label: property.label,
      })),
    ],
    [properties],
  )
  const columnPrefs = useColumnPrefs(
    'patients',
    allColumns,
    patientColumns.map((column) => column.key),
  )

  // Only the branch the user is working in is requested.
  const { branchId, ready: branchReady } = useActiveBranch()

  const branchesQuery = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const savedViews = useQuery({
    queryKey: ['saved-views', 'patients'],
    queryFn: () => api<SavedViewList>('/api/v1/saved-views?entity=patients'),
  })
  const filters = useMemo<PatientQuery>(
    () => ({
      q: search.trim() || undefined,
      branchId,
      responsibleUserId: responsibleUserId || undefined,
      archived,
      page,
      rows,
      ...dates,
      ...(sort.length
        ? { sort: sort.map((part) => `${part.field}:${part.dir}`).join(',') }
        : {}),
    }),
    [archived, branchId, dates, page, responsibleUserId, rows, search, sort],
  )
  const patients = useQuery({
    queryKey: ['patients', filters],
    queryFn: () => api<PatientList>(`/api/v1/patients?${queryString(filters)}`),
    enabled: branchReady,
  })
  const create = useMutation({
    mutationFn: (values: PatientFormValues) => {
      const body: components['schemas']['PatientCreate'] = {
        ...values,
        ...(values.documentId
          ? { documentId: values.documentId }
          : { documentId: null }),
        ...(values.birthDate
          ? { birthDate: values.birthDate }
          : { birthDate: null }),
        ...(values.phone ? { phone: values.phone } : { phone: null }),
        ...(values.email ? { email: values.email } : { email: null }),
        ...(values.address ? { address: values.address } : { address: null }),
        ...(values.zone ? { zone: values.zone } : { zone: null }),
        ...(values.careNotes
          ? { careNotes: values.careNotes }
          : { careNotes: null }),
        ...(values.responsibleUserId
          ? { responsibleUserId: values.responsibleUserId }
          : { responsibleUserId: null }),
      }
      return api<PatientCreateResult>('/api/v1/patients', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      setPage(1)
      closeForm()
    },
  })
  const update = useMutation({
    mutationFn: (values: PatientFormValues) => {
      if (!editing) throw new Error('Selecciona un paciente para editar.')
      const body: components['schemas']['PatientPatch'] = {
        ...values,
        documentId: values.documentId || null,
        birthDate: values.birthDate || null,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
        zone: values.zone || null,
        careNotes: values.careNotes || null,
        responsibleUserId: values.responsibleUserId || null,
      }
      return api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(editing.id)}`,
        { method: 'PATCH', body: JSON.stringify(body) },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      closeForm()
    },
  })
  const archivePatient = useMutation({
    mutationFn: (id: string) =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(id)}/archive`,
        { method: 'POST' },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })
  const createView = useMutation({
    mutationFn: () => {
      const body: components['schemas']['SavedViewCreate'] = {
        entity: 'patients',
        name: viewName.trim(),
        filters: { q: search.trim(), responsibleUserId, archived, dates },
        columns: columnPrefs.keys,
        sort: { parts: sort },
        isDefault: false,
      }
      return api<components['schemas']['SavedView']>('/api/v1/saved-views', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async (view) => {
      await queryClient.invalidateQueries({
        queryKey: ['saved-views', 'patients'],
      })
      setSelectedView(view.id)
      setViewDialog(false)
      setViewName('')
    },
  })
  const deleteView = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/saved-views/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['saved-views', 'patients'],
      })
      setSelectedView('')
    },
  })

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(patient: components['schemas']['Patient']) {
    setEditing(patient)
    setFormOpen(true)
  }
  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function applyView(id: string) {
    setSelectedView(id)
    const view = savedViews.data?.data.find((item) => item.id === id)
    if (!view) return
    const nextFilters = view.filters
    setSearch(stringFilter(nextFilters, 'q'))
    setResponsibleUserId(stringFilter(nextFilters, 'responsibleUserId'))
    setArchived(
      stringFilter(nextFilters, 'archived') === 'true' ? 'true' : 'false',
    )
    const savedDates = nextFilters.dates
    setDates(
      savedDates && typeof savedDates === 'object'
        ? (savedDates as Record<string, string>)
        : {},
    )
    const parts = (view.sort as { parts?: SortPart[] }).parts
    setSort(Array.isArray(parts) ? parts : [])
    setClientSort(null)
    if (view.columns.length) columnPrefs.save(view.columns)
    setPage(1)
  }

  const branchMap = new Map(
    (branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch]),
  )
  /** Sortable value for columns without a backend field; mirrors the row cells but returns a comparable primitive. */
  const sortValue = (
    key: string,
    patient: components['schemas']['Patient'],
  ): unknown => {
    switch (key) {
      case 'branch':
        return branchMap.get(patient.primaryBranchId)?.name ?? ''
      case 'contact':
        return patient.phone ?? ''
      case 'responsible':
        return patient.responsibleUserId
          ? patient.responsibleUserId === me?.user.id
            ? 'Yo'
            : 'Asignado'
          : ''
      case 'status':
        return patient.archivedAt ? 1 : 0
      default: {
        const property = properties.find((item) => `custom:${item.key}` === key)
        if (!property) return ''
        const custom =
          (patient as { customValues?: Record<string, unknown> })
            .customValues ?? {}
        return formatCustomValue(property, custom[property.key]) || ''
      }
    }
  }
  const rawPatients = patients.data?.data ?? []
  const displayPatients = clientSort
    ? [...rawPatients].sort(
        (a, b) =>
          (clientSort.dir === 'asc' ? 1 : -1) *
          compareValues(
            sortValue(clientSort.key, a),
            sortValue(clientSort.key, b),
          ),
      )
    : rawPatients
  const tableRows = displayPatients.map((patient) => {
    const branch = branchMap.get(patient.primaryBranchId)
    const cells: Record<string, ReactNode> = {
      name: (
        <span key="name" className="text-petroleo font-semibold">
          {patient.fullName}
        </span>
      ),
      contact: (
        <span key="contact" className="text-muted">
          {patient.phone ? formatPhone(patient.phone) : 'Sin WhatsApp'}
        </span>
      ),
      document: (
        <span key="document" className="text-muted font-mono text-xs">
          #{patient.numericId}
        </span>
      ),
      branch: branch ? (
        <BranchTag
          key="branch"
          name={branch.name}
          labelColor={branch.labelColor}
        />
      ) : (
        <span key="branch" className="text-muted">
          Sucursal
        </span>
      ),
      status: (
        <span key="archive" className="text-muted">
          {patient.archivedAt ? 'Archivado' : 'Activo'}
        </span>
      ),
      created: (
        <span key="created" className="text-muted">
          {patient.createdAt.slice(0, 10)}
        </span>
      ),
    }
    const custom =
      (patient as { customValues?: Record<string, unknown> }).customValues ?? {}
    for (const property of properties) {
      cells[`custom:${property.key}`] = (
        <span key={property.key} className="text-muted">
          {formatCustomValue(property, custom[property.key])}
        </span>
      )
    }
    return columnPrefs.keys.map((key) => cells[key])
  })
  const rowActions = displayPatients.map((patient) => (
    <RowActions
      key={patient.id}
      label={patient.fullName}
      deleteLabel="Archivar"
      onEdit={canUpdate ? () => openEdit(patient) : undefined}
      onDelete={
        canUpdate && !patient.archivedAt
          ? () => {
              if (window.confirm(`¿Archivar a ${patient.fullName}?`))
                archivePatient.mutate(patient.id)
            }
          : undefined
      }
    />
  ))

  const filterCount = activeFilterCount(
    responsibleUserId,
    archived,
    dates,
    sort,
  )
  const draftFilterCount = filterDraft
    ? activeFilterCount(
        filterDraft.responsibleUserId,
        filterDraft.archived,
        filterDraft.dates,
        filterDraft.sort,
      )
    : 0
  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []
    if (responsibleUserId)
      chips.push({
        key: 'responsible',
        label: 'Responsable',
        value: responsibleUserId,
      })
    if (archived === 'true')
      chips.push({ key: 'archived', label: 'Estado', value: 'Archivados' })
    for (const [from, to, label] of dateFilterLabels) {
      if (dates[from])
        chips.push({ key: from, label: `${label} desde`, value: dates[from] })
      if (dates[to])
        chips.push({ key: to, label: `${label} hasta`, value: dates[to] })
    }
    if (dates.cp_key)
      chips.push({
        key: 'cp',
        label: 'Propiedad',
        value: dates.cp_value || dates.cp_key,
      })
    if (sort.length)
      chips.push({
        key: 'sort',
        label: 'Orden',
        value: sort.map((part) => `${part.field} ${part.dir}`).join(', '),
      })
    return chips
  }, [archived, dates, responsibleUserId, sort])

  function removeFilterChip(key: string) {
    if (key === 'responsible') setResponsibleUserId('')
    else if (key === 'archived') setArchived('false')
    else if (key === 'sort') setSort([])
    else if (key === 'cp')
      setDates(
        Object.fromEntries(
          Object.entries(dates).filter(
            ([name]) => name !== 'cp_key' && name !== 'cp_value',
          ),
        ),
      )
    else setDates({ ...dates, [key]: '' })
    setPage(1)
  }

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Pacientes"
        subtitle="Consulta y organiza a las personas que acompañas."
        actions={
          <>
            <div className="flex flex-wrap gap-2">
              <ImportButton entity="patients" />
              {canCreateTreatments && (
                <ImportButton
                  entity="treatments"
                  label="Importar tratamientos"
                />
              )}
              <ExportButton
                entity="patients"
                filters={{ q: search.trim(), branchId }}
              />
              {canCreate && (
                <Button variant="primary" onClick={openCreate}>
                  <Plus className="size-4" />
                  Nuevo paciente
                </Button>
              )}
            </div>
          </>
        }
      />
      <FilterBarRow aria-label="Filtros de pacientes">
        <label className="relative min-w-[220px] flex-1">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar pacientes"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre, documento o teléfono"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() =>
            setFilterDraft({ responsibleUserId, archived, dates, sort })
          }
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ColumnPicker
            keys={columnPrefs.keys}
            onChange={columnPrefs.save}
            saving={columnPrefs.saving}
            all={allColumns}
          />
          <label className="text-muted text-sm" htmlFor="saved-patient-view">
            Vistas
          </label>
          <select
            id="saved-patient-view"
            value={selectedView}
            onChange={(event) => applyView(event.target.value)}
            className="border-border h-10 w-52 rounded-lg border bg-white px-3 text-sm"
          >
            <option value="">Mis pacientes · vista actual</option>
            {(savedViews.data?.data ?? []).map((view) => (
              <option key={view.id} value={view.id}>
                {view.name}
              </option>
            ))}
          </select>
          {selectedView && (
            <Button
              aria-label="Borrar vista seleccionada"
              variant="ghost"
              className="h-10 px-2 text-red-700"
              onClick={() => deleteView.mutate(selectedView)}
            >
              <Archive className="size-4" />
              Borrar vista
            </Button>
          )}
          <Button className="h-10" onClick={() => setViewDialog(true)}>
            Guardar vista actual
          </Button>
        </div>
      </FilterBarRow>
      <ActiveFilterChips
        chips={activeFilterChips}
        onRemove={(key) => removeFilterChip(key)}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de pacientes."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft({
              responsibleUserId: '',
              archived: 'false',
              dates: {},
              sort: [],
            })
            setResponsibleUserId('')
            setArchived('false')
            setDates({})
            setSort([])
            setClientSort(null)
            setPage(1)
          }}
          clearDisabled={!filterCount && !draftFilterCount}
          onApply={() => {
            setResponsibleUserId(filterDraft.responsibleUserId)
            setArchived(filterDraft.archived)
            setDates(filterDraft.dates)
            setSort(filterDraft.sort)
            setClientSort(null)
            setPage(1)
            setFilterDraft(null)
          }}
        >
          <FilterField label="Estado" icon={<Archive className="size-4" />}>
            <select
              aria-label="Estado de la ficha"
              value={filterDraft.archived}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  archived: event.target.value as 'true' | 'false',
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="false">Activos</option>
              <option value="true">Archivados</option>
            </select>
          </FilterField>
          {dateFilterLabels.map(([from, to, label]) => (
            <div
              key={label}
              className="grid gap-3 sm:col-span-2 sm:grid-cols-2"
            >
              <FilterField
                label={`${label} desde`}
                icon={<CalendarDays className="size-4" />}
              >
                <input
                  type="date"
                  aria-label={`${label} desde`}
                  value={filterDraft.dates[from] ?? ''}
                  onChange={(event) =>
                    setFilterDraft({
                      ...filterDraft,
                      dates: {
                        ...filterDraft.dates,
                        [from]: event.target.value,
                      },
                    })
                  }
                  className={`${filterControlClass} pl-11`}
                />
              </FilterField>
              <FilterField
                label={`${label} hasta`}
                icon={<CalendarDays className="size-4" />}
              >
                <input
                  type="date"
                  aria-label={`${label} hasta`}
                  value={filterDraft.dates[to] ?? ''}
                  onChange={(event) =>
                    setFilterDraft({
                      ...filterDraft,
                      dates: { ...filterDraft.dates, [to]: event.target.value },
                    })
                  }
                  className={`${filterControlClass} pl-11`}
                />
              </FilterField>
            </div>
          ))}
          <div className="sm:col-span-2">
            <CustomPropertyFilter
              entity="patient"
              propertyKey={filterDraft.dates.cp_key}
              value={filterDraft.dates.cp_value}
              onChange={(next) => {
                const rest = Object.fromEntries(
                  Object.entries(filterDraft.dates).filter(
                    ([key]) => key !== 'cp_key' && key !== 'cp_value',
                  ),
                )
                setFilterDraft({
                  ...filterDraft,
                  dates: {
                    ...rest,
                    ...(next.cp_key ? { cp_key: next.cp_key } : {}),
                    ...(next.cp_value ? { cp_value: next.cp_value } : {}),
                  },
                })
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <SortEditor
              sort={filterDraft.sort}
              fields={patientSortFields}
              onChange={(next) =>
                setFilterDraft({ ...filterDraft, sort: next })
              }
            />
          </div>
        </AdvancedFilterDialog>
      )}
      {patients.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar los pacientes. {patients.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {patients.isFetching || !branchReady ? (
          <TableSkeleton columns={columnPrefs.keys.length} />
        ) : (
          <DataTable
            columns={columnPrefs.keys.map(
              (key) =>
                allColumns.find((column) => column.key === key)?.label ?? key,
            )}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={columnPrefs.keys.map((_, index) => index)}
            sort={
              activeSortKey
                ? {
                    index: columnPrefs.keys.findIndex(
                      (key) => key === activeSortKey,
                    ),
                    dir: activeSortDir ?? 'asc',
                  }
                : null
            }
            onSortChange={(index) => {
              const key = columnPrefs.keys[index]
              if (key) toggleColumnSort(key)
            }}
            onRowDoubleClick={(index) => {
              const patient = displayPatients[index]
              if (patient)
                navigate(`/pacientes/${encodeURIComponent(patient.id)}`)
            }}
            emptyTitle={
              archived === 'true'
                ? 'No hay pacientes archivados'
                : 'Todavía no hay pacientes'
            }
            emptyDescription={
              canCreate
                ? 'Crea una ficha para comenzar el seguimiento de tus pacientes.'
                : 'Cuando haya pacientes en tu organización, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={patients.data?.total ?? 0}
                onChange={setPage}
                onRowsChange={(next) => {
                  setRows(next)
                  setPage(1)
                }}
              />
            }
          />
        )}
      </div>
      {formOpen && (editing ? canUpdate : canCreate) && (
        <Dialog
          title={editing ? 'Editar Paciente' : 'Nuevo Paciente'}
          description={
            editing
              ? 'Actualiza los datos de la ficha.'
              : 'Registra sus datos de contacto y atención.'
          }
          icon={<UserRound className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeForm}
          size="lg"
        >
          <PatientForm
            key={editing?.id ?? 'new'}
            patient={editing ?? undefined}
            branches={branchesQuery.data?.data ?? []}
            onSave={(values) =>
              (editing ? update : create)
                .mutateAsync(values)
                .then(() => undefined)
            }
            submitting={editing ? update.isPending : create.isPending}
            onCancel={closeForm}
          />
        </Dialog>
      )}
      {viewDialog && (
        <Dialog
          title="Guardar vista"
          description="Conserva estos filtros para volver a ellos."
          onClose={() => setViewDialog(false)}
        >
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              createView.mutate()
            }}
          >
            <TextField
              label="Nombre de la vista"
              value={viewName}
              onChange={(event) => setViewName(event.target.value)}
              required
              placeholder="Mis pacientes"
            />
            {createView.isError && (
              <p role="alert" className="text-sm text-red-700">
                {createView.error.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setViewDialog(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createView.isPending}
              >
                Guardar vista
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}
