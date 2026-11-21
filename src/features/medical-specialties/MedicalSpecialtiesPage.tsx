import { StatusBadge } from '@/components/ui/StatusBadge'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Hash, Plus, Stethoscope, ToggleRight } from 'lucide-react'
import { SearchField } from '@/components/ui/SearchField'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import { Dialog } from '@/components/ui/Dialog'
import { PurgeDialog } from '@/components/ui/PurgeDialog'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  StatusDraftProvider,
  useStatusDraft,
} from '@/components/ui/StatusDraft'
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
import { TruncatedText } from '@/components/ui/MoreBubble'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { editTitle } from '@/lib/editTitle'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { components, paths } from '@/lib/api-types'
import type { MedicalSpecialtyFormValues } from '@/schemas/medicalSpecialty'
import { MedicalSpecialtyForm } from './MedicalSpecialtyForm'

type SpecialtyList =
  paths['/api/v1/medical-specialties']['get']['responses'][200]['content']['application/json']
type ActiveFilter = 'true' | 'false' | 'all'
type SpecialtyQuery = Omit<
  NonNullable<
    paths['/api/v1/medical-specialties']['get']['parameters']['query']
  >,
  'isActive'
> & { isActive?: ActiveFilter }

const DEFAULT_ACTIVE = 'true' as ActiveFilter
const activeOptions: { value: ActiveFilter; label: string }[] = [
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Inactivas' },
  { value: 'all', label: 'Todas' },
]

type SpecialtyFilters = {
  isActive: ActiveFilter
  id: string
  name: string
  description: string
}

const emptyFilters: SpecialtyFilters = {
  isActive: DEFAULT_ACTIVE,
  id: '',
  name: '',
  description: '',
}

function queryString(query: SpecialtyQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

function uniqueSorted(
  values: (string | null | undefined)[],
  ...selected: string[]
) {
  const set = new Set(values.filter((value): value is string => !!value))
  for (const value of selected) if (value) set.add(value)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

export default function MedicalSpecialtiesPage() {
  const canWrite = useCan('specialties:write')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  // El servidor solo filtra por estado: el resto se aplica sobre la página cargada.
  const [applied, setApplied] = useState<SpecialtyFilters>(emptyFilters)
  const [filterDraft, setFilterDraft] = useState<SpecialtyFilters | null>(null)
  const isActive = applied.isActive
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['MedicalSpecialty'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)
  const [purging, setPurging] = useState<
    components['schemas']['MedicalSpecialty'] | null
  >(null)
  const statusDraft = useStatusDraft(editing ? editing.isActive : true)

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
    mutationFn: async (values: MedicalSpecialtyFormValues) => {
      const body = {
        name: values.name,
        description: values.description || null,
      }
      if (editing) {
        const updated = await api<components['schemas']['MedicalSpecialty']>(
          `/api/v1/medical-specialties/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
        // El interruptor Activo/Inactivo se aplica al guardar, no al instante.
        if (statusDraft.changed)
          return api<components['schemas']['MedicalSpecialty']>(
            `/api/v1/medical-specialties/${encodeURIComponent(editing.id)}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ isActive: statusDraft.value }),
            },
          )
        return updated
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
  const purge = useMutation({
    mutationFn: (id: string) =>
      api<void>(
        `/api/v1/medical-specialties/${encodeURIComponent(id)}/permanent`,
        { method: 'DELETE' },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['medical-specialties'] })
      setPurging(null)
    },
  })

  function closeForm() {
    statusDraft.reset()
    setFormOpen(false)
    setEditing(null)
    setViewOnly(false)
  }
  function openCreate() {
    statusDraft.reset()
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(item: components['schemas']['MedicalSpecialty']) {
    statusDraft.reset()
    setEditing(item)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(item: components['schemas']['MedicalSpecialty']) {
    statusDraft.reset()
    setEditing(item)
    setViewOnly(true)
    setFormOpen(true)
  }

  const loaded = specialties.data?.data ?? []
  const idOptions = uniqueSorted(
    loaded.map((item) => String(item.numericId)),
    applied.id,
    filterDraft?.id ?? '',
  )
  const nameOptions = uniqueSorted(
    loaded.map((item) => item.name),
    applied.name,
    filterDraft?.name ?? '',
  )
  const descriptionOptions = uniqueSorted(
    loaded.map((item) => item.description),
    applied.description,
    filterDraft?.description ?? '',
  )
  const matchesFilters = (item: components['schemas']['MedicalSpecialty']) =>
    (!applied.id || String(item.numericId) === applied.id) &&
    (!applied.name || item.name === applied.name) &&
    (!applied.description || (item.description ?? '') === applied.description)
  const items = applyColumnSort(
    (specialties.data?.data ?? []).filter(matchesFilters),
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
    <StatusBadge key="state" active={item.isActive} feminine />,
    <span key="name" className="text-petroleo font-semibold">
      {item.name}
    </span>,
    <span key="description" className="text-muted">
      <TruncatedText
        text={item.description}
        max={15}
        label="Descripción completa"
      />
    </span>,
  ])
  const exportHeaders = ['ID', 'Estado', 'Nombre', 'Descripción']
  const exportRows = items.map((item) => [
    String(item.numericId),
    item.isActive ? 'Activa' : 'Inactiva',
    item.name,
    item.description || '',
  ])
  const chips: ActiveFilterChip[] = []
  if (applied.isActive !== DEFAULT_ACTIVE)
    chips.push({
      key: 'isActive',
      label: 'Estado',
      value: activeOptions.find((option) => option.value === applied.isActive)!
        .label,
    })
  if (applied.id) chips.push({ key: 'id', label: 'ID', value: applied.id })
  if (applied.name)
    chips.push({ key: 'name', label: 'Nombre', value: applied.name })
  if (applied.description)
    chips.push({
      key: 'description',
      label: 'Descripción',
      value: applied.description,
    })
  const filterCount = chips.length
  const rowActions = items.map((item) => (
    <RowActions
      key={item.id}
      label={item.name}
      onEdit={canWrite ? () => openEdit(item) : undefined}
      onPurge={
        canWrite
          ? () => {
              purge.reset()
              setPurging(item)
            }
          : undefined
      }
    />
  ))

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Especialidades Médicas"
        subtitle="Especialidades disponibles para asignar a los médicos."
        actions={
          <>
            {canWrite && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Crear Especialidad
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <SearchField
          wrapperClassName="w-full sm:w-[34rem]"
          aria-label="Buscar especialidades"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Nombre de la especialidad"
        />
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft(applied)}
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
        onRemove={(key) => {
          setApplied((current) => ({
            ...current,
            [key]: key === 'isActive' ? DEFAULT_ACTIVE : '',
          }))
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de especialidades."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft(emptyFilters)
            setApplied(emptyFilters)
            setPage(1)
          }}
          clearDisabled={
            !filterCount &&
            JSON.stringify(filterDraft) === JSON.stringify(emptyFilters)
          }
          onApply={() => {
            setApplied(filterDraft)
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
                  ...filterDraft,
                  isActive: event.target.value as SpecialtyFilters['isActive'],
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
          <FilterField label="ID" icon={<Hash className="size-4" />}>
            <select
              aria-label="ID de la especialidad"
              value={filterDraft.id}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, id: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {idOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Nombre" icon={<Stethoscope className="size-4" />}>
            <select
              aria-label="Nombre de la especialidad"
              value={filterDraft.name}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, name: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {nameOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField
            label="Descripción"
            icon={<FileText className="size-4" />}
          >
            <select
              aria-label="Descripción de la especialidad"
              value={filterDraft.description}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
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
        <StatusDraftProvider changed={statusDraft.changed}>
          <Dialog
            title={
              viewOnly
                ? 'Ver Especialidad'
                : editing
                  ? editTitle('especialidad', editing?.name)
                  : 'Crear Especialidad'
            }
            icon={<Stethoscope className="size-5" />}
            compactHeader
            bodyClassName="pt-3"
            onClose={closeForm}
            headerAction={
              editing && canWrite ? (
                <StatusToggle
                  active={statusDraft.value}
                  pending={save.isPending}
                  onChange={statusDraft.set}
                />
              ) : undefined
            }
          >
            <MedicalSpecialtyForm
              key={editing?.id ?? 'new'}
              specialty={editing ?? undefined}
              onSave={(values) =>
                save.mutateAsync(values).then(() => undefined)
              }
              onCancel={closeForm}
              submitting={save.isPending}
              readOnly={viewOnly}
              onEdit={() => setViewOnly(false)}
            />
          </Dialog>
        </StatusDraftProvider>
      )}
      {purging && (
        <PurgeDialog
          name={purging.name}
          confirming={purge.isPending}
          error={purge.isError ? purge.error.message : undefined}
          onConfirm={() => purge.mutate(purging.id)}
          onClose={() => setPurging(null)}
        />
      )}
    </div>
  )
}
