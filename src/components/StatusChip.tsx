import { cn } from '@/lib/cn'
import type { StatusLabel } from './status-labels'

const styles: Record<StatusLabel, string> = {
  'Al día': 'bg-emerald-50 text-emerald-900 border-emerald-200',
  'Próxima reposición': 'bg-sky-50 text-sky-900 border-sky-200',
  'Vence pronto': 'bg-amber-50 text-amber-950 border-amber-200',
  'Retiro pendiente': 'bg-violet-50 text-violet-900 border-violet-200',
  Vencido: 'bg-expired-bg text-expired-text border-expired-border',
  'Receta por renovar': 'bg-slate-100 text-slate-800 border-slate-300',
}

export function StatusChip({
  status,
  className,
}: {
  status: StatusLabel
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
