import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function FormActions({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border sticky bottom-0 z-10 -mx-6 -mb-5 flex flex-col-reverse gap-2 border-t bg-white px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  )
}
