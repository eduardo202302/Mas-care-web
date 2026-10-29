import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { StatusChip } from '@/components/StatusChip'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { formatCustomValue, useCustomProperties } from '@/lib/custom-properties'
import { effectiveStage, usePipeline } from '@/lib/pipeline'
import {
  boardFiltersToSearch,
  cycleStatusLabels,
  isOpenCycle,
  openCycleStatuses,
  stockLevelDot,
  stockLevelLabels,
  type BoardCard,
  type BoardFilters,
  type CycleStatus,
  type CycleTableResponse,
} from '@/lib/board'
import {
  cycleColumns,
  type ColumnDef,
  emptyTableFilters,
  tableFiltersToSearch,
  useColumnPrefs,
  type SortPart,
  type TableFilters,
} from '@/lib/cycle-table'
import { derivedStatusLabel, formatDate } from '@/lib/treatments'
import { cn } from '@/lib/cn'
import { compareValues } from '@/lib/table-sort'
import { BatchBar, ColumnPicker, SavedViewsBar } from './CycleTableControls'

/** Column keys that map to a backend-sortable field; columns without an entry sort client-side (current page only). */
const columnSortField: Record<string, string> = {
  patient: 'patient',
  medication: 'medication',
  status: 'status',
  expected_on: 'expected_on',
  derived: 'derived_status',
}

export function CycleTable({
  filters,
  canMove,
  canWrite = false,
  onMove,
  onOpenCard,
  onBoardFiltersChange,
  controlsSlot,
}: {
  filters: BoardFilters
  canMove: boolean
  /** Batch actions need write access (assign, tasks) and move access (stage, archive). */
  canWrite?: boolean
  onMove: (card: BoardCard, to: CycleStatus) => void
  onOpenCard?: (card: BoardCard) => void
  onBoardFiltersChange?: (next: BoardFilters) => void
  /** Renders the saved-views and column pickers into this node instead of the table's own header, e.g. the board tabs row. */
  controlsSlot?: HTMLElement | null
}) {
  const [tableFilters, setTableFilters] = useState<TableFilters>(emptyTableFilters)
  const [sort, setSort] = useState<SortPart[]>([])
  const [clientSort, setClientSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  // Treatment properties defined by the organization can be added as columns (key `custom:<key>`).
  const properties = useCustomProperties('treatment').data?.data ?? []
  const { data: pipeline } = usePipeline()
  const allColumns = useMemo<ColumnDef[]>(
    () => [...cycleColumns, ...properties.map((property) => ({ key: `custom:${property.key}`, label: property.label }))],
    [properties],
  )
  const columns = useColumnPrefs('cycles', allColumns, cycleColumns.map((column) => column.key))

  const params = () => {
    const search = boardFiltersToSearch(filters)
    tableFiltersToSearch(tableFilters, sort, search)
    search.set('page', String(page))
    search.set('rows', String(rows))
    return search
  }
  const table = useQuery({
    queryKey: ['cycles', params().toString()],
    queryFn: () => api<CycleTableResponse>(`/api/v1/cycles?${params().toString()}`),
  })

  const setFiltersAndResetPage = (next: TableFilters) => {
    setTableFilters(next)
    setPage(1)
  }
  const sortedField = sort.length === 1 ? sort[0] : null
  const activeSortKey = sortedField
    ? Object.entries(columnSortField).find(([, field]) => field === sortedField.field)?.[0]
    : clientSort?.key
  const activeSortDir = sortedField ? sortedField.dir : clientSort?.dir ?? null
  const toggleColumnSort = (key: string) => {
    const dir = activeSortKey === key && activeSortDir === 'asc' ? 'desc' : 'asc'
    const field = columnSortField[key]
    if (field) {
      setSort([{ field, dir }])
      setClientSort(null)
    } else {
      setSort([])
      setClientSort({ key, dir })
    }
    setPage(1)
  }
  /** Sortable value for columns without a backend field; mirrors `cell()` but returns a comparable primitive. */
  const sortValue = (key: string, card: BoardCard): unknown => {
    switch (key) {
      case 'branch':
        return card.branch.nombre
      case 'stage': {
        const stage = pipeline ? effectiveStage(pipeline, card.status, (card as { stage_id?: string | null }).stage_id) : undefined
        return stage?.name ?? ''
      }
      case 'days':
        return card.days_remaining
      case 'responsible':
        return card.responsible?.name ?? ''
      case 'next_action':
        return card.status === 'to_notify' ? 'Avisar' : isOpenCycle(card) ? 'Marcar entregado' : ''
      case 'stock':
        return card.stock_level ? stockLevelLabels[card.stock_level] : ''
      default: {
        const property = properties.find((item) => `custom:${item.key}` === key)
        if (!property) return ''
        const values = (card as { treatment_custom_values?: Record<string, unknown> }).treatment_custom_values ?? {}
        return formatCustomValue(property, values[property.key]) || ''
      }
    }
  }
  // The board filters (branch, search, etc.) are controlled by the parent; any change invalidates the current page.
  const boardFiltersKey = boardFiltersToSearch(filters).toString()
  useEffect(() => setPage(1), [boardFiltersKey])

  const cards = table.data?.data ?? []
  const displayCards = clientSort
    ? [...cards].sort(
        (a, b) =>
          (clientSort.dir === 'asc' ? 1 : -1) *
          compareValues(sortValue(clientSort.key, a), sortValue(clientSort.key, b)),
      )
    : cards
  const total = table.data?.total ?? 0
  const selectable = cards.filter(isOpenCycle).map((card) => card.cycle_id)
  const allSelected = selectable.length > 0 && selectable.every((id) => selected.includes(id))
  const canBatch = canMove && canWrite

  const cell = (key: string, card: BoardCard): ReactNode => {
    const open = isOpenCycle(card)
    const derived = derivedStatusLabel(card.derived_status)
    switch (key) {
      case 'patient':
        return (
          <button type="button" className="text-petroleo text-left font-semibold hover:underline" onClick={() => onOpenCard?.(card)}>
            {card.patient.nombre}
          </button>
        )
      case 'medication':
        return (
          <>
            <p className="text-ink font-medium">{card.medication.nombre}</p>
            <p className="text-muted text-xs">{card.medication.presentacion}</p>
          </>
        )
      case 'status':
        return open && canMove ? (
          <label className="relative inline-flex items-center">
            <span className="sr-only">Cambiar estado del ciclo de {card.patient.nombre}</span>
            <select
              value={card.status}
              onChange={(event) => onMove(card, event.target.value as CycleStatus)}
              className="border-border focus:border-tealmax h-8 appearance-none rounded-lg border bg-white pr-7 pl-2 text-xs font-medium outline-none"
            >
              {openCycleStatuses.map((status) => (
                <option key={status} value={status}>{cycleStatusLabels[status]}</option>
              ))}
            </select>
            <ChevronDown className="text-muted pointer-events-none absolute right-2 size-3.5" />
          </label>
        ) : (
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
              open
                ? 'border-sky-200 bg-sky-50 text-sky-900'
                : card.status === 'delivered'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-950',
            )}
          >
            {cycleStatusLabels[card.status]}
          </span>
        )
      case 'stage': {
        const stage = pipeline ? effectiveStage(pipeline, card.status, (card as { stage_id?: string | null }).stage_id) : undefined
        return stage ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: stage.color }} />
            {stage.name}
          </span>
        ) : <span className="text-muted">—</span>
      }
      case 'expected_on':
        return <span className="font-medium">{formatDate(card.expected_on)}</span>
      case 'derived':
        return derived ? <StatusChip status={derived} /> : <span className="text-muted">—</span>
      case 'days':
        return card.days_remaining === null ? '—' : card.days_remaining < 0 ? `${Math.abs(card.days_remaining)} d. vencido` : card.days_remaining === 0 ? 'Hoy' : `${card.days_remaining} d.`
      case 'branch':
        return <BranchTag name={card.branch.nombre} labelColor={card.branch.label_color} />
      case 'responsible':
        return card.responsible?.name ?? '—'
      case 'next_action':
        return card.status === 'to_notify' ? 'Avisar' : open ? 'Marcar entregado' : '—'
      case 'stock':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span aria-hidden="true" className={cn('size-2 rounded-full', card.stock_level ? stockLevelDot[card.stock_level] : 'bg-slate-300')} />
            {card.stock_level ? stockLevelLabels[card.stock_level] : 'Sin marca'}
          </span>
        )
      default: {
        const property = properties.find((item) => `custom:${item.key}` === key)
        if (!property) return null
        const values = (card as { treatment_custom_values?: Record<string, unknown> }).treatment_custom_values ?? {}
        return <span className="text-muted">{formatCustomValue(property, values[property.key]) || '—'}</span>
      }
    }
  }

  const controls = (
    <>
      <SavedViewsBar
        current={() => ({
          filters: { board: filters, table: tableFilters },
          columns: columns.keys,
          sort: { parts: sort },
        })}
        onApply={(view) => {
          onBoardFiltersChange?.(view.filters.board ?? {})
          setFiltersAndResetPage(view.filters.table ?? emptyTableFilters)
          setSort(view.sort.parts ?? [])
          if (view.columns.length) columns.save(view.columns)
          setSelected([])
        }}
      />
      <ColumnPicker keys={columns.keys} onChange={columns.save} saving={columns.saving} all={allColumns} />
    </>
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {controlsSlot ? (
        createPortal(<div className="flex flex-wrap items-center gap-2">{controls}</div>, controlsSlot)
      ) : (
        <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">{controls}</div>
      )}
      {canBatch && <div className="shrink-0"><BatchBar ids={selected} onDone={() => setSelected([])} /></div>}

      <section aria-label="Vista tabla de ciclos" className="border-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-white">
        {table.isLoading ? (
          <div className="grid gap-3 p-5" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : table.isError ? (
          <p role="alert" className="p-5 text-sm text-red-700">No pudimos cargar la tabla. {table.error.message}</p>
        ) : cards.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Sin ciclos para estos filtros" description="Prueba con otra sucursal, fecha o estado." />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-surface text-muted sticky top-0 z-10 text-[11px] tracking-wide uppercase">
                <tr>
                  {canBatch && (
                    <th className="bg-surface w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar todos los ciclos abiertos"
                        checked={allSelected}
                        onChange={(event) => setSelected(event.target.checked ? selectable : [])}
                      />
                    </th>
                  )}
                  {columns.keys.map((key) => {
                    const active = activeSortKey === key ? activeSortDir : null
                    return (
                      <th key={key} className="bg-surface px-4 py-3 font-semibold">
                        <button
                          type="button"
                          onClick={() => toggleColumnSort(key)}
                          className="hover:text-petroleo inline-flex items-center gap-1"
                        >
                          {allColumns.find((column) => column.key === key)?.label}
                          {active === 'asc' ? (
                            <ChevronUp className="size-3.5" />
                          ) : active === 'desc' ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronsUpDown className="size-3.5" />
                          )}
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {displayCards.map((card, index) => (
                  <tr
                    key={card.cycle_id}
                    data-testid={`table-row-${card.cycle_id}`}
                    className={cn(index % 2 === 1 ? 'bg-slate-100' : 'bg-white', 'hover:bg-surface/50')}
                  >
                    {canBatch && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ciclo de ${card.patient.nombre}`}
                          disabled={!isOpenCycle(card)}
                          checked={selected.includes(card.cycle_id)}
                          onChange={(event) =>
                            setSelected(event.target.checked ? [...selected, card.cycle_id] : selected.filter((id) => id !== card.cycle_id))
                          }
                        />
                      </td>
                    )}
                    {columns.keys.map((key) => (
                      <td key={key} className="px-4 py-3">{cell(key, card)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="shrink-0">
          <Pagination
            page={page}
            rows={rows}
            total={total}
            onChange={setPage}
            onRowsChange={(next) => {
              setRows(next)
              setPage(1)
            }}
            disabled={table.isFetching}
          />
        </div>
      </section>
    </div>
  )
}
