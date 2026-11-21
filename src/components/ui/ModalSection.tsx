import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

type SectionsContextValue = { count: number; register: () => () => void }
const SectionsContext = createContext<SectionsContextValue | null>(null)

/**
 * Lo monta `Dialog` alrededor de su contenido: cuenta cuántas secciones hay
 * para que, con dos o más, cada `ModalSection` sea contraíble y abra contraída.
 */
export function DialogSections({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  const register = useCallback(() => {
    setCount((value) => value + 1)
    return () => setCount((value) => value - 1)
  }, [])
  const value = useMemo(() => ({ count, register }), [count, register])
  return (
    <SectionsContext.Provider value={value}>
      {children}
    </SectionsContext.Provider>
  )
}

/**
 * Grouped field block used inside multi-section dialogs. Every section header
 * uses the same mint background so dialogs look consistent across modules.
 * Inside a `Dialog` with 2+ sections the header toggles the body and it starts
 * collapsed, except the first one of its group (override with `collapsible` /
 * `defaultCollapsed`). The body stays
 * mounted (only hidden) so the form keeps its values, and it reopens by itself
 * when a field inside is invalid. `forceOpen` keeps it expanded.
 */
export function ModalSection({
  icon,
  title,
  action,
  children,
  className,
  collapsible,
  defaultCollapsed,
  forceOpen = false,
}: {
  icon: ReactNode
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  forceOpen?: boolean
}) {
  const sections = useContext(SectionsContext)
  const register = sections?.register
  useLayoutEffect(() => register?.(), [register])
  const canCollapse = collapsible ?? (sections ? sections.count >= 2 : false)
  const [collapsed, setCollapsed] = useState(
    defaultCollapsed ?? sections !== null,
  )
  const open = !canCollapse || !collapsed || forceOpen
  const toggle = () => setCollapsed((value) => !value)
  // No son <button>: en modo ver el <fieldset disabled> del formulario
  // deshabilitaría los botones nativos y no se podrían desplegar las cards.
  const toggleProps = {
    role: 'button',
    tabIndex: 0,
    'aria-expanded': open,
    onClick: toggle,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggle()
      }
    },
  } as const
  const bodyRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Inside a dialog the first section of each group starts expanded.
  useLayoutEffect(() => {
    if (!sections) return
    const root = rootRef.current
    if (
      root?.parentElement?.querySelector(':scope > [data-modal-section]') ===
      root
    )
      setCollapsed(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (collapsed && bodyRef.current?.querySelector('[aria-invalid="true"]'))
      setCollapsed(false)
  })

  return (
    <div
      ref={rootRef}
      data-modal-section
      className={cn(
        'border-border overflow-hidden rounded-xl border',
        className,
      )}
    >
      <div className="bg-modulos print-card-header flex items-center gap-2 px-4 py-2.5">
        {canCollapse ? (
          <div
            {...toggleProps}
            className="flex cursor-pointer items-center gap-2 text-left"
          >
            <span className="text-cuidado">{icon}</span>
            <h3 className="text-petroleo text-sm font-semibold">{title}</h3>
          </div>
        ) : (
          <>
            <span className="text-cuidado">{icon}</span>
            <h3 className="text-petroleo text-sm font-semibold">{title}</h3>
          </>
        )}
        {action && (
          <div
            className="ml-2 flex shrink-0 items-center gap-1"
            onClickCapture={() => setCollapsed(false)}
          >
            {action}
          </div>
        )}
        {canCollapse && (
          <div
            {...toggleProps}
            aria-label={open ? 'Contraer sección' : 'Expandir sección'}
            className="text-petroleo ml-auto cursor-pointer rounded p-1 hover:bg-white/60"
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                !open && '-rotate-90',
              )}
            />
          </div>
        )}
      </div>
      <div
        ref={bodyRef}
        onInvalid={(event) => {
          if (open) return
          setCollapsed(false)
          const field = event.target as HTMLInputElement
          requestAnimationFrame(() => field.reportValidity?.())
        }}
        className={cn(
          'bg-surface grid gap-3 p-4',
          !open && 'hidden print:grid',
        )}
      >
        {children}
      </div>
    </div>
  )
}
