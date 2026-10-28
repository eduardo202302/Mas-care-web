import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ChevronDown, Loader2 } from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { StatusChip } from '@/components/StatusChip'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import {
  boardFiltersToSearch,
  cycleStatusLabels,
  isOpenCycle,
  openCycleStatuses,
  type BoardCard,
  type BoardFilters,
  type CycleStatus,
  type CycleTableResponse,
} from '@/lib/board'
import { derivedStatusLabel, formatDate } from '@/lib/treatments'
import { cn } from '@/lib/cn'

export function CycleTable({
  filters,
  canMove,
  onMove,
  onOpenCard,
}: {
  filters: BoardFilters
  canMove: boolean
  onMove: (card: BoardCard, to: CycleStatus) => void
  onOpenCard?: (card: BoardCard) => void
}) {
  const table = useInfiniteQuery({
    queryKey: ['cycles', boardFiltersToSearch(filters).toString()],
    queryFn: ({ pageParam }) => {
      const params = boardFiltersToSearch(filters)
      params.set('limit', '30')
      if (pageParam) params.set('cursor', pageParam)
      return api<CycleTableResponse>(`/api/v1/cycles?${params.toString()}`)
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  })

  const [sortDesc, setSortDesc] = useState(false)
  const rows = table.data?.pages.flatMap((page) => page.data) ?? []
  const sorted = [...rows].sort((a, b) =>
    sortDesc
      ? b.expected_on.localeCompare(a.expected_on)
      : a.expected_on.localeCompare(b.expected_on),
  )

  return (
    <section
      aria-label="Vista tabla de ciclos"
      className="border-border overflow-hidden rounded-xl border bg-white"
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
      ) : rows.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="Sin ciclos para estos filtros"
            description="Prueba con otra sucursal, fecha o estado."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-surface text-muted text-[11px] tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Paciente</th>
                <th className="px-4 py-3 font-semibold">Medicamento</th>
                <th className="px-4 py-3 font-semibold">Estado del ciclo</th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    aria-label={`Ordenar por fecha prevista ${sortDesc ? 'ascendente' : 'descendente'}`}
                    onClick={() => setSortDesc((value) => !value)}
                    className="hover:text-ink inline-flex items-center gap-1"
                  >
                    Fecha prevista
                    {sortDesc ? (
                      <ArrowDown className="size-3" />
                    ) : (
                      <ArrowUp className="size-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Estado derivado</th>
                <th className="px-4 py-3 font-semibold">Sucursal</th>
                <th className="px-4 py-3 font-semibold">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {sorted.map((card, index) => {
                const open = isOpenCycle(card)
                const derived = derivedStatusLabel(card.derived_status)
                return (
                  <tr
                    key={card.cycle_id}
                    data-testid={`table-row-${card.cycle_id}`}
                    className={cn(
                      index % 2 === 1 ? 'bg-slate-100' : 'bg-white',
                      'hover:bg-surface/50',
                    )}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-petroleo text-left font-semibold hover:underline"
                        onClick={() => onOpenCard?.(card)}
                      >
                        {card.patient.nombre}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink font-medium">
                        {card.medication.nombre}
                      </p>
                      <p className="text-muted text-xs">
                        {card.medication.presentacion}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {open && canMove ? (
                        <label className="relative inline-flex items-center">
                          <span className="sr-only">
                            Cambiar estado del ciclo de {card.patient.nombre}
                          </span>
                          <select
                            value={card.status}
                            onChange={(event) =>
                              onMove(card, event.target.value as CycleStatus)
                            }
                            className="border-border focus:border-tealmax h-8 appearance-none rounded-lg border bg-white pr-7 pl-2 text-xs font-medium outline-none"
                          >
                            {openCycleStatuses.map((status) => (
                              <option key={status} value={status}>
                                {cycleStatusLabels[status]}
                              </option>
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
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatDate(card.expected_on)}
                    </td>
                    <td className="px-4 py-3">
                      {derived ? (
                        <StatusChip status={derived} />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <BranchTag
                        name={card.branch.nombre}
                        labelColor={card.branch.label_color}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {card.responsible?.name ?? '—'}
                    </td>
                  </tr>
                )
              })}
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
          <Button
            type="button"
            className="h-8"
            onClick={() => table.fetchNextPage()}
            disabled={table.isFetchingNextPage}
          >
            {table.isFetchingNextPage ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {table.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </Button>
        )}
      </div>
    </section>
  )
}
