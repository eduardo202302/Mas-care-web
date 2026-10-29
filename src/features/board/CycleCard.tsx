import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  CalendarX2,
  ChevronDown,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  TriangleAlert,
  Warehouse,
} from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { StatusChip } from '@/components/StatusChip'
import { DragHandle, type DragHandleProps } from '@/components/kanban/KanbanBoard'
import { derivedStatusLabel, formatDate } from '@/lib/treatments'
import {
  cycleStatusLabels,
  isOpenCycle,
  openCycleStatuses,
  stockLevelDot,
  stockLevelLabels,
  type BoardCard,
  type CycleStatus,
} from '@/lib/board'
import { cn } from '@/lib/cn'
import { StagePicker } from './StagePicker'

/** Next step for an open cycle: notify first, then hand it over. */
function nextActionFor(status: CycleStatus) {
  if (status === 'to_notify') return 'Avisar'
  return openCycleStatuses.includes(status as (typeof openCycleStatuses)[number])
    ? 'Marcar entregado'
    : null
}

export function CycleCard({
  card,
  canMove,
  canEditDate,
  canWrite,
  canCreateIncident,
  canMarkStock,
  dragHandleProps,
  onNotice,
  onDeliver,
  onNotPickedUp,
  onChangeDate,
  onCreateIncident,
  onMoveTo,
  onUpdateStock,
}: {
  card: BoardCard
  canMove: boolean
  canEditDate: boolean
  canWrite: boolean
  canCreateIncident: boolean
  canMarkStock: boolean
  dragHandleProps?: DragHandleProps
  onNotice: () => void
  onDeliver: () => void
  onNotPickedUp: () => void
  onChangeDate: () => void
  onCreateIncident: () => void
  onMoveTo: (status: CycleStatus) => void
  onUpdateStock: () => void
}) {
  const open = isOpenCycle(card)
  const canDoSomething =
    canMove || canEditDate || canWrite || canCreateIncident || canMarkStock
  const derived = derivedStatusLabel(card.derived_status)
  const stock = card.stock_level

  return (
    <article
      className={cn(
        'border-border shadow-card relative rounded-xl border bg-white p-3 transition',
        'hover:border-tealmax/40',
      )}
      aria-label={`Tarjeta de ${card.patient.nombre}, ${card.medication.nombre}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <Link
            to={`/pacientes/${card.patient.id}`}
            className="text-petroleo hover:text-tealmax line-clamp-2 text-sm font-semibold hover:underline"
          >
            {card.patient.nombre}
          </Link>
          <p className="text-ink mt-1 text-xs font-medium">
            {card.medication.nombre}
          </p>
          <p className="text-muted text-[11px]">
            {card.medication.presentacion}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {dragHandleProps && (
            <DragHandle
              label={`${card.patient.nombre}, ${card.medication.nombre}`}
              dragHandleProps={dragHandleProps}
            />
          )}
          {canDoSomething && (
            <CycleCardMenu
              card={card}
              open={open}
              canMove={canMove}
              canEditDate={canEditDate}
              canWrite={canWrite}
              canCreateIncident={canCreateIncident}
              canMarkStock={canMarkStock}
              onNotice={onNotice}
              onDeliver={onDeliver}
              onNotPickedUp={onNotPickedUp}
              onChangeDate={onChangeDate}
              onCreateIncident={onCreateIncident}
              onMoveTo={onMoveTo}
              onUpdateStock={onUpdateStock}
            />
          )}
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <dt className="text-muted">Reposición</dt>
          <dd className="text-ink mt-0.5 font-semibold">
            {formatDate(card.expected_on)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Días</dt>
          <dd
            className={cn(
              'mt-0.5 font-semibold',
              card.days_remaining !== null && card.days_remaining < 0
                ? 'text-expired-text'
                : 'text-ink',
            )}
          >
            {card.days_remaining === null
              ? '—'
              : card.days_remaining < 0
                ? `${Math.abs(card.days_remaining)} d. vencido`
                : card.days_remaining === 0
                  ? 'Hoy'
                  : `${card.days_remaining} d.`}
          </dd>
        </div>
      </dl>

      <StagePicker card={card} canMove={canMove} />

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {card.status === 'delivered' || card.status === 'not_picked_up' ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
              card.status === 'delivered'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-950',
            )}
          >
            {cycleStatusLabels[card.status]}
          </span>
        ) : derived ? (
          <StatusChip status={derived} />
        ) : null}
        {card.prescription_flag && <StatusChip status="Receta por renovar" />}
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <dt className="text-muted">Responsable</dt>
          <dd className="text-ink mt-0.5 truncate font-semibold">
            {card.responsible?.nombre ?? 'Sin asignar'}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Próxima acción</dt>
          <dd className="text-ink mt-0.5 font-semibold">
            {nextActionFor(card.status) ?? '—'}
          </dd>
        </div>
      </dl>

      <div className="border-border mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2">
        <BranchTag
          name={card.branch.nombre}
          labelColor={card.branch.label_color}
          className="text-[11px]"
        />
        <span
          className="text-muted inline-flex items-center gap-1.5 text-[11px]"
          title={
            card.stock_reviewed_at
              ? `Revisado ${formatDate(card.stock_reviewed_at)}`
              : 'Sin revisión de existencias'
          }
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-2 rounded-full',
              stock ? stockLevelDot[stock] : 'bg-slate-300',
            )}
          />
          {stock ? stockLevelLabels[stock] : 'Sin marca'}
        </span>
      </div>
    </article>
  )
}

function CycleCardMenu({
  card,
  open,
  canMove,
  canEditDate,
  canWrite,
  canCreateIncident,
  canMarkStock,
  onNotice,
  onDeliver,
  onNotPickedUp,
  onChangeDate,
  onCreateIncident,
  onMoveTo,
  onUpdateStock,
}: {
  card: BoardCard
  open: boolean
  canMove: boolean
  canEditDate: boolean
  canWrite: boolean
  canCreateIncident: boolean
  canMarkStock: boolean
  onNotice: () => void
  onDeliver: () => void
  onNotPickedUp: () => void
  onChangeDate: () => void
  onCreateIncident: () => void
  onMoveTo: (status: CycleStatus) => void
  onUpdateStock: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
        setMoveOpen(false)
      }
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setMoveOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [menuOpen])

  function run(action: () => void) {
    setMenuOpen(false)
    setMoveOpen(false)
    action()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Acciones de ${card.patient.nombre}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
        className="text-muted hover:bg-surface hover:text-petroleo grid size-7 place-items-center rounded-md transition"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {menuOpen && (
        <div
          role="menu"
          aria-label={`Acciones de ${card.patient.nombre}`}
          className="border-border absolute top-8 right-0 z-30 w-60 rounded-xl border bg-white p-1.5 shadow-xl"
        >
          {open && canWrite && (
            <MenuButton
              icon={MessageCircle}
              label="Avisar"
              className="text-coral hover:bg-coral/10"
              onClick={() => run(onNotice)}
            />
          )}
          {open && canWrite && (
            <MenuButton
              icon={PackageCheck}
              label="Marcar entregado"
              onClick={() => run(onDeliver)}
            />
          )}
          {open && canWrite && (
            <MenuButton
              icon={PackageOpen}
              label="Marcar no retirado"
              onClick={() => run(onNotPickedUp)}
            />
          )}
          {open && canEditDate && (
            <MenuButton
              icon={CalendarClock}
              label="Cambiar fecha prevista"
              onClick={() => run(onChangeDate)}
            />
          )}
          {canCreateIncident && (
            <MenuButton
              icon={TriangleAlert}
              label="Crear incidencia"
              onClick={() => run(onCreateIncident)}
            />
          )}
          {canMarkStock && (
            <MenuButton
              icon={Warehouse}
              label="Actualizar existencias"
              onClick={() => run(onUpdateStock)}
            />
          )}
          {open && canMove && (
            <div className="border-border mt-1 border-t pt-1">
              <button
                type="button"
                role="menuitem"
                aria-expanded={moveOpen}
                className="text-ink hover:bg-surface flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm"
                onClick={() => setMoveOpen((value) => !value)}
              >
                <CalendarX2 className="size-4" />
                Mover a…
                <ChevronDown
                  className={`ml-auto size-3.5 transition ${moveOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {moveOpen && (
                <div className="grid gap-0.5 pb-1 pl-6">
                  {openCycleStatuses
                    .filter((status) => status !== card.status)
                    .map((status) => (
                      <button
                        key={status}
                        type="button"
                        role="menuitem"
                        className="text-ink hover:bg-surface rounded-md px-2 py-1.5 text-left text-xs"
                        onClick={() => run(() => onMoveTo(status))}
                      >
                        {cycleStatusLabels[status]}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: typeof MessageCircle
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'text-ink hover:bg-surface flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm',
        className,
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
