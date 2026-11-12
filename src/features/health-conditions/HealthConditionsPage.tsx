import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, HeartPulse, Plus, Search, ToggleRight } from 'lucide-react'
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
import type { HealthConditionFormValues } from '@/schemas/healthCondition'
import { HealthConditionForm } from './HealthConditionForm'

type ConditionList =
  paths['/api/v1/health-conditions']['get']['responses'][200]['content']['application/json']
type ConditionQuery = NonNullable<
  paths['/api/v1/health-conditions']['get']['parameters']['query']
>

const DEFAULT_ACTIVE = 'true' as 'true' | 'false'
const activeOptions: { value: 'true' | 'false'; label: string }[] = [
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Inactivas' },
]

type ConditionFilters = {
  isActive: 'true' | 'false'
  name: string
  description: string
}

const emptyFilters: ConditionFilters = {
  isActive: DEFAULT_ACTIVE,
  name: '',
  description: '',
}

function uniqueSorted(
  values: (string | null | undefined)[],
  ...selected: string[]
) {
  const set = new Set(values.filter((value): value is string => !!value))
  for (const value of selected) if (value) set.add(value)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

const textFilters: {
  key: 'name' | 'description'
  label: string
  icon: ReactNode
}[] = [
  { key: 'name', label: 'Nombre', icon: <HeartPulse className="size-4" /> },
  {
    key: 'description',
    label: 'Descripción',
    icon: <FileText className="size-4" />,
  },
]

function queryString(query: ConditionQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

export default function HealthConditionsPage() {
  const canWrite = useCan('health-conditions:write')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  // El servidor solo filtra por estado: el resto se aplica sobre la página cargada.
  const [applied, setApplied] = useState<ConditionFilters>(emptyFilters)
  const [filterDraft, setFilterDraft] = useState<ConditionFilters | null>(null)
  const isActive = applied.isActive
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['HealthCondition'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)

  const filters = useMemo<ConditionQuery>(
    () => ({ q: search.trim() || undefined, isActive, page, rows }),
    [isActive, page, rows, search],
  )
  const conditions = useQuery({
    queryKey: ['health-conditions', filters],
    queryFn: () =>
      api<ConditionList>(`/api/v1/health-conditions?${queryString(filters)}`),
  })
  const save = useMutation({
    mutationFn: (values: HealthConditionFormValues) => {
      const body = {
        name: values.name,
        description: values.description || null,
      }
      if (editing) {
        return api<components['schemas']['HealthCondition']>(
          `/api/v1/health-conditions/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      return api<components['schemas']['HealthCondition']>(
        '/api/v1/health-conditions',
        { method: 'POST', body: JSON.stringify(body) },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['health-conditions'] })
      closeForm()
    },
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<components['schemas']['HealthCondition']>(
        `/api/v1/health-conditions/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: active }) },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['health-conditions'] }),
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
  function openEdit(item: components['schemas']['HealthCondition']) {
    setEditing(item)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(item: components['schemas']['HealthCondition']) {
    setEditing(item)
    setViewOnly(true)
    setFormOpen(true)
  }

  const loaded = conditions.data?.data ?? []
  const textOptions = {
    name: uniqueSorted(
      loaded.map((item) => item.name),
      applied.name,
      filterDraft?.name ?? '',
    ),
    description: uniqueSorted(
      loaded.map((item) => item.description),
      applied.description,
      filterDraft?.description ?? '',
    ),
  }
  const items = applyColumnSort(
    loaded.filter(
      (item) =>
        (!applied.name || item.name === applied.name) &&
        (!applied.description ||
          (item.description ?? '') === applied.description),
    ),
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
  const chips: ActiveFilterChip[] = []
  if (applied.isActive !== DEFAULT_ACTIVE)
    chips.push({
      key: 'isActive',
      label: 'Estado',
      value: activeOptions.find((option) => option.value === applied.isActive)!
        .label,
    })
  for (const { key, label } of textFilters)
    if (applied[key]) chips.push({ key, label, value: applied[key] })
  const filterCount = chips.length
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
        title="Condiciones de Salud"
        subtitle="Condiciones disponibles para registrar en la ficha de los pacientes."
        actions={
          <>
            {canWrite && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Nueva condición
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar condiciones de salud"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre de la condición"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft(applied)}
        />
        <TableToolbarActions
          title="Condiciones de Salud"
          headers={exportHeaders}
          rows={exportRows}
          filename="condiciones-de-salud"
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          setApplied((current) => ({
            ...current,
            [key]: emptyFilters[key as keyof ConditionFilters],
          }))
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de condiciones de salud."
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
          {textFilters.map(({ key, label, icon }) => (
            <FilterField key={key} label={label} icon={icon}>
              <select
                aria-label={label}
                value={filterDraft[key]}
                onChange={(event) =>
                  setFilterDraft({ ...filterDraft, [key]: event.target.value })
                }
                className={`${filterControlClass} pl-11`}
              >
                <option value="">{key === 'name' ? 'Todos' : 'Todas'}</option>
                {textOptions[key].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </FilterField>
          ))}
        </AdvancedFilterDialog>
      )}
      {conditions.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el catálogo. {conditions.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {conditions.isFetching ? (
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
                ? 'No hay condiciones inactivas'
                : 'Todavía no hay condiciones de salud'
            }
            emptyDescription={
              canWrite
                ? 'Agrega condiciones para registrarlas en la ficha de los pacientes.'
                : 'Cuando tu organización tenga condiciones registradas, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={conditions.data?.total ?? 0}
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
              ? 'Ver Condición'
              : editing
                ? 'Editar Condición'
                : 'Nueva Condición'
          }
          description="Condiciones de Salud disponibles para la organización."
          icon={<HeartPulse className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeForm}
        >
          <HealthConditionForm
            key={editing?.id ?? 'new'}
            condition={editing ?? undefined}
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
