import type { ReactNode } from 'react'

/**
 * Read-only information card: tinted header with icon, title, optional badge
 * on the right and an optional action slot. Used by record detail views.
 */
export function InfoCard({
  icon,
  title,
  badge,
  action,
  children,
  className = '',
}: {
  icon: ReactNode
  title: string
  badge?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`border-border flex flex-col overflow-hidden rounded-xl border bg-white ${className}`}
    >
      <header className="border-border flex items-center gap-2 border-b px-4 py-2.5">
        <span className="bg-modulos text-cuidado flex size-7 shrink-0 items-center justify-center rounded-md">
          {icon}
        </span>
        <h3 className="text-petroleo flex-1 text-sm font-semibold">{title}</h3>
        {action}
        {badge && (
          <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-semibold">
            {badge}
          </span>
        )}
      </header>
      <div className="bg-surface flex flex-1 flex-col gap-3 p-4">
        {children}
      </div>
    </section>
  )
}

/** Label/value pair used inside InfoCard. */
export function InfoFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-ink text-sm whitespace-pre-wrap">{value}</dd>
    </div>
  )
}
