import { useRef, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const defaultInputClass =
  'border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none'

/**
 * Campo de búsqueda de las listas: lupa a la izquierda y una "x" al final que
 * aparece cuando hay texto y lo borra. El borrado dispara el mismo `onChange`
 * que escribir, así cada pantalla conserva su propia lógica (p. ej. volver a
 * la página 1).
 */
export function SearchField({
  wrapperClassName,
  className,
  value,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string
  value: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function clear() {
    const input = inputRef.current
    if (!input) return
    // Asignar por el setter nativo hace que React detecte el cambio y llame a onChange.
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.call(input, '')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
  }

  return (
    <div className={cn('relative', wrapperClassName)}>
      <Search
        className="text-muted pointer-events-none absolute top-3 left-3 size-4"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        value={value}
        className={cn(className ?? defaultInputClass, 'pr-9')}
        {...props}
      />
      {value !== '' && (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          title="Borrar búsqueda"
          onClick={clear}
          className="text-muted hover:text-ink absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md transition hover:bg-slate-100"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
