import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightLeft } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import type { PatientTransferList } from '@/lib/transfers'

/** Transfer history for one patient, shown in a tab of the patient detail page. */
export function PatientTransfersPanel({ patientId }: { patientId: string }) {
  const [page, setPage] = useState(1)
  const transfers = useQuery({
    queryKey: ['patients', patientId, 'transfers', page],
    queryFn: () =>
      api<PatientTransferList>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/transfers?${pageQuery({ page, rows: PAGE_ROWS })}`,
      ),
    enabled: Boolean(patientId),
  })

  const rows = transfers.data?.data ?? []

  if (transfers.isLoading) return <TableSkeleton columns={5} />
  if (transfers.isError)
    return (
      <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        No pudimos cargar los traslados. {transfers.error.message}
      </p>
    )
  if (rows.length === 0)
    return (
      <EmptyState
        title="Sin traslados"
        description="Cuando este paciente se traslade de sucursal, el historial aparecerá aquí."
      />
    )

  return (
    <div className="grid gap-3">
      <DataTable
        columns={['Fecha', 'De', 'A', 'Motivo', 'Tratamientos', 'Registrado por']}
        rows={rows.map((row) => [
          <span key="date">
            {new Date(row.occurred_at).toLocaleString('es')}
          </span>,
          <span key="from">{row.from_branch.name}</span>,
          <span key="to" className="inline-flex items-center gap-1.5">
            <ArrowRightLeft className="text-tealmax size-3.5" />
            {row.to_branch.name}
          </span>,
          <span key="reason" className="text-muted line-clamp-2">
            {row.reason}
          </span>,
          <span key="count">{row.treatments_count}</span>,
          <span key="by">{row.created_by.name}</span>,
        ])}
        emptyTitle="Sin traslados"
        emptyDescription="Cuando este paciente se traslade de sucursal, el historial aparecerá aquí."
      />
      <Pagination
        page={page}
        rows={PAGE_ROWS}
        total={transfers.data?.total ?? 0}
        onChange={setPage}
        disabled={transfers.isFetching}
      />
    </div>
  )
}
