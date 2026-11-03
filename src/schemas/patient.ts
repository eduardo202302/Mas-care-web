import { z } from 'zod'

const optionalDecimal = (min: number, max: number) =>
  z
    .string()
    .trim()
    .max(20, 'Máximo 20 caracteres.')
    .refine((value) => value === '' || /^-?\d{1,3}(\.\d+)?$/.test(value), {
      message: 'Ingresa un número decimal válido.',
    })
    .refine(
      (value) => value === '' || (Number(value) >= min && Number(value) <= max),
      { message: `Debe estar entre ${min} y ${max}.` },
    )
    .optional()

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
  address: z.string().max(500).optional(),
  state: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  sector: z.string().max(120).optional(),
  latitude: optionalDecimal(-90, 90),
  longitude: optionalDecimal(-180, 180),
  preferredChannel: z.enum(['whatsapp', 'call', 'sms', 'telegram']),
  careNotes: z.string().max(2000).optional(),
  responsibleUserId: z.string().optional(),
  customValues: z.record(z.string(), z.unknown()).optional(),
})

export type PatientFormValues = z.infer<typeof patientSchema>
