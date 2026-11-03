import { z } from 'zod'

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
  rnc: z.string().trim().max(40).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .email('Correo inválido.')
    .max(254)
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(500).optional(),
  state: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  sector: z.string().trim().max(120).optional(),
  latitude: optionalDecimal(-90, 90),
  longitude: optionalDecimal(-180, 180),
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
