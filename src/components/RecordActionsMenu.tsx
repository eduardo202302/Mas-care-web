import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export type RecordAction = {
  label: string
  onClick: () => void
  danger?: boolean
}

/** «Acciones» dropdown shared by the patient and treatment records. */
export function RecordActionsMenu({ actions }: { actions: RecordAction[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  if (actions.length === 0) return null
  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Acciones
        <ChevronDown className="size-4" />
      </Button>
      {open && (
        <div
          role="menu"
          aria-label="Acciones"
          className="border-border absolute right-0 z-30 mt-1 w-56 rounded-xl border bg-white p-1.5 shadow-xl"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              className={`hover:bg-surface w-full rounded-lg px-2.5 py-2 text-left text-sm ${action.danger ? 'text-red-700' : 'text-ink'}`}
              onClick={() => {
                setOpen(false)
                action.onClick()
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
