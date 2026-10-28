import { z } from 'zod'

export const branchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresa al menos 2 caracteres.')
    .max(100, 'Máximo 100 caracteres.'),
  labelColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Usa un color hexadecimal de 6 dígitos.'),
})

export type BranchFormValues = z.infer<typeof branchSchema>
