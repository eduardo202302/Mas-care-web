import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Grouped field block used inside multi-section dialogs. Every section header
 * uses the same mint background so dialogs look consistent across modules.
 */
export function ModalSection({
  icon,
  title,
  action,
  children,
  className,
}: {
  icon: ReactNode
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border overflow-hidden rounded-xl border',
        className,
      )}
    >
      <div className="bg-modulos flex items-center gap-2 px-4 py-2.5">
        <span className="text-cuidado">{icon}</span>
        <h3 className="text-petroleo text-sm font-semibold">{title}</h3>
        {action && (
          <div className="-ml-1 flex shrink-0 items-center gap-1">{action}</div>
        )}
      </div>
      <div className="bg-surface grid gap-3 p-4">{children}</div>
    </div>
  )
}
