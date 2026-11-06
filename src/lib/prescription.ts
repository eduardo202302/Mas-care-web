export type PrescriptionState = 'none' | 'ok' | 'due' | 'expired'

/**
 * Fecha pura (`YYYY-MM-DD`) de hoy en la zona horaria indicada. El vencimiento
 * de receta se guarda como fecha sin hora, así que se compara como texto.
 */
export function todayDateOnly(timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/**
 * Estado de la receta de un tratamiento.
 * - `due`: vence dentro del plazo de aviso (default 15 días)
 * - `expired`: ya pasó el día de vencimiento → no se puede entregar
 */
export function prescriptionState(
  expiresOn: string | null | undefined,
  options: { warningDays?: number; today?: string } = {},
): PrescriptionState {
  if (!expiresOn) return 'none'
  const expiry = expiresOn.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return 'none'
  const today = options.today ?? todayDateOnly()
  if (expiry < today) return 'expired'
  const limit = new Date(`${today}T00:00:00.000Z`)
  limit.setUTCDate(limit.getUTCDate() + (options.warningDays ?? 15))
  const warningLimit = limit.toISOString().slice(0, 10)
  return expiry <= warningLimit ? 'due' : 'ok'
}

/** `13/11/2026` a partir de `2026-11-13`. */
export function formatDateOnly(value: string): string {
  const date = value.slice(0, 10)
  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}/${month}/${year}` : date
}
