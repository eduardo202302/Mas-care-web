import type { StatusLabel } from '@/components/status-labels'
import type { components } from './api-types'
import { api } from './http'
import { todayDateOnly } from './prescription'
import type { TreatmentSaveValues } from '@/schemas/treatment'

export type Treatment = components['schemas']['Treatment']
export type Medication = components['schemas']['Medication']

/** Sube la receta adjunta de un tratamiento ya creado (multipart, no JSON). */
export async function uploadPrescriptionDocument(
  treatmentId: string,
  file: File | null | undefined,
) {
  if (!file) return
  const form = new FormData()
  form.set('prescription_document', file)
  await api(
    `/api/v1/treatments/${encodeURIComponent(treatmentId)}/prescription-document`,
    { method: 'POST', body: form },
  )
}

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
  automation: 'Automatización',
  email: 'Correo',
  meeting: 'Reunión',
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

/** Descompone un total de días en años, meses y días legibles (p.ej. "4 años 1 mes 10 días"), omitiendo las unidades en cero. */
export function formatDurationYMD(totalDays: number): string {
  if (!Number.isFinite(totalDays) || totalDays <= 0) return '0 días'
  const years = Math.floor(totalDays / 365)
  const afterYears = totalDays % 365
  const months = Math.floor(afterYears / 30)
  const days = afterYears % 30
  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`)
  if (days > 0 || parts.length === 0)
    parts.push(`${days} ${days === 1 ? 'día' : 'días'}`)
  return parts.join(' ')
}

const purchaseDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** Fecha y hora en formato mes/día/año, ej. "11/06/2026 03:45 PM". */
export function formatPurchaseDateTime(
  value: string | null | undefined,
): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return purchaseDateTimeFormatter.format(date).replace(', ', ' ')
}

/** Tiempo transcurrido desde una fecha, ej. "Hace 1 año 2 meses 3 días". */
export function elapsedSinceLabel(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  return days <= 0 ? 'Hoy' : `Hace ${formatDurationYMD(days)}`
}

export function medicationName(medication: Medication | undefined): string {
  return (
    medication?.brandName ||
    medication?.genericName ||
    medication?.activeIngredient ||
    'Medicamento'
  )
}

/** Nombre asignado al tratamiento en "Nuevo Ciclo"; si no tiene, usa el medicamento. */
export function treatmentLabel(
  treatment: Treatment,
  medication: Medication | undefined,
): string {
  return treatment.name || medicationName(medication)
}

export function daysRemainingLabel(days: number | null): string {
  if (days === null) return '—'
  if (days < 0)
    return `Vencido hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`
  if (days === 0) return 'Hoy'
  return `${days} ${days === 1 ? 'día' : 'días'}`
}

/**
 * Dosis y frecuencia como texto, p.ej. "1 tableta · Cada 8 horas". Con el
 * horario de dosis real (`schedule`) usa `frequencyLabel` para reflejar la
 * frecuencia tal cual se configuró (intervalo de horas/días, días de la
 * semana); sin horario, cae al cálculo genérico a partir de
 * `intakesPerDay`.
 */
export function treatmentPauta(
  treatment: Treatment,
  medication: Medication | undefined,
  schedule?:
    (DoseScheduleFrequency & { dosePerIntake?: string | number }) | null,
): string {
  const unit = medication?.doseUnit || 'unidad'
  // El horario de dosis activo manda sobre `treatment.dosePerIntake`: ese
  // campo queda fijo desde que se creó el tratamiento, mientras que la
  // cantidad real por toma puede cambiar al abrir una nueva versión del
  // horario.
  const rawDose = schedule?.dosePerIntake ?? treatment.dosePerIntake
  const dose = `${formatQuantity(rawDose)} ${unit}`
  if (schedule)
    return `${dose} · ${frequencyLabel(schedule)} · Toma ${frequencyColumns(schedule).whenToTake}`
  const intakes = Number(treatment.intakesPerDay)
  return `${dose} · ${formatQuantity(
    treatment.intakesPerDay,
  )} ${intakes === 1 ? 'toma' : 'tomas'}/día`
}

export type DoseFrequencyType = 'daily' | 'interval' | 'weekly' | 'monthly'

export type DoseScheduleFrequency = {
  frequencyType: DoseFrequencyType
  times: string[]
  intervalHours: number | null
  anchorAt?: string | null
  weekdays: number[]
  monthdays?: number[]
}

export const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1)

function sortedMonthdays(schedule: DoseScheduleFrequency): string {
  return [...(schedule.monthdays ?? [])].sort((a, b) => a - b).join(', ')
}

export const WEEKDAY_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const

export const WEEKDAY_SHORT_LABELS = [
  'Dom',
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
] as const

function formatTimeList(times: string[]): string {
  return times.join(' y ')
}

/** Resumen legible de una frecuencia de dosis, para la tabla de medicamentos y la card de horario. */
export function frequencyLabel(schedule: DoseScheduleFrequency): string {
  if (schedule.frequencyType === 'interval') {
    const hours = schedule.intervalHours ?? 0
    if (hours > 0 && hours % 24 === 0) {
      const days = hours / 24
      return `Cada ${days} ${days === 1 ? 'día' : 'días'}`
    }
    return `Cada ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  if (schedule.frequencyType === 'weekly') {
    const days = [...schedule.weekdays]
      .sort((a, b) => a - b)
      .map((day) => WEEKDAY_LABELS[day])
      .join(', ')
    return schedule.times.length
      ? `${days || 'Sin días'} a las ${formatTimeList(schedule.times)}`
      : days || 'Sin días'
  }
  if (schedule.frequencyType === 'monthly') {
    const days = sortedMonthdays(schedule)
    const label = days ? `Días ${days} de cada mes` : 'Sin días'
    return schedule.times.length
      ? `${label} a las ${formatTimeList(schedule.times)}`
      : label
  }
  if (!schedule.times.length) return 'Según indicación'
  if (isEvenlySpacedDaily(schedule.times)) {
    const hours = 24 / schedule.times.length
    return `Cada ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  if (schedule.times.length === 1)
    return `Una vez al día (${schedule.times[0]})`
  return `${schedule.times.length} veces al día (${formatTimeList(schedule.times)})`
}

function to12Hour(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minuteStr} ${period}`
}

export type TimeOfDayParts = {
  hour12: number
  minute: number
  period: 'AM' | 'PM'
}

/** `"HH:mm"` (24h, como se guarda) -> partes en 12h, para un selector hora/minuto/AM-PM que no dependa del locale del navegador. */
export function timeToParts(time: string): TimeOfDayParts {
  const [hourStr, minuteStr] = (time || '08:00').split(':')
  const hour = Number(hourStr) || 0
  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return { hour12, minute: Number(minuteStr) || 0, period }
}

/** Inverso de `timeToParts`: partes en 12h -> `"HH:mm"` (24h) para guardar. */
export function partsToTime(parts: TimeOfDayParts): string {
  const hour24 = (parts.hour12 % 12) + (parts.period === 'PM' ? 12 : 0)
  return `${String(hour24).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}

/** `times` repartidas en intervalos iguales a lo largo de 24h - "cada N horas" guardado como daily, no una indicación de horas sueltas sin relación entre sí. */
function isEvenlySpacedDaily(times: string[]): boolean {
  if (times.length < 2) return false
  const minutesOf = (time: string) => {
    const [h, m] = time.split(':')
    return Number(h) * 60 + Number(m)
  }
  const sorted = [...times].map(minutesOf).sort((a, b) => a - b)
  const step = 1440 / sorted.length
  return sorted.every(
    (value, index) => value === (sorted[0]! + index * step) % 1440,
  )
}

/**
 * Frecuencia y hora de toma como dos columnas separadas, para la tabla
 * "Medicamentos del tratamiento" (Producto | Cantidad | Unidad | Frecuencia
 * | Toma). En intervalos de horas/días "Toma" muestra solo la hora de inicio
 * que el usuario indicó (`anchorAt`), aunque el horario se guarde repartido.
 */
export function frequencyColumns(schedule: DoseScheduleFrequency): {
  frequency: string
  whenToTake: string
} {
  if (schedule.frequencyType === 'interval') {
    const hours = schedule.intervalHours ?? 0
    if (hours > 0 && hours % 24 === 0) {
      const days = hours / 24
      const anchorTime = schedule.anchorAt
        ? to12Hour(new Date(schedule.anchorAt).toTimeString().slice(0, 5))
        : 'Según inicio'
      return {
        frequency: `Cada ${days} ${days === 1 ? 'día' : 'días'}`,
        whenToTake: anchorTime,
      }
    }
    return {
      frequency: `Cada ${hours} ${hours === 1 ? 'hora' : 'horas'}`,
      whenToTake: schedule.anchorAt
        ? to12Hour(new Date(schedule.anchorAt).toTimeString().slice(0, 5))
        : 'Según inicio',
    }
  }
  if (schedule.frequencyType === 'weekly') {
    const days = [...schedule.weekdays]
      .sort((a, b) => a - b)
      .map((day) => WEEKDAY_LABELS[day])
      .join(', ')
    return {
      frequency: days ? `Todos los ${days}` : 'Días específicos',
      whenToTake: schedule.times.length
        ? schedule.times.map(to12Hour).join(', ')
        : '—',
    }
  }
  if (schedule.frequencyType === 'monthly') {
    const days = sortedMonthdays(schedule)
    return {
      frequency: days ? `Los días ${days} de cada mes` : 'Días específicos',
      whenToTake: schedule.times.length
        ? schedule.times.map(to12Hour).join(', ')
        : '—',
    }
  }
  if (!schedule.times.length)
    return { frequency: 'Diario', whenToTake: 'Según indicación' }
  if (isEvenlySpacedDaily(schedule.times)) {
    const hours = 24 / schedule.times.length
    return {
      frequency: `Cada ${hours} ${hours === 1 ? 'hora' : 'horas'}`,
      whenToTake: schedule.anchorAt
        ? to12Hour(new Date(schedule.anchorAt).toTimeString().slice(0, 5))
        : 'Según inicio',
    }
  }
  return {
    frequency: 'Diario',
    whenToTake: schedule.times.map(to12Hour).join(', '),
  }
}

/**
 * Horas del día en que caería cada toma si se reparten uniformemente cada
 * `intervalHours` horas a partir de `startTime` - lo que el usuario quiere
 * decir con "cada 8 horas según inicio" cuando 24 es múltiplo del intervalo.
 * Solo tiene sentido llamarla cuando `24 % intervalHours === 0`.
 */
export function computeDailyTimesFromInterval(
  startTime: string,
  intervalHours: number,
): string[] {
  const [hourStr, minuteStr] = startTime.split(':')
  const startMinutes = Number(hourStr) * 60 + Number(minuteStr)
  const stepMinutes = intervalHours * 60
  const count = Math.round(1440 / stepMinutes)
  const times: string[] = []
  for (let i = 0; i < count; i += 1) {
    const total = (startMinutes + i * stepMinutes) % 1440
    const hh = String(Math.floor(total / 60)).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    times.push(`${hh}:${mm}`)
  }
  return times.sort()
}

export type FrequencyMode = 'hours' | 'days' | 'weekday' | 'monthday'

const AVERAGE_DAYS_PER_MONTH = 30.4375
export const HOUR_PRESETS = ['4', '6', '8', '12', '24'] as const
export const DAY_PRESETS = ['2', '3', '7', '15', '30'] as const

export type DoseFrequencyFormValue = {
  frequencyMode: FrequencyMode
  hoursPreset: string
  customHours: string
  daysPreset: string
  customDays: string
  startTime: string
  weekdays: number[]
  /** Días del mes (1-31) del modo `monthday`. */
  monthdays: number[]
  /** Horas de toma de los modos `weekday` y `monthday` (solo uno está activo a la vez). */
  weekdayTimes: string[]
}

export function defaultDoseFrequencyValue(): DoseFrequencyFormValue {
  return {
    frequencyMode: 'hours',
    hoursPreset: '8',
    customHours: '',
    daysPreset: '30',
    customDays: '',
    startTime: '08:00',
    weekdays: [],
    monthdays: [],
    weekdayTimes: [''],
  }
}

export function isDoseFrequencyValid(value: DoseFrequencyFormValue): boolean {
  if (value.frequencyMode === 'weekday')
    return value.weekdays.length > 0 && value.weekdayTimes.some(Boolean)
  if (value.frequencyMode === 'monthday')
    return value.monthdays.length > 0 && value.weekdayTimes.some(Boolean)
  if (value.frequencyMode === 'hours')
    return value.hoursPreset !== 'custom' || Number(value.customHours) > 0
  return value.daysPreset !== 'custom' || Number(value.customDays) > 0
}

/**
 * Convierte los 3 modos de la UI (intervalo de horas, intervalo de días,
 * días de la semana) en los campos que espera `POST
 * /treatments/:id/dose-schedules` (`frequency_type` + `times` /
 * `interval_hours`+`anchor_at` / `weekdays`+`times`, según el modo).
 * Reutilizada tanto por `DoseScheduleCard` (cambiar el horario de un
 * tratamiento ya creado) como por el formulario de alta (primer horario de
 * un tratamiento nuevo, sin autorización porque todavía no hay nada que
 * cambiar).
 */
export function buildDoseScheduleFields(
  value: DoseFrequencyFormValue,
  effectiveFrom: string,
): Record<string, string> {
  if (value.frequencyMode === 'weekday') {
    return {
      frequency_type: 'weekly',
      weekdays: value.weekdays.join(','),
      times: value.weekdayTimes.filter(Boolean).join(','),
    }
  }
  if (value.frequencyMode === 'monthday') {
    return {
      frequency_type: 'monthly',
      monthdays: value.monthdays.join(','),
      times: value.weekdayTimes.filter(Boolean).join(','),
    }
  }
  const anchorAt = new Date(
    `${effectiveFrom}T${value.startTime}:00`,
  ).toISOString()
  if (value.frequencyMode === 'days') {
    const days = Number(
      value.daysPreset === 'custom' ? value.customDays : value.daysPreset,
    )
    return {
      frequency_type: 'interval',
      interval_hours: String(days * 24),
      anchor_at: anchorAt,
    }
  }
  const hours = Number(
    value.hoursPreset === 'custom' ? value.customHours : value.hoursPreset,
  )
  if (hours > 0 && 24 % hours === 0) {
    return {
      frequency_type: 'daily',
      times: computeDailyTimesFromInterval(value.startTime, hours).join(','),
      anchor_at: anchorAt,
    }
  }
  return {
    frequency_type: 'interval',
    interval_hours: String(hours),
    anchor_at: anchorAt,
  }
}

/**
 * Tasa de tomas/día de un horario de dosis ya guardado (el que muestra
 * "Programación de Dosis"), para que "Cobertura estimada" al editar un
 * tratamiento use la frecuencia real activa en vez del legado
 * `treatment.intakesPerDay`.
 */
export function dosesPerDayFromSchedule(
  schedule: DoseScheduleFrequency,
): number {
  if (schedule.frequencyType === 'interval') {
    const hours = schedule.intervalHours ?? 0
    return hours > 0 ? 24 / hours : 0
  }
  if (schedule.frequencyType === 'weekly') {
    const activeDays = schedule.weekdays.length
    const timesPerDay = schedule.times.length
    return activeDays > 0 && timesPerDay > 0
      ? (timesPerDay * activeDays) / 7
      : 0
  }
  if (schedule.frequencyType === 'monthly') {
    const activeDays = schedule.monthdays?.length ?? 0
    const timesPerDay = schedule.times.length
    return activeDays > 0 && timesPerDay > 0
      ? (timesPerDay * activeDays) / AVERAGE_DAYS_PER_MONTH
      : 0
  }
  return schedule.times.length
}

/**
 * Tasa de tomas/día que implica la programación elegida en `DoseFrequencyRow`,
 * para que "Cobertura estimada" (en el alta de tratamiento) refleje la
 * frecuencia real en vez del campo legado `intakesPerDay`, que en un
 * tratamiento nuevo nadie llega a editar y se queda fijo en 1.
 */
export function dosesPerDayFromFrequency(
  value: DoseFrequencyFormValue,
): number {
  if (value.frequencyMode === 'weekday') {
    const timesPerDay = Math.max(1, value.weekdayTimes.filter(Boolean).length)
    const activeDays = value.weekdays.length
    return activeDays > 0 && timesPerDay > 0
      ? (timesPerDay * activeDays) / 7
      : 0
  }
  if (value.frequencyMode === 'monthday') {
    const timesPerDay = Math.max(1, value.weekdayTimes.filter(Boolean).length)
    const activeDays = value.monthdays.length
    return activeDays > 0 && timesPerDay > 0
      ? (timesPerDay * activeDays) / AVERAGE_DAYS_PER_MONTH
      : 0
  }
  if (value.frequencyMode === 'days') {
    const days = Number(
      value.daysPreset === 'custom' ? value.customDays : value.daysPreset,
    )
    return days > 0 ? 1 / days : 0
  }
  const hours = Number(
    value.hoursPreset === 'custom' ? value.customHours : value.hoursPreset,
  )
  return hours > 0 ? 24 / hours : 0
}

/** Precarga los 3 modos de la UI a partir de un DoseSchedule ya guardado (para "Cambiar dosis"). */
export function loadDoseFrequencyFromSchedule(
  schedule: DoseScheduleFrequency,
): DoseFrequencyFormValue {
  if (schedule.frequencyType === 'weekly') {
    return {
      ...defaultDoseFrequencyValue(),
      frequencyMode: 'weekday',
      weekdays: schedule.weekdays,
      weekdayTimes: schedule.times.length ? schedule.times : ['00:00'],
    }
  }
  if (schedule.frequencyType === 'monthly') {
    return {
      ...defaultDoseFrequencyValue(),
      frequencyMode: 'monthday',
      monthdays: schedule.monthdays ?? [],
      weekdayTimes: schedule.times.length ? schedule.times : ['00:00'],
    }
  }
  if (schedule.frequencyType === 'interval') {
    const hours = schedule.intervalHours ?? 24
    const startTime = schedule.anchorAt
      ? new Date(schedule.anchorAt).toTimeString().slice(0, 5)
      : '08:00'
    if (hours % 24 === 0) {
      const days = String(hours / 24)
      return {
        ...defaultDoseFrequencyValue(),
        frequencyMode: 'days',
        startTime,
        daysPreset: (DAY_PRESETS as readonly string[]).includes(days)
          ? days
          : 'custom',
        customDays: days,
      }
    }
    return {
      ...defaultDoseFrequencyValue(),
      frequencyMode: 'hours',
      startTime,
      hoursPreset: 'custom',
      customHours: String(hours),
    }
  }
  const hours = schedule.times.length ? 24 / schedule.times.length : 24
  return {
    ...defaultDoseFrequencyValue(),
    frequencyMode: 'hours',
    startTime: schedule.anchorAt
      ? new Date(schedule.anchorAt).toTimeString().slice(0, 5)
      : ([...schedule.times].sort()[0] ?? '08:00'),
    hoursPreset: (HOUR_PRESETS as readonly string[]).includes(String(hours))
      ? String(hours)
      : 'custom',
    customHours: String(hours),
  }
}

/**
 * Crea un tratamiento desde los valores de `TreatmentForm`: el tratamiento, la
 * receta adjunta y su primer horario de dosis (que nunca requiere autorización,
 * porque todavía no existe uno activo que se esté cambiando).
 */
export async function createTreatmentFromForm(
  patientId: string,
  values: TreatmentSaveValues,
  prescriptionGroupId?: string,
): Promise<Treatment> {
  const body = {
    patient_id: patientId,
    name: values.name?.trim() || null,
    medication_id: values.medicationId,
    branch_id: values.branchId,
    responsible_user_id: values.responsibleUserId || null,
    dose_per_intake: values.dosePerIntake,
    intakes_per_day: values.intakesPerDay,
    quantity_per_cycle: values.quantityPerCycle,
    start_date: values.startDate,
    end_date: values.endDate || null,
    prescriber_name: values.prescriberName?.trim() || null,
    prescriber_id: values.prescriberId?.trim() || null,
    prescription_expires_on: values.prescriptionExpiresOn || null,
    notes: values.notes?.trim() || null,
    custom_values: values.customValues,
    ...(prescriptionGroupId
      ? { prescription_group_id: prescriptionGroupId }
      : {}),
  }
  const created = await api<Treatment>('/api/v1/treatments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await uploadPrescriptionDocument(created.id, values.prescriptionFile)
  if (isDoseFrequencyValid(values)) {
    const form = new FormData()
    form.set('dose_per_intake', String(values.dosePerIntake))
    form.set('effective_from', values.startDate)
    for (const [key, value] of Object.entries(
      buildDoseScheduleFields(values, values.startDate),
    ))
      form.set(key, value)
    await api(
      `/api/v1/treatments/${encodeURIComponent(created.id)}/dose-schedules`,
      { method: 'POST', body: form },
    )
  }
  await markFirstCycleDelivered(created.id, values)
  return created
}

/**
 * Un tratamiento nuevo se registra con su primera entrega hecha: el ciclo
 * inicial queda en "Entregado" del tablero y se abre el siguiente. Si falla,
 * el tratamiento ya existe y no debe recrearse, así que no corta el alta.
 */
async function markFirstCycleDelivered(
  treatmentId: string,
  values: TreatmentSaveValues,
) {
  try {
    await api(`/api/v1/treatments/${encodeURIComponent(treatmentId)}/deliver`, {
      method: 'POST',
      body: JSON.stringify({
        quantity: Number(values.quantityPerCycle),
        delivered_on: todayDateOnly(),
        picked_up_by: 'patient',
      }),
    })
  } catch (error) {
    console.warn('No se pudo marcar la primera entrega', error)
  }
}

/** Guarda los cambios de `TreatmentForm` sobre un tratamiento existente y sube la receta adjunta. */
export async function updateTreatmentFromForm(
  treatmentId: string,
  values: TreatmentSaveValues,
): Promise<Treatment> {
  const updated = await api<Treatment>(
    `/api/v1/treatments/${encodeURIComponent(treatmentId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: values.name?.trim() || null,
        medication_id: values.medicationId,
        branch_id: values.branchId,
        responsible_user_id: values.responsibleUserId || null,
        dose_per_intake: values.dosePerIntake,
        intakes_per_day: values.intakesPerDay,
        quantity_per_cycle: values.quantityPerCycle,
        start_date: values.startDate,
        end_date: values.endDate || null,
        prescriber_name: values.prescriberName?.trim() || null,
        prescriber_id: values.prescriberId?.trim() || null,
        prescription_expires_on: values.prescriptionExpiresOn || null,
        notes: values.notes?.trim() || null,
        custom_values: values.customValues,
      }),
    },
  )
  await uploadPrescriptionDocument(treatmentId, values.prescriptionFile)
  return updated
}
