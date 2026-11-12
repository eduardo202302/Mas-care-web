import { useMemo, useState, type ReactNode } from 'react'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  Building2,
  CalendarDays,
  ClipboardList,
  Hash,
  MapPin,
  Plus,
  Search,
  Stethoscope,
  Tag,
  UserRound,
} from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { CustomPropertyFilter } from '@/components/CustomFields'
import { type ColumnDef, type SortPart } from '@/lib/cycle-table'
import { Pagination } from '@/components/Pagination'
import { formatPhone } from '@/lib/phone'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
import { useActiveBranch } from '@/lib/active-branch'
import { api } from '@/lib/http'
import { formatCustomValue, useCustomProperties } from '@/lib/custom-properties'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan, useMe } from '@/lib/permissions'
import { compareValues } from '@/lib/table-sort'
import type { components, paths } from '@/lib/api-types'
import type { PatientFormValues } from '@/schemas/patient'
import { PatientForm } from './PatientForm'
import {
  buildPatientCreateBody,
  type PatientCreateResult,
} from './patientPayload'

type PatientList =
  paths['/api/v1/patients']['get']['responses'][200]['content']['application/json']
type PatientRow = PatientList['data'][number]
type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type PatientQuery = NonNullable<
  paths['/api/v1/patients']['get']['parameters']['query']
> &
  Record<string, string | number | boolean | undefined>

const patientColumns: ColumnDef[] = [
  { key: 'branch', label: 'Sucursal' },
  { key: 'document', label: 'ID' },
  { key: 'status', label: 'Estado' },
  { key: 'name', label: 'Paciente' },
  { key: 'treatmentsCount', label: 'Cat.Tratamiento' },
  { key: 'contact', label: 'WhatsApp' },
  { key: 'primaryCondition', label: 'Condición Principal' },
  { key: 'city', label: 'Ciudad' },
  { key: 'created', label: 'Creado' },
]

/** Column keys that map to a backend-sortable field; columns without an entry sort client-side (current page only). */
const columnSortField: Record<string, string> = {
  name: 'full_name',
  document: 'document_id',
  created: 'created_at',
}

const dateFilterLabels = [['created_from', 'created_to', 'Creación']] as const

/** Filtros por columna: el servidor no los admite, se aplican sobre la página cargada. */
type PatientColumnFilters = {
  id: string
  branch: string
  treatmentsMin: string
  condition: string
  city: string
  custom: Record<string, string>
}

const emptyColumnFilters: PatientColumnFilters = {
  id: '',
  branch: '',
  treatmentsMin: '',
  condition: '',
  city: '',
  custom: {},
}

const norm = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const contains = (value: string, needle: string) =>
  !needle.trim() || norm(value).includes(norm(needle.trim()))

const patientCity = (patient: PatientRow) =>
  (patient.addressDetails as { city?: string } | null)?.city ?? ''

function distinctOptions(
  values: (string | null | undefined)[],
  selected: string,
) {
  const set = new Set(values.filter((value): value is string => !!value))
  if (selected) set.add(selected)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

function columnFilterCount(columns: PatientColumnFilters) {
  return (
    [
      columns.id,
      columns.branch,
      columns.treatmentsMin,
      columns.condition,
      columns.city,
    ].filter(Boolean).length +
    Object.values(columns.custom).filter(Boolean).length
  )
}

function queryString(query: PatientQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return params.toString()
}

function activeFilterCount(
  responsibleUserId: string,
  archived: string,
  dates: Record<string, string>,
  columns: PatientColumnFilters,
) {
  const dateCount = Object.entries(dates).filter(
    ([key, value]) => value && key !== 'cp_value',
  ).length
  return (
    (responsibleUserId ? 1 : 0) +
    (archived === 'true' ? 1 : 0) +
    dateCount +
    columnFilterCount(columns)
  )
}

export default function PatientsPage() {
  const canCreate = useCan('patients:write')
  const canUpdate = useCan('patients:write')
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
  const [archiving, setArchiving] = useState<
    components['schemas']['Patient'] | null
  >(null)
  const [dates, setDates] = useState<Record<string, string>>({})
  const [columnFilters, setColumnFilters] =
    useState<PatientColumnFilters>(emptyColumnFilters)
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
    columns: PatientColumnFilters
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
  const columnKeys = useMemo(
    () => allColumns.map((column) => column.key),
    [allColumns],
  )

  // Only the branch the user is working in is requested.
  const { branchId, ready: branchReady } = useActiveBranch()

  const branchesQuery = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const conditionsQuery = useQuery({
    queryKey: ['health-conditions', 'patient-filter'],
    queryFn: () =>
      api<{ data: { id: string; name: string }[] }>(
        '/api/v1/health-conditions?isActive=true&page=1&rows=50',
      ),
  })
  const filters = useMemo<PatientQuery>(
    () => ({
      q: search.trim() || undefined,
      branchId: columnFilters.branch || branchId,
      responsibleUserId: responsibleUserId || undefined,
      archived,
      page,
      rows,
      ...dates,
      ...(sort.length
        ? { sort: sort.map((part) => `${part.field}:${part.dir}`).join(',') }
        : {}),
    }),
    [
      archived,
      branchId,
      columnFilters.branch,
      dates,
      page,
      responsibleUserId,
      rows,
      search,
      sort,
    ],
  )
  const patients = useQuery({
    queryKey: ['patients', filters],
    queryFn: () => api<PatientList>(`/api/v1/patients?${queryString(filters)}`),
    enabled: branchReady,
  })
  const create = useMutation({
    mutationFn: (values: PatientFormValues) => {
      const body = buildPatientCreateBody(values)
      return api<PatientCreateResult>('/api/v1/patients', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      setPage(1)
    },
  })
  const update = useMutation({
    mutationFn: (values: PatientFormValues) => {
      if (!editing) throw new Error('Selecciona un paciente para editar.')
      const { address, state, city, sector, latitude, longitude, ...rest } =
        values
      const body: components['schemas']['PatientPatch'] = {
        ...rest,
        addressDetails: {
          ...(address ? { address } : {}),
          ...(state ? { region: state } : {}),
          ...(city ? { city } : {}),
          ...(sector ? { sector } : {}),
          ...(latitude ? { latitude: Number(latitude) } : {}),
          ...(longitude ? { longitude: Number(longitude) } : {}),
        },
        documentId: values.documentId || null,
        birthDate: values.birthDate || null,
        phone: values.phone || null,
        email: values.email || null,
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
    },
  })
  const archivePatient = useMutation({
    mutationFn: (id: string) =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(id)}/archive`,
        { method: 'POST' },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      setArchiving(null)
    },
  })
  const restorePatient = useMutation({
    mutationFn: (id: string) =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(id)}/restore`,
        { method: 'POST' },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
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

  const branchMap = new Map(
    (branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch]),
  )
  /** Sortable value for columns without a backend field; mirrors the row cells but returns a comparable primitive. */
  const sortValue = (key: string, patient: PatientRow): unknown => {
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
      case 'primaryCondition':
        return patient.primaryConditionName ?? ''
      case 'treatmentsCount':
        return patient.treatmentsCount
      case 'city':
        return (patient.addressDetails as { city?: string } | null)?.city ?? ''
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
  const matchesColumns = (patient: PatientRow) => {
    const treatments = patient.treatmentsCount || 0
    const custom =
      (patient as { customValues?: Record<string, unknown> }).customValues ?? {}
    return (
      (!columnFilters.id || String(patient.numericId) === columnFilters.id) &&
      (!columnFilters.treatmentsMin ||
        treatments >= Number(columnFilters.treatmentsMin)) &&
      contains(patient.primaryConditionName ?? '', columnFilters.condition) &&
      contains(patientCity(patient), columnFilters.city) &&
      Object.entries(columnFilters.custom).every(([key, value]) => {
        if (!value) return true
        const property = properties.find((item) => item.key === key)
        return (
          !property || contains(formatCustomValue(property, custom[key]), value)
        )
      })
    )
  }
  const loadedPatients = patients.data?.data ?? []
  const rawPatients = loadedPatients.filter(matchesColumns)
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
      treatmentsCount: (
        <span key="treatmentsCount" className="text-muted block text-center">
          {patient.treatmentsCount || ''}
        </span>
      ),
      document: (
        <span key="document" className="text-muted font-mono text-xs">
          {patient.numericId}
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
      primaryCondition: (
        <span key="primaryCondition" className="text-muted">
          {patient.primaryConditionName || ''}
        </span>
      ),
      city: (
        <span key="city" className="text-muted">
          {(patient.addressDetails as { city?: string } | null)?.city || ''}
        </span>
      ),
      created: (
        <span key="created" className="text-muted">
          {new Date(patient.createdAt).toLocaleString('es', {
            dateStyle: 'short',
            timeStyle: 'short',
            hour12: true,
          })}
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
    return columnKeys.map((key) => cells[key])
  })
  const printRows = displayPatients.map((patient) => {
    const custom =
      (patient as { customValues?: Record<string, unknown> }).customValues ?? {}
    const cells: Record<string, string> = {
      branch: branchMap.get(patient.primaryBranchId)?.name ?? '',
      document: String(patient.numericId),
      status: patient.archivedAt ? 'Archivado' : 'Activo',
      name: patient.fullName,
      treatmentsCount: patient.treatmentsCount
        ? String(patient.treatmentsCount)
        : '',
      contact: patient.phone ? formatPhone(patient.phone) : 'Sin WhatsApp',
      primaryCondition: patient.primaryConditionName || '',
      city: (patient.addressDetails as { city?: string } | null)?.city || '',
      created: new Date(patient.createdAt).toLocaleString('es', {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: true,
      }),
    }
    for (const property of properties)
      cells[`custom:${property.key}`] = String(
        formatCustomValue(property, custom[property.key]) ?? '',
      )
    return columnKeys.map((key) => cells[key] ?? '')
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
              archivePatient.reset()
              setArchiving(patient)
            }
          : undefined
      }
      onRestore={
        canUpdate && patient.archivedAt
          ? () => restorePatient.mutate(patient.id)
          : undefined
      }
    />
  ))

  const filterCount = activeFilterCount(
    responsibleUserId,
    archived,
    dates,
    columnFilters,
  )
  const draftFilterCount = filterDraft
    ? activeFilterCount(
        filterDraft.responsibleUserId,
        filterDraft.archived,
        filterDraft.dates,
        filterDraft.columns,
      )
    : 0
  const branchOptions = branchesQuery.data?.data ?? []
  const setDraftColumn = (patch: Partial<PatientColumnFilters>) =>
    filterDraft &&
    setFilterDraft({
      ...filterDraft,
      columns: { ...filterDraft.columns, ...patch },
    })
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
    if (columnFilters.id)
      chips.push({ key: 'col:id', label: 'ID', value: columnFilters.id })
    if (columnFilters.branch)
      chips.push({
        key: 'col:branch',
        label: 'Sucursal',
        value:
          branchOptions.find((branch) => branch.id === columnFilters.branch)
            ?.name ?? columnFilters.branch,
      })
    if (columnFilters.treatmentsMin)
      chips.push({
        key: 'col:treatmentsMin',
        label: 'Cat.Tratamiento',
        value: columnFilters.treatmentsMin,
      })
    if (columnFilters.condition)
      chips.push({
        key: 'col:condition',
        label: 'Condiciones',
        value: columnFilters.condition,
      })
    if (columnFilters.city)
      chips.push({
        key: 'col:city',
        label: 'Ciudad',
        value: columnFilters.city,
      })
    for (const [key, value] of Object.entries(columnFilters.custom)) {
      if (value)
        chips.push({
          key: `col:custom:${key}`,
          label: properties.find((item) => item.key === key)?.label ?? key,
          value,
        })
    }
    if (sort.length)
      chips.push({
        key: 'sort',
        label: 'Orden',
        value: sort.map((part) => `${part.field} ${part.dir}`).join(', '),
      })
    return chips
  }, [
    archived,
    branchOptions,
    columnFilters,
    dates,
    properties,
    responsibleUserId,
    sort,
  ])

  function removeFilterChip(key: string) {
    if (key.startsWith('col:custom:')) {
      const customKey = key.slice('col:custom:'.length)
      setColumnFilters({
        ...columnFilters,
        custom: { ...columnFilters.custom, [customKey]: '' },
      })
    } else if (key.startsWith('col:'))
      setColumnFilters({ ...columnFilters, [key.slice(4)]: '' })
    else if (key === 'responsible') setResponsibleUserId('')
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
        <label className="relative w-full sm:w-[34rem]">
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
            setFilterDraft({
              responsibleUserId,
              archived,
              dates,
              sort,
              columns: columnFilters,
            })
          }
        />
        <TableToolbarActions
          title="Pacientes"
          filename="pacientes"
          branchScoped
          headers={columnKeys.map(
            (key) =>
              allColumns.find((column) => column.key === key)?.label ?? key,
          )}
          rows={printRows}
        />
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
              columns: emptyColumnFilters,
            })
            setResponsibleUserId('')
            setArchived('false')
            setDates({})
            setColumnFilters(emptyColumnFilters)
            setSort([])
            setClientSort(null)
            setPage(1)
          }}
          clearDisabled={!filterCount && !draftFilterCount}
          onApply={() => {
            setResponsibleUserId(filterDraft.responsibleUserId)
            setArchived(filterDraft.archived)
            setDates(filterDraft.dates)
            setColumnFilters(filterDraft.columns)
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
          <FilterField label="Sucursal" icon={<Building2 className="size-4" />}>
            <select
              aria-label="Sucursal del paciente"
              value={filterDraft.columns.branch}
              onChange={(event) =>
                setDraftColumn({ branch: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="ID" icon={<Hash className="size-4" />}>
            <input
              inputMode="numeric"
              aria-label="ID del paciente"
              value={filterDraft.columns.id}
              onChange={(event) =>
                setDraftColumn({ id: event.target.value.replace(/D/g, '') })
              }
              placeholder="Escribe el ID"
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
          <FilterField
            label="Cat.Tratamiento"
            icon={<ClipboardList className="size-4" />}
          >
            <input
              type="number"
              min={0}
              aria-label="Cat.Tratamiento"
              value={filterDraft.columns.treatmentsMin}
              onChange={(event) =>
                setDraftColumn({ treatmentsMin: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
          <FilterField
            label="Condiciones"
            icon={<Stethoscope className="size-4" />}
          >
            <select
              aria-label="Condiciones"
              value={filterDraft.columns.condition}
              onChange={(event) =>
                setDraftColumn({ condition: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {distinctOptions(
                [
                  ...(conditionsQuery.data?.data ?? []).map(
                    (item) => item.name,
                  ),
                  ...loadedPatients.map(
                    (patient) => patient.primaryConditionName,
                  ),
                ],
                filterDraft.columns.condition,
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Ciudad" icon={<MapPin className="size-4" />}>
            <select
              aria-label="Ciudad"
              value={filterDraft.columns.city}
              onChange={(event) => setDraftColumn({ city: event.target.value })}
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {distinctOptions(
                loadedPatients.map(patientCity),
                filterDraft.columns.city,
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterField>
          {properties.map((property) => {
            const selected = filterDraft.columns.custom[property.key] ?? ''
            return (
              <FilterField
                key={property.key}
                label={property.label}
                icon={<Tag className="size-4" />}
              >
                <select
                  aria-label={property.label}
                  value={selected}
                  onChange={(event) =>
                    setDraftColumn({
                      custom: {
                        ...filterDraft.columns.custom,
                        [property.key]: event.target.value,
                      },
                    })
                  }
                  className={`${filterControlClass} pl-11`}
                >
                  <option value="">Todos</option>
                  {distinctOptions(
                    property.options?.length
                      ? property.options
                      : loadedPatients.map((patient) =>
                          formatCustomValue(
                            property,
                            (
                              patient as {
                                customValues?: Record<string, unknown>
                              }
                            ).customValues?.[property.key],
                          ),
                        ),
                    selected,
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </FilterField>
            )
          })}
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
          <TableSkeleton columns={columnKeys.length} />
        ) : (
          <DataTable
            columns={columnKeys.map(
              (key) =>
                allColumns.find((column) => column.key === key)?.label ?? key,
            )}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={columnKeys.map((_, index) => index)}
            sort={
              activeSortKey
                ? {
                    index: columnKeys.findIndex((key) => key === activeSortKey),
                    dir: activeSortDir ?? 'asc',
                  }
                : null
            }
            onSortChange={(index) => {
              const key = columnKeys[index]
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
              editing
                ? update.mutateAsync(values).then(() => undefined)
                : create.mutateAsync(values).then((result) => result.patient.id)
            }
            submitting={editing ? update.isPending : create.isPending}
            onCancel={closeForm}
          />
        </Dialog>
      )}
      {archiving && (
        <ConfirmDialog
          title="Confirmar"
          description={
            <>
              ¿Está seguro que desea archivar a{' '}
              <strong>{archiving.fullName}</strong>?
              {archivePatient.isError && (
                <p role="alert" className="mt-3 text-sm text-red-800">
                  {archivePatient.error.message}
                </p>
              )}
            </>
          }
          confirmLabel="Archivar"
          confirming={archivePatient.isPending}
          onConfirm={() => archivePatient.mutate(archiving.id)}
          onClose={() => setArchiving(null)}
        />
      )}
    </div>
  )
}
