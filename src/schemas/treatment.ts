import { z } from 'zod'

/**
 * Horario de la primera toma, configurado al crear el tratamiento (no se usa
 * al editar uno existente: cambiar un horario ya activo tiene su propio flujo
 * con autorización médica en DoseScheduleCard). Todos opcionales con default
 * porque el formulario de edición nunca los toca.
 */
const doseFrequencyFields = {
  frequencyMode: z.enum(['hours', 'days', 'weekday', 'monthday']),
  hoursPreset: z.string(),
  customHours: z.string(),
  daysPreset: z.string(),
  customDays: z.string(),
  startTime: z.string(),
  weekdays: z.array(z.number()),
  monthdays: z.array(z.number()),
  weekdayTimes: z.array(z.string()),
}

export const treatmentSchema = z.object({
  ...doseFrequencyFields,
  name: z
    .string()
    .trim()
    .min(1, 'Indica el nombre del tratamiento.')
    .max(160, 'Máximo 160 caracteres.'),
  medicationId: z.string().min(1, 'Selecciona un medicamento.'),
  dosePerIntake: z
    .number({ error: 'Indica una dosis válida.' })
    .positive('Debe ser mayor a cero.'),
  intakesPerDay: z
    .number({ error: 'Indica las tomas por día.' })
    .positive('Debe ser mayor a cero.'),
  quantityPerCycle: z
    .number({ error: 'Indica la cantidad por ciclo.' })
    .positive('Debe ser mayor a cero.'),
  startDate: z.string().min(1, 'Indica la fecha de inicio.'),
  /** Hasta qué fecha llega el tratamiento (opcional). */
  endDate: z.string().optional(),
  /** Médico registrado que prescribe (id del doctor). */
  prescriberId: z.string().optional(),
  /** Nombre anterior en texto libre: solo se conserva para no perderlo al editar. */
  prescriberName: z.string().trim().max(160).optional(),
  prescriptionExpiresOn: z.string().optional(),
  branchId: z.string().min(1, 'Selecciona una sucursal.'),
  responsibleUserId: z.string().optional(),
  notes: z.string().max(5000).optional(),
  customValues: z.record(z.string(), z.unknown()).optional(),
})

export type TreatmentFormValues = z.infer<typeof treatmentSchema>

/** Valores del formulario más la receta adjunta, que viaja aparte (no es JSON). */
export type TreatmentSaveValues = TreatmentFormValues & {
  prescriptionFile?: File | null
}
