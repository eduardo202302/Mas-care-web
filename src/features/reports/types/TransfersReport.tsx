import { useQuery } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { api } from '@/lib/http'
import { reportQueryString, type ReportFilters, type ReportResponse } from '@/lib/reports'
import { SimpleMetricCard } from '../components/MetricCard'
import { ReportChart } from '../components/ReportChart'
import { ReportErrorState } from '../components/ReportErrorState'
import { ExportButton } from '../components/ExportButton'
import { DefinitionHelp } from '../components/DefinitionHelp'
import { Skeleton } from '@/components/ui/Skeleton'

/** Transfers report: indicators, by_month series, by origin/destination branch, free-text reason breakdown. */
export function TransfersReport({ filters }: { filters: ReportFilters }) {
  const query = useQuery({
    queryKey: ['reports', 'transfers', filters],
    queryFn: () =>
      api<ReportResponse['transfers']>(`/api/v1/reports/transfers?${reportQueryString(filters)}`),
  })

  if (query.isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (query.isError) {
    return <ReportErrorState message={query.error.message} onRetry={() => query.refetch()} />
  }

  const data = query.data
  if (!data) return null

  const byMonth = data.by_month.map((row) => ({ month: row.month, traspasos: row.count }))
  const byOrigin = data.by_origin_branch.map((row) => ({
    sucursal: row.name,
    traspasos: row.count,
    label_color: row.label_color,
  }))
  const byDestination = data.by_destination_branch.map((row) => ({
    sucursal: row.name,
    traspasos: row.count,
    label_color: row.label_color,
  }))

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <SimpleMetricCard
            label="Total de traspasos"
            value={data.summary.total_transfers}
            definitions={data.definitions}
            definitionKey="scope"
          />
          <SimpleMetricCard label="Tratamientos movidos" value={data.summary.total_treatments_moved} />
          <SimpleMetricCard label="Ciclos movidos" value={data.summary.total_cycles_moved} />
        </div>
        <ExportButton type="transfers" filters={filters} />
      </div>

      <div className="flex items-center gap-1.5">
        <DefinitionHelp definitions={data.definitions} term="by_month" label="Traspasos por mes" />
      </div>

      <ReportChart
        title="Traspasos por mes"
        description="Número de traspasos por mes"
        data={byMonth}
        xKey="month"
        series={[{ key: 'traspasos', label: 'Traspasos' }]}
        kind="line"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ReportChart
          title="Por sucursal de origen"
          description="Traspasos iniciados desde cada sucursal"
          data={byOrigin}
          xKey="sucursal"
          series={[{ key: 'traspasos', label: 'Traspasos' }]}
          colorByCategory="label_color"
        />
        <ReportChart
          title="Por sucursal de destino"
          description="Traspasos recibidos por cada sucursal"
          data={byDestination}
          xKey="sucursal"
          series={[{ key: 'traspasos', label: 'Traspasos' }]}
          colorByCategory="label_color"
        />
      </div>

      <div className="border-border shadow-card rounded-xl border bg-white p-4">
        <h3 className="font-display text-petroleo mb-1 text-base font-bold">Motivos</h3>
        {data.notes.reason_limitation && (
          <p className="text-muted mb-3 flex items-start gap-2 text-xs">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {data.notes.reason_limitation}
          </p>
        )}
        {data.by_reason.length === 0 ? (
          <p className="text-muted text-sm">Sin motivos registrados en este periodo.</p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Traspasos agrupados por motivo de texto libre</caption>
            <thead className="bg-surface text-muted text-xs tracking-wide uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Motivo</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Traspasos</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {data.by_reason.map((row) => (
                <tr key={row.reason}>
                  <td className="text-ink px-4 py-2.5">{row.reason}</td>
                  <td className="text-ink px-4 py-2.5">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
