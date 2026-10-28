import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="border-border flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-white px-6 py-10 text-center">
      <span className="bg-surface text-tealmax mb-4 grid size-11 place-items-center rounded-full">
        <span className="size-2 rounded-full bg-current" />
      </span>
      <h2 className="text-ink text-base font-semibold">{title}</h2>
      <p className="text-muted mt-1 max-w-sm text-sm leading-6">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
