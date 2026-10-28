import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
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
  const [page, setPage] = useState(1)
  // Distinct key from the full lookup list ['branches'] used by selectors.
  const branches = useQuery({
    queryKey: ['branches', 'table', page],
    queryFn: () =>
      api<BranchList>(
        `/api/v1/branches?${pageQuery({ page, rows: PAGE_ROWS })}`,
      ),
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
  }
  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(branch: components['schemas']['Branch']) {
    setEditing(branch)
    setFormOpen(true)
  }
  async function submit(values: BranchFormValues) {
    await save.mutateAsync(values)
  }
  const data = branches.data?.data ?? []
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
    <div className="animate-in">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">Configuración</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Sucursales
          </h1>
          <p className="text-muted mt-2 text-sm">
            Organiza los puntos de atención de tu farmacia.
          </p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={openCreate}>
            <Plus className="size-4" />
            Nueva sucursal
          </Button>
        )}
      </div>
      {branches.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar las sucursales. {branches.error.message}
        </p>
      )}
      {branches.isFetching ? (
        <TableSkeleton columns={3} />
      ) : (
        <DataTable
          columns={['Sucursal', 'Dirección', 'Etiqueta']}
          rows={tableRows}
          actions={tableActions}
          onRowDoubleClick={(index) => {
            const branch = data[index]
            if (branch && canUpdate) openEdit(branch)
          }}
          emptyTitle="Todavía no hay sucursales"
          emptyDescription={
            canCreate
              ? 'Crea la primera sucursal para empezar a organizar tu operación.'
              : 'Cuando tu organización tenga sucursales, aparecerán aquí.'
          }
        />
      )}
      {!branches.isFetching && (
        <Pagination
          page={page}
          rows={PAGE_ROWS}
          total={branches.data?.total ?? 0}
          onChange={setPage}
        />
      )}
      {formOpen && (
        <Dialog
          title={editing ? 'Editar sucursal' : 'Nueva sucursal'}
          description="Completa los datos de este punto de atención."
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
          />
        </Dialog>
      )}
    </div>
  )
}
