import { z } from 'zod'

export const thresholdsSchema = z
  .object({
    dueSoonDays: z
      .number({ error: 'Indica un número de días.' })
      .int('Debe ser un número entero.')
      .min(0, 'No puede ser negativo.')
      .max(365, 'Máximo 365 días.'),
    upcomingDays: z
      .number({ error: 'Indica un número de días.' })
      .int('Debe ser un número entero.')
      .min(0, 'No puede ser negativo.')
      .max(365, 'Máximo 365 días.'),
    prescriptionWarningDays: z
      .number({ error: 'Indica un número de días.' })
      .int('Debe ser un número entero.')
      .min(0, 'No puede ser negativo.')
      .max(365, 'Máximo 365 días.'),
  })
  .refine((values) => values.dueSoonDays < values.upcomingDays, {
    message: '«Vence pronto» debe ser menor que «Próxima reposición».',
    path: ['dueSoonDays'],
  })

export type ThresholdsFormValues = z.infer<typeof thresholdsSchema>
