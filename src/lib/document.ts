export const DOCUMENT_INPUT_MAX_LENGTH = 13

const CEDULA_DIGITS = 11
const PASSPORT_LENGTH = 9

/**
 * Masks a document while typing. Starting with a digit it is a cédula
 * (11 digits, `000-0000000-0`); starting with a letter it is a passport
 * (2 letters + 7 digits, `AB1234567`, no separators).
 */
export function maskDocumentInput(value: string): string {
  const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (!clean) return ''

  if (/^[A-Z]/.test(clean)) {
    const letters = clean.slice(0, 2).replace(/[^A-Z]/g, '')
    if (letters.length < 2) return letters
    const digits = clean.slice(2).replace(/\D/g, '')
    return `${letters}${digits.slice(0, PASSPORT_LENGTH - 2)}`
  }

  const digits = clean.replace(/\D/g, '').slice(0, CEDULA_DIGITS)
  if (digits.length <= 3) return digits
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`
}

function hasValidCedulaCheckDigit(digits: string): boolean {
  let sum = 0
  for (let i = 0; i < 10; i += 1) {
    const product = Number(digits[i]) * (i % 2 === 0 ? 1 : 2)
    sum += product > 9 ? product - 9 : product
  }
  return (10 - (sum % 10)) % 10 === Number(digits[10])
}

export function isValidDocument(value: string): boolean {
  const compact = value.replace(/-/g, '')
  if (/^\d{11}$/.test(compact)) return hasValidCedulaCheckDigit(compact)
  return /^[A-Z]{2}\d{7}$/.test(compact)
}
