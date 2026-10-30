import { useMemo, useState } from 'react'
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
import type { MedicalSpecialtyFormValues } from '@/schemas/medicalSpecialty'
import { MedicalSpecialtyForm } from './MedicalSpecialtyForm'

type SpecialtyList =
  paths['/api/v1/medical-specialties']['get']['responses'][200]['content']['application/json']
type SpecialtyQuery = NonNullable<
  paths['/api/v1/medical-specialties']['get']['parameters']['query']
>

function queryString(query: SpecialtyQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

export default function MedicalSpecialtiesPage() {
  const canWrite = useCan('specialties:write')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<'true' | 'false'>('true')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['MedicalSpecialty'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)

  const filters = useMemo<SpecialtyQuery>(
    () => ({ q: search.trim() || undefined, isActive, page, rows }),
    [isActive, page, rows, search],
  )
  const specialties = useQuery({
    queryKey: ['medical-specialties', filters],
    queryFn: () =>
      api<SpecialtyList>(`/api/v1/medical-specialties?${queryString(filters)}`),
  })
  const save = useMutation({
    mutationFn: (values: MedicalSpecialtyFormValues) => {
      const body = {
        name: values.name,
        description: values.description || null,
      }
      if (editing) {
        return api<components['schemas']['MedicalSpecialty']>(
          `/api/v1/medical-specialties/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      return api<components['schemas']['MedicalSpecialty']>(
        '/api/v1/medical-specialties',
        { method: 'POST', body: JSON.stringify(body) },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['medical-specialties'] })
      closeForm()
    },
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<components['schemas']['MedicalSpecialty']>(
        `/api/v1/medical-specialties/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: active }) },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['medical-specialties'] }),
  })

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }
  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(item: components['schemas']['MedicalSpecialty']) {
    setEditing(item)
    setFormOpen(true)
  }

  const items = applyColumnSort(
    specialties.data?.data ?? [],
    sort,
    (item, index) =>
      index === 0
        ? item.name
        : index === 1
          ? (item.description ?? '')
          : item.isActive
            ? 1
            : 0,
  )
  const tableRows = items.map((item) => [
    <span key="name" className="text-petroleo font-semibold">
      {item.name}
    </span>,
    <span key="description" className="text-muted">
      {item.description || '—'}
    </span>,
    <span key="state" className="text-muted">
      {item.isActive ? 'Activa' : 'Inactiva'}
    </span>,
  ])
  const rowActions = items.map((item) => (
    <RowActions
      key={item.id}
      label={item.name}
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
            Especialidades médicas
          </h1>
          <p className="text-muted mt-2 text-sm">
            Especialidades disponibles para asignar a los médicos.
          </p>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={openCreate}>
            <Plus className="size-4" />
            Nueva especialidad
          </Button>
        )}
      </div>
      <section className="border-border mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
        <label className="relative min-w-56 flex-1">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            aria-label="Buscar especialidades"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre de la especialidad"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none"
          />
        </label>
        <select
          aria-label="Filtrar especialidades"
          value={isActive}
          onChange={(event) => {
            setIsActive(event.target.value as 'true' | 'false')
            setPage(1)
          }}
          className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
        >
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </section>
      {specialties.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el catálogo. {specialties.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {specialties.isFetching ? (
          <TableSkeleton columns={3} />
        ) : (
          <DataTable
            columns={['Nombre', 'Descripción', 'Estado']}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item && canWrite) openEdit(item)
            }}
            emptyTitle={
              isActive === 'false'
                ? 'No hay especialidades inactivas'
                : 'Todavía no hay especialidades'
            }
            emptyDescription={
              canWrite
                ? 'Agrega especialidades para asignarlas a los médicos.'
                : 'Cuando tu organización tenga especialidades, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={specialties.data?.total ?? 0}
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
          title={editing ? 'Editar Especialidad' : 'Nueva Especialidad'}
          icon={<Stethoscope className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeForm}
        >
          <MedicalSpecialtyForm
            key={editing?.id ?? 'new'}
            specialty={editing ?? undefined}
            onSave={(values) => save.mutateAsync(values).then(() => undefined)}
            onCancel={closeForm}
            submitting={save.isPending}
          />
        </Dialog>
      )}
    </div>
  )
}
