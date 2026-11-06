import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ListTree, Plus } from 'lucide-react'
import { RowActions } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { api } from '@/lib/http'
import { buildMenuTree, type MenuItemDto } from '@/lib/menu'
import { cn } from '@/lib/cn'
import { useMe } from '@/lib/permissions'
import type { MenuItemFormValues } from '@/schemas/menu'
import { MenuItemForm } from './MenuItemForm'
import { MenuOrderTable } from './MenuOrderTable'

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
    // Se aplica el nuevo orden de inmediato para que la fila no regrese a su lugar al soltarla.
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ['menu', 'all'] })
      const previous = queryClient.getQueryData<MenuList>(['menu', 'all'])
      const orderById = new Map(next.map(({ id, order }) => [id, order]))
      if (previous)
        queryClient.setQueryData<MenuList>(['menu', 'all'], {
          data: previous.data.map((item) => ({
            ...item,
            order: orderById.get(item.id) ?? item.order,
          })),
        })
      return { previous }
    },
    onError: (_error, _next, context) => {
      if (context?.previous)
        queryClient.setQueryData(['menu', 'all'], context.previous)
    },
    onSettled: refresh,
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

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    save.reset()
  }
  function reorderSiblings(orderedIds: string[]) {
    reorder.mutate(
      orderedIds.map((id, position) => ({ id, order: (position + 1) * 10 })),
    )
  }
  const renderActions = (item: MenuItemDto) => (
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
  )
  const renderState = (item: MenuItemDto) => (
    <button
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
    </button>
  )

  const hasChildren = (item: MenuItemDto | null) =>
    item ? items.some((candidate) => candidate.parentId === item.id) : false
  const parents = items
    .filter((item) => !item.parentId && item.id !== editing?.id)
    .map((item) => ({ id: item.id, label: item.label }))

  return (
    <div className="animate-in">
      <PageHeader
        title="Menú"
        subtitle="Catálogo único de pantallas del sistema. Los roles deciden cuáles ve cada usuario y el menú lateral se construye desde aquí."
        actions={
          <>
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
          </>
        }
      />
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
        ) : tree.length ? (
          <MenuOrderTable
            tree={tree}
            disabled={reorder.isPending}
            renderActions={renderActions}
            renderState={renderState}
            onReorder={reorderSiblings}
          />
        ) : (
          <EmptyState
            title="El menú está vacío"
            description="Crea el primer ítem para que aparezca en el menú lateral."
          />
        ))}
      {formOpen && (
        <Dialog
          title={editing ? 'Editar Ítem de Menú' : 'Nuevo Ítem de Menú'}
          icon={<ListTree className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
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
          <FormActions>
            <Button
              className="w-full sm:w-auto"
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              disabled={remove.isPending}
              onClick={() => remove.mutate(deleting)}
            >
              {remove.isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </FormActions>
        </Dialog>
      )}
    </div>
  )
}
