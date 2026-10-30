import { z } from 'zod'

export const doctorSchema = z.object({
  firstName: z.string().trim().min(1, 'Ingresa el nombre.').max(120),
  lastName: z.string().trim().min(1, 'Ingresa el apellido.').max(120),
  licenseNumber: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .email('Correo inválido.')
    .max(254)
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(2000).optional(),
})

export type DoctorBaseFormValues = z.infer<typeof doctorSchema>
export type DoctorFormValues = DoctorBaseFormValues & {
  specialtyIds: string[]
  medicalCenterIds: string[]
}
