import { z } from 'zod'

export const treatmentSchema = z.object({
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
  prescriberName: z.string().trim().max(160).optional(),
  prescriptionExpiresOn: z.string().optional(),
  branchId: z.string().min(1, 'Selecciona una sucursal.'),
  responsibleUserId: z.string().optional(),
  notes: z.string().max(5000).optional(),
  customValues: z.record(z.string(), z.unknown()).optional(),
})

export type TreatmentFormValues = z.infer<typeof treatmentSchema>
