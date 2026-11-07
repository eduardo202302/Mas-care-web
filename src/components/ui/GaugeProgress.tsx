import { cn } from '@/lib/cn'

const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC = 0.75

/**
 * Medidor de arco abierto por abajo con el porcentaje al centro. Sin `percent`
 * es indeterminado: un tramo del arco gira mientras dura la operación.
 */
export function GaugeProgress({
  percent,
  label,
  className,
}: {
  percent?: number
  label: string
  className?: string
}) {
  const determinate = percent !== undefined
  const value = determinate ? Math.min(100, Math.max(0, percent)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={determinate ? value : undefined}
      className={cn('relative size-12', className)}
    >
      <svg viewBox="0 0 44 44" className="size-full">
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-slate-200"
          strokeDasharray={`${CIRCUMFERENCE * ARC} ${CIRCUMFERENCE}`}
          transform="rotate(135 22 22)"
        />
        {determinate ? (
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-violet-600 transition-[stroke-dasharray] duration-200"
            strokeDasharray={`${CIRCUMFERENCE * ARC * (value / 100)} ${CIRCUMFERENCE}`}
            transform="rotate(135 22 22)"
          />
        ) : (
          <g
            className="origin-center animate-spin"
            style={{ transformOrigin: '22px 22px' }}
          >
            <circle
              cx="22"
              cy="22"
              r={RADIUS}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-violet-600"
              strokeDasharray={`${CIRCUMFERENCE * 0.25} ${CIRCUMFERENCE}`}
            />
          </g>
        )}
      </svg>
      {determinate && (
        <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-slate-900">
          {value}%
        </span>
      )}
    </div>
  )
}
