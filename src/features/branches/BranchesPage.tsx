import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FilterBarRow, FilterSegmented } from '@/components/ui/AdvancedFilter'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { formatPhone } from '@/lib/phone'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { BranchFormValues } from '@/schemas/branch'
import { BranchForm } from './BranchForm'
import type { components, paths } from '@/lib/api-types'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

type BranchAddressDetails = components['schemas']['Branch']['addressDetails']

function addressText(details: BranchAddressDetails, key: string): string {
  const value = (details as Record<string, unknown> | null)?.[key]
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function addressValues(details: BranchAddressDetails) {
  return {
    address: addressText(details, 'address'),
    state: addressText(details, 'region'),
    city: addressText(details, 'city'),
    sector: addressText(details, 'sector'),
    postalCode: addressText(details, 'postalCode'),
    latitude: addressText(details, 'latitude'),
    longitude: addressText(details, 'longitude'),
  }
}

function toAddressDetails(values: BranchFormValues) {
  const details: Record<string, string | number> = {}
  if (values.address) details.address = values.address
  if (values.state) details.region = values.state
  if (values.city) details.city = values.city
  if (values.sector) details.sector = values.sector
  if (values.postalCode) details.postalCode = values.postalCode
  if (values.latitude) details.latitude = Number(values.latitude)
  if (values.longitude) details.longitude = Number(values.longitude)
  return details
}

export default function BranchesPage() {
  const canCreate = useCan('branches:write')
  const canUpdate = useCan('branches:write')
  const canDelete = useCan('branches:write')
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<
    components['schemas']['Branch'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)
  const [archiving, setArchiving] = useState<
    components['schemas']['Branch'] | null
  >(null)
  const [archived, setArchived] = useState<'true' | 'false'>('false')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  // Distinct key from the full lookup list ['branches'] used by selectors.
  const branches = useQuery({
    queryKey: ['branches', 'table', archived, page, rows],
    queryFn: () =>
      api<BranchList>(
        `/api/v1/branches?${pageQuery({ archived, page, rows })}`,
      ),
  })
  const save = useMutation({
    mutationFn: (values: BranchFormValues) => {
      const { address, city, state, postalCode, sector, latitude, longitude, ...rest } = values
      const payload = { ...rest, addressDetails: toAddressDetails(values) }
      if (editing) {
        const body: components['schemas']['BranchPatch'] = payload
        return api<components['schemas']['Branch']>(
          `/api/v1/branches/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      const body: components['schemas']['BranchInput'] = payload
      return api<components['schemas']['Branch']>('/api/v1/branches', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['branches'] })
      closeForm()
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/branches/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['branches'] })
      setArchiving(null)
    },
  })
  const restore = useMutation({
    mutationFn: (id: string) =>
      api<components['schemas']['Branch']>(
        `/api/v1/branches/${encodeURIComponent(id)}/restore`,
        { method: 'POST' },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
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
  function openEdit(branch: components['schemas']['Branch']) {
    setEditing(branch)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(branch: components['schemas']['Branch']) {
    setEditing(branch)
    setViewOnly(true)
    setFormOpen(true)
  }
  async function submit(values: BranchFormValues) {
    await save.mutateAsync(values)
  }
  const data = applyColumnSort(
    branches.data?.data ?? [],
    sort,
    (branch, index) =>
      index === 0
        ? branch.numericId
        : index === 1
          ? (branch.archivedAt ? 1 : 0)
          : index === 2
            ? branch.name
            : index === 3
              ? addressText(branch.addressDetails, 'address')
              : index === 4
                ? addressText(branch.addressDetails, 'sector')
                : index === 5
                  ? (branch.managerName ?? '')
                  : (branch.managerPhone ?? ''),
  )
  const tableRows = data.map((branch) => {
    const name = branch.name
    const color = branch.labelColor
    return [
      <span key="id" className="text-muted font-mono text-xs">
        {branch.numericId}
      </span>,
      <span key="state" className="text-muted">
        {branch.archivedAt ? 'Archivado' : 'Activo'}
      </span>,
      <BranchTag key="branch" name={name} labelColor={color} />,
      <span
        key="location"
        className="text-muted inline-flex items-center gap-1.5"
      >
        <MapPin className="size-3.5" />
        {addressText(branch.addressDetails, 'address') || 'Sin dirección'}
      </span>,
      <span key="sector" className="text-muted">
        {addressText(branch.addressDetails, 'sector') || 'Sin sector'}
      </span>,
      <span key="manager" className="text-muted">
        {branch.managerName ?? 'Sin encargado'}
      </span>,
      <span key="whatsapp" className="text-muted">
        {branch.managerPhone ? formatPhone(branch.managerPhone) : 'Sin WhatsApp'}
      </span>,
    ]
  })
  const tableActions = data.map((branch) => (
    <RowActions
      key={branch.id}
      label={branch.name}
      deleteLabel="Archivar"
      onEdit={canUpdate ? () => openEdit(branch) : undefined}
      onDelete={
        canDelete && !branch.archivedAt
          ? () => {
              remove.reset()
              setArchiving(branch)
            }
          : undefined
      }
      onRestore={
        canDelete && branch.archivedAt
          ? () => restore.mutate(branch.id)
          : undefined
      }
    />
  ))

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Sucursales"
        subtitle="Organiza los puntos de atención de tu farmacia."
        actions={
          <>
            {canCreate && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Nueva sucursal
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <FilterSegmented<'true' | 'false'>
          label="Filtrar sucursales archivadas"
          value={archived}
          options={[
            { value: 'false', label: 'Activas' },
            { value: 'true', label: 'Archivadas' },
          ]}
          onChange={(value) => {
            setArchived(value)
            setPage(1)
          }}
        />
      </FilterBarRow>
      {branches.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar las sucursales. {branches.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {branches.isFetching ? (
          <TableSkeleton columns={7} />
        ) : (
          <DataTable
            columns={[
              'ID',
              'Estado',
              'Sucursal',
              'Dirección',
              'Sector',
              'Nombre del Encargado',
              'WhatsApp',
            ]}
            rows={tableRows}
            actions={tableActions}
            sortableColumns={[0, 1, 2, 3, 4, 5, 6]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const branch = data[index]
              if (branch) openView(branch)
            }}
            emptyTitle={
              archived === 'true'
                ? 'No hay sucursales archivadas'
                : 'Todavía no hay sucursales'
            }
            emptyDescription={
              canCreate
                ? 'Crea la primera sucursal para empezar a organizar tu operación.'
                : 'Cuando tu organización tenga sucursales, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={branches.data?.total ?? 0}
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
              ? 'Ver Sucursal'
              : editing
                ? 'Editar Sucursal'
                : 'Nueva Sucursal'
          }
          description="Completa los datos de este punto de atención."
          icon={<Building2 className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeForm}
        >
          <BranchForm
            key={editing?.id ?? 'new'}
            initialValues={
              editing
                ? {
                    name: editing.name,
                    labelColor: editing.labelColor,
                    ...addressValues(editing.addressDetails),
                    description: editing.description ?? '',
                    managerName: editing.managerName ?? '',
                    managerPhone: editing.managerPhone ?? '',
                    managerEmail: editing.managerEmail ?? '',
                  }
                : undefined
            }
            onSave={submit}
            onCancel={closeForm}
            submitting={save.isPending}
            readOnly={viewOnly}
            onEdit={() => setViewOnly(false)}
          />
        </Dialog>
      )}
      {archiving && (
        <ConfirmDialog
          title="Confirmar"
          description={
            <>
              ¿Está seguro que desea archivar la sucursal{' '}
              <strong>{archiving.name}</strong>?
              {remove.isError && (
                <p role="alert" className="mt-3 text-sm text-red-800">
                  {remove.error.message}
                </p>
              )}
            </>
          }
          confirmLabel="Archivar"
          confirming={remove.isPending}
          onConfirm={() => remove.mutate(archiving.id)}
          onClose={() => setArchiving(null)}
        />
      )}
    </div>
  )
}
