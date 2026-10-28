import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
}

export const PasswordField = forwardRef<HTMLInputElement, Props>(
  function PasswordField(
    { id, label, error, className, required, ...props },
    ref,
  ) {
    const generatedId = useId()
    const inputId = id ?? props.name ?? generatedId
    const [visible, setVisible] = useState(false)

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
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={visible ? 'text' : 'password'}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white pr-10 pl-3 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
            className="text-muted hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 transition"
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-700">
            {error}
          </p>
        )}
      </div>
    )
  },
)
