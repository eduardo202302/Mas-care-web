/** Máscara de RNC dominicano mientras se escribe: `101-01234-5` (9 dígitos). */
export function maskRncInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 8)}-${digits.slice(8)}`
}

export const RNC_INPUT_MAX_LENGTH = 11

export function isValidRnc(value: string): boolean {
  return value.replace(/\D/g, '').length === 9
}
