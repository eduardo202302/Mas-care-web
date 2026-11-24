import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, FileText, Hash, Plus, ShieldCheck } from 'lucide-react'
import { SearchField } from '@/components/ui/SearchField'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  filterControlClass,
  type ActiveFilterChip,
} from '@/components/ui/AdvancedFilter'
import { Button } from '@/components/ui/Button'
import { PurgeDialog } from '@/components/ui/PurgeDialog'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  StatusDraftProvider,
  useStatusDraft,
} from '@/components/ui/StatusDraft'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import type { components } from '@/lib/api-types'
import { api } from '@/lib/http'
import type { MenuItemDto } from '@/lib/menu'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import { RoleForm, type RoleSavePayload } from './RoleForm'

type RoleDto = components['schemas']['Role']
type RoleStateFilter = '' | 'active' | 'inactive'
type RoleKindFilter = '' | 'system' | 'custom'

type RoleFilters = {
  state: RoleStateFilter
  kind: RoleKindFilter
  id: string
  name: string
  description: string
}

const emptyFilters: RoleFilters = {
  state: '',
  kind: '',
  id: '',
  name: '',
  description: '',
}

const stateOptions: { value: RoleStateFilter; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]
const kindOptions: { value: RoleKindFilter; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'system', label: 'Sistema' },
  { value: 'custom', label: 'Personalizados' },
]
const roleColumns = [
  'ID',
  'Estado',
  'Nombre',
  'Descripción',
  'Usuarios',
  'Pantallas',
]

function distinctOptions(
  values: (string | null | undefined)[],
  selected: string,
) {
  const set = new Set(values.filter((value): value is string => !!value))
  if (selected) set.add(selected)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

export default function RolesPage() {
  const canManage = useCan('roles:write')
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)
  const [editing, setEditing] = useState<RoleDto | null>(null)
  const [purging, setPurging] = useState<RoleDto | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState<RoleFilters>(emptyFilters)
  const [filterDraft, setFilterDraft] = useState<RoleFilters | null>(null)
  const statusDraft = useStatusDraft(editing?.isActive ?? true)

  // Distinct key from the full list ['roles'] used by the user form.
  const roles = useQuery({
    queryKey: ['roles', 'table', page, rows],
    queryFn: () =>
      api<{ data: RoleDto[]; total: number }>(
        `/api/v1/roles?${pageQuery({ page, rows })}`,
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
        // El estado del interruptor del encabezado viaja en el mismo PATCH.
        const body = editing.isSystem
          ? { description }
          : {
              ...values,
              description,
              items,
              isActive: statusDraft.value,
            }
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
  const purge = useMutation({
    mutationFn: (role: RoleDto) =>
      api<void>(`/api/v1/roles/${encodeURIComponent(role.id)}/permanent`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await refresh()
      setPurging(null)
    },
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<RoleDto>(`/api/v1/roles/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: active }),
      }),
    onSuccess: async (updated) => {
      // Mantiene el interruptor del formulario abierto en sincronía.
      setEditing((current) =>
        current && current.id === updated.id
          ? { ...current, isActive: updated.isActive }
          : current,
      )
      await refresh()
    },
  })

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    setViewOnly(false)
    save.reset()
    statusDraft.reset()
  }
  function openEdit(role: RoleDto) {
    save.reset()
    statusDraft.reset()
    setEditing(role)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(role: RoleDto) {
    save.reset()
    statusDraft.reset()
    setEditing(role)
    setViewOnly(true)
    setFormOpen(true)
  }

  // La API no filtra roles: búsqueda y filtros se aplican a la página cargada.
  const needle = search.trim().toLowerCase()
  const idNeedle = applied.id.trim()
  const nameNeedle = applied.name.trim().toLowerCase()
  const descriptionNeedle = applied.description.trim().toLowerCase()
  const loadedRoles = roles.data?.data ?? []
  const visibleRoles = loadedRoles.filter((role) => {
    return (
      (!needle ||
        `${role.numericId} ${role.name} ${role.description ?? ''}`
          .toLowerCase()
          .includes(needle)) &&
      (!applied.state || role.isActive === (applied.state === 'active')) &&
      (!applied.kind || role.isSystem === (applied.kind === 'system')) &&
      (!idNeedle || String(role.numericId) === idNeedle) &&
      (!nameNeedle || role.name.toLowerCase().includes(nameNeedle)) &&
      (!descriptionNeedle ||
        (role.description ?? '').toLowerCase().includes(descriptionNeedle))
    )
  })
  const list = applyColumnSort(visibleRoles, sort, (role, index) =>
    index === 0
      ? role.numericId
      : index === 1
        ? role.isActive
          ? 1
          : 0
        : index === 2
          ? role.name
          : index === 3
            ? (role.description ?? '')
            : index === 4
              ? role.memberCount
              : role.items.filter((item) => item.canView).length,
  )
  const tableRows = list.map((role) => [
    <span key="id" className="text-muted font-mono text-xs">
      {role.numericId}
    </span>,
    <StatusBadge key="state" active={role.isActive} />,
    <span key="name" className="inline-flex items-center gap-2 font-semibold">
      {role.name}
      {role.isSystem && (
        <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-medium">
          Sistema
        </span>
      )}
    </span>,
    <span key="description" className="text-muted">
      {role.description ?? ''}
    </span>,
    <span key="users" className="text-muted">
      {role.memberCount}
    </span>,
    <span key="menus" className="text-muted">
      {role.items.filter((item) => item.canView).length}
    </span>,
  ])
  const printRows = list.map((role) => [
    String(role.numericId),
    role.isActive ? 'Activo' : 'Inactivo',
    role.isSystem ? `${role.name} (Sistema)` : role.name,
    role.description ?? '',
    String(role.memberCount),
    String(role.items.filter((item) => item.canView).length),
  ])
  const chips: ActiveFilterChip[] = []
  if (applied.state)
    chips.push({
      key: 'state',
      label: 'Estado',
      value: stateOptions.find((option) => option.value === applied.state)!
        .label,
    })
  if (applied.kind)
    chips.push({
      key: 'kind',
      label: 'Tipo',
      value: kindOptions.find((option) => option.value === applied.kind)!.label,
    })
  if (applied.id) chips.push({ key: 'id', label: 'ID', value: applied.id })
  if (applied.name)
    chips.push({ key: 'name', label: 'Nombre', value: applied.name })
  if (applied.description)
    chips.push({
      key: 'description',
      label: 'Descripción',
      value: applied.description,
    })
  const filterCount = chips.length
  const actions = list.map((role) =>
    canManage ? (
      <RowActions
        key={role.id}
        label={role.name}
        onEdit={() => openEdit(role)}
        onPurge={
          role.isSystem
            ? undefined
            : () => {
                purge.reset()
                setPurging(role)
              }
        }
      />
    ) : null,
  )

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Roles"
        subtitle="Define qué pantallas puede ver cada tipo de usuario. Asigna el rol al crear o editar un usuario."
        actions={
          <>
            {canManage && (
              <Button
                variant="primary"
                onClick={() => {
                  save.reset()
                  statusDraft.reset()
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <Plus className="size-4" />
                Crear Rol
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros de roles">
        <SearchField
          wrapperClassName="w-full sm:w-[34rem]"
          aria-label="Buscar roles"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nombre o descripción del rol"
        />
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft(applied)}
        />
        <TableToolbarActions
          title="Roles"
          filename="roles"
          headers={roleColumns}
          rows={printRows}
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          setApplied((current) => ({ ...current, [key]: '' }))
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de roles."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft(emptyFilters)
            setApplied(emptyFilters)
          }}
          clearDisabled={
            !filterCount &&
            JSON.stringify(filterDraft) === JSON.stringify(emptyFilters)
          }
          onApply={() => {
            setApplied(filterDraft)
            setFilterDraft(null)
          }}
        >
          <FilterField label="Estado" icon={<Activity className="size-4" />}>
            <Select
              aria-label="Estado del rol"
              value={filterDraft.state}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  state: event.target.value as RoleStateFilter,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {stateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Tipo" icon={<ShieldCheck className="size-4" />}>
            <Select
              aria-label="Tipo de rol"
              value={filterDraft.kind}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  kind: event.target.value as RoleKindFilter,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="ID" icon={<Hash className="size-4" />}>
            <Select
              aria-label="ID del rol"
              value={filterDraft.id}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, id: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {distinctOptions(
                loadedRoles.map((role) => String(role.numericId)),
                filterDraft.id,
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Nombre" icon={<ShieldCheck className="size-4" />}>
            <Select
              aria-label="Nombre del rol"
              value={filterDraft.name}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, name: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {distinctOptions(
                loadedRoles.map((role) => role.name),
                filterDraft.name,
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField
            label="Descripción"
            icon={<FileText className="size-4" />}
          >
            <Select
              aria-label="Descripción del rol"
              value={filterDraft.description}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  description: event.target.value,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {distinctOptions(
                loadedRoles.map((role) => role.description),
                filterDraft.description,
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </FilterField>
        </AdvancedFilterDialog>
      )}
      {roles.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar los roles. {roles.error.message}
        </p>
      )}
      {toggleActive.isError && !formOpen && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {toggleActive.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {roles.isPending ? (
          <TableSkeleton columns={6} />
        ) : (
          <DataTable
            columns={roleColumns}
            rows={tableRows}
            actions={canManage ? actions : undefined}
            sortableColumns={[0, 1, 2, 3, 4, 5]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const role = list[index]
              if (role) openView(role)
            }}
            emptyTitle="Aún no hay roles"
            emptyDescription="Crea un rol para controlar qué pantallas ve cada usuario."
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={roles.data?.total ?? 0}
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
        <StatusDraftProvider changed={statusDraft.changed}>
          <Dialog
            size="lg"
            title={
              viewOnly
                ? `Ver Rol: ${editing?.name}`
                : editing
                  ? `Editar rol ${editing.name}`
                  : 'Crear Rol'
            }
            description="Marca las pantallas que este rol puede ver."
            icon={<ShieldCheck className="size-5" />}
            compactHeader
            bodyClassName="pt-3"
            onClose={closeForm}
            headerAction={
              editing && canManage ? (
                <StatusToggle
                  active={statusDraft.value}
                  pending={save.isPending}
                  disabled={editing.isSystem || viewOnly}
                  onChange={statusDraft.set}
                />
              ) : undefined
            }
          >
            {toggleActive.isError && (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                {toggleActive.error.message}
              </p>
            )}
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
                readOnly={viewOnly}
                onEdit={() => setViewOnly(false)}
              />
            )}
          </Dialog>
        </StatusDraftProvider>
      )}
      {purging && (
        <PurgeDialog
          name={purging.name}
          confirming={purge.isPending}
          error={purge.isError ? purge.error.message : undefined}
          onConfirm={() => purge.mutate(purging)}
          onClose={() => setPurging(null)}
        />
      )}
    </div>
  )
}
