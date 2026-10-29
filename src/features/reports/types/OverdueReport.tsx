import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { reportQueryString, type ReportFilters, type ReportResponse } from '@/lib/reports'
import { SimpleMetricCard } from '../components/MetricCard'
import { ReportChart } from '../components/ReportChart'
import { ReportTable } from '../components/ReportTable'
import { ReportErrorState } from '../components/ReportErrorState'
import { ExportButton } from '../components/ExportButton'
import { Skeleton } from '@/components/ui/Skeleton'

/** Overdue report: indicators, by_branch breakdown, avg delay, paginated detail list (delivered-late vs still-pending). */
export function OverdueReport({ filters }: { filters: ReportFilters }) {
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const query = useQuery({
    queryKey: ['reports', 'overdue', filters, page, rows],
    queryFn: () =>
      api<ReportResponse['overdue']>(
        `/api/v1/reports/overdue?${reportQueryString(filters, { page, rows })}`,
      ),
  })

  if (query.isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (query.isError) {
    return <ReportErrorState message={query.error.message} onRetry={() => query.refetch()} />
  }

  const data = query.data
  if (!data) return null

  const byBranch = data.by_branch.map((row) => ({
    sucursal: row.name,
    vencidos: row.total_overdue,
    label_color: row.label_color,
  }))

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid flex-1 gap-3 sm:grid-cols-4">
          <SimpleMetricCard
            label="Total vencidos"
            value={data.summary.total_overdue}
            definitions={data.definitions}
            definitionKey="overdue"
          />
          <SimpleMetricCard label="Entregados tarde" value={data.summary.delivered_late} />
          <SimpleMetricCard label="Aún pendientes" value={data.summary.still_pending} />
          <SimpleMetricCard
            label="Retraso promedio"
            value={data.avg_delay_days}
            unit="días"
            definitions={data.definitions}
            definitionKey="avg_delay_days"
          />
        </div>
        <ExportButton type="overdue" filters={filters} />
      </div>

      <ReportChart
        title="Vencidos por sucursal"
        description="Total de ciclos vencidos por sucursal"
        data={byBranch}
        xKey="sucursal"
        series={[{ key: 'vencidos', label: 'Vencidos' }]}
        colorByCategory="label_color"
      />

      <div>
        <h3 className="font-display text-petroleo mb-2 text-base font-bold">Detalle</h3>
        <ReportTable
          columns={['Paciente', 'Medicamento', 'Sucursal', 'Previsto', 'Retraso', 'Estado']}
          rows={data.detail.map((row) => [
            <span key="patient">{row.patient.full_name}</span>,
            <span key="medication">{row.medication}</span>,
            <span key="branch">{row.branch.name}</span>,
            <span key="expected">{new Date(row.expected_on).toLocaleDateString('es')}</span>,
            <span key="delay">{row.delay_days === null ? '—' : `${row.delay_days} días`}</span>,
            <span
              key="status"
              className={
                row.delivered_late
                  ? 'text-cuidado font-medium'
                  : 'text-expired-text font-medium'
              }
            >
              {row.delivered_late ? 'Entregado tarde' : 'Pendiente'}
            </span>,
          ])}
          page={page}
          pageRows={rows}
          total={data.total}
          onPageChange={setPage}
          onRowsChange={(next) => {
            setRows(next)
            setPage(1)
          }}
          loading={false}
          fetching={query.isFetching}
        />
      </div>
    </div>
  )
}
