import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Encabezado de página compacto: título y subtítulo apilados a la izquierda,
 * acciones a la derecha. El subtítulo siempre ocupa una sola línea (`truncate`)
 * para que el bloque no crezca en alto y la tabla gane espacio vertical.
 *
 * Reemplaza el patrón anterior (eyebrow + h1 text-3xl + subtítulo suelto) que
 * consumía cuatro líneas de altura.
 */
export function PageHeader({
  title,
  subtitle,
  meta,
  below,
  actions,
  size = 'default',
  className,
}: {
  title: string
  subtitle?: string
  /** Dato corto junto al título (p. ej. la fecha del día). No añade altura. */
  meta?: string
  /** Contenido pegado bajo el título (acciones rápidas de la ficha). */
  below?: ReactNode
  actions?: ReactNode
  /** `large` para fichas de detalle, donde el nombre es el protagonista. */
  size?: 'default' | 'large'
  className?: string
}) {
  const large = size === 'large'
  return (
    <div
      className={cn(
        'mb-4 flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h1
            className={cn(
              'font-display text-petroleo font-bold tracking-tight',
              large ? 'text-3xl' : 'text-2xl',
            )}
          >
            {title}
          </h1>
          {meta && (
            <span
              className={cn(
                'text-tealmax shrink-0 font-medium capitalize',
                large ? 'text-base' : 'text-xs',
              )}
            >
              {meta}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-muted mt-0.5 truncate text-sm" title={subtitle}>
            {subtitle}
          </p>
        )}
        {below && <div className="mt-1.5">{below}</div>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
