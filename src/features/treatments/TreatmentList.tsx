import {
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  PackageCheck,
  PauseCircle,
  Pencil,
  PlayCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusChip } from '@/components/StatusChip'
import {
  daysRemainingLabel,
  derivedStatusLabel,
  formatDate,
  medicationName,
  treatmentPauta,
  treatmentStatusLabel,
  type Medication,
  type Treatment,
} from '@/lib/treatments'
import type { TreatmentActionType } from './TreatmentActionDialog'

const neutralChip =
  'inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800'

export function TreatmentList({
  treatments,
  medications,
  canWrite,
  canManage,
  onEdit,
  onAction,
  onNotice,
  onDeliver,
}: {
  treatments: Treatment[]
  medications: Map<string, Medication>
  canWrite: boolean
  canManage: boolean
  onEdit: (treatment: Treatment) => void
  onAction: (
    action: TreatmentActionType | 'resume',
    treatment: Treatment,
  ) => void
  onNotice?: (treatment: Treatment) => void
  onDeliver?: (treatment: Treatment) => void
}) {
  return (
    <ul className="grid gap-3">
      {treatments.map((treatment) => {
        const medication = medications.get(treatment.medicationId)
        const derived = derivedStatusLabel(treatment.derived_status)
        const canAdjust =
          treatment.status === 'active' || treatment.status === 'paused'
        const showActions =
          (canWrite && treatment.status !== 'finished') || canManage
        return (
          <li
            key={treatment.id}
            aria-label={`Tratamiento de ${medicationName(medication)}`}
            className="border-border rounded-xl border bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-petroleo text-sm font-semibold">
                  {medicationName(medication)}
                </p>
                <p className="text-muted mt-0.5 text-xs">
                  {treatmentPauta(treatment, medication)}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {derived ? (
                  <StatusChip status={derived} />
                ) : (
                  <span className={neutralChip}>
                    {treatmentStatusLabel(treatment.status)}
                  </span>
                )}
                {treatment.prescription_flag && (
                  <StatusChip status="Receta por renovar" />
                )}
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-muted">Fin de cobertura</dt>
                <dd className="text-ink mt-0.5 font-medium">
                  {formatDate(treatment.coverageEndOn)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Días restantes</dt>
                <dd
                  className={`mt-0.5 font-medium ${
                    treatment.days_remaining !== null &&
                    treatment.days_remaining < 0
                      ? 'text-red-700'
                      : 'text-ink'
                  }`}
                >
                  {daysRemainingLabel(treatment.days_remaining)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Prescriptor</dt>
                <dd className="text-ink mt-0.5 font-medium">
                  {treatment.prescriberName || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Receta vence</dt>
                <dd className="text-ink mt-0.5 font-medium">
                  {formatDate(treatment.prescriptionExpiresOn)}
                </dd>
              </div>
            </dl>
            {treatment.statusReason && (
              <p className="text-muted mt-2 text-xs">
                <span className="text-ink font-medium">Motivo:</span>{' '}
                {treatment.statusReason}
              </p>
            )}
            {showActions && (
              <div className="border-border mt-3 flex flex-wrap gap-1 border-t pt-3">
                {canWrite && treatment.status !== 'finished' && (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onEdit(treatment)}
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                )}
                {onNotice && canWrite && treatment.status === 'active' && (
                  <Button
                    variant="coral"
                    className="h-8 px-2 text-xs"
                    onClick={() => onNotice(treatment)}
                  >
                    <MessageCircle className="size-3.5" />
                    Avisar
                  </Button>
                )}
                {onDeliver && canWrite && treatment.status === 'active' && (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onDeliver(treatment)}
                  >
                    <PackageCheck className="size-3.5" />
                    Entregar
                  </Button>
                )}
                {canManage && treatment.status === 'active' && (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('pause', treatment)}
                  >
                    <PauseCircle className="size-3.5" />
                    Pausar
                  </Button>
                )}
                {canManage &&
                  (treatment.status === 'active' ||
                    treatment.status === 'paused') && (
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-xs text-red-700 hover:text-red-800"
                      onClick={() => onAction('finish', treatment)}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Finalizar
                    </Button>
                  )}
                {canManage && treatment.status === 'paused' && (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('resume', treatment)}
                  >
                    <PlayCircle className="size-3.5" />
                    Reanudar
                  </Button>
                )}
                {canManage && canAdjust && (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('adjust', treatment)}
                  >
                    <CalendarClock className="size-3.5" />
                    Ajustar cobertura
                  </Button>
                )}
                {canManage && (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAction('renew', treatment)}
                  >
                    <RefreshCw className="size-3.5" />
                    Renovar receta
                  </Button>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function ActiveTreatmentsPanel({
  treatments,
  medications,
}: {
  treatments: Treatment[]
  medications: Map<string, Medication>
}) {
  if (!treatments.length)
    return <p className="text-muted text-sm">Sin tratamientos activos.</p>
  return (
    <ul className="grid gap-3">
      {treatments.map((treatment) => {
        const medication = medications.get(treatment.medicationId)
        const derived = derivedStatusLabel(treatment.derived_status)
        return (
          <li
            key={treatment.id}
            className="border-border border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-petroleo text-sm font-semibold">
                {medicationName(medication)}
              </p>
              <span className="shrink-0">
                {derived ? (
                  <StatusChip status={derived} />
                ) : (
                  <span className={neutralChip}>Activo</span>
                )}
              </span>
            </div>
            <p className="text-muted mt-0.5 text-xs">
              {treatmentPauta(treatment, medication)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
