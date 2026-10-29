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
