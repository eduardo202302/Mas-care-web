import { useMemo, useState } from 'react'
import { ExportButton } from '@/components/ExportButton'
import { ImportButton } from '@/components/ImportButton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
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
import type { MedicationFormValues } from '@/schemas/medication'
import { MedicationForm } from './MedicationForm'

type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type MedicationQuery = NonNullable<
  paths['/api/v1/medications']['get']['parameters']['query']
>

function queryString(query: MedicationQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

export default function MedicationsPage() {
  const canCreate = useCan('medications:write')
  const canUpdate = useCan('medications:write')
  const canArchive = useCan('medications:write')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [archived, setArchived] = useState<'true' | 'false'>('false')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['Medication'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)

  const filters = useMemo<MedicationQuery>(
    () => ({
      q: search.trim() || undefined,
      archived,
      page,
      rows,
    }),
    [archived, page, rows, search],
  )
  const medications = useQuery({
    queryKey: ['medications', filters],
    queryFn: () =>
      api<MedicationList>(`/api/v1/medications?${queryString(filters)}`),
  })
  const save = useMutation({
    mutationFn: (values: MedicationFormValues) => {
      if (editing) {
        const body: components['schemas']['MedicationPatch'] = {
          ...values,
          ...(values.brandName
            ? { brandName: values.brandName }
            : { brandName: null }),
          ...(values.genericName
            ? { genericName: values.genericName }
            : { genericName: null }),
          ...(values.activeIngredient
            ? { activeIngredient: values.activeIngredient }
            : { activeIngredient: null }),
        }
        return api<components['schemas']['Medication']>(
          `/api/v1/medications/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      const body: components['schemas']['MedicationCreate'] = {
        ...values,
        ...(values.brandName
          ? { brandName: values.brandName }
          : { brandName: null }),
        ...(values.genericName
          ? { genericName: values.genericName }
          : { genericName: null }),
        ...(values.activeIngredient
          ? { activeIngredient: values.activeIngredient }
          : { activeIngredient: null }),
      }
      return api<components['schemas']['Medication']>('/api/v1/medications', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['medications'] })
      closeForm()
    },
  })
  const archive = useMutation({
    mutationFn: (id: string) =>
      api<components['schemas']['Medication']>(
        `/api/v1/medications/${encodeURIComponent(id)}/archive`,
        { method: 'POST' },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['medications'] }),
  })

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }
  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(item: components['schemas']['Medication']) {
    setEditing(item)
    setFormOpen(true)
  }

  const items = applyColumnSort(medications.data?.data ?? [], sort, (item, index) =>
    index === 0
      ? item.brandName || item.genericName || item.activeIngredient || 'Medicamento'
      : index === 1
        ? item.activeIngredient || item.genericName || ''
        : index === 2
          ? item.presentation
          : index === 3
            ? item.unitsPerPackage
            : item.archivedAt
              ? 1
              : 0,
  )
  const tableRows = items.map((item) => [
    <span key="name" className="text-petroleo font-semibold">
      {item.brandName ||
        item.genericName ||
        item.activeIngredient ||
        'Medicamento'}
    </span>,
    <span key="ingredient" className="text-muted">
      {item.activeIngredient || item.genericName || '—'}
    </span>,
    <span key="presentation">{item.presentation}</span>,
    <span key="units">
      {String(item.unitsPerPackage)} {item.doseUnit} por envase
    </span>,
    <span key="state" className="text-muted">
      {item.archivedAt ? 'Archivado' : 'Activo'}
    </span>,
  ])
  const rowActions = items.map((item) => {
    const label = item.brandName || item.genericName || item.presentation
    return (
      <RowActions
        key={item.id}
        label={label}
        deleteLabel="Archivar"
        onEdit={canUpdate ? () => openEdit(item) : undefined}
        onDelete={
          canArchive && !item.archivedAt
            ? () => {
                if (window.confirm(`¿Archivar ${label}?`))
                  archive.mutate(item.id)
              }
            : undefined
        }
      />
    )
  })

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <div className="mb-7 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">Catálogo</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Medicamentos
          </h1>
          <p className="text-muted mt-2 text-sm">
            Presentaciones y unidades registradas para la organización.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportButton entity="medications" />
          <ExportButton entity="medications" filters={{ q: search.trim() }} />
          {canCreate && (
            <Button variant="primary" onClick={openCreate}>
              <Plus className="size-4" />
              Nuevo medicamento
            </Button>
          )}
        </div>
      </div>
      <section className="border-border mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
        <label className="relative min-w-56 flex-1">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            aria-label="Buscar medicamentos"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre, principio activo o presentación"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none"
          />
        </label>
        <select
          aria-label="Filtrar medicamentos archivados"
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
      </section>
      {medications.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el catálogo. {medications.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {medications.isFetching ? (
          <TableSkeleton columns={5} />
        ) : (
          <DataTable
            columns={[
              'Medicamento',
              'Principio activo',
              'Presentación',
              'Contenido',
              'Estado',
            ]}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3, 4]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item && canUpdate) openEdit(item)
            }}
            emptyTitle={
              archived === 'true'
                ? 'No hay medicamentos archivados'
                : 'Todavía no hay medicamentos'
            }
            emptyDescription={
              canCreate
                ? 'Agrega medicamentos para construir el catálogo de tu farmacia.'
                : 'Cuando tu organización tenga medicamentos, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={medications.data?.total ?? 0}
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
          title={editing ? 'Editar medicamento' : 'Nuevo medicamento'}
          description="Registra los datos de presentación del producto."
          onClose={closeForm}
        >
          <MedicationForm
            key={editing?.id ?? 'new'}
            medication={editing ?? undefined}
            onSave={(values) => save.mutateAsync(values).then(() => undefined)}
            onCancel={closeForm}
            submitting={save.isPending}
          />
        </Dialog>
      )}
    </div>
  )
}
