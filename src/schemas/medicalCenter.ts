import { z } from 'zod'
import { isValidRnc } from '@/lib/rnc'
import { requiredPhoneField } from './phone'

const required = (max: number) =>
  z.string().trim().min(1, 'Campo requerido.').max(max)

const requiredDecimal = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, 'Campo requerido.')
    .max(20, 'Máximo 20 caracteres.')
    .refine((value) => /^-?\d{1,3}(\.\d+)?$/.test(value), {
      message: 'Ingresa un número decimal válido.',
    })
    .refine((value) => Number(value) >= min && Number(value) <= max, {
      message: `Debe estar entre ${min} y ${max}.`,
    })

export const medicalCenterTypes = [
  'clinic',
  'hospital',
  'medical_center',
  'private_office',
  'other',
] as const

export const medicalCenterSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa un nombre.').max(160),
  centerType: z.enum(medicalCenterTypes),
  rnc: required(40).refine(isValidRnc, {
    message: 'RNC inválido: debe tener 9 dígitos, ej. 101-01234-5.',
  }),
  phone: requiredPhoneField,
  email: z
    .string()
    .trim()
    .min(1, 'Campo requerido.')
    .email('Correo inválido.')
    .max(254),
  address: required(500),
  state: required(120),
  city: required(120),
  sector: required(120),
  latitude: requiredDecimal(-90, 90),
  longitude: requiredDecimal(-180, 180),
  notes: z.string().trim().max(2000).optional(),
})

export type MedicalCenterFormValues = z.infer<typeof medicalCenterSchema>

export const medicalCenterTypeLabels: Record<
  (typeof medicalCenterTypes)[number],
  string
> = {
  clinic: 'Clínica',
  hospital: 'Hospital',
  medical_center: 'Centro médico',
  private_office: 'Consultorio privado',
  other: 'Otro',
}
