import { cn } from '@/lib/cn'

export function BranchTag({
  name,
  labelColor,
  solid = false,
  className,
}: {
  name: string
  labelColor: string
  solid?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2',
        solid
          ? 'bg-tealmax rounded-lg px-3 py-1.5 text-base font-semibold text-white'
          : 'border-border text-ink rounded-full border bg-white px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      {!solid && (
        <span
          aria-hidden="true"
          className="size-2 rounded-full"
          style={{ backgroundColor: labelColor }}
        />
      )}
      {name}
    </span>
  )
}
