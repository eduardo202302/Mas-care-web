import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/** Page footer for server-paged tables (page numbers are 1-based). */
export function Pagination({
  page,
  rows,
  total,
  onChange,
  disabled = false,
}: {
  page: number
  rows: number
  total: number
  onChange: (page: number) => void
  disabled?: boolean
}) {
  const pages = Math.max(1, Math.ceil(total / rows))
  if (total === 0 || (pages === 1 && page === 1)) return null
  const from = (page - 1) * rows + 1
  const to = Math.min(page * rows, total)
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <span className="text-muted text-sm">
        {from}–{to} de {total} · Página {page} de {pages}
      </span>
      <div className="flex gap-2">
        <Button
          aria-label="Página anterior"
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          aria-label="Página siguiente"
          disabled={disabled || page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
