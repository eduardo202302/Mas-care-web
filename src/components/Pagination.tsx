import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PAGE_ROWS_OPTIONS } from '@/lib/paging'

/** Footer for server-paged tables: prev/next + page count on the left, rows-per-page on the right. Page numbers are 1-based. */
export function Pagination({
  page,
  rows,
  total,
  onChange,
  onRowsChange,
  rowsOptions = PAGE_ROWS_OPTIONS,
  disabled = false,
}: {
  page: number
  rows: number
  total: number
  onChange: (page: number) => void
  /** Omit to hide the rows-per-page selector (e.g. for small, unpaged lists). */
  onRowsChange?: (rows: number) => void
  rowsOptions?: readonly number[]
  disabled?: boolean
}) {
  const pages = Math.max(1, Math.ceil(total / rows))
  const from = total === 0 ? 0 : (page - 1) * rows + 1
  const to = Math.min(page * rows, total)
  return (
    <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          <Button aria-label="Página anterior" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button aria-label="Página siguiente" disabled={disabled || page >= pages} onClick={() => onChange(page + 1)}>
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <span className="text-muted text-sm">
          {from}–{to} de {total} · Página {page} de {pages}
        </span>
      </div>
      {onRowsChange && (
        <label className="text-muted flex items-center gap-2 text-sm">
          Filas por página
          <select
            value={rows}
            disabled={disabled}
            onChange={(event) => onRowsChange(Number(event.target.value))}
            className="border-border focus:border-tealmax h-8 rounded-lg border bg-white px-2 text-sm outline-none"
          >
            {rowsOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
