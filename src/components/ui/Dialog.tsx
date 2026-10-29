import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Dialog({
  title,
  description,
  icon,
  onClose,
  children,
  size = 'md',
}: {
  title: string
  description?: string
  icon?: ReactNode
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg'
}) {
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`animate-in border-border flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`}
      >
        <header className="border-border flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="bg-modulos text-cuidado flex size-14 shrink-0 items-center justify-center rounded-2xl">
                {icon}
              </div>
            )}
            <div>
              <h2
                id={titleId}
                className="font-display text-petroleo text-xl font-bold"
              >
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-muted mt-1 text-sm">
                  {description}
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            aria-label="Cerrar"
            className="size-9 shrink-0 px-0"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </section>
    </div>,
    document.body,
  )
}
