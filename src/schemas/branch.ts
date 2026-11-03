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

export const branchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresa al menos 2 caracteres.')
    .max(100, 'Máximo 100 caracteres.'),
  labelColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Usa un color hexadecimal de 6 dígitos.'),
  address: z.string().trim().max(500, 'Máximo 500 caracteres.').optional(),
  city: z.string().trim().max(120, 'Máximo 120 caracteres.').optional(),
  state: z.string().trim().max(120, 'Máximo 120 caracteres.').optional(),
  postalCode: z.string().trim().max(20, 'Máximo 20 caracteres.').optional(),
  sector: z.string().trim().max(120, 'Máximo 120 caracteres.').optional(),
  latitude: optionalDecimal(-90, 90),
  longitude: optionalDecimal(-180, 180),
  description: z
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres.')
    .optional(),
  managerName: z.string().trim().max(120, 'Máximo 120 caracteres.').optional(),
  managerPhone: z.string().trim().max(40, 'Máximo 40 caracteres.').optional(),
  managerEmail: z.union([
    z.literal(''),
    z.string().trim().email('Ingresa un correo válido.'),
  ]),
})

export type BranchFormValues = z.infer<typeof branchSchema>
