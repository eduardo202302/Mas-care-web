import { z } from 'zod'

export const healthConditionSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa un nombre.').max(160),
  description: z.string().trim().max(1000).optional(),
})

export type HealthConditionFormValues = z.infer<typeof healthConditionSchema>
