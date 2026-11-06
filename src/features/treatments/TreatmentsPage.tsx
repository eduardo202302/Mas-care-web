import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  ClipboardList,
  Pill,
  Plus,
  Printer,
  Search,
} from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { ExportButton } from '@/components/ExportButton'
import { Pagination } from '@/components/Pagination'
import { StatusChip } from '@/components/StatusChip'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  filterControlClass,
  type ActiveFilterChip,
} from '@/components/ui/AdvancedFilter'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { PageHeader } from '@/components/ui/PageHeader'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { useActiveBranch } from '@/lib/active-branch'
import { authClient } from '@/lib/auth-client'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { printTable } from '@/lib/print-table'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { paths } from '@/lib/api-types'
import {
  createTreatmentFromForm,
  updateTreatmentFromForm,
  daysRemainingLabel,
  derivedStatusLabel,
  elapsedSinceLabel,
  formatDate,
  formatPurchaseDateTime,
  medicationName,
  treatmentPauta,
  treatmentStatusLabel,
  type DoseScheduleFrequency,
  type Medication,
  type Treatment,
} from '@/lib/treatments'
import type { TreatmentSaveValues } from '@/schemas/treatment'
import { PatientPicker, type PickerPatient } from './PatientPicker'
import { TreatmentForm } from './TreatmentForm'

type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']
type DoctorPickerList = {
  data: {
    id: string
    firstName: string
    lastName: string
    licenseNumber?: string | null
    specialties?: { specialty: { name: string } }[]
  }[]
}

/** Fila del listado: el tratamiento más los datos que el servidor une para la tabla. */
type TreatmentRow = Treatment & {
  patient_name: string
  last_purchase_at: string | null
  medication: Medication
  active_schedule:
    (DoseScheduleFrequency & { dosePerIntake?: string | number }) | null
}
type TreatmentRows = {
  data: TreatmentRow[]
  total: number
  page: number
  rows: number
}

type TreatmentStatusFilter = '' | 'active' | 'paused' | 'finished'
type DerivedStatusFilter =
  | ''
  | 'al_dia'
  | 'proxima_reposicion'
  | 'vence_pronto'
  | 'retiro_pendiente'
  | 'vencido'

const statusOptions: { value: TreatmentStatusFilter; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'finished', label: 'Finalizados' },
]
const derivedOptions: { value: DerivedStatusFilter; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'al_dia', label: 'Al Día' },
  { value: 'proxima_reposicion', label: 'Próxima Reposición' },
  { value: 'vence_pronto', label: 'Vence Pronto' },
  { value: 'retiro_pendiente', label: 'Retiro Pendiente' },
  { value: 'vencido', label: 'Vencido' },
]

const columns = [
  'Sucursal',
  'ID',
  'Estado',
  'Paciente',
  'Medicamento',
  'Dosis y Frecuencia',
  'Doctor',
  'Última Compra',
  'Fin de Cobertura',
  'Días Restantes',
  'Cobertura',
]

function queryString(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

export default function TreatmentsPage() {
  const canCreate = useCan('treatments:write')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { branchId, ready: branchReady } = useActiveBranch()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TreatmentStatusFilter>('')
  const [derived, setDerived] = useState<DerivedStatusFilter>('')
  const [filterDraft, setFilterDraft] = useState<{
    status: TreatmentStatusFilter
    derived: DerivedStatusFilter
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [formOpen, setFormOpen] = useState(false)
  const [patient, setPatient] = useState<PickerPatient | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      q: search.trim() || undefined,
      branch_id: branchId,
      status: status || undefined,
      derived_status: derived || undefined,
      page,
      rows,
    }),
    [branchId, derived, page, rows, search, status],
  )
  const treatments = useQuery({
    queryKey: ['treatments', 'table', filters],
    queryFn: () =>
      api<TreatmentRows>(`/api/v1/treatments?${queryString(filters)}`),
    enabled: branchReady,
  })
  const activeOrganization = authClient.useActiveOrganization()
  const organizations = authClient.useListOrganizations()
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })

  // El formulario solo carga sus catálogos mientras el diálogo está abierto.
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', rows: 100 }],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&rows=100'),
    enabled: formOpen || editingId !== null,
  })
  const users = useQuery({
    queryKey: ['users', { rows: 100 }],
    queryFn: () => api<UserList>('/api/v1/users?rows=100'),
    enabled: formOpen || editingId !== null,
  })
  const canReadDoctors = useCan('doctors:read')
  const doctors = useQuery({
    queryKey: ['doctors', 'picker'],
    queryFn: () =>
      api<DoctorPickerList>('/api/v1/doctors?isActive=true&rows=100'),
    enabled: (formOpen || editingId !== null) && canReadDoctors,
  })
  const editing = useQuery({
    queryKey: ['treatments', editingId],
    queryFn: () =>
      api<Treatment>(`/api/v1/treatments/${encodeURIComponent(editingId!)}`),
    enabled: editingId !== null,
  })

  const create = useMutation({
    mutationFn: (values: TreatmentSaveValues) => {
      if (!patient) throw new Error('Selecciona un paciente.')
      return createTreatmentFromForm(patient.id, values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['treatments'] })
      setPage(1)
      closeForm()
    },
  })

  const update = useMutation({
    mutationFn: (values: TreatmentSaveValues) =>
      updateTreatmentFromForm(editingId!, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['treatments'] })
      closeEdit()
    },
  })

  function closeEdit() {
    setEditingId(null)
    update.reset()
  }

  function closeForm() {
    setFormOpen(false)
    setPatient(null)
    create.reset()
  }

  const branchMap = new Map(
    (branches.data?.data ?? []).map((branch) => [branch.id, branch]),
  )
  const items = applyColumnSort(
    treatments.data?.data ?? [],
    sort,
    (item, index) => {
      switch (index) {
        case 0:
          return branchMap.get(item.branchId)?.name ?? ''
        case 1:
          return Number(item.numericId)
        case 2:
          return treatmentStatusLabel(item.status)
        case 3:
          return item.patient_name
        case 4:
          return medicationName(item.medication)
        case 5:
          return treatmentPauta(item, item.medication, item.active_schedule)
        case 6:
          return item.prescriberName ?? ''
        case 7:
          return item.last_purchase_at ?? ''
        case 8:
          return item.coverageEndOn ?? ''
        case 9:
          return item.days_remaining ?? Number.MAX_SAFE_INTEGER
        default:
          return derivedStatusLabel(item.derived_status) ?? ''
      }
    },
  )
  const tableRows = items.map((item) => {
    const branch = branchMap.get(item.branchId)
    const derivedLabel = derivedStatusLabel(item.derived_status)
    return [
      branch ? (
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
      <span key="id" className="text-muted font-mono text-xs">
        {String(item.numericId)}
      </span>,
      <span key="status" className="text-muted">
        {treatmentStatusLabel(item.status)}
      </span>,
      <span key="patient" className="text-petroleo font-semibold">
        {item.patient_name}
      </span>,
      <span key="medication">{medicationName(item.medication)}</span>,
      <span key="pauta" className="text-muted">
        {treatmentPauta(item, item.medication, item.active_schedule)}
      </span>,
      <span key="prescriber" className="text-muted">
        {item.prescriberName || ''}
      </span>,
      item.last_purchase_at ? (
        <div key="purchase" className="grid gap-0.5">
          <span>{formatPurchaseDateTime(item.last_purchase_at)}</span>
          <span className="text-muted text-xs">
            {elapsedSinceLabel(item.last_purchase_at)}
          </span>
        </div>
      ) : null,
      <span key="coverage">
        {item.coverageEndOn ? formatDate(item.coverageEndOn) : ''}
      </span>,
      <span
        key="days"
        className={
          item.days_remaining !== null && item.days_remaining <= 0
            ? 'font-medium text-red-700'
            : undefined
        }
      >
        {item.days_remaining === null
          ? ''
          : daysRemainingLabel(item.days_remaining)}
      </span>,
      derivedLabel ? <StatusChip key="derived" status={derivedLabel} /> : null,
    ]
  })
  const openDetail = (item: TreatmentRow) =>
    navigate(
      `/pacientes/${encodeURIComponent(item.patientId)}/tratamientos/${encodeURIComponent(item.id)}`,
    )
  const rowActions = items.map((item) => (
    <RowActions
      key={item.id}
      label={`Tratamiento de ${item.patient_name}`}
      onEdit={canCreate ? () => setEditingId(item.id) : undefined}
    />
  ))

  function printList() {
    printTable({
      company:
        activeOrganization.data?.name ?? organizations.data?.[0]?.name ?? '',
      branch: branchId
        ? (branchMap.get(branchId)?.name ?? '')
        : 'Todas las Sucursales',
      title: 'Tratamientos',
      subtitle: `Impreso el ${formatPurchaseDateTime(new Date().toISOString())}`,
      headers: columns,
      rows: items.map((item) => [
        branchMap.get(item.branchId)?.name ?? '',
        String(item.numericId),
        treatmentStatusLabel(item.status),
        item.patient_name,
        medicationName(item.medication),
        treatmentPauta(item, item.medication, item.active_schedule),
        item.prescriberName || '',
        item.last_purchase_at
          ? `${formatPurchaseDateTime(item.last_purchase_at)} (${elapsedSinceLabel(item.last_purchase_at)})`
          : '',
        item.coverageEndOn ? formatDate(item.coverageEndOn) : '',
        item.days_remaining === null
          ? ''
          : daysRemainingLabel(item.days_remaining),
        derivedStatusLabel(item.derived_status) ?? '',
      ]),
    })
  }

  const filterCount = (status ? 1 : 0) + (derived ? 1 : 0)
  const draftCount = filterDraft
    ? (filterDraft.status ? 1 : 0) + (filterDraft.derived ? 1 : 0)
    : 0
  const chips: ActiveFilterChip[] = []
  if (status)
    chips.push({
      key: 'status',
      label: 'Estado',
      value: statusOptions.find((option) => option.value === status)!.label,
    })
  if (derived)
    chips.push({
      key: 'derived',
      label: 'Cobertura',
      value: derivedOptions.find((option) => option.value === derived)!.label,
    })

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Tratamientos"
        subtitle="Consulta la cobertura de los tratamientos de todos tus pacientes."
        actions={
          canCreate && (
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Nuevo Tratamiento
            </Button>
          )
        }
      />
      <FilterBarRow aria-label="Filtros de tratamientos">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar tratamientos"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Paciente, medicamento o nombre del tratamiento"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft({ status, derived })}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={printList}
            disabled={!items.length}
            aria-label="Imprimir tratamientos"
          >
            <Printer className="size-4" />
            Imprimir
          </Button>
          <ExportButton
            entity="treatments"
            filters={{ q: search.trim(), branchId, status }}
            defaultFormat="xlsx"
            label="Exportar a Excel"
          />
        </div>
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          if (key === 'status') setStatus('')
          else setDerived('')
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de tratamientos."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft({ status: '', derived: '' })
            setStatus('')
            setDerived('')
            setPage(1)
          }}
          clearDisabled={!filterCount && !draftCount}
          onApply={() => {
            setStatus(filterDraft.status)
            setDerived(filterDraft.derived)
            setPage(1)
            setFilterDraft(null)
          }}
        >
          <FilterField
            label="Estado del Tratamiento"
            icon={<ClipboardList className="size-4" />}
          >
            <select
              aria-label="Estado del tratamiento"
              value={filterDraft.status}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  status: event.target.value as TreatmentStatusFilter,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField
            label="Estado de Cobertura"
            icon={<Activity className="size-4" />}
          >
            <select
              aria-label="Estado de cobertura"
              value={filterDraft.derived}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  derived: event.target.value as DerivedStatusFilter,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {derivedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
        </AdvancedFilterDialog>
      )}
      {treatments.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar los tratamientos. {treatments.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {treatments.isFetching || !branchReady ? (
          <TableSkeleton columns={columns.length} />
        ) : (
          <DataTable
            columns={columns}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={columns.map((_, index) => index)}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item) openDetail(item)
            }}
            emptyTitle="Todavía no hay tratamientos"
            emptyDescription={
              canCreate
                ? 'Crea un tratamiento para comenzar el seguimiento de la cobertura.'
                : 'Cuando haya tratamientos en tu organización, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={treatments.data?.total ?? 0}
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
      {formOpen && canCreate && (
        <Dialog
          title="Nuevo Tratamiento"
          description="Elige al paciente y registra los datos del medicamento."
          icon={<Pill className="size-5" />}
          compactHeader
          printable
          bodyClassName="pt-0"
          size="lg"
          onClose={closeForm}
        >
          <div className="grid gap-5">
            <PatientPicker
              value={patient}
              onChange={setPatient}
              branchId={branchId}
            />
            {patient ? (
              <TreatmentForm
                key={patient.id}
                patientName={patient.fullName}
                medications={medications.data?.data ?? []}
                branches={branches.data?.data ?? []}
                users={users.data?.data ?? []}
                doctors={doctors.data?.data ?? []}
                doctorsLoading={doctors.isLoading}
                defaultBranchId={patient.primaryBranchId}
                defaultResponsibleUserId={patient.responsibleUserId}
                onSave={(values) =>
                  create.mutateAsync(values).then(() => undefined)
                }
                onCancel={closeForm}
                submitting={create.isPending}
              />
            ) : (
              <p className="text-muted text-sm">
                Selecciona un paciente para completar el tratamiento.
              </p>
            )}
          </div>
        </Dialog>
      )}
      {editingId !== null && canCreate && (
        <Dialog
          title="Editar Tratamiento"
          description="Define la pauta, la cobertura y los datos de la receta."
          icon={<Pill className="size-5" />}
          compactHeader
          printable
          bodyClassName="pt-0"
          size="lg"
          onClose={closeEdit}
        >
          {editing.data ? (
            <TreatmentForm
              key={editing.data.id}
              treatment={editing.data}
              patientName={
                items.find((item) => item.id === editingId)?.patient_name
              }
              medications={medications.data?.data ?? []}
              branches={branches.data?.data ?? []}
              users={users.data?.data ?? []}
              doctors={doctors.data?.data ?? []}
              doctorsLoading={doctors.isLoading}
              onSave={(values) =>
                update.mutateAsync(values).then(() => undefined)
              }
              onCancel={closeEdit}
              submitting={update.isPending}
            />
          ) : editing.isError ? (
            <p role="alert" className="text-sm text-red-700">
              No pudimos cargar el tratamiento. {editing.error.message}
            </p>
          ) : (
            <p className="text-muted text-sm">Cargando tratamiento…</p>
          )}
        </Dialog>
      )}
    </div>
  )
}
