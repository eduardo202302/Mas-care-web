import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircleMore } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Nube con flecha que flota bajo un punto de la pantalla, sin capturar el mouse. */
function Cloud({
  position,
  children,
}: {
  position: { x: number; y: number }
  children: ReactNode
}) {
  return createPortal(
    <div
      role="tooltip"
      style={{ left: position.x, top: position.y + 8 }}
      className="border-border text-ink pointer-events-none fixed z-[100] w-max max-w-56 -translate-x-1/2 rounded-xl border bg-white px-3 py-2 text-left text-sm font-normal shadow-xl"
    >
      <span className="border-border absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-t border-l bg-white" />
      {children}
    </div>,
    document.body,
  )
}

/** Texto que, si supera `max` caracteres, se corta con «…» y muestra el completo en la burbuja. */
export function TruncatedText({
  text,
  max,
  label = 'Ver texto completo',
}: {
  text: string | null | undefined
  max: number
  label?: string
}) {
  if (!text) return null
  if (text.length <= max) return <>{text}</>
  return (
    <span className="inline-flex items-center gap-1">
      {text.slice(0, max).trimEnd()}…
      <MoreBubble label={label} items={[text]} />
    </span>
  )
}

/**
 * Texto en una sola línea que el CSS corta con «…» cuando no cabe; al pasar el
 * mouse (o enfocarlo) solo si de verdad está cortado, muestra el completo en una nube.
 */
export function OverflowTooltip({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  )

  const show = () => {
    const element = ref.current
    if (!element || element.scrollWidth <= element.clientWidth) return
    const rect = element.getBoundingClientRect()
    setPosition({ x: rect.left + rect.width / 2, y: rect.bottom })
  }
  const hide = () => setPosition(null)

  return (
    <>
      <span
        ref={ref}
        tabIndex={0}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={cn('block truncate outline-none', className)}
      >
        {children}
      </span>
      {position && <Cloud position={position}>{children}</Cloud>}
    </>
  )
}

/** Burbuja azul que, al pasar el mouse o enfocarla, muestra en una nube el resto de elementos. */
export function MoreBubble({
  items,
  label = 'Ver más',
}: {
  items: string[]
  label?: string
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  )
  if (items.length === 0) return null

  const show = () => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) setPosition({ x: rect.left + rect.width / 2, y: rect.bottom })
  }
  const hide = () => setPosition(null)

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={`${label}: ${items.join(', ')}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (position) hide()
          else show()
        }}
        className="inline-flex shrink-0 align-middle text-blue-500 hover:text-blue-600"
      >
        <MessageCircleMore className="size-4" />
      </button>
      {position && (
        <Cloud position={position}>
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Cloud>
      )}
    </>
  )
}
