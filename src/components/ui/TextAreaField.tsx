import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useId,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Opcional: omítelo si el campo ya tiene su propia etiqueta fuera. */
  label?: string
  error?: string
}

/**
 * Multiline field that starts as a single line and grows with its content
 * (no scrollbar, no manual drag handle). Matches `TextField` styling so both
 * can sit side by side in the same form grid.
 */
export const TextAreaField = forwardRef<HTMLTextAreaElement, Props>(
  function TextAreaField(
    { id, label, error, className, required, onChange, ...props },
    ref,
  ) {
    const generatedId = useId()
    const inputId = id ?? props.name ?? generatedId
    const innerRef = useRef<HTMLTextAreaElement | null>(null)

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref)
          (ref as { current: HTMLTextAreaElement | null }).current = node
      },
      [ref],
    )

    const resize = useCallback(() => {
      const element = innerRef.current
      if (!element) return
      element.style.height = 'auto'
      element.style.height = `${element.scrollHeight}px`
    }, [])

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event)
        // El valor del DOM ya está actualizado aquí; esperamos al repintado
        // para medir el alto real del contenido.
        requestAnimationFrame(resize)
      },
      [onChange, resize],
    )

    // Ajusta el alto inicial cuando el campo arranca con contenido ya guardado.
    useEffect(() => {
      resize()
    }, [resize])

    return (
      <div className="grid gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-ink text-sm font-medium',
              required && "after:ml-0.5 after:text-red-600 after:content-['*']",
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={setRefs}
          rows={1}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={handleChange}
          className={cn(
            'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 min-h-10 w-full resize-none overflow-hidden rounded-lg border bg-white px-3 py-2 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400',
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
  },
)
