import { z } from 'zod'

export const patientSchema = z.object({
  fullName: z.string().trim().min(2, 'Ingresa al menos 2 caracteres.').max(160),
  primaryBranchId: z.string().min(1, 'Selecciona una sucursal.'),
  documentId: z.string().trim().max(80).optional(),
  birthDate: z.string().optional(),
  phone: z.string().trim().max(40).optional(),
  phoneHasWhatsapp: z.boolean(),
  email: z.union([
    z.literal(''),
    z.string().email('Ingresa un correo válido.'),
  ]),
  address: z.string().max(240).optional(),
  zone: z.string().max(120).optional(),
  preferredChannel: z.enum(['whatsapp', 'call', 'sms', 'telegram']),
  careNotes: z.string().max(2000).optional(),
  responsibleUserId: z.string().optional(),
  customValues: z.record(z.string(), z.unknown()).optional(),
})

export type PatientFormValues = z.infer<typeof patientSchema>
