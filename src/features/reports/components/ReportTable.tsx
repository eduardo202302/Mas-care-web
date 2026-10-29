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
  pageRows = PAGE_ROWS,
  total,
  onPageChange,
  onRowsChange,
  loading,
  fetching = false,
  emptyTitle = 'No hay datos en este periodo',
  emptyDescription = 'Ajusta los filtros o elige otro rango de fechas.',
}: {
  columns: string[]
  rows: ReactNode[][]
  page: number
  pageRows?: number
  total: number
  onPageChange: (page: number) => void
  onRowsChange?: (rows: number) => void
  loading: boolean
  fetching?: boolean
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (loading) return <TableSkeleton columns={columns.length} />
  return (
    <DataTable
      columns={columns}
      rows={rows}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      footer={
        rows.length > 0 ? (
          <Pagination
            page={page}
            rows={pageRows}
            total={total}
            onChange={onPageChange}
            onRowsChange={onRowsChange}
            disabled={fetching}
          />
        ) : undefined
      }
    />
  )
}
