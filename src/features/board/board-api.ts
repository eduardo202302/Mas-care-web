import type { paths } from '@/lib/api-types'
import { api } from '@/lib/http'
import {
  boardFiltersToSearch,
  statusOfLane,
  type BoardCard,
  type BoardColumnData,
  type BoardColumnKey,
  type BoardData,
  type BoardFilters,
  type BoardLaneKey,
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
  status: BoardLaneKey,
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
    stage_id?: string | null
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

export function editCycle(
  cycleId: string,
  input: {
    expected_version: number
    expected_on?: string
    expected_quantity?: number
    priority?: 'low' | 'medium' | 'high' | 'urgent' | null
    type?: 'regular' | 'urgent' | 'special' | null
    reason?: string
  },
): Promise<BoardCard> {
  return api<BoardCard>(`/api/v1/cycles/${encodeURIComponent(cycleId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
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

const lanesOf = (data: BoardData) => Object.keys(data.columns) as BoardLaneKey[]

export function cloneBoard(data: BoardData): BoardData {
  const columns = {} as Record<BoardLaneKey, BoardColumnData>
  for (const key of lanesOf(data)) {
    const column = data.columns[key]!
    columns[key] = {
      ...column,
      cards: [...column.cards],
    }
  }
  return { ...data, columns } as BoardData
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
  to: BoardLaneKey,
  afterId: string | null,
  beforeId: string | null,
  stageId?: string | null,
): BoardData {
  const data = cloneBoard(previous)
  const columns = data.columns as Record<BoardLaneKey, BoardColumnData>
  let from: BoardLaneKey | null = null
  for (const key of lanesOf(data)) {
    if (columns[key].cards.some((item) => item.cycle_id === card.cycle_id)) {
      from = key
      break
    }
  }
  const sameColumn = from === to
  if (from) {
    columns[from] = {
      ...columns[from],
      cards: columns[from].cards.filter(
        (item) => item.cycle_id !== card.cycle_id,
      ),
      count: sameColumn
        ? columns[from].count
        : Math.max(0, columns[from].count - 1),
    }
  }
  columns[to] = {
    ...columns[to],
    cards: insertCard(
      columns[to].cards,
      {
        ...card,
        status:
          to === 'closed'
            ? card.status
            : (statusOfLane(to) as Exclude<BoardColumnKey, 'closed'>),
        ...(stageId !== undefined ? { stage_id: stageId } : {}),
      },
      afterId,
      beforeId,
    ),
    count: sameColumn ? columns[to].count : columns[to].count + 1,
  }
  return data
}

export function appendColumnPage(
  previous: BoardData,
  status: BoardLaneKey,
  page: BoardListResponse,
): BoardData {
  const data = cloneBoard(previous)
  const columns = data.columns as Record<BoardLaneKey, BoardColumnData>
  const seen = new Set(columns[status].cards.map((item) => item.cycle_id))
  const cards = page.data.filter((item) => !seen.has(item.cycle_id))
  columns[status] = {
    ...columns[status],
    cards: [...columns[status].cards, ...cards],
    next_cursor: page.next_cursor,
  }
  return data
}

export function cardById(
  data: BoardData | undefined,
  cycleId: string,
): BoardCard | undefined {
  if (!data) return undefined
  for (const key of lanesOf(data)) {
    const card = data.columns[key]!.cards.find(
      (item) => item.cycle_id === cycleId,
    )
    if (card) return card
  }
  return undefined
}
