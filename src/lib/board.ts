import type { components, paths } from './api-types'

export type BoardCard = components['schemas']['BoardCard']
export type BoardResponse = components['schemas']['BoardResponse']
export type CycleStatus = BoardCard['status']
export type DerivedStatus = NonNullable<BoardCard['derived_status']>
export type BoardListResponse =
  paths['/api/v1/board/columns/{status}']['get']['responses'][200]['content']['application/json']
export type CycleTableResponse =
  paths['/api/v1/cycles']['get']['responses'][200]['content']['application/json']

export type BoardColumnKey =
  | 'to_notify'
  | 'notified'
  | 'confirmed'
  | 'prepared'
  | 'closed'

/** One board column plus client-side cursor state for "Cargar más". */
export type BoardColumnData = components['schemas']['BoardColumn'] & {
  next_cursor?: string | null
}

export type BoardData = Omit<BoardResponse, 'columns'> & {
  columns: Record<BoardColumnKey, BoardColumnData>
}

export const boardColumns: readonly BoardColumnKey[] = [
  'to_notify',
  'notified',
  'confirmed',
  'prepared',
  'closed',
]

export const boardColumnLabels: Record<BoardColumnKey, string> = {
  to_notify: 'Por avisar',
  notified: 'Avisado',
  confirmed: 'Confirmado',
  prepared: 'Preparado',
  closed: 'Entregado / No retirado',
}

export const cycleStatusLabels: Record<CycleStatus, string> = {
  to_notify: 'Por avisar',
  notified: 'Avisado',
  confirmed: 'Confirmado',
  prepared: 'Preparado',
  delivered: 'Entregado',
  not_picked_up: 'No retirado',
  cancelled: 'Cancelado',
}

export const openCycleStatuses: readonly Exclude<CycleStatus, 'delivered' | 'not_picked_up' | 'cancelled'>[] =
  ['to_notify', 'notified', 'confirmed', 'prepared']

export const derivedStatusLabels: Record<DerivedStatus, string> = {
  al_dia: 'Al día',
  proxima_reposicion: 'Próxima reposición',
  vence_pronto: 'Vence pronto',
  retiro_pendiente: 'Retiro pendiente',
  vencido: 'Vencido',
}

export const derivedStatusOptions: { value: DerivedStatus; label: string }[] = [
  { value: 'vencido', label: 'Vencido' },
  { value: 'vence_pronto', label: 'Vence pronto' },
  { value: 'retiro_pendiente', label: 'Retiro pendiente' },
  { value: 'proxima_reposicion', label: 'Próxima reposición' },
  { value: 'al_dia', label: 'Al día' },
]

export type StockLevel = NonNullable<BoardCard['stock_level']>

export const stockLevelLabels: Record<StockLevel, string> = {
  in_stock: 'Hay',
  low: 'Poco',
  out_of_stock: 'No hay',
}

export const stockLevelDot: Record<StockLevel, string> = {
  in_stock: 'bg-emerald-500',
  low: 'bg-amber-500',
  out_of_stock: 'bg-red-600',
}

export type BoardFilters = {
  branch_id?: string
  responsible_user_id?: string
  medication_id?: string
  derived_status?: DerivedStatus
  q?: string
  expected_from?: string
  expected_to?: string
}

export const emptyBoardFilters: BoardFilters = {}

const filterKeys = [
  'branch_id',
  'responsible_user_id',
  'medication_id',
  'derived_status',
  'q',
  'expected_from',
  'expected_to',
] as const

export function boardFiltersFromSearch(params: URLSearchParams): BoardFilters {
  const filters: BoardFilters = {}
  for (const key of filterKeys) {
    const value = params.get(key)
    if (!value) continue
    if (key === 'derived_status') {
      if (value in derivedStatusLabels) {
        filters.derived_status = value as DerivedStatus
      }
      continue
    }
    filters[key] = value
  }
  return filters
}

export function boardFiltersToSearch(
  filters: BoardFilters,
  base?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(base)
  for (const key of filterKeys) {
    const value = filters[key]
    if (value) params.set(key, value)
    else params.delete(key)
  }
  return params
}

export function boardQueryString(filters: BoardFilters): string {
  const params = boardFiltersToSearch(filters)
  return params.toString()
}

export function boardQueryKey(filters: BoardFilters) {
  return ['board', boardQueryString(filters)] as const
}

export function cycleTableQueryKey(filters: BoardFilters) {
  return ['cycles', boardQueryString(filters)] as const
}

export function isOpenCycle(card: BoardCard): boolean {
  return openCycleStatuses.includes(
    card.status as (typeof openCycleStatuses)[number],
  )
}

export function cardIsDueToday(card: BoardCard): boolean {
  return card.expected_on <= new Date().toISOString().slice(0, 10)
}
