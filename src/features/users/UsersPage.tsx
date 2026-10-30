import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Dialog } from '@/components/ui/Dialog'
import { ModalSection } from '@/components/ui/ModalSection'
import { FilterBarRow } from '@/components/ui/AdvancedFilter'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { roleLabel } from '@/lib/role-labels'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { UserCreateValues } from '@/schemas/user'
import { UserForm } from './UserForm'
import type { components, paths } from '@/lib/api-types'

type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']
type UserQuery = NonNullable<
  paths['/api/v1/users']['get']['parameters']['query']
>
type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

function queryString(query: UserQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return params.toString()
}

function UserDetail({
  user,
  canManage,
  onRegeneratePin,
  regenerating,
}: {
  user: components['schemas']['OrganizationUser']
  canManage: boolean
  onRegeneratePin: () => void
  regenerating: boolean
}) {
  const branchLabel =
    user.branches.length === 1 ? 'Sucursal Asignada' : 'Sucursales Asignadas'
  return (
    <div className="grid gap-4">
      <div className="bg-surface flex items-center gap-4 rounded-xl p-4">
        <span className="bg-tealmax/10 text-petroleo grid size-14 shrink-0 place-items-center rounded-full text-lg font-bold">
          {user.name.trim().slice(0, 1).toLocaleUpperCase('es')}
        </span>
        <div className="min-w-0">
          <h3 className="text-petroleo truncate text-lg font-semibold">
            {user.name}
          </h3>
          <p className="text-muted truncate text-sm">{user.email}</p>
        </div>
      </div>

      <ModalSection
        icon={<UserRound className="size-4" />}
        title="Acceso y Rol"
        tone="mint"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              Rol en la Organización
            </dt>
            <dd className="text-ink text-sm font-medium">
              {user.roleName ?? roleLabel(user.role)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              Usuario
            </dt>
            <dd className="text-ink text-sm font-medium">
              {user.username ?? '—'}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              WhatsApp / Teléfono
            </dt>
            <dd className="text-ink text-sm font-medium">
              {user.phone ?? '—'}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              Miembro Desde
            </dt>
            <dd className="text-ink text-sm">
              {new Date(user.memberSince).toLocaleDateString('es')}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              Cuenta Creada
            </dt>
            <dd className="text-ink text-sm">
              {new Date(user.createdAt).toLocaleDateString('es')}
            </dd>
          </div>
        </div>
      </ModalSection>

      <ModalSection
        icon={<Building2 className="size-4" />}
        title={branchLabel}
        tone="sky"
        action={
          user.branches.length ? (
            <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-semibold">
              {user.branches.length}
            </span>
          ) : undefined
        }
      >
        {user.branches.length ? (
          <ul className="flex flex-wrap gap-2">
            {user.branches.map((branch) => (
              <li
                key={branch.id}
                className="border-border text-ink rounded-full border bg-white px-3 py-1 text-xs font-medium"
              >
                {branch.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted text-sm">Sin sucursales asignadas.</p>
        )}
      </ModalSection>

      {user.pin !== undefined && (
        <ModalSection
          icon={<KeyRound className="size-4" />}
          title="PIN de Recuperación"
          tone="amber"
          action={
            canManage ? (
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2.5 text-xs"
                disabled={regenerating}
                onClick={onRegeneratePin}
              >
                <RefreshCw
                  className={`size-3.5 ${regenerating ? 'animate-spin' : ''}`}
                />
                {regenerating
                  ? 'Generando…'
                  : user.pin
                    ? 'Regenerar'
                    : 'Generar'}
              </Button>
            ) : undefined
          }
        >
          {user.pin ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="border-border text-petroleo rounded-lg border bg-white px-3 py-2 font-mono text-lg font-semibold tracking-[0.35em]">
                {user.pin}
              </span>
              <span className="text-muted text-xs">Se renueva al usarlo.</span>
            </div>
          ) : (
            <p className="text-muted text-sm">Sin PIN configurado.</p>
          )}
          <p className="text-muted text-xs">
            El usuario puede usar este PIN si olvida su contraseña. Después de
            usarlo se genera uno nuevo.
          </p>
        </ModalSection>
      )}
    </div>
  )
}

function UserDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Cargando…" className="mt-5">
      <div className="bg-surface flex items-center gap-4 rounded-xl p-4">
        <Skeleton className="size-14 shrink-0 rounded-full" />
        <div className="grid gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const canManage = useCan('users:write')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [selectedId, setSelectedId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['OrganizationUser'] | null
  >(null)

  const filters = useMemo<UserQuery>(
    () => ({ q: search.trim() || undefined, page, rows }),
    [page, rows, search],
  )
  const users = useQuery({
    queryKey: ['users', filters],
    queryFn: () => api<UserList>(`/api/v1/users?${queryString(filters)}`),
  })
  const selectedUser = useQuery({
    queryKey: ['users', selectedId],
    queryFn: () =>
      api<components['schemas']['OrganizationUser']>(
        `/api/v1/users/${encodeURIComponent(selectedId)}`,
      ),
    enabled: Boolean(selectedId),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
    enabled: formOpen,
  })
  const canReadRoles = useCan('roles:read')
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: () =>
      api<{ data: components['schemas']['Role'][] }>('/api/v1/roles'),
    enabled: formOpen && canReadRoles,
  })
  const activeRoles = (roles.data?.data ?? []).filter(
    (candidate) => candidate.isActive,
  )
  const createUser = useMutation({
    mutationFn: (values: UserCreateValues) => {
      const body: components['schemas']['UserCreate'] = values
      return api<components['schemas']['OrganizationUser']>('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      setFormOpen(false)
      updateSearch(user.name)
    },
  })
  const updateUser = useMutation({
    mutationFn: ({
      id,
      values,
      keepRole,
    }: {
      id: string
      values: UserCreateValues
      keepRole: boolean
    }) =>
      api<components['schemas']['OrganizationUser']>(
        `/api/v1/users/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: values.name,
            username: values.username,
            email: values.email,
            phone: values.phone || null,
            ...(keepRole
              ? {}
              : { role: values.role, roleId: values.roleId ?? null }),
            branchIds: values.branchIds,
          }),
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      closeForm()
    },
  })
  const regeneratePin = useMutation({
    mutationFn: () =>
      api<components['schemas']['UserPin']>(
        `/api/v1/users/${encodeURIComponent(selectedId)}/pin`,
        { method: 'POST' },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['users', selectedId],
      })
    },
  })

  const sortedUsers = applyColumnSort(
    users.data?.data ?? [],
    sort,
    (user, index) =>
      index === 0
        ? user.id
        : index === 3
          ? user.name
          : index === 4
            ? (user.username ?? '')
            : index === 5
              ? (user.phone ?? '')
              : user.email,
  )
  const tableRows = sortedUsers.map((user) => [
    <span key="id" className="text-ink">
      {user.id ?? '—'}
    </span>,
    <span key="branches" className="text-muted">
      {user.branches.length
        ? user.branches.map((branch) => branch.name).join(', ')
        : 'Sin asignación'}
    </span>,
    <span
      key="role"
      className="bg-surface text-petroleo inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
    >
      {user.roleName ?? roleLabel(user.role)}
    </span>,
    <span
      key="name"
      className="text-petroleo inline-flex items-center gap-2 font-semibold"
    >
      <span className="bg-tealmax/10 grid size-8 place-items-center rounded-full">
        <UserRound className="size-4" />
      </span>
      {user.name}
    </span>,
    <span key="username" className="text-ink">
      {user.username ?? '—'}
    </span>,
    <span key="phone" className="text-ink">
      {user.phone ?? '—'}
    </span>,
    <span key="email" className="text-muted">
      {user.email}
    </span>,
  ])
  const rowActions = sortedUsers.map((user) => (
    <RowActions
      key={user.id}
      label={user.name}
      onEdit={canManage ? () => openEdit(user) : undefined}
    />
  ))

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }
  function openForm() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(user: components['schemas']['OrganizationUser']) {
    setEditing(user)
    setFormOpen(true)
  }
  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Usuarios"
        subtitle="Miembros con acceso a la organización y sus sucursales."
        actions={
          <>
            {canManage && (
              <Button variant="primary" onClick={openForm}>
                <Plus className="size-4" />
                Nuevo usuario
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <label className="relative min-w-[220px] flex-1">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar usuarios"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Buscar por nombre, usuario o correo"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none"
          />
        </label>
      </FilterBarRow>
      {users.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar los usuarios. {users.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {users.isFetching ? (
          <TableSkeleton columns={5} avatar />
        ) : (
          <DataTable
            columns={[
              'ID',
              'Sucursales',
              'Rol',
              'Nombre',
              'Usuario',
              'WhatsApp',
              'Correo',
            ]}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 3, 4, 5, 6]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const user = sortedUsers[index]
              if (user) setSelectedId(user.id)
            }}
            emptyTitle="No hay usuarios para mostrar"
            emptyDescription={
              search.trim()
                ? 'Prueba con otro nombre, usuario o correo.'
                : 'Los miembros con acceso aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={users.data?.total ?? 0}
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
      {selectedId && (
        <Dialog
          title="Ficha de Usuario"
          description="Información de acceso y asignación en esta organización."
          icon={<UserRound className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          size="lg"
          onClose={() => {
            setSelectedId('')
            regeneratePin.reset()
          }}
        >
          {selectedUser.isLoading ? (
            <UserDetailSkeleton />
          ) : selectedUser.isError ? (
            <p role="alert" className="mt-5 text-sm text-red-700">
              No pudimos cargar este usuario. {selectedUser.error.message}
            </p>
          ) : selectedUser.data ? (
            <>
              <UserDetail
                user={selectedUser.data}
                canManage={canManage}
                onRegeneratePin={() => regeneratePin.mutate()}
                regenerating={regeneratePin.isPending}
              />
              {regeneratePin.isError && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  No pudimos generar el PIN. {regeneratePin.error.message}
                </p>
              )}
            </>
          ) : null}
        </Dialog>
      )}
      {formOpen && (
        <Dialog
          title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}
          description={
            editing
              ? 'Actualiza los datos y el acceso de este usuario.'
              : 'Crea una cuenta con acceso a esta organización.'
          }
          icon={<UserRound className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeForm}
        >
          {branches.isError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              No pudimos cargar las sucursales. {branches.error.message}
            </p>
          )}
          <UserForm
            key={editing?.id ?? 'new'}
            mode={editing ? 'edit' : 'create'}
            initialValues={
              editing
                ? {
                    name: editing.name,
                    username: editing.username ?? '',
                    email: editing.email,
                    phone: editing.phone ?? '',
                    role: editing.role as UserCreateValues['role'],
                    ...(editing.roleId ? { roleId: editing.roleId } : {}),
                    branchIds: editing.branches.map((branch) => branch.id),
                  }
                : undefined
            }
            roleLocked={editing?.role === 'owner'}
            roles={activeRoles}
            rolesLoading={roles.isLoading}
            branches={branches.data?.data ?? []}
            branchesLoading={branches.isLoading}
            onSave={async (values) => {
              if (editing) {
                await updateUser.mutateAsync({
                  id: editing.id,
                  values,
                  keepRole: editing.role === 'owner',
                })
              } else {
                await createUser.mutateAsync(values)
              }
            }}
            onCancel={closeForm}
            submitting={createUser.isPending || updateUser.isPending}
          />
        </Dialog>
      )}
    </div>
  )
}
