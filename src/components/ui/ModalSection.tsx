import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const tones = {
  mint: {
    header: 'bg-modulos',
    icon: 'text-cuidado',
    title: 'text-petroleo',
  },
  sky: {
    header: 'bg-sky-50',
    icon: 'text-sky-600',
    title: 'text-petroleo',
  },
  amber: {
    header: 'bg-amber-50',
    icon: 'text-amber-600',
    title: 'text-petroleo',
  },
} as const

export type ModalSectionTone = keyof typeof tones

/**
 * Grouped, color-coded field block used inside multi-section dialogs.
 * See designModal.md for the tone each kind of section should use.
 */
export function ModalSection({
  icon,
  title,
  tone = 'mint',
  action,
  children,
  className,
}: {
  icon: ReactNode
  title: string
  tone?: ModalSectionTone
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  const t = tones[tone]
  return (
    <div
      className={cn(
        'border-border overflow-hidden rounded-xl border',
        className,
      )}
    >
      <div className={cn('flex items-center gap-2 px-4 py-2.5', t.header)}>
        <span className={t.icon}>{icon}</span>
        <h3 className={cn('text-sm font-semibold', t.title)}>{title}</h3>
        {action && (
          <div className="-ml-1 flex shrink-0 items-center gap-1">{action}</div>
        )}
      </div>
      <div className="bg-surface grid gap-3 p-4">{children}</div>
    </div>
  )
}
