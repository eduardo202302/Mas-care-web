import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, Building2, Plus, Search } from 'lucide-react'
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
import { medicalCenterTypeLabels } from '@/schemas/medicalCenter'
import type { MedicalCenterFormValues } from '@/schemas/medicalCenter'
import { MedicalCenterForm } from './MedicalCenterForm'

type MedicalCenterList =
  paths['/api/v1/medical-centers']['get']['responses'][200]['content']['application/json']
type MedicalCenterQuery = NonNullable<
  paths['/api/v1/medical-centers']['get']['parameters']['query']
>

function queryString(query: MedicalCenterQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

function addressText(
  details: components['schemas']['MedicalCenter']['addressDetails'],
  key: string,
): string {
  const value = (details as Record<string, unknown> | null)?.[key]
  return typeof value === 'string' ? value : ''
}

export default function MedicalCentersPage() {
  const canWrite = useCan('medical-centers:write')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<'true' | 'false'>('true')
  const [filterDraft, setFilterDraft] = useState<{
    isActive: 'true' | 'false'
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['MedicalCenter'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)

  const filters = useMemo<MedicalCenterQuery>(
    () => ({ q: search.trim() || undefined, isActive, page, rows }),
    [isActive, page, rows, search],
  )
  const centers = useQuery({
    queryKey: ['medical-centers', filters],
    queryFn: () =>
      api<MedicalCenterList>(`/api/v1/medical-centers?${queryString(filters)}`),
  })
  const save = useMutation({
    mutationFn: (values: MedicalCenterFormValues) => {
      const body = {
        name: values.name,
        centerType: values.centerType,
        rnc: values.rnc || null,
        phone: values.phone || null,
        email: values.email || null,
        addressDetails: {
          ...(values.address ? { address: values.address } : {}),
          ...(values.state ? { region: values.state } : {}),
          ...(values.city ? { city: values.city } : {}),
          ...(values.sector ? { sector: values.sector } : {}),
          ...(values.latitude ? { latitude: Number(values.latitude) } : {}),
          ...(values.longitude ? { longitude: Number(values.longitude) } : {}),
        },
        notes: values.notes || null,
      }
      if (editing) {
        return api<components['schemas']['MedicalCenter']>(
          `/api/v1/medical-centers/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      return api<components['schemas']['MedicalCenter']>(
        '/api/v1/medical-centers',
        { method: 'POST', body: JSON.stringify(body) },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['medical-centers'] })
      closeForm()
    },
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<components['schemas']['MedicalCenter']>(
        `/api/v1/medical-centers/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: active }) },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['medical-centers'] }),
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
  function openEdit(item: components['schemas']['MedicalCenter']) {
    setEditing(item)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(item: components['schemas']['MedicalCenter']) {
    setEditing(item)
    setViewOnly(true)
    setFormOpen(true)
  }

  const items = applyColumnSort(
    centers.data?.data ?? [],
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
            : index === 3
              ? medicalCenterTypeLabels[item.centerType]
              : [
                  addressText(item.addressDetails, 'city'),
                  addressText(item.addressDetails, 'region'),
                ]
                  .filter(Boolean)
                  .join(', '),
  )
  const tableRows = items.map((item) => [
    <span key="id" className="text-muted font-mono text-xs">
      {item.numericId}
    </span>,
    <span key="state" className="text-muted">
      {item.isActive ? 'Activo' : 'Inactivo'}
    </span>,
    <span key="name" className="text-petroleo font-semibold">
      {item.name}
    </span>,
    <span key="type" className="text-muted">
      {medicalCenterTypeLabels[item.centerType]}
    </span>,
    <span key="location" className="text-muted">
      {[
        addressText(item.addressDetails, 'city'),
        addressText(item.addressDetails, 'region'),
      ]
        .filter(Boolean)
        .join(', ') || ''}
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

  const columnHeaders = ['ID', 'Estado', 'Nombre', 'Tipo', 'Ubicación']
  const exportRows = items.map((item) => [
    String(item.numericId),
    item.isActive ? 'Activo' : 'Inactivo',
    item.name,
    medicalCenterTypeLabels[item.centerType],
    [
      addressText(item.addressDetails, 'city'),
      addressText(item.addressDetails, 'region'),
    ]
      .filter(Boolean)
      .join(', ') || '',
  ])
  const filterCount = isActive === 'false' ? 1 : 0
  const chips: ActiveFilterChip[] =
    isActive === 'false'
      ? [{ key: 'isActive', label: 'Estado', value: 'Inactivos' }]
      : []

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Centros Médicos"
        subtitle="Clínicas, hospitales y consultorios donde atienden los médicos."
        actions={
          <>
            {canWrite && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo centro médico
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar centros médicos"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre o RNC"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft({ isActive })}
        />
        <TableToolbarActions
          title="Centros Médicos"
          headers={columnHeaders}
          rows={exportRows}
          filename="centros-medicos"
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={() => {
          setIsActive('true')
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de centros médicos."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft({ isActive: 'true' })
            setIsActive('true')
            setPage(1)
          }}
          clearDisabled={!filterCount && filterDraft.isActive === 'true'}
          onApply={() => {
            setIsActive(filterDraft.isActive)
            setPage(1)
            setFilterDraft(null)
          }}
        >
          <FilterField
            label="Estado del Centro"
            icon={<Activity className="size-4" />}
          >
            <select
              aria-label="Estado del centro"
              value={filterDraft.isActive}
              onChange={(event) =>
                setFilterDraft({
                  isActive: event.target.value as 'true' | 'false',
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </FilterField>
        </AdvancedFilterDialog>
      )}
      {centers.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el catálogo. {centers.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {centers.isFetching ? (
          <TableSkeleton columns={5} />
        ) : (
          <DataTable
            columns={columnHeaders}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3, 4]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item) openView(item)
            }}
            emptyTitle={
              isActive === 'false'
                ? 'No hay centros médicos inactivos'
                : 'Todavía no hay centros médicos'
            }
            emptyDescription={
              canWrite
                ? 'Agrega centros médicos para asignarlos a los médicos.'
                : 'Cuando tu organización tenga centros médicos, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={centers.data?.total ?? 0}
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
              ? 'Ver Centro Médico'
              : editing
                ? 'Editar Centro Médico'
                : 'Nuevo Centro Médico'
          }
          icon={<Building2 className="size-5" />}
          compactHeader
          description="Datos del centro donde atienden los médicos."
          onClose={closeForm}
          size="lg"
        >
          <MedicalCenterForm
            key={editing?.id ?? 'new'}
            center={editing ?? undefined}
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
