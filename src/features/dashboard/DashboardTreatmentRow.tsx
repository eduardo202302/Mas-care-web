import { Link } from 'react-router-dom'
import { MessageCircle, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/StatusChip'
import { formatDate, derivedStatusLabel } from '@/lib/treatments'
import type { DashboardRow } from '@/lib/operations'

function remainingText(row: DashboardRow): string {
  if (row.days_remaining === null) return 'Sin cobertura'
  if (row.days_remaining === 0) return 'Vence hoy'
  if (row.days_remaining === 1) return 'Vence mañana'
  if (row.days_remaining > 1) return `Quedan ${row.days_remaining} días`
  const days = Math.abs(row.days_remaining)
  return `Venció hace ${days} ${days === 1 ? 'día' : 'días'}`
}

export function DashboardTreatmentRow({
  row,
  canOperate,
  compact = false,
  onNotice,
  onDeliver,
}: {
  row: DashboardRow
  canOperate: boolean
  compact?: boolean
  onNotice: (row: DashboardRow) => void
  onDeliver: (row: DashboardRow) => void
}) {
  const status = derivedStatusLabel(row.derived_status)
  return (
    <div
      className={`flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
        compact ? '' : 'sm:py-4'
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            to={`/pacientes/${encodeURIComponent(row.patient.id)}`}
            className="text-petroleo truncate text-sm font-semibold hover:underline"
          >
            {row.patient.full_name}
          </Link>
          {status && <StatusChip status={status} />}
          {row.prescription_flag && (
            <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              Receta
            </span>
          )}
        </div>
        <p className="text-muted mt-0.5 truncate text-xs">
          {row.medication.name} · {row.branch.name}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="text-right">
          <p
            className={`text-xs font-semibold ${
              row.days_remaining !== null && row.days_remaining < 0
                ? 'text-expired-text'
                : 'text-ink'
            }`}
          >
            {remainingText(row)}
          </p>
          <p className="text-muted text-[11px]">
            {row.coverage_end_on
              ? `Cobertura hasta ${formatDate(row.coverage_end_on)}`
              : 'Sin fecha de cobertura'}
          </p>
        </div>
        {canOperate && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="coral"
              className="h-9 px-3 text-xs"
              onClick={() => onNotice(row)}
            >
              <MessageCircle className="size-4" />
              Avisar
            </Button>
            <Button
              type="button"
              className="h-9 px-3 text-xs"
              onClick={() => onDeliver(row)}
            >
              <PackageCheck className="size-4" />
              Entregar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
