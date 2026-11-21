import type { ReactNode } from 'react'
import { Plus, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/** Encabezado de las pestañas Médicos/Tratamientos/Condiciones del paciente. */
export function RelationTabHeader({
  description,
  addLabel,
  canWrite,
  onAdd,
}: {
  description: string
  addLabel: string
  canWrite: boolean
  onAdd: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-muted text-sm">{description}</p>
      {canWrite && (
        <Button type="button" className="shrink-0" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      )}
    </div>
  )
}

export function RelationList({ children }: { children: ReactNode }) {
  return <ul className="grid gap-1.5">{children}</ul>
}

/** Fila intercalada de la lista; `actions` va a la derecha. */
export function RelationRow({
  children,
  actions,
}: {
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <li className="odd:bg-surface flex items-start justify-between gap-2 rounded-lg px-3 py-2.5 even:bg-white">
      <div>{children}</div>
      {actions}
    </li>
  )
}

/** Estrella (marcar como principal) y X (quitar) de una fila. */
export function RelationActions({
  onSetPrimary,
  onRemove,
}: {
  /** Omitirlo cuando el elemento ya es el principal. */
  onSetPrimary?: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex shrink-0 gap-1">
      {onSetPrimary && (
        <button
          type="button"
          title="Marcar como principal"
          onClick={onSetPrimary}
          className="text-muted hover:text-tealmax"
        >
          <Star className="size-4" />
        </button>
      )}
      <button
        type="button"
        title="Quitar"
        onClick={onRemove}
        className="text-muted hover:text-red-600"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function PrincipalBadge() {
  return (
    <span className="bg-tealmax/10 text-tealmax ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
      Principal
    </span>
  )
}
