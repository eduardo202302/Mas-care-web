import { forwardRef, useContext, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { FormOwnerContext } from './dialog-footer'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'coral'
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant: variantProp, ...props },
  ref,
) {
  // Los botones "Cancelar" / "Cerrar" se muestran en rojo y, dentro de un
  // diálogo con cambios sin guardar, piden confirmación antes de cerrar.
  const closes =
    variantProp === undefined &&
    props.type === 'button' &&
    typeof props.children === 'string' &&
    (props.children === 'Cancelar' || props.children === 'Cerrar')
  const variant = variantProp ?? (closes ? 'danger' : 'secondary')
  const formOwner = useContext(FormOwnerContext)
  return (
    <button
      ref={ref}
      form={props.type === 'submit' ? formOwner : undefined}
      data-dialog-close={closes ? '' : undefined}
      className={cn(
        'focus-visible:ring-tealmax inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'bg-tealmax hover:bg-petroleo text-white shadow-sm',
        variant === 'secondary' &&
          'border-border text-ink bg-modulos border hover:bg-[#c3e9cf]',
        variant === 'ghost' && 'text-muted hover:text-ink hover:bg-modulos',
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
