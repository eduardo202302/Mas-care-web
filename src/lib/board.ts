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
  'to_notify' | 'notified' | 'confirmed' | 'prepared' | 'closed'

/** One board column plus client-side cursor state for "Cargar más". */
export type BoardColumnData = components['schemas']['BoardColumn'] & {
  next_cursor?: string | null
  overdue_count?: number
  due_soon_count?: number
}

/** Carril del tablero: una columna de estado o "created" ("Creado", el estado inicial: reemplaza a la columna "Por avisar"). */
export type BoardLaneKey = BoardColumnKey | 'created'

export type BoardData = Omit<BoardResponse, 'columns'> & {
  columns: Record<BoardColumnKey, BoardColumnData> &
    Partial<Record<'created', BoardColumnData>>
}

/** Movimientos que piden registrar el aviso al paciente: Creado → Avisado y Confirmado → Preparado. */
export const movePromptsNotice = (from: string, to: string): boolean =>
  (from === 'to_notify' && to === 'notified') ||
  (from === 'confirmed' && to === 'prepared')

/** Estado de una reposición que vive en el carril. */
export const statusOfLane = (lane: BoardLaneKey): BoardColumnKey =>
  lane === 'created' ? 'to_notify' : lane

export const boardColumns: readonly BoardColumnKey[] = [
  'to_notify',
  'notified',
  'confirmed',
  'prepared',
  'closed',
]

export const boardColumnLabels: Record<BoardColumnKey, string> = {
  to_notify: 'Creado',
  notified: 'Avisado',
  confirmed: 'Confirmado',
  prepared: 'Preparado',
  closed: 'Entregado / No retirado',
}

export const cycleStatusLabels: Record<CycleStatus, string> = {
  to_notify: 'Creado',
  notified: 'Avisado',
  confirmed: 'Confirmado',
  prepared: 'Preparado',
  delivered: 'Entregado',
  not_picked_up: 'No retirado',
  cancelled: 'Cancelado',
}

export const openCycleStatuses: readonly Exclude<
  CycleStatus,
  'delivered' | 'not_picked_up' | 'cancelled'
>[] = ['to_notify', 'notified', 'confirmed', 'prepared']

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
  created_from?: string
  created_to?: string
  closed_from?: string
  closed_to?: string
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
  'created_from',
  'created_to',
  'closed_from',
  'closed_to',
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
  // Las fechas de creación son instantes: el servidor necesita el huso del usuario para acotar el día.
  if (filters.created_from || filters.created_to)
    params.set('tz_offset', String(new Date().getTimezoneOffset()))
  else params.delete('tz_offset')
  return params
}

const pad2 = (value: number) => String(value).padStart(2, '0')

/** Todo hasta ayer (calendario local): sin fecha de inicio, termina el día anterior a hoy (YYYY-MM-DD). */
export function yesterdayRange(now: Date = new Date()) {
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  )
  return {
    to: `${yesterday.getFullYear()}-${pad2(yesterday.getMonth() + 1)}-${pad2(yesterday.getDate())}`,
  }
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
