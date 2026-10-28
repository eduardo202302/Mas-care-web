import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { api } from '@/lib/http'
import { reportQueryString, type ReportFilters, type ReportResponse } from '@/lib/reports'
import { ReportTable } from '../components/ReportTable'
import { ReportErrorState } from '../components/ReportErrorState'
import { ExportButton } from '../components/ExportButton'
import { DefinitionHelp } from '../components/DefinitionHelp'
import { Skeleton } from '@/components/ui/Skeleton'
import { BranchTag } from '@/components/BranchTag'

const stockStatusLabels: Record<string, string> = {
  in_stock: 'En existencia',
  low: 'Existencias bajas',
  out_of_stock: 'Sin existencias',
}

/**
 * Refills report: per medication+branch table with a forecast horizon
 * selector. The horizon list comes from the API's own `horizons_days`
 * (not assumed to always be 7/14/30/60) — the selector only offers
 * horizons the response actually included.
 */
export function RefillsReport({ filters }: { filters: ReportFilters }) {
  const query = useQuery({
    queryKey: ['reports', 'refills', filters],
    queryFn: () =>
      api<ReportResponse['refills']>(`/api/v1/reports/refills?${reportQueryString(filters)}`),
  })

  const data = query.data
  const [horizon, setHorizon] = useState<number | null>(null)
  const activeHorizon = useMemo(() => {
    if (!data) return null
    if (horizon && data.horizons_days.includes(horizon)) return horizon
    return data.horizons_days[0] ?? null
  }, [data, horizon])

  if (query.isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (query.isError) {
    return <ReportErrorState message={query.error.message} onRetry={() => query.refetch()} />
  }
  if (!data) return null

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted font-medium">Horizonte de previsión</span>
          <select
            aria-label="Horizonte de previsión"
            value={activeHorizon ?? ''}
            onChange={(event) => setHorizon(Number(event.target.value))}
            className="border-border h-9 rounded-lg border bg-white px-3 text-sm outline-none"
          >
            {data.horizons_days.map((days) => (
              <option key={days} value={days}>
                {days} días
              </option>
            ))}
          </select>
        </label>
        <ExportButton type="refills" filters={filters} />
      </div>

      {data.notes.forecast && (
        <p className="text-muted border-border flex items-start gap-2 rounded-lg border bg-white p-3 text-xs">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {data.notes.forecast}
        </p>
      )}

      <ReportTable
        columns={[
          'Medicamento',
          'Sucursal',
          'Entregado',
          `Previsión (${activeHorizon ?? '—'} días)`,
          'Estado de stock',
        ]}
        rows={data.data.map((row) => {
          const bucket = activeHorizon ? row.forecast[String(activeHorizon)] : undefined
          return [
            <span key="medication">{row.medication}</span>,
            <BranchTag key="branch" name={row.branch} labelColor={row.label_color} />,
            <span key="delivered">{row.delivered_units}</span>,
            <span key="forecast">
              {bucket
                ? `${bucket.units} unidades${bucket.estimated_packages !== undefined ? ` (${bucket.estimated_packages} paquetes)` : ''}`
                : 'Sin previsión'}
            </span>,
            <span
              key="stock"
              className={
                row.stock_status === 'out_of_stock'
                  ? 'text-expired-text font-medium'
                  : row.stock_status === 'low'
                    ? 'text-coral font-medium'
                    : 'text-ink'
              }
            >
              {row.stock_status ? stockStatusLabels[row.stock_status] ?? row.stock_status : 'Sin datos'}
            </span>,
          ]
        })}
        page={1}
        total={data.data.length}
        onPageChange={() => {}}
        loading={false}
        fetching={query.isFetching}
      />
      <DefinitionHelp definitions={data.definitions} term="stock_status" label="Estado de stock" />
    </div>
  )
}
