import { z } from 'zod'

/**
 * Horario de la primera toma, configurado al crear el tratamiento (no se usa
 * al editar uno existente: cambiar un horario ya activo tiene su propio flujo
 * con autorización médica en DoseScheduleCard). Todos opcionales con default
 * porque el formulario de edición nunca los toca.
 */
const doseFrequencyFields = {
  frequencyMode: z.enum(['hours', 'days', 'weekday', 'monthday', 'monthend']),
  hoursPreset: z.string(),
  customHours: z.string(),
  daysPreset: z.string(),
  customDays: z.string(),
  startTime: z.string(),
  weekdays: z.array(z.number()),
  monthdays: z.array(z.number()),
  weekdayTimes: z.array(z.string()),
}

const treatmentObject = z.object({
  ...doseFrequencyFields,
  name: z
    .string()
    .trim()
    .min(1, 'Campo requerido.')
    .max(160, 'Máximo 160 caracteres.'),
  medicationId: z.string().min(1, 'Campo requerido.'),
  dosePerIntake: z
    .number({ error: 'Campo requerido.' })
    .positive('Debe ser mayor a cero.'),
  intakesPerDay: z
    .number({ error: 'Indica las tomas por día.' })
    .positive('Debe ser mayor a cero.'),
  quantityPerCycle: z
    .number({ error: 'Indica la cantidad por ciclo.' })
    .positive('Debe ser mayor a cero.'),
  deliveredQuantity: z
    .number({ error: 'Indica una cantidad válida.' })
    .positive('Debe ser mayor a cero.')
    .nullable()
    .optional(),
  startDate: z.string().min(1, 'Campo requerido.'),
  /** Hasta qué fecha llega el tratamiento (opcional). */
  endDate: z.string().optional(),
  /** Médico registrado que prescribe (id del doctor). */
  prescriberId: z.string().optional(),
  /** Nombre anterior en texto libre: solo se conserva para no perderlo al editar. */
  prescriberName: z.string().trim().max(160).optional(),
  prescriptionExpiresOn: z.string().optional(),
  branchId: z.string().min(1, 'Campo requerido.'),
  responsibleUserId: z.string().optional(),
  notes: z.string().max(5000).optional(),
  customValues: z.record(z.string(), z.unknown()).optional(),
})

type DateRules = {
  /** Hoy (AAAA-MM-DD): activa la regla "no anterior a hoy". */
  today?: string
  /** Inicio ya guardado: al editar se respeta aunque sea anterior a hoy. */
  savedStartDate?: string
}

/**
 * Esquema del formulario con las reglas de fechas: el inicio no puede ser
 * anterior a hoy (salvo que sea el ya guardado) y el fin no puede ser anterior
 * al inicio (ni a hoy si no hay inicio).
 */
export function makeTreatmentSchema({ today, savedStartDate }: DateRules = {}) {
  return treatmentObject.superRefine((values, ctx) => {
    const { startDate, endDate } = values
    if (today && startDate && startDate < today && startDate !== savedStartDate)
      ctx.addIssue({
        code: 'custom',
        path: ['startDate'],
        message: 'La fecha de inicio no puede ser anterior a hoy.',
      })
    if (!endDate) return
    if (startDate && endDate < startDate)
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
      })
    else if (!startDate && today && endDate < today)
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'La fecha de fin no puede ser anterior a hoy.',
      })
  })
}

export const treatmentSchema = makeTreatmentSchema()

export type TreatmentFormValues = z.infer<typeof treatmentObject>

/** Valores del formulario más la receta adjunta, que viaja aparte (no es JSON). */
export type TreatmentSaveValues = TreatmentFormValues & {
  prescriptionFile?: File | null
}
