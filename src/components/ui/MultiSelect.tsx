import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDialogDirty } from './Dialog'

export type MultiSelectOption = { id: string; name: string }

const PANEL_MAX_HEIGHT = 192
const PANEL_GAP = 4
const VIEWPORT_MARGIN = 8

type PanelPosition = {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
}

export function MultiSelect({
  label,
  placeholder,
  emptyText,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  placeholder: string
  emptyText: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (ids: string[]) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<PanelPosition | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const markDirty = useDialogDirty()

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN
    const spaceAbove = rect.top - VIEWPORT_MARGIN
    const openUp = spaceBelow < PANEL_MAX_HEIGHT && spaceAbove > spaceBelow
    const available = (openUp ? spaceAbove : spaceBelow) - PANEL_GAP
    setPosition({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.min(PANEL_MAX_HEIGHT, Math.max(available, 96)),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + PANEL_GAP }
        : { top: rect.bottom + PANEL_GAP }),
    })
  }, [])

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      )
        setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  function toggle(id: string) {
    markDirty()
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    )
  }

  return (
    <div className={cn('min-w-0 flex-1', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2"
      >
        <span className={cn('truncate', !value.length && 'text-muted/70')}>
          {value.length
            ? `${value.length} seleccionado${value.length === 1 ? '' : 's'}`
            : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open &&
        position &&
        createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            style={{
              position: 'fixed',
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
            }}
            className="border-border app-scroll z-[60] overflow-y-auto rounded-lg border bg-white py-1 shadow-lg"
          >
            {options.length === 0 && (
              <li className="text-muted px-3 py-2 text-sm">{emptyText}</li>
            )}
            {options.map((option) => {
              const selected = value.includes(option.id)
              return (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onClick={() => toggle(option.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggle(option.id)
                    }
                  }}
                  className={cn(
                    'text-ink hover:bg-modulos focus:bg-modulos flex cursor-pointer items-center gap-2 px-3 py-2 text-sm outline-none',
                    selected && 'text-petroleo font-medium',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      selected
                        ? 'border-tealmax bg-tealmax text-white'
                        : 'border-border bg-white',
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                  {option.name}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </div>
  )
}
