import { useMemo, useState } from 'react'
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
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { components, paths } from '@/lib/api-types'
import type { MedicalSpecialtyFormValues } from '@/schemas/medicalSpecialty'
import { MedicalSpecialtyForm } from './MedicalSpecialtyForm'

type SpecialtyList =
  paths['/api/v1/medical-specialties']['get']['responses'][200]['content']['application/json']
type SpecialtyQuery = NonNullable<
  paths['/api/v1/medical-specialties']['get']['parameters']['query']
>

const DEFAULT_ACTIVE = 'true' as 'true' | 'false'
const activeOptions: { value: 'true' | 'false'; label: string }[] = [
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Inactivas' },
]

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
  const [isActive, setIsActive] = useState<'true' | 'false'>(DEFAULT_ACTIVE)
  const [filterDraft, setFilterDraft] = useState<{
    isActive: 'true' | 'false'
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['MedicalSpecialty'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)

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
    setViewOnly(false)
  }
  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(item: components['schemas']['MedicalSpecialty']) {
    setEditing(item)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(item: components['schemas']['MedicalSpecialty']) {
    setEditing(item)
    setViewOnly(true)
    setFormOpen(true)
  }

  const items = applyColumnSort(
    specialties.data?.data ?? [],
    sort,
    (item, index) =>
      index === 0
        ? item.numericId
        : index === 1
          ? item.isActive
            ? 1
            : 0
          : index === 2
            ? item.name
            : (item.description ?? ''),
  )
  const tableRows = items.map((item) => [
    <span key="id" className="text-muted font-mono text-xs">
      {item.numericId}
    </span>,
    <span key="state" className="text-muted">
      {item.isActive ? 'Activa' : 'Inactiva'}
    </span>,
    <span key="name" className="text-petroleo font-semibold">
      {item.name}
    </span>,
    <span key="description" className="text-muted">
      {item.description || ''}
    </span>,
  ])
  const exportHeaders = ['ID', 'Estado', 'Nombre', 'Descripción']
  const exportRows = items.map((item) => [
    String(item.numericId),
    item.isActive ? 'Activa' : 'Inactiva',
    item.name,
    item.description || '',
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
      <PageHeader
        title="Especialidades médicas"
        subtitle="Especialidades disponibles para asignar a los médicos."
        actions={
          <>
            {canWrite && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Nueva especialidad
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar especialidades"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre de la especialidad"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft({ isActive })}
        />
        <TableToolbarActions
          title="Especialidades Médicas"
          headers={exportHeaders}
          rows={exportRows}
          filename="especialidades-medicas"
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
          description="Combina estos criterios para acotar la lista de especialidades."
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
          <TableSkeleton columns={4} />
        ) : (
          <DataTable
            columns={['ID', 'Estado', 'Nombre', 'Descripción']}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item) openView(item)
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
          title={
            viewOnly
              ? 'Ver Especialidad'
              : editing
                ? 'Editar Especialidad'
                : 'Nueva Especialidad'
          }
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
            readOnly={viewOnly}
            onEdit={() => setViewOnly(false)}
          />
        </Dialog>
      )}
    </div>
  )
}
