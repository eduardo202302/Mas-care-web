import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { id, label, error, className, required, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? props.name ?? generatedId
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={inputId}
        className={cn(
          'text-ink text-sm font-medium',
          required && "after:ml-0.5 after:text-red-600 after:content-['*']",
        )}
      >
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  )
})
