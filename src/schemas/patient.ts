import { z } from 'zod'

import { DOCUMENT_INPUT_MAX_LENGTH, isValidDocument } from '@/lib/document'
import { phoneField } from '@/schemas/phone'

const optionalDecimal = (min: number, max: number) =>
  z
    .string()
    .trim()
    .max(20, 'Máximo 20 caracteres.')
    .refine((value) => value === '' || /^-?\d{1,3}(\.\d+)?$/.test(value), {
      message: 'Ingresa un número decimal válido.',
    })
    .refine(
      (value) => value === '' || (Number(value) >= min && Number(value) <= max),
      { message: `Debe estar entre ${min} y ${max}.` },
    )
    .optional()

export const todayISO = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const documentRule = (value: string) => value === '' || isValidDocument(value)

const birthDateRule = (value: string) =>
  value === '' || (value >= '1900-01-01' && value <= todayISO())

const documentField = z
  .string()
  .trim()
  .max(DOCUMENT_INPUT_MAX_LENGTH, 'Documento demasiado largo.')
  .refine(documentRule, {
    message:
      'Documento inválido: cédula de 11 dígitos (000-0000000-0) o pasaporte de 2 letras y 7 dígitos (AB1234567).',
  })

const birthDateField = z.string().refine(birthDateRule, {
  message: 'La fecha de nacimiento no puede ser futura ni anterior a 1900.',
})

export const patientSchema = z.object({
  fullName: z.string().trim().min(2, 'Campo requerido.').max(160),
  primaryBranchId: z.string().min(1, 'Selecciona una sucursal.'),
  documentId: documentField.optional(),
  birthDate: birthDateField.optional(),
  phone: phoneField.optional(),
  phoneHasWhatsapp: z.boolean(),
  email: z.union([
    z.literal(''),
    z.string().email('Ingresa un correo válido.'),
  ]),
  address: z.string().max(500).optional(),
  state: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  sector: z.string().max(120).optional(),
  latitude: optionalDecimal(-90, 90),
  longitude: optionalDecimal(-180, 180),
  preferredChannel: z.enum(['whatsapp', 'call', 'sms', 'telegram']),
  careNotes: z.string().max(2000).optional(),
  responsibleUserId: z.string().optional(),
  customValues: z.record(z.string(), z.unknown()).optional(),
})

export type PatientFormValues = z.infer<typeof patientSchema>

const REQUIRED = 'Campo requerido.'

const requiredDecimal = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, REQUIRED)
    .max(20, 'Máximo 20 caracteres.')
    .refine((value) => /^-?\d{1,3}(\.\d+)?$/.test(value), {
      message: 'Ingresa un número decimal válido.',
    })
    .refine((value) => Number(value) >= min && Number(value) <= max, {
      message: `Debe estar entre ${min} y ${max}.`,
    })

/** Alta de paciente: todos los campos de la pestaña Datos son obligatorios salvo las notas de cuidado. */
export const patientCreateSchema = patientSchema.extend({
  documentId: documentField.refine((v) => v.length > 0, REQUIRED),
  birthDate: birthDateField.refine((v) => v.length > 0, REQUIRED),
  phone: phoneField.refine((v) => v.length > 0, REQUIRED),
  email: z.string().trim().min(1, REQUIRED).email('Ingresa un correo válido.'),
  address: z.string().trim().min(1, REQUIRED).max(500),
  state: z.string().trim().min(1, REQUIRED).max(120),
  city: z.string().trim().min(1, REQUIRED).max(120),
  sector: z.string().trim().min(1, REQUIRED).max(120),
  latitude: requiredDecimal(-90, 90),
  longitude: requiredDecimal(-180, 180),
})
