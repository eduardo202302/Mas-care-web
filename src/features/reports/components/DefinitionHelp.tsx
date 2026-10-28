import { useId, useState } from 'react'
import { CircleHelp } from 'lucide-react'

/**
 * Help icon that shows the real definition text the API sent in a report's
 * `definitions` map. Never invents or rewrites the text — if `definitions`
 * is missing the requested key, this renders nothing at all (no fallback
 * copy), per the API contract: definitions are authored server-side.
 */
export function DefinitionHelp({
  definitions,
  term,
  label,
}: {
  definitions: Record<string, string> | undefined
  term: string
  label: string
}) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()
  const text = definitions?.[term]
  if (!text) return null
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`Qué significa ${label}`}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        className="text-muted hover:text-tealmax inline-flex size-4 items-center justify-center rounded-full"
      >
        <CircleHelp className="size-3.5" />
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="border-border text-ink absolute top-5 left-0 z-10 w-56 rounded-lg border bg-white p-2.5 text-xs leading-5 shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  )
}
