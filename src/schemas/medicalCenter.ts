import { z } from 'zod'

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
  province: z.string().trim().max(120).optional(),
  municipality: z.string().trim().max(120).optional(),
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
