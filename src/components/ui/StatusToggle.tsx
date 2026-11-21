import { cn } from '@/lib/cn'

/** Interruptor Activo/Inactivo para el encabezado de los formularios. Aplica el cambio al instante. */
export function StatusToggle({
  active,
  onChange,
  pending = false,
  disabled = false,
}: {
  active: boolean
  onChange: (next: boolean) => void
  pending?: boolean
  disabled?: boolean
}) {
  return (
    <label
      data-no-dirty
      className={cn(
        'flex items-center gap-2 text-sm font-medium select-none',
        disabled || pending
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer',
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={active ? 'Activo' : 'Inactivo'}
        disabled={disabled || pending}
        onClick={() => onChange(!active)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition',
          active ? 'bg-emerald-600' : 'bg-red-500',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
            active && 'translate-x-5',
          )}
        />
      </button>
      <span className={active ? 'text-emerald-800' : 'text-red-700'}>
        {active ? 'Activo' : 'Inactivo'}
      </span>
    </label>
  )
}
