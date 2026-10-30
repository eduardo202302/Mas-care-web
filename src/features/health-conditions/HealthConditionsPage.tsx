import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HeartPulse, Plus, Search } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Dialog } from '@/components/ui/Dialog'
import { FilterBarRow, FilterSegmented } from '@/components/ui/AdvancedFilter'
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
  const [isActive, setIsActive] = useState<'true' | 'false'>('true')
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

  const items = applyColumnSort(
    conditions.data?.data ?? [],
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
      <PageHeader
        title="Condiciones de salud"
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
        <label className="relative min-w-[220px] flex-1">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            aria-label="Buscar condiciones de salud"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre de la condición"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none"
          />
        </label>
        <FilterSegmented<'true' | 'false'>
          label="Filtrar condiciones de salud"
          value={isActive}
          options={[
            { value: 'true', label: 'Activas' },
            { value: 'false', label: 'Inactivas' },
          ]}
          onChange={(value) => {
            setIsActive(value)
            setPage(1)
          }}
        />
      </FilterBarRow>
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
          description="Condiciones de salud disponibles para la organización."
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
