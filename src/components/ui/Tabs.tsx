import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type TabItem<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
  badge?: number
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  dense,
}: {
  tabs: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  dense?: boolean
}) {
  return (
    <div
      role="tablist"
      className={cn('border-border -mx-1 flex gap-1 border-b px-1', className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 font-medium transition',
              dense ? 'px-1.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
              active
                ? 'border-tealmax text-tealmax'
                : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.badge === 'number' && tab.badge > 0 && (
              <span className="bg-tealmax/10 text-tealmax rounded-full px-1.5 py-0.5 text-[11px] font-semibold">
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
