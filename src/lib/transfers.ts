import type { components, paths } from './api-types'

export type Transfer = components['schemas']['Transfer']
export type TransferPending = components['schemas']['TransferPending']
export type TransferInput = components['schemas']['TransferInput']
export type TransferWarning = components['schemas']['TransferWarning']
export type TransferHistoryRow = components['schemas']['TransferHistoryRow']
export type TransferGlobalRow = components['schemas']['TransferGlobalRow']

export type PatientTransferList =
  paths['/api/v1/patients/{id}/transfers']['get']['responses'][200]['content']['application/json']
export type GlobalTransferList =
  paths['/api/v1/transfers']['get']['responses'][200]['content']['application/json']

/** True when the POST response is a pending stock-out warning, not a completed transfer. */
export function isTransferPending(
  result: Transfer | TransferPending,
): result is TransferPending {
  return result.completed === false
}

export const transferWarningLabels: Record<string, string> = {
  STOCK_OUT_OF_STOCK_DEST: 'Sin existencias en la sucursal destino',
}

export function transferWarningLabel(code: string): string {
  return transferWarningLabels[code] ?? code
}

export type TransferListFilters = {
  branch_id?: string
  from?: string
  to?: string
}

export function transferFiltersFromSearch(
  params: URLSearchParams,
): TransferListFilters {
  const filters: TransferListFilters = {}
  const branch = params.get('branch_id')
  const from = params.get('from')
  const to = params.get('to')
  if (branch) filters.branch_id = branch
  if (from) filters.from = from
  if (to) filters.to = to
  return filters
}

export function transferFiltersToSearch(
  filters: TransferListFilters,
): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of ['branch_id', 'from', 'to'] as const) {
    if (filters[key]) params.set(key, filters[key]!)
  }
  return params
}
