import { useMemo, useState, type HTMLAttributes, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

export type DragHandleProps = {
  attributes: HTMLAttributes<HTMLElement>
  listeners: HTMLAttributes<HTMLElement>
  ref: (node: HTMLElement | null) => void
}

export type KanbanColumn<T> = {
  key: string
  title: string
  cards: T[]
  count?: number
  dueLabel?: string
  /** Closed columns stay visible but reject drops. Defaults to true. */
  droppable?: boolean
  emptyText?: string
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

export type KanbanMove<T> = {
  item: T
  from: string
  to: string
  afterId: string | null
  beforeId: string | null
}

/** Prefer the column under the pointer so empty columns receive drops too. */
const collisionDetectionStrategy: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  return within.length > 0 ? within : closestCorners(args)
}

export function KanbanBoard<T>({
  columns,
  getId,
  getLabel,
  canDragItem = () => true,
  renderCard,
  onMove,
  testIdPrefix,
  ariaLabel = 'Tablero Kanban',
}: {
  columns: KanbanColumn<T>[]
  getId: (item: T) => string
  getLabel: (item: T) => string
  canDragItem?: (item: T, columnKey: string) => boolean
  renderCard: (
    item: T,
    options: { dragHandleProps?: DragHandleProps; isDragging?: boolean },
  ) => ReactNode
  onMove: (move: KanbanMove<T>) => void
  testIdPrefix: string
  ariaLabel?: string
}) {
  const [active, setActive] = useState<{ item: T; column: string } | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const itemById = useMemo(() => {
    const map = new Map<string, { item: T; column: string }>()
    for (const column of columns) {
      for (const item of column.cards) {
        map.set(getId(item), { item, column: column.key })
      }
    }
    return map
  }, [columns, getId])

  function columnFor(id: string, overData: unknown): string | undefined {
    const data = overData as
      | { type?: string; column?: string }
      | null
      | undefined
    if (data?.column) return data.column
    if (data?.type === 'column') return id.replace(/^column:/, '')
    return itemById.get(id)?.column
  }

  function handleDragStart(event: DragStartEvent) {
    const found = itemById.get(String(event.active.id))
    if (found) setActive(found)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActive(null)
    const { active: dragged, over } = event
    if (!over) return
    const source = itemById.get(String(dragged.id))
    if (!source) return
    const overData = over.data.current
    const targetKey = columnFor(String(over.id), overData)
    if (!targetKey) return
    const targetColumn = columns.find((column) => column.key === targetKey)
    if (!targetColumn || targetColumn.droppable === false) return
    if (!canDragItem(source.item, source.column)) return

    const overIsCard = overData?.type === 'card'
    const targetCards = targetColumn.cards.filter(
      (item) => getId(item) !== getId(source.item),
    )
    let index = targetCards.length
    if (overIsCard) {
      const overIndex = targetCards.findIndex(
        (item) => getId(item) === String(over.id),
      )
      if (overIndex >= 0) index = overIndex
    }
    if (
      source.column === targetKey &&
      String(over.id) === String(dragged.id)
    ) {
      return
    }
    const afterId = index > 0 ? getId(targetCards[index - 1]!) : null
    const beforeId =
      index < targetCards.length ? getId(targetCards[index]!) : null
    if (source.column === targetKey) {
      const currentIndex = targetColumn.cards.findIndex(
        (item) => getId(item) === getId(source.item),
      )
      const currentAfter =
        currentIndex > 0 ? getId(targetColumn.cards[currentIndex - 1]!) : null
      if (currentAfter === afterId && beforeId === null) return
      if (currentAfter === afterId && beforeId === getId(source.item)) return
    }
    onMove({
      item: source.item,
      from: source.column,
      to: targetKey,
      afterId,
      beforeId,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragCancel={() => setActive(null)}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'Para mover una tarjeta, pulsa espacio, usa las flechas y vuelve a pulsar espacio para soltar. Pulsa Escape para cancelar.',
        },
        announcements: {
          onDragStart: ({ active: current }) =>
            `Tarjeta ${getLabel(itemById.get(String(current.id))!.item)} levantada.`,
          onDragOver: ({ active: current, over: target }) =>
            target
              ? `Tarjeta ${getLabel(itemById.get(String(current.id))!.item)} sobre ${columnFor(String(target.id), target.data.current) ?? 'otra columna'}.`
              : 'Fuera de una columna.',
          onDragEnd: ({ active: current, over: target }) =>
            target
              ? `Tarjeta ${getLabel(itemById.get(String(current.id))!.item)} soltada.`
              : 'Movimiento cancelado.',
          onDragCancel: ({ active: current }) =>
            `Movimiento de ${getLabel(itemById.get(String(current.id))!.item)} cancelado.`,
        },
      }}
    >
      <div
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      >
        {columns.map((column) => (
          <KanbanColumnView
            key={column.key}
            column={column}
            getId={getId}
            canDragItem={canDragItem}
            renderCard={renderCard}
            testIdPrefix={testIdPrefix}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="w-[min(85vw,320px)] rotate-1 opacity-95 shadow-2xl">
            {renderCard(active.item, { isDragging: true })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumnView<T>({
  column,
  getId,
  canDragItem,
  renderCard,
  testIdPrefix,
}: {
  column: KanbanColumn<T>
  getId: (item: T) => string
  canDragItem: (item: T, columnKey: string) => boolean
  renderCard: (
    item: T,
    options: { dragHandleProps?: DragHandleProps; isDragging?: boolean },
  ) => ReactNode
  testIdPrefix: string
}) {
  const droppable = column.droppable !== false
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.key}`,
    data: { type: 'column', column: column.key },
    disabled: !droppable,
  })
  return (
    <section
      ref={setNodeRef}
      data-testid={`${testIdPrefix}-column-${column.key}`}
      aria-label={`${column.title}, ${column.count ?? column.cards.length} tarjetas`}
      className={cn(
        'border-border flex w-[min(85vw,320px)] shrink-0 snap-start flex-col rounded-xl border bg-slate-50/80 transition xl:w-auto xl:min-w-[240px] xl:flex-1',
        isOver && droppable && 'border-tealmax ring-tealmax/15 bg-teal-50/60 ring-2',
        isOver && !droppable && 'border-red-200 bg-red-50/40',
      )}
    >
      <header className="border-border border-b px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-petroleo text-sm font-bold">{column.title}</h2>
          <span className="border-border rounded-full border bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
            {column.count ?? column.cards.length}
          </span>
        </div>
        {column.dueLabel && (
          <p className="text-muted mt-1 text-[11px] font-medium">
            {column.dueLabel}
          </p>
        )}
      </header>
      <div className="flex min-h-[160px] flex-1 flex-col gap-2 p-2.5">
        <SortableContext
          items={column.cards.map(getId)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((item) => (
            <SortableCard
              key={getId(item)}
              id={getId(item)}
              columnKey={column.key}
              item={item}
              disabled={!droppable || !canDragItem(item, column.key)}
              renderCard={renderCard}
              testIdPrefix={testIdPrefix}
            />
          ))}
        </SortableContext>
        {column.cards.length === 0 && (
          <p className="text-muted grid flex-1 place-items-center rounded-lg border border-dashed px-3 py-6 text-center text-xs">
            {column.emptyText ?? 'Sin tarjetas en esta columna.'}
          </p>
        )}
        {column.hasMore && (
          <Button
            type="button"
            className="mt-1 h-8 w-full text-xs"
            onClick={column.onLoadMore}
            disabled={column.loadingMore}
          >
            {column.loadingMore ? 'Cargando…' : 'Cargar más'}
          </Button>
        )}
      </div>
    </section>
  )
}

function SortableCard<T>({
  id,
  columnKey,
  item,
  disabled,
  renderCard,
  testIdPrefix,
}: {
  id: string
  columnKey: string
  item: T
  disabled: boolean
  renderCard: (
    item: T,
    options: { dragHandleProps?: DragHandleProps; isDragging?: boolean },
  ) => ReactNode
  testIdPrefix: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: 'card', column: columnKey, item },
    disabled,
  })
  const dragHandleProps: DragHandleProps | undefined = disabled
    ? undefined
    : {
        attributes: attributes as unknown as HTMLAttributes<HTMLElement>,
        listeners: (listeners ?? {}) as HTMLAttributes<HTMLElement>,
        ref: setActivatorNodeRef,
      }
  return (
    <div
      ref={setNodeRef}
      data-testid={`${testIdPrefix}-card-${id}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      {renderCard(item, { dragHandleProps, isDragging })}
    </div>
  )
}

export function DragHandle({
  label,
  dragHandleProps,
}: {
  label: string
  dragHandleProps: DragHandleProps
}) {
  return (
    <button
      type="button"
      ref={dragHandleProps.ref}
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
      aria-label={`Mover ${label}`}
      title="Arrastrar para mover"
      className="text-muted hover:bg-surface hover:text-petroleo grid size-7 cursor-grab place-items-center rounded-md transition active:cursor-grabbing"
    >
      <GripVertical className="size-4" aria-hidden="true" />
    </button>
  )
}
