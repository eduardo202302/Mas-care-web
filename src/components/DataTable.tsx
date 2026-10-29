import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ColumnSort } from '@/lib/table-sort'
import { EmptyState } from './EmptyState'

/** Compact edit / delete icon buttons for the first column of a table row. */
export function RowActions({
  label,
  onEdit,
  onDelete,
  deleteLabel = 'Eliminar',
}: {
  label: string
  onEdit?: () => void
  onDelete?: () => void
  deleteLabel?: string
}) {
  return (
    <div className="flex items-center gap-0.5">
      {onEdit && (
        <button
          type="button"
          aria-label={`Editar ${label}`}
          title="Editar"
          onClick={onEdit}
          className="text-muted hover:bg-surface hover:text-petroleo grid size-7 place-items-center rounded-md transition"
        >
          <Pencil className="size-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          aria-label={`${deleteLabel} ${label}`}
          title={deleteLabel}
          onClick={onDelete}
          className="grid size-7 place-items-center rounded-md text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  )
}

export function DataTable({
  columns,
  rows,
  actions,
  onRowDoubleClick,
  emptyTitle = 'No hay resultados',
  emptyDescription = 'Cuando haya información, aparecerá aquí.',
  footer,
  sort = null,
  sortableColumns,
  onSortChange,
}: {
  columns: string[]
  rows: ReactNode[][]
  /** One node per row, rendered in a narrow first column. */
  actions?: ReactNode[]
  /** Called with the row index when a row is double-clicked. */
  onRowDoubleClick?: (index: number) => void
  emptyTitle?: string
  emptyDescription?: string
  /** Rendered inside the table's own card, below the rows (e.g. pagination). Stays outside the scrollable body. */
  footer?: ReactNode
  /** The one column currently sorted, if any; picking another column replaces it. */
  sort?: ColumnSort
  /** Indices of the columns whose header can be clicked to sort. */
  sortableColumns?: number[]
  /** Called with the clicked column's index; the caller owns computing the next sort state. */
  onSortChange?: (index: number) => void
}) {
  if (!rows.length)
    return (
      <div className="border-border flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white">
        <EmptyState title={emptyTitle} description={emptyDescription} />
        {footer && <div className="shrink-0">{footer}</div>}
      </div>
    )
  return (
    <div className="border-border flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface text-muted sticky top-0 z-10 text-xs tracking-wide uppercase">
            <tr>
              {actions && (
                <th className="bg-surface px-3 py-3.5 font-semibold whitespace-nowrap">
                  Acciones
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="bg-surface px-5 py-3.5 font-semibold"
                >
                  {sortableColumns?.includes(index) && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(index)}
                      className="hover:text-petroleo inline-flex items-center gap-1"
                    >
                      {column}
                      {sort?.index === index ? (
                        sort.dir === 'asc' ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5" />
                      )}
                    </button>
                  ) : (
                    column
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {rows.map((row, index) => (
              <tr
                key={index}
                title={onRowDoubleClick ? 'Doble clic para ver' : undefined}
                onDoubleClick={
                  onRowDoubleClick ? () => onRowDoubleClick(index) : undefined
                }
                className={cn(
                  index % 2 === 1 ? 'bg-slate-100' : 'bg-white',
                  'hover:bg-surface/50',
                  onRowDoubleClick && 'cursor-pointer select-none',
                )}
              >
                {actions && (
                  <td
                    className="w-px px-3 py-4 align-middle"
                    onDoubleClick={(event) => event.stopPropagation()}
                  >
                    {actions[index]}
                  </td>
                )}
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="text-ink px-5 py-4 align-middle"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  )
}
