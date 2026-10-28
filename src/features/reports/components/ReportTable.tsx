import type { ReactNode } from 'react'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { PAGE_ROWS } from '@/lib/paging'

/**
 * Generic paginated table for report detail rows. Thin wrapper over the
 * existing DataTable/Pagination/TableSkeleton primitives so every report's
 * paginated list (overdue detail, no-response, refills) looks and behaves
 * the same.
 */
export function ReportTable({
  columns,
  rows,
  page,
  total,
  onPageChange,
  loading,
  fetching = false,
  emptyTitle = 'No hay datos en este periodo',
  emptyDescription = 'Ajusta los filtros o elige otro rango de fechas.',
}: {
  columns: string[]
  rows: ReactNode[][]
  page: number
  total: number
  onPageChange: (page: number) => void
  loading: boolean
  fetching?: boolean
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (loading) return <TableSkeleton columns={columns.length} />
  return (
    <div>
      <DataTable
        columns={columns}
        rows={rows}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      {rows.length > 0 && (
        <Pagination page={page} rows={PAGE_ROWS} total={total} onChange={onPageChange} disabled={fetching} />
      )}
    </div>
  )
}
