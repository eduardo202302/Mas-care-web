import type { StatusLabel } from '@/components/status-labels'
import type { components } from './api-types'

export type Treatment = components['schemas']['Treatment']
export type Medication = components['schemas']['Medication']

const derivedLabels: Record<
  NonNullable<Treatment['derived_status']>,
  StatusLabel
> = {
  al_dia: 'Al día',
  proxima_reposicion: 'Próxima reposición',
  vence_pronto: 'Vence pronto',
  retiro_pendiente: 'Retiro pendiente',
  vencido: 'Vencido',
}

const activityLabels: Record<string, string> = {
  note: 'Nota',
  call: 'Llamada',
  treatment_created: 'Tratamiento creado',
  treatment_updated: 'Tratamiento actualizado',
  treatment_paused: 'Tratamiento pausado',
  treatment_finished: 'Tratamiento finalizado',
  treatment_resumed: 'Tratamiento reanudado',
  coverage_adjusted: 'Fin de cobertura ajustado',
  prescription_renewed: 'Receta renovada',
  cycle_moved: 'Ciclo movido',
  incident: 'Incidencia',
  notice: 'Aviso registrado',
  delivery: 'Entrega registrada',
}

const dateFormatter = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const quantityFormatter = new Intl.NumberFormat('es-BO', {
  maximumFractionDigits: 3,
})

export function derivedStatusLabel(
  status: Treatment['derived_status'],
): StatusLabel | null {
  return status ? derivedLabels[status] : null
}

export function treatmentStatusLabel(status: Treatment['status']): string {
  if (status === 'paused') return 'Pausado'
  if (status === 'finished') return 'Finalizado'
  return 'Activo'
}

export function activityLabel(type: string): string {
  return activityLabels[type] ?? type
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  if (!year || !month || !day) return null
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = parseDateOnly(value)
  return date ? dateFormatter.format(date) : '—'
}

export function formatDateValue(date: Date): string {
  return dateFormatter.format(date)
}

export function dateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 10)
}

export function todayInputValue(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function formatQuantity(value: string | number): string {
  const parsed = Number(value)
  return Number.isFinite(parsed)
    ? quantityFormatter.format(parsed)
    : String(value)
}

export function coveragePreview(input: {
  quantityPerCycle: number
  dosePerIntake: number
  intakesPerDay: number
  startDate: string
}): { days: number; endOn: Date } | null {
  const start = parseDateOnly(input.startDate)
  const units = input.dosePerIntake * input.intakesPerDay
  if (
    !start ||
    !Number.isFinite(units) ||
    units <= 0 ||
    !Number.isFinite(input.quantityPerCycle) ||
    input.quantityPerCycle <= 0
  )
    return null
  const days = Math.floor(input.quantityPerCycle / units + 1e-9)
  return {
    days,
    endOn: new Date(start.getTime() + days * 24 * 60 * 60 * 1000),
  }
}

export function medicationName(medication: Medication | undefined): string {
  return (
    medication?.brandName ||
    medication?.genericName ||
    medication?.activeIngredient ||
    'Medicamento'
  )
}

export function daysRemainingLabel(days: number | null): string {
  if (days === null) return '—'
  if (days < 0)
    return `Vencido hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`
  if (days === 0) return 'Hoy'
  return `${days} ${days === 1 ? 'día' : 'días'}`
}

export function treatmentPauta(
  treatment: Treatment,
  medication: Medication | undefined,
): string {
  const unit = medication?.doseUnit || 'unidad'
  const intakes = Number(treatment.intakesPerDay)
  return `${formatQuantity(treatment.dosePerIntake)} ${unit} · ${formatQuantity(
    treatment.intakesPerDay,
  )} ${intakes === 1 ? 'toma' : 'tomas'}/día`
}
