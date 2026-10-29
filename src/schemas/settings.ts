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

const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa el formato HH:mm.')

export const noticeTimingSchema = z
  .object({
    noticeLeadDays: z
      .number({ error: 'Indica un número de días.' })
      .int('Debe ser un número entero.')
      .min(0, 'No puede ser negativo.')
      .max(365, 'Máximo 365 días.'),
    retryAfterHours: z
      .number({ error: 'Indica un número de horas.' })
      .int('Debe ser un número entero.')
      .min(1, 'Al menos 1 hora.')
      .max(336, 'Máximo 336 horas (14 días).'),
    noticeWindowStart: timeOfDay,
    noticeWindowEnd: timeOfDay,
  })
  .refine((values) => values.noticeWindowStart < values.noticeWindowEnd, {
    message: 'La apertura debe ser antes del cierre.',
    path: ['noticeWindowStart'],
  })

export type NoticeTimingFormValues = z.infer<typeof noticeTimingSchema>
