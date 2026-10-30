import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export function Dialog({
  title,
  description,
  icon,
  dense = false,
  compactHeader = false,
  onClose,
  children,
  size = 'md',
  bodyClassName,
}: {
  title: string
  description?: string
  icon?: ReactNode
  dense?: boolean
  compactHeader?: boolean
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg'
  bodyClassName?: string
}) {
  const compact = dense || compactHeader
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
        className={`animate-in border-border flex w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl ${dense ? '' : 'max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]'} ${size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`}
      >
        <header
          className={`border-border flex shrink-0 items-start justify-between gap-4 border-b ${compact ? 'px-5 py-3' : 'px-6 py-5'}`}
        >
          <div className={`flex items-start ${compact ? 'gap-3' : 'gap-4'}`}>
            {icon && (
              <div
                className={`bg-modulos text-cuidado flex shrink-0 items-center justify-center rounded-2xl ${compact ? 'size-10 rounded-xl' : 'size-14'}`}
              >
                {icon}
              </div>
            )}
            <div>
              <h2
                id={titleId}
                className={`font-display text-petroleo font-bold ${compact ? 'text-lg' : 'text-xl'}`}
              >
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className={`text-muted text-sm ${compact ? 'mt-0.5' : 'mt-1'}`}
                >
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
        <div
          className={cn(
            'min-h-0 flex-1',
            dense ? 'px-5 pt-2 pb-4' : 'overflow-y-auto px-6 py-5',
            bodyClassName,
          )}
        >
          {children}
        </div>
      </section>
    </div>,
    document.body,
  )
}
