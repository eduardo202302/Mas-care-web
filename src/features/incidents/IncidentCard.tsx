import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  MoreHorizontal,
  UserRound,
} from 'lucide-react'
import { DragHandle, type DragHandleProps } from '@/components/kanban/KanbanBoard'
import { BranchTag } from '@/components/BranchTag'
import { incidentTypeLabels, type Incident } from '@/lib/incidents'
import { formatDateTime } from '@/lib/operations'
import { cn } from '@/lib/cn'

export function IncidentCard({
  incident,
  canMove,
  canResolve,
  dragHandleProps,
  onResolve,
  onAssign,
  onOpen,
}: {
  incident: Incident
  canMove: boolean
  canResolve: boolean
  dragHandleProps?: DragHandleProps
  onResolve: () => void
  onAssign: () => void
  onOpen: () => void
}) {
  const resolved = incident.status === 'resolved'
  const canDoSomething = canMove && !resolved
  return (
    <article
      className="border-border shadow-card rounded-xl border bg-white p-3"
      aria-label={`Incidencia ${incidentTypeLabels[incident.type]} de ${incident.patient?.fullName ?? 'paciente'}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <span className="border-border inline-flex items-center rounded-full border bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {incidentTypeLabels[incident.type]}
          </span>
          {incident.patient ? (
            <Link
              to={`/pacientes/${incident.patient.id}`}
              className="text-petroleo hover:text-tealmax mt-1.5 line-clamp-2 block text-sm font-semibold hover:underline"
            >
              {incident.patient.fullName}
            </Link>
          ) : (
            <p className="text-muted mt-1.5 text-sm">Sin paciente</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {dragHandleProps && (
            <DragHandle
              label={`incidencia ${incidentTypeLabels[incident.type]}`}
              dragHandleProps={dragHandleProps}
            />
          )}
          {canDoSomething && (
            <IncidentCardMenu
              incident={incident}
              canResolve={canResolve}
              onResolve={onResolve}
              onAssign={onAssign}
              onOpen={onOpen}
            />
          )}
        </div>
      </div>

      <p className="text-muted mt-2 line-clamp-3 text-xs leading-5">
        {incident.description}
      </p>

      {resolved && incident.resolution && (
        <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-950">
          <CheckCircle2 className="mr-1 inline size-3.5" />
          {incident.resolution}
        </p>
      )}

      <div className="border-border mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-[11px]">
        {incident.branch ? (
          <BranchTag
            name={incident.branch.name}
            labelColor={incident.branch.labelColor}
            className="text-[11px]"
          />
        ) : (
          <span className="text-muted">Sucursal</span>
        )}
        <span className="text-muted inline-flex items-center gap-1">
          <UserRound className="size-3" />
          {incident.assignee?.name ?? 'Sin asignar'}
        </span>
      </div>
      <p className="text-muted mt-1 inline-flex items-center gap-1 text-[11px]">
        <CalendarDays className="size-3" />
        {formatDateTime(incident.createdAt)}
      </p>
    </article>
  )
}

function IncidentCardMenu({
  incident,
  canResolve,
  onResolve,
  onAssign,
  onOpen,
}: {
  incident: Incident
  canResolve: boolean
  onResolve: () => void
  onAssign: () => void
  onOpen: () => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Acciones de la incidencia"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="text-muted hover:bg-surface hover:text-petroleo grid size-7 place-items-center rounded-md transition"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="border-border absolute top-8 right-0 z-30 w-52 rounded-xl border bg-white p-1.5 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            className="text-ink hover:bg-surface flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm"
            onClick={() => {
              setOpen(false)
              onOpen()
            }}
          >
            <ChevronDown className="size-4 rotate-[-90deg]" />
            Ver detalle
          </button>
          <button
            type="button"
            role="menuitem"
            className="text-ink hover:bg-surface flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm"
            onClick={() => {
              setOpen(false)
              onAssign()
            }}
          >
            <UserRound className="size-4" />
            Asignar responsable
          </button>
          {canResolve && incident.status !== 'resolved' && (
            <button
              type="button"
              role="menuitem"
              className={cn(
                'hover:bg-surface flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm',
                'text-emerald-800',
              )}
              onClick={() => {
                setOpen(false)
                onResolve()
              }}
            >
              <CheckCircle2 className="size-4" />
              Resolver
            </button>
          )}
        </div>
      )}
    </div>
  )
}
