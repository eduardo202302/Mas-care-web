/**
 * Formats a phone number for display (Dominican Republic 10-digit numbers as
 * `(809) 555-1234`, 11-digit NANP numbers with a leading `1` as
 * `+1 (809) 555-1234`). Returns the trimmed input unchanged when it doesn't
 * look like a plain phone number or doesn't match a known length, so
 * unusual/foreign formats already in the data are never mangled.
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const trimmed = phone.trim()
  if (!/^[+\d\s()-]+$/.test(trimmed)) return trimmed
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }
  return trimmed
}

/**
 * Formats a phone number while it is being typed: progressive Dominican
 * Republic NANP grouping `(809) 555-1234`, or `+1 (809) 555-1234` when the
 * user starts with `+1` / a leading `1`. Non-digit characters are dropped and
 * input is capped at 10 national digits (11 with the country code), so it can
 * be used directly as an input mask.
 */
export function maskPhoneInput(value: string): string {
  const raw = value.trim()
  if (!raw) return ''

  const international =
    raw.startsWith('+') || /^1\d{0,10}$/.test(raw.replace(/\D/g, ''))
  let digits = raw.replace(/\D/g, '')

  if (international && digits.startsWith('1')) {
    digits = digits.slice(1, 11)
    const area = digits.slice(0, 3)
    const prefix = digits.slice(3, 6)
    const line = digits.slice(6, 10)
    if (digits.length <= 3) return `+1 (${area}`
    if (digits.length <= 6) return `+1 (${area}) ${prefix}`
    return `+1 (${area}) ${prefix}-${line}`
  }

  digits = digits.slice(0, 10)
  const area = digits.slice(0, 3)
  const prefix = digits.slice(3, 6)
  const line = digits.slice(6, 10)
  if (digits.length <= 3) return area
  if (digits.length <= 6) return `(${area}) ${prefix}`
  return `(${area}) ${prefix}-${line}`
}

/** Longest masked value: `+1 (809) 555-1234`. */
export const PHONE_INPUT_MAX_LENGTH = 17

/** Empty is valid (optionality is up to the schema); otherwise 10 digits, or 11 starting with 1. */
export function isValidPhone(value: string): boolean {
  if (value === '') return true
  if (!/^\+?[\d\s()-]+$/.test(value)) return false
  const digits = value.replace(/\D/g, '')
  return (
    digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
  )
}
