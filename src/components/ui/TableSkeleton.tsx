import { Skeleton } from './Skeleton'

export function TableSkeleton({
  columns,
  rows = 5,
  avatar = false,
  actions = false,
}: {
  columns: number
  rows?: number
  avatar?: boolean
  actions?: boolean
}) {
  const middleColumns = Math.max(columns - 2, 0)
  const template = [
    avatar ? 'minmax(160px, 1.6fr)' : 'minmax(130px, 1.4fr)',
    ...Array.from({ length: middleColumns }, () => 'minmax(90px, 1fr)'),
    actions ? '44px' : 'minmax(90px, 1fr)',
  ].join(' ')

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando…"
      className="border-border overflow-hidden rounded-xl border bg-white"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className="bg-surface grid items-center gap-5 px-5 py-3.5"
            style={{ gridTemplateColumns: template }}
          >
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton
                key={index}
                className={
                  actions && index === columns - 1
                    ? 'h-3 w-4 justify-self-end'
                    : index === 0
                      ? 'h-3 w-20'
                      : 'h-3 w-14'
                }
              />
            ))}
          </div>
          <div className="divide-border divide-y">
            {Array.from({ length: rows }).map((_, row) => (
              <div
                key={row}
                className="grid items-center gap-5 px-5 py-4"
                style={{ gridTemplateColumns: template }}
              >
                {Array.from({ length: columns }).map((_, column) => {
                  const isFirst = column === 0
                  const isLast = column === columns - 1
                  if (isFirst && avatar) {
                    return (
                      <div key={column} className="flex items-center gap-3">
                        <Skeleton className="size-9 shrink-0 rounded-full" />
                        <Skeleton className="h-3.5 w-24" />
                      </div>
                    )
                  }
                  if (isLast && actions) {
                    return (
                      <Skeleton
                        key={column}
                        className="size-8 justify-self-end"
                      />
                    )
                  }
                  return (
                    <Skeleton
                      key={column}
                      className={
                        isFirst
                          ? 'h-3.5 w-28'
                          : column % 2 === 0
                            ? 'h-3.5 w-20'
                            : 'h-3.5 w-24'
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
