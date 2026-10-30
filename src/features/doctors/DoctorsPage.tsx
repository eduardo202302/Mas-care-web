import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Stethoscope } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
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
  const [isActive, setIsActive] = useState<'true' | 'false'>('true')
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
        ? `${item.lastName} ${item.firstName}`
        : index === 1
          ? item.licenseNumber ?? ''
          : index === 2
            ? item.phone ?? ''
            : item.isActive
              ? 1
              : 0,
  )
  const tableRows = items.map((item) => [
    <span key="name" className="text-petroleo font-semibold">
      {item.lastName}, {item.firstName}
    </span>,
    <span key="license" className="text-muted">
      {item.licenseNumber || '—'}
    </span>,
    <span key="phone" className="text-muted">
      {item.phone || '—'}
    </span>,
    <div key="specialties" className="flex flex-wrap gap-1">
      {item.specialties?.length ? (
        item.specialties.map((link) => (
          <span
            key={link.specialty.id}
            className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs"
          >
            {link.specialty.name}
          </span>
        ))
      ) : (
        <span className="text-muted">—</span>
      )}
    </div>,
    <span key="state" className="text-muted">
      {item.isActive ? 'Activo' : 'Inactivo'}
    </span>,
  ])
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
      <div className="mb-7 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">Catálogo</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Médicos
          </h1>
          <p className="text-muted mt-2 text-sm">
            Médicos prescriptores y sus especialidades y centros médicos.
          </p>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo médico
          </Button>
        )}
      </div>
      <section className="border-border mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
        <label className="relative min-w-56 flex-1">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            aria-label="Buscar médicos"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre o colegiatura"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none"
          />
        </label>
        <select
          aria-label="Filtrar médicos"
          value={isActive}
          onChange={(event) => {
            setIsActive(event.target.value as 'true' | 'false')
            setPage(1)
          }}
          className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
        >
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </section>
      {doctors.isError && (
        <p role="alert" className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          No pudimos cargar el catálogo. {doctors.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {doctors.isFetching ? (
          <TableSkeleton columns={5} />
        ) : (
          <DataTable
            columns={['Médico', 'Colegiatura', 'Teléfono', 'Especialidades', 'Estado']}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 4]}
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
          description="Datos de contacto y colegiatura del médico."
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
