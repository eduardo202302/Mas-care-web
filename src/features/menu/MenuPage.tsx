import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { api } from '@/lib/http'
import { buildMenuTree, menuIcon, type MenuItemDto } from '@/lib/menu'
import { cn } from '@/lib/cn'
import { useMe } from '@/lib/permissions'
import type { MenuItemFormValues } from '@/schemas/menu'
import { MenuItemForm } from './MenuItemForm'

type MenuList = { data: MenuItemDto[] }

function toBody(values: MenuItemFormValues) {
  return {
    label: values.label,
    path: values.path || null,
    icon: values.icon,
    order: Number(values.order),
    isActive: values.isActive,
    permission: values.permission || null,
    parentId: values.parentId || null,
  }
}

export default function MenuPage() {
  const { data: me, isPending: meLoading } = useMe()
  const isOwner = me?.isPlatformOwner ?? false
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItemDto | null>(null)
  const [deleting, setDeleting] = useState<MenuItemDto | null>(null)

  const menu = useQuery({
    queryKey: ['menu', 'all'],
    queryFn: () => api<MenuList>('/api/v1/menu?includeInactive=true'),
    enabled: isOwner,
  })
  // The sidebar reads the menu from /me, so every change refreshes both.
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['menu'] }),
      queryClient.invalidateQueries({ queryKey: ['me'] }),
    ])

  const save = useMutation({
    mutationFn: (values: MenuItemFormValues) =>
      editing
        ? api<MenuItemDto>(`/api/v1/menu/${encodeURIComponent(editing.id)}`, {
            method: 'PATCH',
            body: JSON.stringify(toBody(values)),
          })
        : api<MenuItemDto>('/api/v1/menu', {
            method: 'POST',
            body: JSON.stringify({ key: values.key, ...toBody(values) }),
          }),
    onSuccess: async () => {
      await refresh()
      closeForm()
    },
  })
  const toggleActive = useMutation({
    mutationFn: (item: MenuItemDto) =>
      api<MenuItemDto>(`/api/v1/menu/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !item.isActive }),
      }),
    onSuccess: refresh,
  })
  const reorder = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      api<MenuList>('/api/v1/menu/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      }),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: (item: MenuItemDto) =>
      api(`/api/v1/menu/${encodeURIComponent(item.id)}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await refresh()
      setDeleting(null)
    },
  })

  const items = menu.data?.data ?? []
  const tree = buildMenuTree(items)
  const ordered = tree.flatMap((node) => [
    { item: node as MenuItemDto, depth: 0 },
    ...node.children.map((child) => ({ item: child, depth: 1 })),
  ])

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    save.reset()
  }
  /** Items sharing a parent, in display order. */
  const siblingsOf = (item: MenuItemDto) =>
    ordered
      .map((entry) => entry.item)
      .filter((candidate) => candidate.parentId === item.parentId)
  function move(item: MenuItemDto, direction: -1 | 1) {
    const siblings = siblingsOf(item)
    const index = siblings.findIndex((candidate) => candidate.id === item.id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= siblings.length) return
    const next = [...siblings]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    reorder.mutate(
      next.map((sibling, position) => ({
        id: sibling.id,
        order: (position + 1) * 10,
      })),
    )
  }
  const positionOf = (item: MenuItemDto) => {
    const siblings = siblingsOf(item)
    return {
      index: siblings.findIndex((candidate) => candidate.id === item.id),
      count: siblings.length,
    }
  }

  const rows = ordered.map(({ item, depth }) => {
    const Icon = menuIcon(item.icon)
    return [
      <span
        key="label"
        className={cn(
          'inline-flex items-center gap-2 font-semibold',
          depth === 1 && 'pl-6',
        )}
      >
        <Icon className="text-tealmax size-4" aria-hidden="true" />
        {item.label}
        {!item.path && (
          <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-medium">
            Grupo
          </span>
        )}
      </span>,
      <span key="path" className="text-muted font-mono text-xs">
        {item.path ?? '—'}
      </span>,
      <span key="key" className="text-muted font-mono text-xs">
        {item.key}
      </span>,
      <span key="order" className="text-muted">
        {item.order}
      </span>,
      <button
        key="state"
        type="button"
        aria-pressed={item.isActive}
        aria-label={`${item.isActive ? 'Desactivar' : 'Activar'} ${item.label}`}
        disabled={toggleActive.isPending}
        onClick={() => toggleActive.mutate(item)}
        className={cn(
          'rounded-full px-3 py-1 text-xs font-semibold transition',
          item.isActive
            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        )}
      >
        {item.isActive ? 'Activo' : 'Inactivo'}
      </button>,
    ]
  })
  const actions = ordered.map(({ item }) => {
    const { index, count } = positionOf(item)
    return (
      <div key={item.id} className="flex items-center gap-1">
        <RowActions
          label={item.label}
          onEdit={() => {
            setEditing(item)
            setFormOpen(true)
          }}
          onDelete={() => {
            remove.reset()
            setDeleting(item)
          }}
        />
        <button
          type="button"
          aria-label={`Subir ${item.label}`}
          disabled={index <= 0 || reorder.isPending}
          onClick={() => move(item, -1)}
          className="text-muted hover:bg-surface hover:text-petroleo grid size-7 place-items-center rounded-md transition disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Bajar ${item.label}`}
          disabled={index < 0 || index >= count - 1 || reorder.isPending}
          onClick={() => move(item, 1)}
          className="text-muted hover:bg-surface hover:text-petroleo grid size-7 place-items-center rounded-md transition disabled:opacity-30"
        >
          <ArrowDown className="size-4" />
        </button>
      </div>
    )
  })

  const hasChildren = (item: MenuItemDto | null) =>
    item ? items.some((candidate) => candidate.parentId === item.id) : false
  const parents = items
    .filter((item) => !item.parentId && item.id !== editing?.id)
    .map((item) => ({ id: item.id, label: item.label }))

  return (
    <div className="animate-in">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">
            Administración
          </p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Menú
          </h1>
          <p className="text-muted mt-2 max-w-2xl text-sm">
            Catálogo único de pantallas del sistema. Los roles deciden cuáles ve
            cada usuario y el menú lateral se construye desde aquí.
          </p>
        </div>
        {isOwner && (
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nuevo ítem
          </Button>
        )}
      </div>
      {!meLoading && !isOwner && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          Solo el propietario global puede gestionar el catálogo de menú.
        </p>
      )}
      {menu.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el menú. {menu.error.message}
        </p>
      )}
      {(reorder.isError || toggleActive.isError) && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos actualizar el menú.{' '}
          {(reorder.error ?? toggleActive.error)?.message}
        </p>
      )}
      {isOwner &&
        (menu.isPending ? (
          <TableSkeleton columns={5} />
        ) : (
          <DataTable
            columns={[
              'Pantalla',
              'Ruta',
              'Clave',
              'Orden',
              'Estado',
            ]}
            rows={rows}
            actions={actions}
            emptyTitle="El menú está vacío"
            emptyDescription="Crea el primer ítem para que aparezca en el menú lateral."
          />
        ))}
      {formOpen && (
        <Dialog
          title={editing ? 'Editar ítem de menú' : 'Nuevo ítem de menú'}
          description="Los cambios se reflejan en el menú lateral de todos los usuarios con acceso."
          onClose={closeForm}
        >
          <MenuItemForm
            key={editing?.id ?? 'new'}
            mode={editing ? 'edit' : 'create'}
            initialValues={
              editing
                ? {
                    key: editing.key,
                    label: editing.label,
                    path: editing.path ?? '',
                    icon: editing.icon,
                    order: String(editing.order),
                    permission: editing.permission ?? '',
                    parentId: editing.parentId ?? '',
                    isActive: editing.isActive,
                  }
                : undefined
            }
            parents={parents}
            parentLocked={hasChildren(editing)}
            onSave={async (values) => {
              await save.mutateAsync(values)
            }}
            onCancel={closeForm}
            submitting={save.isPending}
          />
        </Dialog>
      )}
      {deleting && (
        <Dialog
          title="Eliminar ítem de menú"
          description={`¿Eliminar "${deleting.label}"? Se quitará también de todos los roles.`}
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
