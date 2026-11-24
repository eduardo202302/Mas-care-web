import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { createPortal } from 'react-dom'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AtSign,
  Building2,
  CalendarDays,
  KeyRound,
  MessageCircle,
  MessageSquare,
  Power,
  ShieldCheck,
  Plus,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import { SearchField } from '@/components/ui/SearchField'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Dialog } from '@/components/ui/Dialog'
import { PurgeDialog } from '@/components/ui/PurgeDialog'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  StatusDraftProvider,
  useStatusDraft,
} from '@/components/ui/StatusDraft'
import { ModalSection } from '@/components/ui/ModalSection'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  FilterSelect,
  distinctOptions,
  filterControlClass,
  type ActiveFilterChip,
} from '@/components/ui/AdvancedFilter'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { editTitle } from '@/lib/editTitle'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { formatPhone } from '@/lib/phone'
import { useCan } from '@/lib/permissions'
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

const isUserActive = (user: object) =>
  (user as { isActive?: boolean }).isActive !== false

type UserFilters = {
  status: '' | 'active' | 'inactive'
  role: string
  branch: string
  whatsapp: string
  username: string
  from: string
  to: string
}

const emptyFilters: UserFilters = {
  status: '',
  role: '',
  branch: '',
  whatsapp: '',
  username: '',
  from: '',
  to: '',
}

function BranchesCell({
  branches,
}: {
  branches: { id: string; name: string }[]
}) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  if (!branches.length)
    return <span className="text-muted">Sin asignación</span>
  if (branches.length === 1)
    return <span className="text-muted">{branches[0]!.name}</span>
  function show(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    setPos({ left: rect.left, top: rect.bottom + 6 })
  }
  return (
    <span
      className="inline-flex max-w-[16rem] items-center gap-1.5"
      onMouseEnter={(event) => show(event.currentTarget)}
      onMouseLeave={() => setPos(null)}
      onFocus={(event) => show(event.currentTarget)}
      onBlur={() => setPos(null)}
    >
      <span className="text-muted truncate">{branches[0]!.name}</span>
      <span
        tabIndex={0}
        aria-label={`${branches.length} sucursales: ${branches
          .map((branch) => branch.name)
          .join(', ')}`}
        className="text-tealmax focus-visible:ring-tealmax/40 inline-flex shrink-0 items-center gap-0.5 rounded outline-none focus-visible:ring-2"
      >
        <MessageSquare className="size-4" />
        <span className="text-xs font-semibold">{branches.length}</span>
      </span>
      {pos &&
        createPortal(
          <span
            role="tooltip"
            style={{ left: pos.left, top: pos.top }}
            className="border-border text-ink pointer-events-none fixed z-50 grid min-w-48 gap-1.5 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg"
          >
            {branches.map((branch) => (
              <span key={branch.id} className="whitespace-nowrap">
                {branch.name}
              </span>
            ))}
          </span>,
          document.body,
        )}
    </span>
  )
}

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
        title="Acceso Y Rol"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              Rol en la Organización
            </dt>
            <dd className="text-ink text-sm font-medium">
              {user.roleName ?? 'Sin rol'}
              {user.roleActive === false && (
                <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                  Inactivo
                </span>
              )}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              Usuario
            </dt>
            <dd className="text-ink text-sm font-medium">
              {user.username ?? ''}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
              WhatsApp
            </dt>
            <dd className="text-ink text-sm font-medium">
              {user.phone ? formatPhone(user.phone) : ''}
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
  // El servidor no filtra por rol: se aplica sobre la página cargada.
  const [applied, setApplied] = useState<UserFilters>(emptyFilters)
  const [filterDraft, setFilterDraft] = useState<UserFilters | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [selectedId, setSelectedId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [purging, setPurging] = useState<
    components['schemas']['OrganizationUser'] | null
  >(null)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['OrganizationUser'] | null
  >(null)
  const statusDraft = useStatusDraft(editing ? isUserActive(editing) : true)

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
    queryKey: ['branches', 'organization'],
    queryFn: () => api<BranchList>('/api/v1/branches?scope=organization'),
    enabled: formOpen,
  })
  const canReadRoles = useCan('roles:read')
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: () =>
      api<{ data: components['schemas']['Role'][] }>('/api/v1/roles'),
    enabled: formOpen && canReadRoles,
  })
  // Only active roles can be assigned, but keep the edited user's current role
  // in the list so opening the form does not blank it.
  const activeRoles = (roles.data?.data ?? []).filter(
    (candidate) => candidate.isActive || candidate.id === editing?.roleId,
  )
  const createUser = useMutation({
    mutationFn: (values: UserCreateValues) => {
      const { roleId, ...rest } = values
      const body: components['schemas']['UserCreate'] = {
        ...rest,
        roleId: roleId ?? '',
      }
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
    mutationFn: ({ id, values }: { id: string; values: UserCreateValues }) =>
      api<components['schemas']['OrganizationUser']>(
        `/api/v1/users/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: values.name,
            username: values.username,
            email: values.email,
            phone: values.phone || null,
            ...(values.roleId ? { roleId: values.roleId } : {}),
            branchIds: values.branchIds,
          }),
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  const setActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api<components['schemas']['OrganizationUser']>(
        `/api/v1/users/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive }) },
      ),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditing((current) => (current ? { ...current, ...updated } : current))
    },
  })
  const purge = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/api/v1/users/${encodeURIComponent(id)}/permanent`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
      setPurging(null)
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

  const userRole = (user: components['schemas']['OrganizationUser']) =>
    user.roleName ?? 'Sin rol'
  const loadedUsers = users.data?.data ?? []
  const roleOptions = Array.from(
    new Set([
      ...loadedUsers.map(userRole),
      ...(applied.role ? [applied.role] : []),
    ]),
  ).sort((a, b) => a.localeCompare(b, 'es'))
  const branchOptions = Array.from(
    new Set([
      ...loadedUsers.flatMap((user) =>
        user.branches.map((branch) => branch.name),
      ),
      ...(applied.branch ? [applied.branch] : []),
    ]),
  ).sort((a, b) => a.localeCompare(b, 'es'))
  const usernameOptions = distinctOptions(
    loadedUsers.map((user) => user.username),
    applied.username,
  )
  const whatsappOptions = distinctOptions(
    loadedUsers.map((user) => (user.phone ? formatPhone(user.phone) : '')),
    applied.whatsapp,
  )
  const matchesFilters = (user: components['schemas']['OrganizationUser']) => {
    const joined = (user.memberSince || user.createdAt || '').slice(0, 10)
    return (
      (!applied.status ||
        isUserActive(user) === (applied.status === 'active')) &&
      (!applied.role || userRole(user) === applied.role) &&
      (!applied.branch ||
        user.branches.some((branch) => branch.name === applied.branch)) &&
      (!applied.whatsapp ||
        (user.phone ? formatPhone(user.phone) : '') === applied.whatsapp) &&
      (!applied.username || user.username === applied.username) &&
      (!applied.from || joined >= applied.from) &&
      (!applied.to || joined <= applied.to)
    )
  }
  const sortedUsers = applyColumnSort(
    loadedUsers.filter(matchesFilters),
    sort,
    (user, index) =>
      index === 0
        ? user.numericId
        : index === 1
          ? String(isUserActive(user))
          : index === 4
            ? user.name
            : index === 5
              ? (user.username ?? '')
              : index === 6
                ? (user.phone ?? '')
                : user.email,
  )
  const tableRows = sortedUsers.map((user) => [
    <span key="id" className="text-muted font-mono text-xs">
      {user.numericId}
    </span>,
    <StatusBadge key="status" active={isUserActive(user)} />,
    <BranchesCell key="branches" branches={user.branches} />,
    <span
      key="role"
      className={
        user.roleActive === false
          ? 'inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700'
          : 'bg-surface text-petroleo inline-flex rounded-full px-2.5 py-1 text-xs font-semibold'
      }
    >
      {user.roleName ?? 'Sin rol'}
      {user.roleActive === false ? ' · Inactivo' : ''}
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
      {user.username ?? ''}
    </span>,
    <span key="phone" className="text-ink">
      {user.phone ? formatPhone(user.phone) : ''}
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
      onPurge={
        canManage
          ? () => {
              purge.reset()
              setPurging(user)
            }
          : undefined
      }
    />
  ))

  const columnHeaders = [
    'ID',
    'Estado',
    'Sucursales',
    'Rol',
    'Nombre',
    'Usuario',
    'WhatsApp',
    'Correo',
  ]
  const exportRows = sortedUsers.map((user) => [
    String(user.numericId),
    isUserActive(user) ? 'Activo' : 'Inactivo',
    user.branches.length
      ? user.branches.map((branch) => branch.name).join(', ')
      : 'Sin asignación',
    userRole(user),
    user.name,
    user.username ?? '',
    user.phone ? formatPhone(user.phone) : '',
    user.email,
  ])
  const chips: ActiveFilterChip[] = [
    ...(applied.status
      ? [
          {
            key: 'status',
            label: 'Estado',
            value: applied.status === 'active' ? 'Activos' : 'Inactivos',
          },
        ]
      : []),
    ...(applied.role
      ? [{ key: 'role', label: 'Rol', value: applied.role }]
      : []),
    ...(applied.branch
      ? [{ key: 'branch', label: 'Sucursal', value: applied.branch }]
      : []),
    ...(applied.whatsapp
      ? [
          {
            key: 'whatsapp',
            label: 'WhatsApp',
            value: applied.whatsapp,
          },
        ]
      : []),
    ...(applied.username
      ? [
          {
            key: 'username',
            label: 'Usuario',
            value: applied.username,
          },
        ]
      : []),
    ...(applied.from
      ? [{ key: 'from', label: 'Miembro desde', value: applied.from }]
      : []),
    ...(applied.to
      ? [{ key: 'to', label: 'Miembro hasta', value: applied.to }]
      : []),
  ]
  const filterCount = chips.length

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }
  function openForm() {
    statusDraft.reset()
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(user: components['schemas']['OrganizationUser']) {
    statusDraft.reset()
    setEditing(user)
    setFormOpen(true)
  }
  function closeForm() {
    statusDraft.reset()
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
                Crear Usuario
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <SearchField
          wrapperClassName="w-full sm:w-[34rem]"
          aria-label="Buscar usuarios"
          value={search}
          onChange={(event) => updateSearch(event.target.value)}
          placeholder="Buscar por nombre, usuario o correo"
        />
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft(applied)}
        />
        <TableToolbarActions
          title="Usuarios"
          headers={columnHeaders}
          rows={exportRows}
          filename="usuarios"
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          setApplied((current) => ({ ...current, [key]: '' }))
          setPage(1)
        }}
      />
      {setActive.isError && (
        <p role="alert" className="mb-2 text-sm text-red-700">
          {setActive.error.message}
        </p>
      )}
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de usuarios."
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
          <FilterField
            label="Rol del Usuario"
            icon={<ShieldCheck className="size-4" />}
          >
            <Select
              aria-label="Rol del usuario"
              value={filterDraft.role}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, role: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Estado" icon={<Power className="size-4" />}>
            <Select
              aria-label="Estado del usuario"
              value={filterDraft.status}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  status: event.target.value as UserFilters['status'],
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </Select>
          </FilterField>
          <FilterField label="Sucursal" icon={<Building2 className="size-4" />}>
            <Select
              aria-label="Sucursal del usuario"
              value={filterDraft.branch}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, branch: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {branchOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField
            label="WhatsApp"
            icon={<MessageCircle className="size-4" />}
          >
            <FilterSelect
              label="WhatsApp del usuario"
              value={filterDraft.whatsapp}
              options={whatsappOptions}
              onChange={(value) =>
                setFilterDraft({ ...filterDraft, whatsapp: value })
              }
            />
          </FilterField>
          <FilterField label="Usuario" icon={<AtSign className="size-4" />}>
            <FilterSelect
              label="Nombre de usuario"
              value={filterDraft.username}
              options={usernameOptions}
              onChange={(value) =>
                setFilterDraft({ ...filterDraft, username: value })
              }
            />
          </FilterField>
          <FilterField
            label="Miembro desde"
            icon={<CalendarDays className="size-4" />}
          >
            <input
              type="date"
              aria-label="Miembro desde"
              value={filterDraft.from}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, from: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
          <FilterField
            label="Miembro hasta"
            icon={<CalendarDays className="size-4" />}
          >
            <input
              type="date"
              aria-label="Miembro hasta"
              value={filterDraft.to}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, to: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
        </AdvancedFilterDialog>
      )}
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
            columns={columnHeaders}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 4, 5, 6, 7]}
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
        <StatusDraftProvider changed={statusDraft.changed}>
          <Dialog
            title={
              editing ? editTitle('usuario', editing.name) : 'Crear Usuario'
            }
            description={
              editing
                ? 'Actualiza los datos y el acceso de este usuario.'
                : 'Crea una cuenta con acceso a esta organización.'
            }
            icon={<UserRound className="size-5" />}
            compactHeader
            bodyClassName="pt-3"
            size="lg"
            onClose={closeForm}
            headerAction={
              editing && canManage ? (
                <StatusToggle
                  active={statusDraft.value}
                  pending={updateUser.isPending || setActive.isPending}
                  onChange={statusDraft.set}
                />
              ) : undefined
            }
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
                      ...(editing.roleId ? { roleId: editing.roleId } : {}),
                      ...(editing.roleName
                        ? { roleName: editing.roleName }
                        : {}),
                      branchIds: editing.branches.map((branch) => branch.id),
                    }
                  : undefined
              }
              roles={activeRoles}
              rolesLoading={roles.isLoading}
              branches={branches.data?.data ?? []}
              branchesLoading={branches.isLoading}
              onSave={async (values) => {
                if (editing) {
                  await updateUser.mutateAsync({
                    id: editing.id,
                    values,
                  })
                  if (statusDraft.changed) {
                    try {
                      await setActive.mutateAsync({
                        id: editing.id,
                        isActive: statusDraft.value,
                      })
                    } catch (error) {
                      // El error se muestra en el formulario, no en la página.
                      setActive.reset()
                      throw error
                    }
                  }
                  closeForm()
                } else {
                  await createUser.mutateAsync(values)
                }
              }}
              onCancel={closeForm}
              submitting={
                createUser.isPending ||
                updateUser.isPending ||
                setActive.isPending
              }
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
