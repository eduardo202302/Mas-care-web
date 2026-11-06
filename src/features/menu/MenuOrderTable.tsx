import type { ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/cn'
import { menuIcon, type MenuItemDto, type MenuNode } from '@/lib/menu'

const columns = ['Pantalla', 'Ruta', 'Clave', 'Orden', 'Estado']
const gridClass =
  'grid min-w-[56rem] grid-cols-[8rem_minmax(12rem,2fr)_minmax(8rem,1.5fr)_minmax(8rem,1.5fr)_4rem_6.5rem] items-center'

type Node = MenuNode<MenuItemDto>

function useReorderSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
}

function reorderedIds(ids: string[], event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return null
  const from = ids.indexOf(String(active.id))
  const to = ids.indexOf(String(over.id))
  if (from < 0 || to < 0) return null
  return arrayMove(ids, from, to)
}

function ItemRow({
  item,
  depth,
  actions,
  stateCell,
  handle,
  dragging = false,
}: {
  item: MenuItemDto
  depth: 0 | 1
  actions: ReactNode
  stateCell: ReactNode
  handle: ReactNode
  dragging?: boolean
}) {
  const Icon = menuIcon(item.icon)
  return (
    <div
      className={cn(
        gridClass,
        'px-3 py-3 text-sm',
        depth === 1 ? 'bg-surface/40' : 'bg-white',
        dragging && 'shadow-lg',
      )}
    >
      <div className="flex items-center gap-0.5">
        {handle}
        {actions}
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-2 px-5 font-semibold',
          depth === 1 && 'pl-11',
        )}
      >
        <Icon className="text-tealmax size-4 shrink-0" aria-hidden="true" />
        {item.label}
        {!item.path && (
          <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-medium">
            Grupo
          </span>
        )}
      </span>
      <span className="text-muted px-5 font-mono text-xs">
        {item.path ?? ''}
      </span>
      <span className="text-muted px-5 font-mono text-xs">{item.key}</span>
      <span className="text-muted px-5">{item.order}</span>
      <span className="px-5">{stateCell}</span>
    </div>
  )
}

function DragHandle({
  label,
  disabled,
  attributes,
  listeners,
  setActivatorNodeRef,
}: {
  label: string
  disabled: boolean
  attributes: ReturnType<typeof useSortable>['attributes']
  listeners: ReturnType<typeof useSortable>['listeners']
  setActivatorNodeRef: (node: HTMLElement | null) => void
}) {
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={`Arrastrar ${label} para cambiar su orden`}
      title="Arrastra para reordenar"
      disabled={disabled}
      className="text-muted hover:bg-surface hover:text-petroleo grid size-7 cursor-grab touch-none place-items-center rounded-md transition active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  )
}

function ChildRow({
  item,
  disabled,
  actions,
  stateCell,
}: {
  item: MenuItemDto
  disabled: boolean
  actions: ReactNode
  stateCell: ReactNode
}) {
  const sortable = useSortable({ id: item.id, disabled })
  return (
    <div
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
      className={cn(
        'border-border relative border-t',
        sortable.isDragging && 'z-10 opacity-80',
      )}
    >
      <ItemRow
        item={item}
        depth={1}
        actions={actions}
        stateCell={stateCell}
        dragging={sortable.isDragging}
        handle={
          <DragHandle
            label={item.label}
            disabled={disabled}
            attributes={sortable.attributes}
            listeners={sortable.listeners}
            setActivatorNodeRef={sortable.setActivatorNodeRef}
          />
        }
      />
    </div>
  )
}

function Group({
  node,
  disabled,
  renderActions,
  renderState,
  onReorder,
}: {
  node: Node
  disabled: boolean
  renderActions: (item: MenuItemDto) => ReactNode
  renderState: (item: MenuItemDto) => ReactNode
  onReorder: (orderedIds: string[]) => void
}) {
  const sortable = useSortable({ id: node.id, disabled })
  const sensors = useReorderSensors()
  const childIds = node.children.map((child) => child.id)
  return (
    <div
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
      className={cn(
        'border-border relative border-t bg-white first:border-t-0',
        sortable.isDragging && 'z-20 opacity-80 shadow-lg',
      )}
    >
      <ItemRow
        item={node}
        depth={0}
        actions={renderActions(node)}
        stateCell={renderState(node)}
        dragging={sortable.isDragging}
        handle={
          <DragHandle
            label={node.label}
            disabled={disabled}
            attributes={sortable.attributes}
            listeners={sortable.listeners}
            setActivatorNodeRef={sortable.setActivatorNodeRef}
          />
        }
      />
      {node.children.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const next = reorderedIds(childIds, event)
            if (next) onReorder(next)
          }}
        >
          <SortableContext
            items={childIds}
            strategy={verticalListSortingStrategy}
          >
            {node.children.map((child) => (
              <ChildRow
                key={child.id}
                item={child}
                disabled={disabled}
                actions={renderActions(child)}
                stateCell={renderState(child)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

/**
 * Menu catalog as a drag-and-drop list: top-level entries (with their
 * children) reorder among themselves, and children reorder inside their group.
 */
export function MenuOrderTable({
  tree,
  disabled = false,
  renderActions,
  renderState,
  onReorder,
}: {
  tree: Node[]
  disabled?: boolean
  renderActions: (item: MenuItemDto) => ReactNode
  renderState: (item: MenuItemDto) => ReactNode
  onReorder: (orderedIds: string[]) => void
}) {
  const sensors = useReorderSensors()
  const rootIds = tree.map((node) => node.id)
  return (
    <div className="border-border flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white">
      <div className="app-scroll min-h-0 flex-1 overflow-auto">
        <div className="min-w-[56rem]">
          <div
            className={cn(
              gridClass,
              'bg-surface text-muted sticky top-0 z-30 px-3 py-3.5 text-xs font-semibold tracking-wide uppercase',
            )}
          >
            <span>Acciones</span>
            {columns.map((column) => (
              <span key={column} className="px-5">
                {column}
              </span>
            ))}
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const next = reorderedIds(rootIds, event)
              if (next) onReorder(next)
            }}
          >
            <SortableContext
              items={rootIds}
              strategy={verticalListSortingStrategy}
            >
              {tree.map((node) => (
                <Group
                  key={node.id}
                  node={node}
                  disabled={disabled}
                  renderActions={renderActions}
                  renderState={renderState}
                  onReorder={onReorder}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
}
