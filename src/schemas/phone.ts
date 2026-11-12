import { z } from 'zod'
import { PHONE_INPUT_MAX_LENGTH, isValidPhone } from '@/lib/phone'

export const phoneField = z
  .string()
  .trim()
  .max(PHONE_INPUT_MAX_LENGTH, `Máximo ${PHONE_INPUT_MAX_LENGTH} caracteres.`)
  .refine(isValidPhone, {
    message: 'Teléfono inválido: debe tener 10 dígitos, ej. (809) 555-1234.',
  })

export const requiredPhoneField = z
  .string()
  .trim()
  .min(1, 'Campo requerido.')
  .max(PHONE_INPUT_MAX_LENGTH, `Máximo ${PHONE_INPUT_MAX_LENGTH} caracteres.`)
  .refine(isValidPhone, {
    message: 'Teléfono inválido: debe tener 10 dígitos, ej. (809) 555-1234.',
  })
