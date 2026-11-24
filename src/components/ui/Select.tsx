import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type SelectHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Cuántas opciones muestra la lista; el resto aparece al escribir para filtrar. */
const MAX_VISIBLE = 7
const PANEL_GAP = 4
const VIEWPORT_MARGIN = 8
const MIN_PANEL_WIDTH = 160

type Option = {
  value: string
  label: string
  disabled: boolean
  group?: string
}

type PanelPosition = {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
}

// Clases de layout (ancho, flex, grid, márgenes…) van al contenedor; el resto, al campo.
const LAYOUT_CLASS =
  /^(?:[a-z0-9-]+:)*(?:w-|min-w-|max-w-|flex-|grow|shrink|basis-|col-|row-|self-|justify-self-|order-|-?m[trblxy]?-)/

function splitClasses(className?: string) {
  const wrapper: string[] = []
  const field: string[] = []
  for (const token of (className ?? '').split(/\s+/).filter(Boolean)) {
    ;(LAYOUT_CLASS.test(token) ? wrapper : field).push(token)
  }
  return { wrapper: wrapper.join(' '), field: field.join(' ') }
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function readOptions(select: HTMLSelectElement): Option[] {
  return Array.from(select.options)
    .filter((option) => !option.hidden)
    .map((option) => {
      const group =
        option.parentElement instanceof HTMLOptGroupElement
          ? option.parentElement
          : null
      return {
        value: option.value,
        label: (option.textContent ?? '').trim(),
        disabled: option.disabled || Boolean(group?.disabled),
        group: group?.label,
      }
    })
}

const nativeValue = () =>
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Muestra todas las opciones en la lista, sin el límite de 7 ni el "escribe para filtrar". */
  showAll?: boolean
}

/**
 * Reemplazo de `<select>`: al pulsarlo muestra las primeras 7 opciones y, si se
 * escribe en el mismo campo, filtra. Mantiene la API de `<select>` (children
 * `<option>`, `value`/`onChange`, `register` de react-hook-form): por debajo
 * hay un `<select>` nativo oculto que es quien guarda el valor.
 */
export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  {
    className,
    id,
    title,
    style,
    autoFocus,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    showAll = false,
    children,
    ...nativeProps
  },
  forwardedRef,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listId = `${inputId}-options`
  const nativeRef = useRef<HTMLSelectElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState<PanelPosition | null>(null)
  const [shown, setShown] = useState({ value: '', label: '' })
  const disabled = Boolean(nativeProps.disabled)

  const syncShown = useCallback(() => {
    const native = nativeRef.current
    if (!native) return
    const label = (native.selectedOptions[0]?.textContent ?? '').trim()
    setShown((current) =>
      current.value === native.value && current.label === label
        ? current
        : { value: native.value, label },
    )
  }, [])
  const syncRef = useRef(syncShown)
  syncRef.current = syncShown

  // react-hook-form (setValue/reset) asigna `ref.value` sin disparar eventos.
  const setNativeRef = useCallback(
    (node: HTMLSelectElement | null) => {
      nativeRef.current = node
      if (node && !Object.prototype.hasOwnProperty.call(node, 'value')) {
        const original = nativeValue()
        Object.defineProperty(node, 'value', {
          configurable: true,
          get() {
            return original.get!.call(this)
          },
          set(next: string) {
            original.set!.call(this, next)
            syncRef.current()
          },
        })
      }
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )

  // Refleja el valor del select nativo tras cada render (controlado o no).
  useLayoutEffect(() => {
    syncShown()
  })

  useEffect(() => {
    const form = nativeRef.current?.form
    if (!form) return
    const onReset = () => window.setTimeout(() => syncRef.current(), 0)
    form.addEventListener('reset', onReset)
    return () => form.removeEventListener('reset', onReset)
  }, [])

  const options =
    open && nativeRef.current ? readOptions(nativeRef.current) : []
  const term = normalize(query.trim())
  const filtered = term
    ? options.filter((option) => normalize(option.label).includes(term))
    : options
  const visible = showAll ? filtered : filtered.slice(0, MAX_VISIBLE)
  const hiddenCount = filtered.length - visible.length

  const updatePosition = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const native = nativeRef.current
    const rows = showAll ? (native?.options.length ?? MAX_VISIBLE) : MAX_VISIBLE
    const groups = showAll
      ? (native?.querySelectorAll('optgroup').length ?? 0)
      : 0
    const wanted = 8 + rows * 36 + groups * 28 + 28
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN
    const spaceAbove = rect.top - VIEWPORT_MARGIN
    const openUp = spaceBelow < wanted && spaceAbove > spaceBelow
    const available = (openUp ? spaceAbove : spaceBelow) - PANEL_GAP
    setPosition({
      left: rect.left,
      width: Math.max(rect.width, MIN_PANEL_WIDTH),
      maxHeight: Math.min(wanted, Math.max(available, 96)),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + PANEL_GAP }
        : { top: rect.bottom + PANEL_GAP }),
    })
  }, [showAll])

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  function openList() {
    if (disabled || open) return
    const native = nativeRef.current
    if (native) {
      const index = readOptions(native)
        .slice(0, showAll ? undefined : MAX_VISIBLE)
        .findIndex((option) => option.value === native.value)
      setActive(Math.max(index, 0))
    }
    setOpen(true)
  }

  function closeList() {
    setOpen(false)
    setQuery('')
  }

  function choose(option: Option) {
    const native = nativeRef.current
    if (!native || option.disabled) return
    if (native.value !== option.value) {
      nativeValue().set!.call(native, option.value)
      native.dispatchEvent(new Event('change', { bubbles: true }))
    }
    syncShown()
    closeList()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) =>
        Math.min(Math.max(current + step, 0), Math.max(visible.length - 1, 0)),
      )
    } else if (event.key === 'Enter' && open) {
      event.preventDefault()
      const option = visible[active]
      if (option) choose(option)
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      closeList()
    }
  }

  function onBlur() {
    closeList()
    // react-hook-form marca el campo como "tocado" con el blur del select nativo.
    nativeRef.current?.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true }),
    )
  }

  const { wrapper: wrapperClass, field: fieldClass } = splitClasses(className)
  const emptySelected = shown.value === ''

  return (
    <div ref={wrapperRef} className={cn('relative min-w-0', wrapperClass)}>
      <input
        ref={inputRef}
        id={inputId}
        role="combobox"
        type="text"
        autoComplete="off"
        spellCheck={false}
        title={title}
        style={style}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={nativeProps.required || undefined}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          open && visible[active] ? `${listId}-${active}` : undefined
        }
        value={open ? query : emptySelected ? '' : shown.label}
        placeholder={shown.label}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          if (!open) setOpen(true)
        }}
        onClick={openList}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={cn(
          'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full truncate rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed aria-[invalid=true]:border-red-400',
          open && 'placeholder:text-ink/60',
          fieldClass,
          // Deja sitio a la flecha salvo que el llamador fije su propio `pr-*` (campos angostos).
          !/(^|\s)pr-/.test(fieldClass) && 'pr-9',
        )}
      />
      <ChevronDown
        aria-hidden="true"
        className={cn(
          'text-muted pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 transition-transform',
          open && 'rotate-180',
        )}
      />
      <select
        {...nativeProps}
        ref={setNativeRef}
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onFocus={() => inputRef.current?.focus()}
        onInvalid={(event) => {
          nativeProps.onInvalid?.(event)
          inputRef.current?.focus()
        }}
      >
        {children}
      </select>
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            onMouseDown={(event) => event.preventDefault()}
            style={{
              position: 'fixed',
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
            }}
            className="border-border app-scroll z-[60] overflow-y-auto rounded-lg border bg-white p-1 shadow-lg"
          >
            {visible.length === 0 && (
              <p className="text-muted px-3 py-2 text-sm">
                No hay resultados para esa búsqueda.
              </p>
            )}
            {visible.map((option, index) => {
              const selected = option.value === shown.value
              const showGroup =
                option.group && option.group !== visible[index - 1]?.group
              return (
                <div key={`${option.value}-${index}`}>
                  {showGroup && (
                    <p className="text-muted px-3 pt-2 pb-1 text-xs font-semibold uppercase">
                      {option.group}
                    </p>
                  )}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={option.disabled || undefined}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={cn(
                      'flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm',
                      index === active ? 'bg-modulos' : 'hover:bg-modulos',
                      selected ? 'text-petroleo font-semibold' : 'text-ink',
                      option.disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span className="min-w-0 break-words">
                      {option.label || '—'}
                    </span>
                    {selected && (
                      <Check className="text-tealmax size-4 shrink-0" />
                    )}
                  </div>
                </div>
              )
            })}
            {hiddenCount > 0 && (
              <p className="text-muted border-border mt-1 border-t px-3 pt-2 pb-1 text-xs">
                {hiddenCount === 1
                  ? '1 opción más: escribe para filtrar.'
                  : `${hiddenCount} opciones más: escribe para filtrar.`}
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
})
