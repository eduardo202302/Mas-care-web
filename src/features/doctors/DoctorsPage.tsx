import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Stethoscope, ToggleRight } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { TableToolbarActions } from '@/components/TableToolbarActions'
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
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { formatPhone } from '@/lib/phone'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { components, paths } from '@/lib/api-types'
import type { DoctorFormValues } from '@/schemas/doctor'
import { DoctorForm } from './DoctorForm'
import { syncDoctorMedicalCenters, syncDoctorSpecialties } from './doctorLinks'

type DoctorWithLinks = components['schemas']['Doctor'] & {
  specialties?: { specialty: components['schemas']['MedicalSpecialty'] }[]
  medicalCenters?: (components['schemas']['DoctorMedicalCenterLink'] & {
    medicalCenter: components['schemas']['MedicalCenter']
  })[]
}
type DoctorList =
  paths['/api/v1/doctors']['get']['responses'][200]['content']['application/json']
type DoctorQuery = NonNullable<
  paths['/api/v1/doctors']['get']['parameters']['query']
>

const DEFAULT_ACTIVE = 'true' as 'true' | 'false'
const activeOptions: { value: 'true' | 'false'; label: string }[] = [
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
]

function queryString(query: DoctorQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

export default function DoctorsPage() {
  const canWrite = useCan('doctors:write')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<'true' | 'false'>(DEFAULT_ACTIVE)
  const [filterDraft, setFilterDraft] = useState<{
    isActive: 'true' | 'false'
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<DoctorWithLinks | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const filters = useMemo<DoctorQuery>(
    () => ({ q: search.trim() || undefined, isActive, page, rows }),
    [isActive, page, rows, search],
  )
  const doctors = useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => api<DoctorList>(`/api/v1/doctors?${queryString(filters)}`),
  })
  const save = useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        licenseNumber: values.licenseNumber || null,
        phone: values.phone || null,
        email: values.email || null,
        notes: values.notes || null,
      }
      const doctor = editing
        ? await api<components['schemas']['Doctor']>(
            `/api/v1/doctors/${encodeURIComponent(editing.id)}`,
            { method: 'PATCH', body: JSON.stringify(body) },
          )
        : await api<components['schemas']['Doctor']>('/api/v1/doctors', {
            method: 'POST',
            body: JSON.stringify(body),
          })
      const doctorId = editing?.id ?? doctor.id
      await syncDoctorSpecialties(
        doctorId,
        editing?.specialties?.map((link) => link.specialty.id) ?? [],
        values.specialtyIds,
      )
      await syncDoctorMedicalCenters(
        doctorId,
        editing?.medicalCenters
          ?.filter((link) => link.isActive)
          .map((link) => link.medicalCenterId) ?? [],
        values.medicalCenterIds,
      )
      return doctor
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      closeForm()
    },
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<components['schemas']['Doctor']>(
        `/api/v1/doctors/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: active }) },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
  })

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }
  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(item: DoctorWithLinks) {
    setEditing(item)
    setFormOpen(true)
  }

  const items = applyColumnSort(
    (doctors.data?.data ?? []) as DoctorWithLinks[],
    sort,
    (item, index) =>
      index === 0
        ? item.numericId
        : index === 1
          ? item.isActive
            ? 1
            : 0
          : index === 2
            ? `${item.firstName} ${item.lastName}`
            : index === 3
              ? (item.licenseNumber ?? '')
              : (item.phone ?? ''),
  )
  const tableRows = items.map((item) => [
    <span key="id" className="text-muted font-mono text-xs">
      {item.numericId}
    </span>,
    <span key="state" className="text-muted">
      {item.isActive ? 'Activo' : 'Inactivo'}
    </span>,
    <span key="name" className="text-petroleo font-semibold">
      {item.firstName} {item.lastName}
    </span>,
    <span key="license" className="text-muted">
      {item.licenseNumber || ''}
    </span>,
    <span key="phone" className="text-muted">
      {item.phone ? formatPhone(item.phone) : ''}
    </span>,
    <div key="specialties" className="flex flex-wrap gap-1">
      {item.specialties?.length
        ? item.specialties.map((link) => (
            <span
              key={link.specialty.id}
              className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs"
            >
              {link.specialty.name}
            </span>
          ))
        : null}
    </div>,
  ])
  const exportHeaders = [
    'ID',
    'Estado',
    'Médico',
    'Colegiatura',
    'Teléfono',
    'Especialidades',
  ]
  const exportRows = items.map((item) => [
    String(item.numericId),
    item.isActive ? 'Activo' : 'Inactivo',
    `${item.firstName} ${item.lastName}`,
    item.licenseNumber || '',
    item.phone ? formatPhone(item.phone) : '',
    item.specialties?.map((link) => link.specialty.name).join(', ') || '',
  ])
  const filterCount = isActive !== DEFAULT_ACTIVE ? 1 : 0
  const chips: ActiveFilterChip[] = []
  if (isActive !== DEFAULT_ACTIVE)
    chips.push({
      key: 'isActive',
      label: 'Estado',
      value: activeOptions.find((option) => option.value === isActive)!.label,
    })
  const rowActions = items.map((item) => (
    <RowActions
      key={item.id}
      label={`${item.firstName} ${item.lastName}`}
      deleteLabel={item.isActive ? 'Desactivar' : 'Activar'}
      onEdit={canWrite ? () => openEdit(item) : undefined}
      onDelete={
        canWrite
          ? () => toggleActive.mutate({ id: item.id, active: !item.isActive })
          : undefined
      }
    />
  ))

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Médicos"
        subtitle="Médicos prescriptores y sus especialidades y centros médicos."
        actions={
          <>
            {canWrite && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo Médico
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar Médicos"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre o colegiatura"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft({ isActive })}
        />
        <TableToolbarActions
          title="Médicos"
          headers={exportHeaders}
          rows={exportRows}
          filename="medicos"
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={() => {
          setIsActive(DEFAULT_ACTIVE)
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de médicos."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft({ isActive: DEFAULT_ACTIVE })
            setIsActive(DEFAULT_ACTIVE)
            setPage(1)
          }}
          clearDisabled={
            !filterCount && filterDraft.isActive === DEFAULT_ACTIVE
          }
          onApply={() => {
            setIsActive(filterDraft.isActive)
            setPage(1)
            setFilterDraft(null)
          }}
        >
          <FilterField label="Estado" icon={<ToggleRight className="size-4" />}>
            <select
              aria-label="Estado"
              value={filterDraft.isActive}
              onChange={(event) =>
                setFilterDraft({
                  isActive: event.target.value as 'true' | 'false',
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {activeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
        </AdvancedFilterDialog>
      )}
      {doctors.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el catálogo. {doctors.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {doctors.isFetching ? (
          <TableSkeleton columns={6} />
        ) : (
          <DataTable
            columns={[
              'ID',
              'Estado',
              'Médico',
              'Colegiatura',
              'Teléfono',
              'Especialidades',
            ]}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3, 4]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item) navigate(`/medicos/${encodeURIComponent(item.id)}`)
            }}
            emptyTitle={
              isActive === 'false'
                ? 'No hay médicos inactivos'
                : 'Todavía no hay médicos'
            }
            emptyDescription={
              canWrite
                ? 'Agrega médicos para asociarlos a los pacientes.'
                : 'Cuando tu organización tenga médicos registrados, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={doctors.data?.total ?? 0}
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
      {formOpen && (
        <Dialog
          title={editing ? 'Editar Médico' : 'Nuevo Médico'}
          icon={<Stethoscope className="size-5" />}
          compactHeader
          description="Datos de contacto y colegiatura del Médico."
          bodyClassName="pt-2"
          onClose={closeForm}
          size="lg"
        >
          <DoctorForm
            key={editing?.id ?? 'new'}
            doctor={editing ?? undefined}
            onSave={(values) => save.mutateAsync(values).then(() => undefined)}
            onCancel={closeForm}
            submitting={save.isPending}
          />
        </Dialog>
      )}
    </div>
  )
}
