import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'coral'
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'secondary', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'focus-visible:ring-tealmax inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'bg-tealmax hover:bg-petroleo text-white shadow-sm',
        variant === 'secondary' &&
          'border-border text-ink hover:bg-surface border bg-white',
        variant === 'ghost' && 'text-muted hover:text-ink hover:bg-white',
        variant === 'danger' &&
          'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100',
        variant === 'coral' &&
          'bg-coral hover:bg-coral/90 text-white shadow-sm',
        className,
      )}
      {...props}
    />
  )
})
