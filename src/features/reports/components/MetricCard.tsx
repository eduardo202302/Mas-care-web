import type { ReactNode } from 'react'
import { DefinitionHelp } from './DefinitionHelp'

/**
 * Numerator/denominator metric tile, e.g. "87% — 174 de 200". When
 * `percentage` is null (denominator 0) shows "Sin datos" — never 0% or
 * 100%, per the API contract that null means "no data", not zero.
 */
export function MetricCard({
  label,
  numerator,
  denominator,
  percentage,
  definitions,
  definitionKey,
  trend,
}: {
  label: string
  numerator: number
  denominator: number
  percentage: number | null
  definitions?: Record<string, string>
  definitionKey?: string
  /** Optional extra line, e.g. previous-period comparison. */
  trend?: ReactNode
}) {
  return (
    <div className="border-border shadow-card rounded-xl border bg-white p-4">
      <div className="mb-1 flex items-center gap-1.5">
        <p className="text-muted text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        {definitionKey && (
          <DefinitionHelp definitions={definitions} term={definitionKey} label={label} />
        )}
      </div>
      {percentage === null ? (
        <p className="text-muted text-2xl font-bold">Sin datos</p>
      ) : (
        <p className="font-display text-petroleo text-2xl font-bold">
          {percentage}% <span className="text-muted text-sm font-medium">— {numerator} de {denominator}</span>
        </p>
      )}
      {trend && <div className="text-muted mt-1 text-xs">{trend}</div>}
    </div>
  )
}

/** Plain numeric tile for metrics without a numerator/denominator, e.g. avg_delay_days. */
export function SimpleMetricCard({
  label,
  value,
  unit,
  definitions,
  definitionKey,
}: {
  label: string
  value: number | null
  unit?: string
  definitions?: Record<string, string>
  definitionKey?: string
}) {
  return (
    <div className="border-border shadow-card rounded-xl border bg-white p-4">
      <div className="mb-1 flex items-center gap-1.5">
        <p className="text-muted text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        {definitionKey && (
          <DefinitionHelp definitions={definitions} term={definitionKey} label={label} />
        )}
      </div>
      {value === null ? (
        <p className="text-muted text-2xl font-bold">Sin datos</p>
      ) : (
        <p className="font-display text-petroleo text-2xl font-bold">
          {value}
          {unit ? <span className="text-muted text-sm font-medium"> {unit}</span> : null}
        </p>
      )}
    </div>
  )
}
