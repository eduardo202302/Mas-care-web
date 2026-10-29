import { useMemo, useState, type ReactNode } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronDown, Filter, Loader2 } from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { StatusChip } from '@/components/StatusChip'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
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
import {
  BatchBar,
  ColumnPicker,
  SavedViewsBar,
  SortEditor,
  TableFilterPanel,
} from './CycleTableControls'

export function CycleTable({
  filters,
  canMove,
  canWrite = false,
  onMove,
  onOpenCard,
  onBoardFiltersChange,
}: {
  filters: BoardFilters
  canMove: boolean
  /** Batch actions need write access (assign, tasks) and move access (stage, archive). */
  canWrite?: boolean
  onMove: (card: BoardCard, to: CycleStatus) => void
  onOpenCard?: (card: BoardCard) => void
  onBoardFiltersChange?: (next: BoardFilters) => void
}) {
  const [tableFilters, setTableFilters] = useState<TableFilters>(emptyTableFilters)
  const [sort, setSort] = useState<SortPart[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
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
    return search
  }
  const table = useInfiniteQuery({
    queryKey: ['cycles', params().toString()],
    queryFn: ({ pageParam }) => {
      const search = params()
      search.set('limit', '30')
      if (pageParam) search.set('cursor', pageParam)
      return api<CycleTableResponse>(`/api/v1/cycles?${search.toString()}`)
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  })

  const rows = table.data?.pages.flatMap((page) => page.data) ?? []
  const selectable = rows.filter(isOpenCycle).map((card) => card.cycle_id)
  const allSelected = selectable.length > 0 && selectable.every((id) => selected.includes(id))
  const canBatch = canMove && canWrite

  const cell = (key: string, card: BoardCard): ReactNode => {
    const open = isOpenCycle(card)
    const derived = derivedStatusLabel(card.derived_status)
    switch (key) {
      case 'patient':
        return (
          <span className="flex items-center gap-1">
            <button type="button" className="text-petroleo text-left font-semibold hover:underline" onClick={() => onOpenCard?.(card)}>
              {card.patient.nombre}
            </button>
            <button
              type="button"
              aria-label={`Filtrar por el tratamiento de ${card.patient.nombre}`}
              title="Ver solo este tratamiento"
              className="text-muted hover:text-petroleo"
              onClick={() =>
                setTableFilters({ ...tableFilters, treatment_ids: [...new Set([...(tableFilters.treatment_ids ?? []), card.treatment_id])] })
              }
            >
              <Filter className="size-3" />
            </button>
          </span>
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

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SavedViewsBar
          current={() => ({
            filters: { board: filters, table: tableFilters },
            columns: columns.keys,
            sort: { parts: sort },
          })}
          onApply={(view) => {
            onBoardFiltersChange?.(view.filters.board ?? {})
            setTableFilters(view.filters.table ?? emptyTableFilters)
            setSort(view.sort.parts ?? [])
            if (view.columns.length) columns.save(view.columns)
            setSelected([])
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" className="h-9" aria-expanded={showFilters} onClick={() => setShowFilters((value) => !value)}>
            <Filter className="size-4" />
            Filtros avanzados
          </Button>
          <ColumnPicker keys={columns.keys} onChange={columns.save} saving={columns.saving} all={allColumns} />
        </div>
      </div>
      {showFilters && (
        <TableFilterPanel
          board={filters}
          table={tableFilters}
          onBoard={(next) => onBoardFiltersChange?.(next)}
          onTable={setTableFilters}
        />
      )}
      <div className="mb-3">
        <SortEditor sort={sort} onChange={setSort} />
      </div>
      {canBatch && <BatchBar ids={selected} onDone={() => setSelected([])} />}

      <section aria-label="Vista tabla de ciclos" className="border-border overflow-hidden rounded-xl border bg-white">
        {table.isLoading ? (
          <div className="grid gap-3 p-5" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : table.isError ? (
          <p role="alert" className="p-5 text-sm text-red-700">No pudimos cargar la tabla. {table.error.message}</p>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Sin ciclos para estos filtros" description="Prueba con otra sucursal, fecha o estado." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-surface text-muted text-[11px] tracking-wide uppercase">
                <tr>
                  {canBatch && (
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar todos los ciclos abiertos"
                        checked={allSelected}
                        onChange={(event) => setSelected(event.target.checked ? selectable : [])}
                      />
                    </th>
                  )}
                  {columns.keys.map((key) => (
                    <th key={key} className="px-4 py-3 font-semibold">
                      {allColumns.find((column) => column.key === key)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {rows.map((card, index) => (
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
        <div className="border-border flex items-center justify-between gap-3 border-t px-4 py-3">
          <p className="text-muted text-xs">
            {rows.length} ciclos cargados
            {table.hasNextPage ? ' · hay más páginas' : ''}
          </p>
          {table.hasNextPage && (
            <Button type="button" className="h-8" onClick={() => table.fetchNextPage()} disabled={table.isFetchingNextPage}>
              {table.isFetchingNextPage ? <Loader2 className="size-4 animate-spin" /> : null}
              {table.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
