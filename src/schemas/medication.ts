import { z } from 'zod'

export const medicationSchema = z.object({
  brandName: z.string().trim().max(160).optional(),
  genericName: z.string().trim().max(160).optional(),
  activeIngredient: z.string().trim().max(160).optional(),
  presentation: z.string().trim().min(1, 'Ingresa una presentación.').max(160),
  doseUnit: z.string().trim().min(1, 'Ingresa una unidad.').max(50),
  unitsPerPackage: z.number().positive('Debe ser mayor a cero.'),
})

export type MedicationFormValues = z.infer<typeof medicationSchema>
