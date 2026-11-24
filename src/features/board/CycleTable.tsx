import { Select } from '@/components/ui/Select'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
import { effectiveStage, usePipeline, type PipelineStage } from '@/lib/pipeline'
import {
  boardFiltersToSearch,
  cycleStatusLabels,
  isOpenCycle,
  type BoardCard,
  type BoardFilters,
  type CycleTableResponse,
} from '@/lib/board'
import {
  cycleColumns,
  type ColumnDef,
  emptyTableFilters,
  tableFiltersToSearch,
  type SortPart,
  type TableFilters,
} from '@/lib/cycle-table'
import { derivedStatusLabel, formatDate } from '@/lib/treatments'
import { cn } from '@/lib/cn'
import { compareValues } from '@/lib/table-sort'
import {
  emptyCycleColumnFilters,
  matchesCycleColumnFilters,
  type CycleColumnFilters,
} from './cycleColumnFilters'

/** Día local de un instante ISO (closed_at viene en UTC). */
function localDateOnly(iso: string): string {
  const date = new Date(iso)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Column keys that map to a backend-sortable field; columns without an entry sort client-side (current page only). */
const columnSortField: Record<string, string> = {
  patient: 'patient',
  medication: 'medication',
  status: 'status',
  created_at: 'created_at',
  expected_on: 'expected_on',
  derived: 'derived_status',
}

const defaultColumnKeys = cycleColumns.map((column) => column.key)

export function CycleTable({
  filters,
  columnFilters = emptyCycleColumnFilters,
  canMove,
  onSetStage,
  onOpenCard,
}: {
  filters: BoardFilters
  /** Filtros por columna del Filtro Avanzado; se aplican sobre la página cargada. */
  columnFilters?: CycleColumnFilters
  canMove: boolean
  /** Cambia la reposición a otra etapa; si la etapa es de otra columna, también la mueve. */
  onSetStage: (card: BoardCard, stage: PipelineStage) => void
  onOpenCard?: (card: BoardCard) => void
}) {
  const [tableFilters, setTableFilters] =
    useState<TableFilters>(emptyTableFilters)
  const [sort, setSort] = useState<SortPart[]>([])
  const [clientSort, setClientSort] = useState<{
    key: string
    dir: 'asc' | 'desc'
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  // Treatment properties defined by the organization can be added as columns (key `custom:<key>`).
  const properties = useCustomProperties('treatment').data?.data ?? []
  const { data: pipeline } = usePipeline()
  // Estados a los que se puede pasar una reposición abierta; "Entregado" abre el cierre con su fecha.
  const openStageOptions = useMemo(
    () => [...(pipeline?.stages ?? [])].sort((a, b) => a.position - b.position),
    [pipeline],
  )
  const allColumns = useMemo<ColumnDef[]>(
    () => [
      ...cycleColumns,
      ...properties.map((property) => ({
        key: `custom:${property.key}`,
        label: property.label,
      })),
    ],
    [properties],
  )

  const params = () => {
    const search = boardFiltersToSearch(filters)
    tableFiltersToSearch(tableFilters, sort, search)
    search.set('page', String(page))
    search.set('rows', String(rows))
    return search
  }
  const table = useQuery({
    queryKey: ['cycles', params().toString()],
    queryFn: () =>
      api<CycleTableResponse>(`/api/v1/cycles?${params().toString()}`),
  })

  const setFiltersAndResetPage = (next: TableFilters) => {
    setTableFilters(next)
    setPage(1)
  }
  const sortedField = sort.length === 1 ? sort[0] : null
  const activeSortKey = sortedField
    ? Object.entries(columnSortField).find(
        ([, field]) => field === sortedField.field,
      )?.[0]
    : clientSort?.key
  const activeSortDir = sortedField
    ? sortedField.dir
    : (clientSort?.dir ?? null)
  const toggleColumnSort = (key: string) => {
    const dir =
      activeSortKey === key && activeSortDir === 'asc' ? 'desc' : 'asc'
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
      case 'numeric_id':
        return Number(card.numeric_id)
      case 'branch':
        return card.branch.nombre
      case 'delivered_on':
        return card.closed_at ?? ''
      default: {
        const property = properties.find((item) => `custom:${item.key}` === key)
        if (!property) return ''
        const values =
          (card as { treatment_custom_values?: Record<string, unknown> })
            .treatment_custom_values ?? {}
        return formatCustomValue(property, values[property.key]) || ''
      }
    }
  }
  // The board filters (branch, search, etc.) are controlled by the parent; any change invalidates the current page.
  const boardFiltersKey = boardFiltersToSearch(filters).toString()
  useEffect(() => setPage(1), [boardFiltersKey])

  const columnFiltersKey = JSON.stringify(columnFilters)
  useEffect(() => setPage(1), [columnFiltersKey])

  const loadedCards = table.data?.data ?? []
  const cards = loadedCards.filter((card) =>
    matchesCycleColumnFilters(
      card,
      columnFilters,
      (item) =>
        pipeline
          ? effectiveStage(
              pipeline,
              item.status,
              (item as { stage_id?: string | null }).stage_id,
            )?.id
          : undefined,
      properties,
    ),
  )
  const displayCards = clientSort
    ? [...cards].sort(
        (a, b) =>
          (clientSort.dir === 'asc' ? 1 : -1) *
          compareValues(
            sortValue(clientSort.key, a),
            sortValue(clientSort.key, b),
          ),
      )
    : cards
  const total = table.data?.total ?? 0

  const cell = (key: string, card: BoardCard): ReactNode => {
    const open = isOpenCycle(card)
    const derived = derivedStatusLabel(card.derived_status)
    switch (key) {
      case 'patient':
        return (
          <button
            type="button"
            className="text-petroleo text-left font-semibold hover:underline"
            onClick={() => onOpenCard?.(card)}
          >
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
      case 'status': {
        // El estado de una reposición abierta es su etapa en la configuración
        // del tablero; las cerradas conservan "Entregado" / "No retirado".
        const stage = pipeline
          ? effectiveStage(
              pipeline,
              card.status,
              (card as { stage_id?: string | null }).stage_id,
            )
          : undefined
        return open && canMove && stage ? (
          <label className="relative inline-flex items-center">
            <span className="sr-only">
              Cambiar estado del ciclo de {card.patient.nombre}
            </span>
            <Select
              value={stage.id}
              onChange={(event) => {
                const next = openStageOptions.find(
                  (option) => option.id === event.target.value,
                )
                if (next) onSetStage(card, next)
              }}
              style={{ borderLeft: `4px solid ${stage.color}` }}
              className="border-border focus:border-tealmax h-8 appearance-none rounded-lg border bg-white pr-7 pl-2 text-xs font-medium outline-none"
            >
              {openStageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
            <ChevronDown className="text-muted pointer-events-none absolute right-2 size-3.5" />
          </label>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
              open
                ? 'border-sky-200 bg-sky-50 text-sky-900'
                : card.status === 'delivered'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-950',
            )}
          >
            {open && stage ? (
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
            ) : null}
            {open && stage ? stage.name : cycleStatusLabels[card.status]}
          </span>
        )
      }
      case 'created_at':
        return card.created_at ? formatDate(localDateOnly(card.created_at)) : ''
      case 'expected_on':
        return formatDate(card.expected_on)
      case 'delivered_on':
        return (
          <span className="font-medium">
            {card.status === 'delivered' && card.closed_at
              ? formatDate(localDateOnly(card.closed_at))
              : ''}
          </span>
        )
      case 'derived':
        return derived ? <StatusChip status={derived} /> : null
      case 'numeric_id':
        return <span className="tabular-nums">{card.numeric_id}</span>
      case 'branch':
        return (
          <BranchTag
            name={card.branch.nombre}
            labelColor={card.branch.label_color}
          />
        )
      default: {
        const property = properties.find((item) => `custom:${item.key}` === key)
        if (!property) return null
        const values =
          (card as { treatment_custom_values?: Record<string, unknown> })
            .treatment_custom_values ?? {}
        return (
          <span className="text-muted">
            {formatCustomValue(property, values[property.key]) || ''}
          </span>
        )
      }
    }
  }

  // Los botones salen de las etapas configuradas en el tablero (nombre, color y orden).
  const stageOptions = [...(pipeline?.stages ?? [])].sort(
    (a, b) => a.position - b.position,
  )
  // Los conteos no dependen del botón elegido: se conservan mientras llega la respuesta nueva.
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({})
  useEffect(() => {
    if (table.data?.stage_counts) setStageCounts(table.data.stage_counts)
  }, [table.data])
  const totalCount = Object.values(stageCounts).reduce(
    (sum, count) => sum + count,
    0,
  )
  const activeStageIds = tableFilters.stage_id
    ? tableFilters.stage_id.split(',')
    : []
  // La fecha de entrega solo tiene sentido al ver ciclos entregados: se muestra al filtrar por "Entregado".
  const closedStageIds = new Set(
    (pipeline?.stages ?? [])
      .filter((stage) => stage.system_status === 'closed')
      .map((stage) => stage.id),
  )
  const showDeliveredOn =
    activeStageIds.length > 0 &&
    activeStageIds.every((id) => closedStageIds.has(id))
  const visibleColumnKeys = defaultColumnKeys.filter(
    (key) => key !== 'delivered_on' || showDeliveredOn,
  )
  const toggleStage = (stageId: string | null) => {
    const next =
      stageId === null
        ? []
        : activeStageIds.includes(stageId)
          ? activeStageIds.filter((id) => id !== stageId)
          : [...activeStageIds, stageId]
    setFiltersAndResetPage({
      ...tableFilters,
      stage_id: next.length ? next.join(',') : undefined,
    })
  }
  const stagePill = (selectedOption: boolean) =>
    cn(
      'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition',
      selectedOption
        ? 'border-tealmax bg-tealmax text-white'
        : 'border-border text-ink hover:bg-surface bg-white',
    )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        role="group"
        aria-label="Filtrar por estado"
        className="mb-3 flex shrink-0 flex-wrap items-center gap-1.5"
      >
        <button
          type="button"
          aria-pressed={activeStageIds.length === 0}
          onClick={() => toggleStage(null)}
          className={stagePill(activeStageIds.length === 0)}
        >
          Todos
          {totalCount > 0 && (
            <span className="font-normal tabular-nums opacity-80">
              {totalCount}
            </span>
          )}
        </button>
        {stageOptions.map((stage) => (
          <button
            key={stage.id}
            type="button"
            aria-pressed={activeStageIds.includes(stage.id)}
            onClick={() => toggleStage(stage.id)}
            className={stagePill(activeStageIds.includes(stage.id))}
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            {stage.name}
            {(stageCounts[stage.id] ?? 0) > 0 && (
              <span className="font-normal tabular-nums opacity-80">
                {stageCounts[stage.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <section
        aria-label="Vista tabla de ciclos"
        className="border-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-white"
      >
        {table.isLoading ? (
          <div className="grid gap-3 p-5" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : table.isError ? (
          <p role="alert" className="p-5 text-sm text-red-700">
            No pudimos cargar la tabla. {table.error.message}
          </p>
        ) : cards.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Sin ciclos para estos filtros"
              description="Prueba con otra sucursal, fecha o estado."
            />
          </div>
        ) : (
          <div className="app-scroll min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-surface text-muted sticky top-0 z-10 text-[11px] tracking-wide uppercase">
                <tr>
                  {visibleColumnKeys.map((key) => {
                    const active = activeSortKey === key ? activeSortDir : null
                    return (
                      <th
                        key={key}
                        className="bg-surface px-4 py-3 font-semibold"
                      >
                        <button
                          type="button"
                          onClick={() => toggleColumnSort(key)}
                          className="hover:text-petroleo inline-flex items-center gap-1"
                        >
                          {
                            allColumns.find((column) => column.key === key)
                              ?.label
                          }
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
                    className={cn(
                      index % 2 === 1 ? 'bg-slate-100' : 'bg-white',
                      'hover:bg-surface/50',
                    )}
                  >
                    {visibleColumnKeys.map((key) => (
                      <td key={key} className="px-4 py-3">
                        {cell(key, card)}
                      </td>
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
