import type { components, paths } from './api-types'

/** The 6 report types the backend exposes under /api/v1/reports/*. */
export const reportTypes = [
  'adherence',
  'overdue',
  'no-response',
  'refills',
  'treatments-flow',
  'transfers',
] as const

export type ReportType = (typeof reportTypes)[number]

export function isReportType(value: string): value is ReportType {
  return (reportTypes as readonly string[]).includes(value)
}

export const reportLabels: Record<ReportType, string> = {
  adherence: 'Adherencia',
  overdue: 'Vencidos del mes',
  'no-response': 'Sin respuesta',
  refills: 'Reposiciones y pedidos',
  'treatments-flow': 'Altas y bajas',
  transfers: 'Traspasos',
}

export const reportDescriptions: Record<ReportType, string> = {
  adherence:
    'Porcentaje de ciclos entregados a tiempo, por mes, sucursal y medicamento.',
  overdue: 'Ciclos vencidos en el periodo, entregados tarde o aún pendientes.',
  'no-response':
    'Pacientes con avisos repetidos sin confirmación ni entrega posterior.',
  refills:
    'Unidades entregadas y previsión de demanda por medicamento y sucursal.',
  'treatments-flow':
    'Altas, pausas, reanudaciones y finalizaciones de tratamientos por mes.',
  transfers: 'Traslados de pacientes entre sucursales por origen y destino.',
}

/** Response payload shape per report type, keyed the same as `reportTypes`. */
export type ReportResponse = {
  adherence: components['schemas']['AdherenceResponse']
  overdue: components['schemas']['OverdueResponse']
  'no-response': components['schemas']['NoResponseResponse']
  refills: components['schemas']['RefillsResponse']
  'treatments-flow': components['schemas']['TreatmentsFlowResponse']
  transfers: components['schemas']['TransfersReportResponse']
}

export type ReportQuery =
  paths['/api/v1/reports/adherence']['get']['parameters']['query']

/**
 * Common report filters, serialized to/from the URL. `branch_id` is kept as
 * a string[] in app state and joined to a CSV only when building the query
 * (the API takes `branch_id=a,b,c`), matching the backend contract — never
 * store the joined string in state, it would round-trip badly through the
 * multi-select UI.
 */
export type ReportFilters = {
  from?: string
  to?: string
  branch_id: string[]
  group_by?: 'month' | 'week' | 'branch' | 'medication'
  compare_previous?: boolean
}

export function reportFiltersFromSearch(params: URLSearchParams): ReportFilters {
  const from = params.get('from')
  const to = params.get('to')
  const branch = params.get('branch_id')
  const groupBy = params.get('group_by')
  const comparePrevious = params.get('compare_previous')
  return {
    from: from ?? undefined,
    to: to ?? undefined,
    branch_id: branch ? branch.split(',').filter(Boolean) : [],
    group_by:
      groupBy === 'month' ||
      groupBy === 'week' ||
      groupBy === 'branch' ||
      groupBy === 'medication'
        ? groupBy
        : undefined,
    compare_previous: comparePrevious === '1' ? true : undefined,
  }
}

export function reportFiltersToSearch(filters: ReportFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.branch_id.length > 0) {
    params.set('branch_id', filters.branch_id.join(','))
  }
  if (filters.group_by) params.set('group_by', filters.group_by)
  if (filters.compare_previous) params.set('compare_previous', '1')
  return params
}

/** Builds the query object sent to the report endpoints from app filters. */
export function reportFiltersToQuery(filters: ReportFilters): ReportQuery {
  return {
    from: filters.from,
    to: filters.to,
    branch_id: filters.branch_id.length > 0 ? filters.branch_id.join(',') : undefined,
    group_by: filters.group_by,
    compare_previous: filters.compare_previous,
  }
}

/** Builds the query string for a GET /api/v1/reports/{type} request, skipping empty values. */
export function reportQueryString(filters: ReportFilters, extra?: Record<string, string | number | undefined>): string {
  const query = reportFiltersToQuery(filters)
  const params = new URLSearchParams()
  if (query?.from) params.set('from', query.from)
  if (query?.to) params.set('to', query.to)
  if (query?.branch_id) params.set('branch_id', query.branch_id)
  if (query?.group_by) params.set('group_by', query.group_by)
  if (query?.compare_previous) params.set('compare_previous', 'true')
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined) params.set(key, String(value))
  }
  return params.toString()
}

export const MAX_RANGE_MONTHS = 24

/**
 * Mirrors the backend's "from/to must be <= 24 months" validation so the
 * frontend never relies solely on the 400 response. Returns an error message
 * in Spanish when the range is invalid, or null when it is fine (including
 * when from/to are not both set — the backend applies its own defaults then).
 */
export function validateReportRange(from?: string, to?: string): string | null {
  if (!from || !to) return null
  const fromDate = new Date(`${from}T00:00:00Z`)
  const toDate = new Date(`${to}T00:00:00Z`)
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return 'Fechas inválidas.'
  }
  if (fromDate.getTime() > toDate.getTime()) {
    return 'La fecha "desde" debe ser anterior a la fecha "hasta".'
  }
  const months =
    (toDate.getUTCFullYear() - fromDate.getUTCFullYear()) * 12 +
    (toDate.getUTCMonth() - fromDate.getUTCMonth())
  if (months > MAX_RANGE_MONTHS) {
    return `El rango no puede superar ${MAX_RANGE_MONTHS} meses.`
  }
  return null
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export type DateRangePreset =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-12-months'
  | 'custom'

export const dateRangePresetLabels: Record<DateRangePreset, string> = {
  'this-month': 'Este mes',
  'last-month': 'Mes pasado',
  'last-3-months': 'Últimos 3 meses',
  'last-12-months': 'Últimos 12 meses',
  custom: 'Rango personalizado',
}

/** Computes the from/to ISO dates (UTC, day precision) for a date preset. */
export function dateRangeForPreset(
  preset: Exclude<DateRangePreset, 'custom'>,
  today: Date = new Date(),
): { from: string; to: string } {
  const year = today.getUTCFullYear()
  const month = today.getUTCMonth()
  switch (preset) {
    case 'this-month': {
      const from = new Date(Date.UTC(year, month, 1))
      const to = new Date(Date.UTC(year, month + 1, 0))
      return { from: toIsoDate(from), to: toIsoDate(to) }
    }
    case 'last-month': {
      const from = new Date(Date.UTC(year, month - 1, 1))
      const to = new Date(Date.UTC(year, month, 0))
      return { from: toIsoDate(from), to: toIsoDate(to) }
    }
    case 'last-3-months': {
      const from = new Date(Date.UTC(year, month - 2, 1))
      const to = new Date(Date.UTC(year, month + 1, 0))
      return { from: toIsoDate(from), to: toIsoDate(to) }
    }
    case 'last-12-months': {
      const from = new Date(Date.UTC(year, month - 11, 1))
      const to = new Date(Date.UTC(year, month + 1, 0))
      return { from: toIsoDate(from), to: toIsoDate(to) }
    }
  }
}

/**
 * Which report types a control actually affects, derived from the real
 * response shapes in api-types.ts (not assumed):
 * - group_by: accepted by every report's query, but adherence/overdue already
 *   return by_month + by_branch + by_medication together in one response, so
 *   a group_by selector would change nothing for them. refills/transfers/
 *   treatments-flow/no-response similarly return their own fixed breakdown
 *   shape regardless of group_by. No report's *rendering* branches on
 *   group_by today, so the FilterBar does not show a group_by control for
 *   any of them — documented here instead of a dead dropdown.
 * - medication filter: no report query accepts a medication_id parameter
 *   (only from/to/branch_id/group_by/compare_previous/page/rows), even
 *   though adherence/refills break results down by medication in the
 *   response. Not added.
 */
/**
 * Whether `compare_previous` actually changes the rendered response for a
 * report type. The query parameter is accepted by all 6 endpoints, but only
 * AdherenceResponse's shape carries a `previous_period` field in
 * api-types.ts — overdue/no-response/refills/treatments-flow/transfers have
 * no such field today, so toggling compare_previous for them would send the
 * param with nothing in the response to show for it. The FilterBar hides the
 * toggle outside adherence instead of rendering a control with no effect.
 */
export const reportSupportsComparePrevious: Record<ReportType, boolean> = {
  adherence: true,
  overdue: false,
  'no-response': false,
  refills: false,
  'treatments-flow': false,
  transfers: false,
}
