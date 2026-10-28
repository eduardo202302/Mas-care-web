import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/http'
import { reportQueryString, type ReportFilters, type ReportResponse } from '@/lib/reports'
import { MetricCard, SimpleMetricCard } from '../components/MetricCard'
import { ReportChart } from '../components/ReportChart'
import { ReportErrorState } from '../components/ReportErrorState'
import { ExportButton } from '../components/ExportButton'
import { Skeleton } from '@/components/ui/Skeleton'

/** Adherence report: global metric, by_month/by_branch/by_medication breakdowns, avg delay, manual adjustments. */
export function AdherenceReport({ filters }: { filters: ReportFilters }) {
  const query = useQuery({
    queryKey: ['reports', 'adherence', filters],
    queryFn: () =>
      api<ReportResponse['adherence']>(
        `/api/v1/reports/adherence?${reportQueryString(filters)}`,
      ),
  })

  if (query.isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    )
  }

  if (query.isError) {
    return <ReportErrorState message={query.error.message} onRetry={() => query.refetch()} />
  }

  const data = query.data
  if (!data) return null

  const byMonth = data.by_month.map((row) => ({ month: row.month, adherencia: row.percentage ?? 0 }))
  const byBranch = data.by_branch.map((row) => ({
    sucursal: row.name,
    adherencia: row.percentage ?? 0,
    label_color: row.label_color,
  }))
  const byMedication = data.by_medication.map((row) => ({
    medicamento: row.name,
    adherencia: row.percentage ?? 0,
  }))

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <MetricCard
            label="Adherencia global"
            numerator={data.summary.numerator}
            denominator={data.summary.denominator}
            percentage={data.summary.percentage}
            definitions={data.definitions}
            definitionKey="adherence"
            trend={
              data.previous_period
                ? `Periodo anterior: ${data.previous_period.percentage === null ? 'Sin datos' : `${data.previous_period.percentage}%`}`
                : undefined
            }
          />
          <SimpleMetricCard
            label="Retraso promedio"
            value={data.avg_delay_days}
            unit="días"
            definitions={data.definitions}
            definitionKey="avg_delay_days"
          />
          <SimpleMetricCard
            label="Ajustes manuales"
            value={data.manual_adjustments_count}
            definitions={data.definitions}
            definitionKey="manual_adjustments_count"
          />
        </div>
        <ExportButton type="adherence" filters={filters} />
      </div>

      <ReportChart
        title="Adherencia por mes"
        description="Porcentaje de adherencia mensual en el periodo seleccionado"
        data={byMonth}
        xKey="month"
        series={[{ key: 'adherencia', label: 'Adherencia (%)' }]}
        kind="line"
        unit="%"
      />

      <ReportChart
        title="Adherencia por sucursal"
        description="Porcentaje de adherencia por sucursal"
        data={byBranch}
        xKey="sucursal"
        series={[{ key: 'adherencia', label: 'Adherencia (%)' }]}
        colorByCategory="label_color"
        unit="%"
      />

      <ReportChart
        title="Adherencia por medicamento"
        description="Porcentaje de adherencia por medicamento"
        data={byMedication}
        xKey="medicamento"
        series={[{ key: 'adherencia', label: 'Adherencia (%)' }]}
        unit="%"
      />
    </div>
  )
}
