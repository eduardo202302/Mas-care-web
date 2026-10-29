import { useMemo, useState, type ReactNode } from 'react'
import { ExportButton } from '@/components/ExportButton'
import { ImportButton } from '@/components/ImportButton'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, Plus, Search } from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { CustomPropertyFilter } from '@/components/CustomFields'
import { ColumnPicker, SortEditor } from '@/features/board/CycleTableControls'
import { useColumnPrefs, type ColumnDef, type SortPart } from '@/lib/cycle-table'
import { Pagination } from '@/components/Pagination'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { TextField } from '@/components/ui/TextField'
import { useActiveBranch } from '@/lib/active-branch'
import { api } from '@/lib/http'
import { formatCustomValue, useCustomProperties } from '@/lib/custom-properties'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan, useMe } from '@/lib/permissions'
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
  { key: 'name', label: 'Paciente' },
  { key: 'contact', label: 'Contacto' },
  { key: 'document', label: 'Documento' },
  { key: 'branch', label: 'Sucursal' },
  { key: 'responsible', label: 'Responsable' },
  { key: 'status', label: 'Estado' },
  { key: 'created', label: 'Creado' },
]

const patientSortFields = [
  { value: 'full_name', label: 'Nombre' },
  { value: 'created_at', label: 'Fecha de creación' },
  { value: 'document_id', label: 'Documento' },
  { value: 'birth_date', label: 'Fecha de nacimiento' },
]

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
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<
    components['schemas']['Patient'] | null
  >(null)
  const [viewName, setViewName] = useState('')
  const [viewDialog, setViewDialog] = useState(false)
  const [selectedView, setSelectedView] = useState('')
  const [dates, setDates] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<SortPart[]>([])
  // Patient properties defined by the organization can be added as columns (key `custom:<key>`).
  const properties = useCustomProperties('patient').data?.data ?? []
  const allColumns = useMemo<ColumnDef[]>(
    () => [...patientColumns, ...properties.map((property) => ({ key: `custom:${property.key}`, label: property.label }))],
    [properties],
  )
  const columnPrefs = useColumnPrefs('patients', allColumns, patientColumns.map((column) => column.key))

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
      rows: PAGE_ROWS,
      ...dates,
      ...(sort.length
        ? { sort: sort.map((part) => `${part.field}:${part.dir}`).join(',') }
        : {}),
    }),
    [archived, branchId, dates, page, responsibleUserId, search, sort],
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
    if (view.columns.length) columnPrefs.save(view.columns)
    setPage(1)
  }

  const branchMap = new Map(
    (branchesQuery.data?.data ?? []).map((branch) => [branch.id, branch]),
  )
  const rows = (patients.data?.data ?? []).map((patient) => {
    const branch = branchMap.get(patient.primaryBranchId)
    const cells: Record<string, ReactNode> = {
      name: <span key="name" className="text-petroleo font-semibold">
        {patient.fullName}
      </span>,
      contact: <span key="contact" className="text-muted">
        {patient.phone || patient.email || 'Sin contacto'}
      </span>,
      document: <span key="document" className="text-muted">
        {patient.documentId || '—'}
      </span>,
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
      responsible: <span key="responsible" className="text-muted">
        {patient.responsibleUserId
          ? patient.responsibleUserId === me?.user.id
            ? 'Yo'
            : 'Asignado'
          : 'Sin responsable'}
      </span>,
      status: <span key="archive" className="text-muted">
        {patient.archivedAt ? 'Archivado' : 'Activo'}
      </span>,
      created: <span key="created" className="text-muted">{patient.createdAt.slice(0, 10)}</span>,
    }
    const custom = (patient as { customValues?: Record<string, unknown> }).customValues ?? {}
    for (const property of properties) {
      cells[`custom:${property.key}`] = <span key={property.key} className="text-muted">{formatCustomValue(property, custom[property.key])}</span>
    }
    return columnPrefs.keys.map((key) => cells[key])
  })
  const rowActions = (patients.data?.data ?? []).map((patient) => (
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

  return (
    <div className="animate-in">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">Atención</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Pacientes
          </h1>
          <p className="text-muted mt-2 text-sm">
            Consulta y organiza a las personas que acompañas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportButton entity="patients" />
          {canCreateTreatments && <ImportButton entity="treatments" label="Importar tratamientos" />}
          <ExportButton entity="patients" filters={{ q: search.trim(), branchId }} />
          {canCreate && (
            <Button variant="primary" onClick={openCreate}>
              <Plus className="size-4" />
              Nuevo paciente
            </Button>
          )}
        </div>
      </div>
      <section className="border-border mb-4 rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-56 flex-1">
            <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              aria-label="Buscar pacientes"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Nombre, documento o teléfono"
              className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none"
            />
          </label>

          <select
            aria-label="Filtrar por responsable"
            value={responsibleUserId}
            onChange={(event) => {
              setResponsibleUserId(event.target.value)
              setPage(1)
            }}
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
          >
            <option value="">Todos los responsables</option>
            {me && <option value={me.user.id}>Asignados a mí</option>}
          </select>
          <select
            aria-label="Filtrar archivados"
            value={archived}
            onChange={(event) => {
              setArchived(event.target.value as 'true' | 'false')
              setPage(1)
            }}
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
          >
            <option value="false">Activos</option>
            <option value="true">Archivados</option>
          </select>
        </div>
        <div className="border-border mt-3 grid gap-2 border-t pt-3 md:grid-cols-2 xl:grid-cols-4">
          {dateFilterLabels.map(([from, to, label]) => (
            <fieldset key={label} className="grid gap-1">
              <legend className="text-muted text-xs font-semibold">{label}</legend>
              <div className="flex gap-1">
                {[from, to].map((key, index) => (
                  <input
                    key={key}
                    type="date"
                    aria-label={`${label} ${index === 0 ? 'desde' : 'hasta'}`}
                    value={dates[key] ?? ''}
                    onChange={(event) => {
                      setDates({ ...dates, [key]: event.target.value })
                      setPage(1)
                    }}
                    className="border-border h-9 rounded-lg border bg-white px-2 text-sm"
                  />
                ))}
              </div>
            </fieldset>
          ))}
          <CustomPropertyFilter
            entity="patient"
            propertyKey={dates.cp_key}
            value={dates.cp_value}
            onChange={(next) => {
              const rest = Object.fromEntries(Object.entries(dates).filter(([key]) => key !== 'cp_key' && key !== 'cp_value'))
              setDates({
                ...rest,
                ...(next.cp_key ? { cp_key: next.cp_key } : {}),
                ...(next.cp_value ? { cp_value: next.cp_value } : {}),
              })
              setPage(1)
            }}
          />
        </div>
        <div className="border-border mt-3 border-t pt-3">
          <SortEditor
            sort={sort}
            fields={patientSortFields}
            onChange={(next) => {
              setSort(next)
              setPage(1)
            }}
          />
        </div>
        <div className="border-border mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
          <ColumnPicker keys={columnPrefs.keys} onChange={columnPrefs.save} saving={columnPrefs.saving} all={allColumns} />
          <label className="text-muted text-sm" htmlFor="saved-patient-view">
            Vistas
          </label>
          <select
            id="saved-patient-view"
            value={selectedView}
            onChange={(event) => applyView(event.target.value)}
            className="border-border h-9 min-w-48 rounded-lg border bg-white px-3 text-sm"
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
              className="h-9 px-2 text-red-700"
              onClick={() => deleteView.mutate(selectedView)}
            >
              <Archive className="size-4" />
              Borrar vista
            </Button>
          )}
          <Button className="h-9" onClick={() => setViewDialog(true)}>
            Guardar vista actual
          </Button>
        </div>
      </section>
      {patients.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar los pacientes. {patients.error.message}
        </p>
      )}
      {patients.isFetching || !branchReady ? (
        <TableSkeleton columns={columnPrefs.keys.length} />
      ) : (
        <DataTable
          columns={columnPrefs.keys.map(
            (key) => allColumns.find((column) => column.key === key)?.label ?? key,
          )}
          rows={rows}
          actions={rowActions}
          onRowDoubleClick={(index) => {
            const patient = patients.data?.data[index]
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
        />
      )}
      {!patients.isFetching && (
        <Pagination
          page={page}
          rows={PAGE_ROWS}
          total={patients.data?.total ?? 0}
          onChange={setPage}
        />
      )}
      {formOpen && (editing ? canUpdate : canCreate) && (
        <Dialog
          title={editing ? 'Editar paciente' : 'Nuevo paciente'}
          description={
            editing
              ? 'Actualiza los datos de la ficha.'
              : 'Registra sus datos de contacto y atención.'
          }
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
