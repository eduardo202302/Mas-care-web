import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { BranchFormValues } from '@/schemas/branch'
import { BranchForm } from './BranchForm'
import type { components, paths } from '@/lib/api-types'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

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
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  // Distinct key from the full lookup list ['branches'] used by selectors.
  const branches = useQuery({
    queryKey: ['branches', 'table', page, rows],
    queryFn: () =>
      api<BranchList>(`/api/v1/branches?${pageQuery({ page, rows })}`),
  })
  const save = useMutation({
    mutationFn: (values: BranchFormValues) => {
      if (editing) {
        const body: components['schemas']['BranchPatch'] = values
        return api<components['schemas']['Branch']>(
          `/api/v1/branches/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      const body: components['schemas']['BranchInput'] = values
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
        ? branch.name
        : index === 1
          ? (branch.address ?? '')
          : branch.labelColor,
  )
  const tableRows = data.map((branch) => {
    const name = branch.name
    const color = branch.labelColor
    return [
      <BranchTag key="branch" name={name} labelColor={color} />,
      <span
        key="location"
        className="text-muted inline-flex items-center gap-1.5"
      >
        <MapPin className="size-3.5" />
        {branch.address ?? 'Sin dirección'}
      </span>,
      <span
        key="color"
        className="text-muted inline-flex items-center gap-2 text-xs"
      >
        <i
          className="size-3 rounded-full border border-black/10"
          style={{ backgroundColor: color }}
        />
        {color.toUpperCase()}
      </span>,
    ]
  })
  const tableActions = data.map((branch) => (
    <RowActions
      key={branch.id}
      label={branch.name}
      onEdit={canUpdate ? () => openEdit(branch) : undefined}
      onDelete={
        canDelete
          ? () => {
              if (window.confirm(`¿Eliminar la sucursal ${branch.name}?`))
                remove.mutate(branch.id)
            }
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
      {branches.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar las sucursales. {branches.error.message}
        </p>
      )}
      {remove.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos eliminar la sucursal. {remove.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {branches.isFetching ? (
          <TableSkeleton columns={3} />
        ) : (
          <DataTable
            columns={['Sucursal', 'Dirección', 'Etiqueta']}
            rows={tableRows}
            actions={tableActions}
            sortableColumns={[0, 1, 2]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const branch = data[index]
              if (branch) openView(branch)
            }}
            emptyTitle="Todavía no hay sucursales"
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
    </div>
  )
}
