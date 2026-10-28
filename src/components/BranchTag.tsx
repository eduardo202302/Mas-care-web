import { cn } from '@/lib/cn'

export function BranchTag({
  name,
  labelColor,
  className,
}: {
  name: string
  labelColor: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'border-border text-ink inline-flex items-center gap-2 rounded-full border bg-white px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: labelColor }}
      />
      {name}
    </span>
  )
}
