import type { ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
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
}: {
  columns: string[]
  rows: ReactNode[][]
  /** One node per row, rendered in a narrow first column. */
  actions?: ReactNode[]
  /** Called with the row index when a row is double-clicked. */
  onRowDoubleClick?: (index: number) => void
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (!rows.length)
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  return (
    <div className="border-border overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface text-muted text-xs tracking-wide uppercase">
            <tr>
              {actions && (
                <th className="px-3 py-3.5 font-semibold whitespace-nowrap">
                  Acciones
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="px-5 py-3.5 font-semibold"
                >
                  {column}
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
    </div>
  )
}
