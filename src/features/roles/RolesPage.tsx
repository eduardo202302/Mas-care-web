import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import type { components } from '@/lib/api-types'
import { api } from '@/lib/http'
import type { MenuItemDto } from '@/lib/menu'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { roleLabel } from '@/lib/role-labels'
import { RoleForm, type RoleSavePayload } from './RoleForm'

type RoleDto = components['schemas']['Role']

export default function RolesPage() {
  const canManage = useCan('roles:write')
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoleDto | null>(null)
  const [deleting, setDeleting] = useState<RoleDto | null>(null)
  const [page, setPage] = useState(1)

  // Distinct key from the full list ['roles'] used by the user form.
  const roles = useQuery({
    queryKey: ['roles', 'table', page],
    queryFn: () =>
      api<{ data: RoleDto[]; total: number }>(
        `/api/v1/roles?${pageQuery({ page, rows: PAGE_ROWS })}`,
      ),
  })
  const catalog = useQuery({
    queryKey: ['menu', 'active'],
    queryFn: () => api<{ data: MenuItemDto[] }>('/api/v1/menu'),
    enabled: formOpen,
  })
  // A role change can alter the signed-in user's own sidebar.
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['roles'] }),
      queryClient.invalidateQueries({ queryKey: ['me'] }),
    ])

  const save = useMutation({
    mutationFn: ({ values, items }: RoleSavePayload) => {
      const description = values.description || null
      if (editing) {
        const body = editing.isSystem
          ? { description, ...(editing.key === 'owner' ? {} : { items }) }
          : { ...values, description, items }
        return api<RoleDto>(`/api/v1/roles/${encodeURIComponent(editing.id)}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      }
      return api<RoleDto>('/api/v1/roles', {
        method: 'POST',
        body: JSON.stringify({ ...values, description, items }),
      })
    },
    onSuccess: async () => {
      await refresh()
      closeForm()
    },
  })
  const remove = useMutation({
    mutationFn: (role: RoleDto) =>
      api(`/api/v1/roles/${encodeURIComponent(role.id)}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await refresh()
      setDeleting(null)
    },
  })

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    save.reset()
  }
  function openEdit(role: RoleDto) {
    save.reset()
    setEditing(role)
    setFormOpen(true)
  }

  const list = roles.data?.data ?? []
  const rows = list.map((role) => [
    <span key="name" className="inline-flex items-center gap-2 font-semibold">
      {role.name}
      {role.isSystem && (
        <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-medium">
          Sistema
        </span>
      )}
    </span>,
    <span key="description" className="text-muted">
      {role.description ?? '—'}
    </span>,
    <span key="base" className="text-muted">
      {roleLabel(role.baseRole)}
    </span>,
    <span key="users" className="text-muted">
      {role.memberCount}
    </span>,
    <span key="menus" className="text-muted">
      {role.items.filter((item) => item.canView).length}
    </span>,
    <span
      key="state"
      className={
        role.isActive
          ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800'
          : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'
      }
    >
      {role.isActive ? 'Activo' : 'Inactivo'}
    </span>,
  ])
  const actions = list.map((role) =>
    canManage ? (
      <RowActions
        key={role.id}
        label={role.name}
        onEdit={() => openEdit(role)}
        onDelete={
          role.isSystem
            ? undefined
            : () => {
                remove.reset()
                setDeleting(role)
              }
        }
      />
    ) : null,
  )

  return (
    <div className="animate-in">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">
            Administración
          </p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Roles
          </h1>
          <p className="text-muted mt-2 max-w-2xl text-sm">
            Define qué pantallas puede ver cada tipo de usuario. Asigna el rol
            al crear o editar un usuario.
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            onClick={() => {
              save.reset()
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nuevo rol
          </Button>
        )}
      </div>
      {roles.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar los roles. {roles.error.message}
        </p>
      )}
      {roles.isPending ? (
        <TableSkeleton columns={6} />
      ) : (
        <DataTable
          columns={[
            'Nombre',
            'Descripción',
            'Rol base',
            'Usuarios',
            'Pantallas',
            'Estado',
          ]}
          rows={rows}
          actions={canManage ? actions : undefined}
          onRowDoubleClick={
            canManage
              ? (index) => list[index] && openEdit(list[index])
              : undefined
          }
          emptyTitle="Aún no hay roles"
          emptyDescription="Crea un rol para controlar qué pantallas ve cada usuario."
        />
      )}
      {!roles.isPending && (
        <Pagination
          page={page}
          rows={PAGE_ROWS}
          total={roles.data?.total ?? 0}
          onChange={setPage}
        />
      )}
      {formOpen && (
        <Dialog
          size="lg"
          title={editing ? `Editar rol: ${editing.name}` : 'Nuevo rol'}
          description="Marca las pantallas que este rol puede ver."
          onClose={closeForm}
        >
          {catalog.isError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              No pudimos cargar el menú. {catalog.error.message}
            </p>
          )}
          {catalog.isPending ? (
            <TableSkeleton columns={5} />
          ) : (
            <RoleForm
              key={editing?.id ?? 'new'}
              role={editing ?? undefined}
              catalog={catalog.data?.data ?? []}
              onSave={async (payload) => {
                await save.mutateAsync(payload)
              }}
              onCancel={closeForm}
              submitting={save.isPending}
            />
          )}
        </Dialog>
      )}
      {deleting && (
        <Dialog
          title="Eliminar rol"
          description={`¿Eliminar el rol "${deleting.name}"?`}
          onClose={() => setDeleting(null)}
        >
          {remove.isError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {remove.error.message}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button
              variant="danger"
              disabled={remove.isPending}
              onClick={() => remove.mutate(deleting)}
            >
              {remove.isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  )
}
