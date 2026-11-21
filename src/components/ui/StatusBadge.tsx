import { cn } from '@/lib/cn'

/**
 * Píldora de estado Activo/Inactivo. Es el único diseño que se usa en tablas y
 * fichas: verde cuando está activo, rojo cuando está inactivo. `feminine` usa
 * "Activa/Inactiva" para registros de género femenino.
 */
export function StatusBadge({
  active,
  feminine = false,
  className,
}: {
  active: boolean
  feminine?: boolean
  className?: string
}) {
  const label = active
    ? feminine
      ? 'Activa'
      : 'Activo'
    : feminine
      ? 'Inactiva'
      : 'Inactivo'
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
        className,
      )}
    >
      {label}
    </span>
  )
}
