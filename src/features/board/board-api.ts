import type { paths } from '@/lib/api-types'
import { api } from '@/lib/http'
import {
  boardColumns,
  boardFiltersToSearch,
  type BoardCard,
  type BoardColumnData,
  type BoardColumnKey,
  type BoardData,
  type BoardFilters,
  type BoardListResponse,
} from '@/lib/board'

export type CycleMoveResponse =
  paths['/api/v1/cycles/{id}/move']['post']['responses'][200]['content']['application/json']
export type CycleExpectedOnResponse =
  paths['/api/v1/cycles/{id}/expected-on']['patch']['responses'][200]['content']['application/json']
export type StockMarkInput = {
  level: 'in_stock' | 'low' | 'out_of_stock'
}

export function boardPath(filters: BoardFilters): string {
  const query = boardFiltersToSearch(filters).toString()
  return `/api/v1/board${query ? `?${query}` : ''}`
}

export function fetchBoard(filters: BoardFilters): Promise<BoardData> {
  return api<BoardData>(boardPath(filters))
}

export function fetchBoardColumn(
  status: BoardColumnKey,
  filters: BoardFilters,
  cursor?: string | null,
  limit = 30,
): Promise<BoardListResponse> {
  const params = boardFiltersToSearch(filters)
  params.set('limit', String(limit))
  if (cursor) params.set('cursor', cursor)
  return api<BoardListResponse>(
    `/api/v1/board/columns/${status}?${params.toString()}`,
  )
}

export function moveCycle(
  cycleId: string,
  input: {
    to_status: BoardCard['status']
    after_id?: string | null
    before_id?: string | null
    expected_version: number
    confirm_out_of_stock?: boolean
  },
): Promise<CycleMoveResponse> {
  return api<CycleMoveResponse>(
    `/api/v1/cycles/${encodeURIComponent(cycleId)}/move`,
    { method: 'POST', body: JSON.stringify(input) },
  )
}

export function changeExpectedOn(
  cycleId: string,
  input: { expected_on: string; expected_version: number; reason?: string },
): Promise<CycleExpectedOnResponse> {
  return api<CycleExpectedOnResponse>(
    `/api/v1/cycles/${encodeURIComponent(cycleId)}/expected-on`,
    { method: 'PATCH', body: JSON.stringify(input) },
  )
}

export function markNotPickedUp(cycleId: string) {
  return api(`/api/v1/cycles/${encodeURIComponent(cycleId)}/mark-not-picked-up`, {
    method: 'POST',
  })
}

export function setStockMark(
  branchId: string,
  medicationId: string,
  level: StockMarkInput['level'],
) {
  return api(
    `/api/v1/branches/${encodeURIComponent(branchId)}/stock-marks/${encodeURIComponent(medicationId)}`,
    { method: 'PUT', body: JSON.stringify({ level }) },
  )
}

export function cloneBoard(data: BoardData): BoardData {
  const columns = {} as Record<BoardColumnKey, BoardColumnData>
  for (const key of boardColumns) {
    const column = data.columns[key]
    columns[key] = {
      ...column,
      cards: [...column.cards],
    }
  }
  return { ...data, columns }
}

export function insertCard(
  cards: BoardCard[],
  card: BoardCard,
  afterId: string | null,
  beforeId: string | null,
): BoardCard[] {
  const next = cards.filter((item) => item.cycle_id !== card.cycle_id)
  let index = next.length
  if (afterId) {
    const after = next.findIndex((item) => item.cycle_id === afterId)
    if (after >= 0) index = after + 1
  } else if (beforeId) {
    const before = next.findIndex((item) => item.cycle_id === beforeId)
    if (before >= 0) index = before
  }
  next.splice(index, 0, card)
  return next
}

export function moveCardInBoard(
  previous: BoardData,
  card: BoardCard,
  to: BoardColumnKey,
  afterId: string | null,
  beforeId: string | null,
): BoardData {
  const data = cloneBoard(previous)
  let from: BoardColumnKey | null = null
  for (const key of boardColumns) {
    if (data.columns[key].cards.some((item) => item.cycle_id === card.cycle_id)) {
      from = key
      break
    }
  }
  const sameColumn = from === to
  if (from) {
    data.columns[from] = {
      ...data.columns[from],
      cards: data.columns[from].cards.filter(
        (item) => item.cycle_id !== card.cycle_id,
      ),
      count: sameColumn
        ? data.columns[from].count
        : Math.max(0, data.columns[from].count - 1),
    }
  }
  data.columns[to] = {
    ...data.columns[to],
    cards: insertCard(
      data.columns[to].cards,
      { ...card, status: to === 'closed' ? card.status : to },
      afterId,
      beforeId,
    ),
    count: sameColumn ? data.columns[to].count : data.columns[to].count + 1,
  }
  return data
}

export function appendColumnPage(
  previous: BoardData,
  status: BoardColumnKey,
  page: BoardListResponse,
): BoardData {
  const data = cloneBoard(previous)
  const seen = new Set(data.columns[status].cards.map((item) => item.cycle_id))
  const cards = page.data.filter((item) => !seen.has(item.cycle_id))
  data.columns[status] = {
    ...data.columns[status],
    cards: [...data.columns[status].cards, ...cards],
    next_cursor: page.next_cursor,
  }
  return data
}

export function cardById(
  data: BoardData | undefined,
  cycleId: string,
): BoardCard | undefined {
  if (!data) return undefined
  for (const key of boardColumns) {
    const card = data.columns[key].cards.find(
      (item) => item.cycle_id === cycleId,
    )
    if (card) return card
  }
  return undefined
}
