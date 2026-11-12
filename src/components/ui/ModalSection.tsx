import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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
 * collapsed (override with `collapsible` / `defaultCollapsed`). The body stays
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
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (collapsed && bodyRef.current?.querySelector('[aria-invalid="true"]'))
      setCollapsed(false)
  })

  return (
    <div
      className={cn(
        'border-border overflow-hidden rounded-xl border',
        className,
      )}
    >
      <div className="bg-modulos flex items-center gap-2 px-4 py-2.5">
        {canCollapse ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="flex items-center gap-2 text-left"
          >
            <span className="text-cuidado">{icon}</span>
            <h3 className="text-petroleo text-sm font-semibold">{title}</h3>
          </button>
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
          <button
            type="button"
            onClick={toggle}
            aria-label={open ? 'Contraer sección' : 'Expandir sección'}
            aria-expanded={open}
            className="text-petroleo ml-auto rounded p-1 hover:bg-white/60"
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                !open && '-rotate-90',
              )}
            />
          </button>
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
