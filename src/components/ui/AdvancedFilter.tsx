import type { ReactNode } from 'react'
import { Check, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { cn } from '@/lib/cn'

/**
 * Control de campo con icono a la izquierda, tal como el Filtro Avanzado del
 * tablero: el icono vive en una cajita `bg-modulos` superpuesta y el control
 * lleva `pl-11` para dejarle sitio.
 */
export function FilterFieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="bg-modulos text-cuidado pointer-events-none absolute top-1/2 left-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md">
      {children}
    </span>
  )
}

/** Clase compartida por todos los controles dentro del panel de filtros. */
export const filterControlClass =
  'border-border focus:border-tealmax h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm outline-none'

/** Campo de filtro con etiqueta, icono y control. */
export function FilterField({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-ink text-sm font-medium">{label}</span>
      <span className="relative block">
        <FilterFieldIcon>{icon}</FilterFieldIcon>
        {children}
      </span>
    </label>
  )
}

export type ActiveFilterChip = {
  key: string
  label: string
  value: string
}

/**
 * Chips de los filtros activos, cada uno con una ✕ para quitarlo. Se muestran
 * bajo la barra de búsqueda, igual que en el tablero.
 */
export function ActiveFilterChips({
  chips,
  onRemove,
}: {
  chips: ActiveFilterChip[]
  onRemove: (key: string) => void
}) {
  if (!chips.length) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="border-border text-ink hover:bg-surface flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-medium"
        >
          {chip.label}: {chip.value}
          <X className="size-3" />
        </button>
      ))}
    </div>
  )
}

/** Botón que abre el panel. Se pinta primario cuando hay filtros activos. */
export function AdvancedFilterButton({
  open,
  count,
  onClick,
  label = 'Filtro Avanzado',
}: {
  open: boolean
  count: number
  onClick: () => void
  label?: string
}) {
  return (
    <Button
      type="button"
      variant={count > 0 ? 'primary' : 'secondary'}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="h-10 gap-1.5"
      onClick={onClick}
    >
      <SlidersHorizontal className="size-3.5" />
      {label}
      {count > 0 ? ` (${count})` : ''}
    </Button>
  )
}

/**
 * Diálogo del panel de filtros: mismo esqueleto que el del tablero — grilla de
 * campos con icono arriba y pie con Limpiar / Cancelar / Aplicar.
 */
export function AdvancedFilterDialog({
  open,
  title = 'Filtro Avanzado',
  description,
  onClose,
  onClear,
  onApply,
  clearDisabled = false,
  applyDisabled = false,
  children,
  size = 'lg',
}: {
  open: boolean
  title?: string
  description?: string
  onClose: () => void
  onClear: () => void
  onApply: () => void
  clearDisabled?: boolean
  applyDisabled?: boolean
  children: ReactNode
  size?: 'md' | 'lg'
}) {
  if (!open) return null
  return (
    <Dialog
      title={title}
      description={description}
      icon={<SlidersHorizontal className="size-6" />}
      onClose={onClose}
      size={size}
    >
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
      <div className="border-border mt-5 flex flex-col-reverse items-stretch justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
        <Button
          type="button"
          className="gap-1.5 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
          disabled={clearDisabled}
          onClick={onClear}
        >
          <Trash2 className="size-3.5" />
          Limpiar filtros
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="hover:border-red-200 hover:bg-red-50 hover:text-red-800"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            className="gap-1.5 hover:bg-emerald-700"
            disabled={applyDisabled}
            onClick={onApply}
          >
            <Check className="size-3.5" />
            Aplicar filtros
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

/** Contenedor de la barra de filtros (búsqueda + botón + acciones). */
export function FilterBarRow({
  children,
  className,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  className?: string
  'aria-label'?: string
}) {
  return (
    <section aria-label={ariaLabel} className={cn('mb-4', className)}>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
  )
}

/**
 * Filtro rápido de valores excluyentes, con el mismo aspecto que las pestañas
 * de alcance del tablero (`bg-surface`/`text-petroleo` para el activo). Se usa
 * para los filtros binarios del catálogo (Activos / Inactivos), que no merecen
 * un diálogo: se resuelven en un clic.
 */
export function FilterSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="border-border flex shrink-0 gap-1 rounded-lg border bg-white p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-semibold transition',
              active ? 'bg-surface text-petroleo' : 'text-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
