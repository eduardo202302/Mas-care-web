import { z } from 'zod'

const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa el formato HH:mm.')

export const automationSettingsSchema = z
  .object({
    automationEnabled: z.boolean(),
    automationDryRun: z.boolean(),
    timezone: z.string().min(1, 'Indica una zona horaria.'),
    noticeLeadDays: z
      .number({ error: 'Indica un número de días.' })
      .int('Debe ser un número entero.')
      .min(0, 'No puede ser negativo.')
      .max(365, 'Máximo 365 días.'),
    maxNoticeAttempts: z
      .number({ error: 'Indica un número de intentos.' })
      .int('Debe ser un número entero.')
      .min(1, 'Al menos 1 intento.')
      .max(10, 'Máximo 10 intentos.'),
    retryAfterHours: z
      .number({ error: 'Indica un número de horas.' })
      .int('Debe ser un número entero.')
      .min(1, 'Al menos 1 hora.')
      .max(336, 'Máximo 336 horas (14 días).'),
    noticeWindowStart: timeOfDay,
    noticeWindowEnd: timeOfDay,
    autoCallTaskWithoutConsent: z.boolean(),
  })
  .refine((values) => values.noticeWindowStart < values.noticeWindowEnd, {
    message: 'La apertura debe ser antes del cierre.',
    path: ['noticeWindowStart'],
  })

export type AutomationSettingsFormValues = z.infer<
  typeof automationSettingsSchema
>
