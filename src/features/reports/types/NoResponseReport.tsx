import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { reportQueryString, type ReportFilters, type ReportResponse } from '@/lib/reports'
import { ReportTable } from '../components/ReportTable'
import { ReportErrorState } from '../components/ReportErrorState'
import { ExportButton } from '../components/ExportButton'
import { DefinitionHelp } from '../components/DefinitionHelp'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * No-response report: paginated patient/branch/attempts/last-notice/age/
 * open-task table. The API's NoResponseRow shape carries no phone field at
 * all (confirmed in api-types.ts) — this component never reads or renders
 * one, so there is nothing to scrub here; the guarantee lives server-side.
 */
export function NoResponseReport({ filters }: { filters: ReportFilters }) {
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ['reports', 'no-response', filters, page],
    queryFn: () =>
      api<ReportResponse['no-response']>(
        `/api/v1/reports/no-response?${reportQueryString(filters, { page, rows: PAGE_ROWS })}`,
      ),
  })

  if (query.isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (query.isError) {
    return <ReportErrorState message={query.error.message} onRetry={() => query.refetch()} />
  }

  const data = query.data
  if (!data) return null

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-petroleo flex items-center gap-1.5 text-base font-bold">
          Pacientes sin respuesta
          <DefinitionHelp definitions={data.definitions} term="no_response" label="Sin respuesta" />
        </h3>
        <ExportButton type="no-response" filters={filters} />
      </div>

      <ReportTable
        columns={['Paciente', 'Sucursal', 'Intentos', 'Último aviso', 'Antigüedad', 'Tarea abierta']}
        rows={data.data.map((row) => [
          <span key="patient">{row.patient.full_name ?? 'Sin nombre'}</span>,
          <span key="branch">{row.branch?.name ?? '—'}</span>,
          <span key="attempts">{row.attempts_count}</span>,
          <span key="last">{new Date(row.last_notice_at).toLocaleDateString('es')}</span>,
          <span key="age">{row.age_days} días</span>,
          <span key="task" className="inline-flex items-center gap-1">
            {row.has_open_task ? (
              <Check className="text-cuidado size-4" />
            ) : (
              <X className="text-muted size-4" />
            )}
            {row.has_open_task ? 'Sí' : 'No'}
          </span>,
        ])}
        page={page}
        total={data.total}
        onPageChange={setPage}
        loading={false}
        fetching={query.isFetching}
        emptyTitle="Sin pacientes pendientes de respuesta"
        emptyDescription="Nadie tiene avisos sin confirmar en este periodo."
      />
    </div>
  )
}
