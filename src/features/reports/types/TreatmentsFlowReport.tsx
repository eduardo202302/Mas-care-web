import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '@/lib/http'
import { reportQueryString, type ReportFilters, type ReportResponse } from '@/lib/reports'
import { EmptyState } from '@/components/EmptyState'
import { SimpleMetricCard } from '../components/MetricCard'
import { DefinitionHelp } from '../components/DefinitionHelp'
import { ReportErrorState } from '../components/ReportErrorState'
import { ExportButton } from '../components/ExportButton'
import { Skeleton } from '@/components/ui/Skeleton'

type FlowCategory = 'altas' | 'pausas' | 'reanudaciones' | 'finalizaciones'

const categoryLabels: Record<FlowCategory, string> = {
  altas: 'Altas',
  pausas: 'Pausas',
  reanudaciones: 'Reanudaciones',
  finalizaciones: 'Finalizaciones',
}

// Neutral palette for the four lifecycle categories — none of these reuses
// --coral or --expired-text (the "avisar"/"vencido" reserved colors).
const categoryColors: Record<FlowCategory, string> = {
  altas: '#2db88a',
  pausas: '#eab308',
  reanudaciones: '#3b82f6',
  finalizaciones: '#0a3d4a',
}

/** Altas/bajas report: stacked bars by month (altas/pausas/reanudaciones/finalizaciones) + net balance. */
export function TreatmentsFlowReport({ filters }: { filters: ReportFilters }) {
  const query = useQuery({
    queryKey: ['reports', 'treatments-flow', filters],
    queryFn: () =>
      api<ReportResponse['treatments-flow']>(
        `/api/v1/reports/treatments-flow?${reportQueryString(filters)}`,
      ),
  })

  if (query.isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (query.isError) {
    return <ReportErrorState message={query.error.message} onRetry={() => query.refetch()} />
  }

  const data = query.data
  if (!data) return null

  const netBalance = data.totals.altas + data.totals.reanudaciones - data.totals.pausas - data.totals.finalizaciones
  const includedCategories = data.categories_included

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid flex-1 gap-3 sm:grid-cols-5">
          {includedCategories.map((category) => (
            <SimpleMetricCard key={category} label={categoryLabels[category]} value={data.totals[category]} />
          ))}
          <SimpleMetricCard label="Balance neto" value={netBalance} />
        </div>
        <ExportButton type="treatments-flow" filters={filters} />
      </div>

      {data.notes.source && (
        <p className="text-muted text-xs">{data.notes.source}</p>
      )}

      <div className="border-border shadow-card rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center gap-1.5">
          <h3 className="font-display text-petroleo text-base font-bold">Altas y bajas por mes</h3>
          <DefinitionHelp definitions={data.definitions} term="month" label="Mes" />
        </div>
        {data.by_month.length === 0 ? (
          <EmptyState title="No hay datos en este periodo" description="Ajusta los filtros o elige otro rango de fechas." />
        ) : (
          <div role="img" aria-label="Altas, pausas, reanudaciones y finalizaciones por mes" className="h-80 w-full print:hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3eef0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#71878c" />
                <YAxis tick={{ fontSize: 12 }} stroke="#71878c" />
                <Tooltip />
                <Legend />
                {includedCategories.map((category) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    name={categoryLabels[category]}
                    stackId="flow"
                    fill={categoryColors[category]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Altas, pausas, reanudaciones y finalizaciones por mes</caption>
            <thead className="bg-surface text-muted text-xs tracking-wide uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Mes</th>
                {includedCategories.map((category) => (
                  <th key={category} scope="col" className="px-4 py-2.5 font-semibold">
                    {categoryLabels[category]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {data.by_month.map((row) => (
                <tr key={row.month}>
                  <td className="text-ink px-4 py-2.5">{row.month}</td>
                  {includedCategories.map((category) => (
                    <td key={category} className="text-ink px-4 py-2.5">
                      {row[category]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
