import { z } from 'zod'

export const menuItemFormSchema = z.object({
  key: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9_]{2,40}$/,
      'Usa minúsculas, números o guion bajo (2 a 40).',
    ),
  label: z
    .string()
    .trim()
    .min(1, 'Ingresa una etiqueta.')
    .max(60, 'Máximo 60 caracteres.'),
  path: z
    .string()
    .trim()
    .max(120, 'Máximo 120 caracteres.')
    .refine(
      (value) => value === '' || /^\/[A-Za-z0-9\-_/]*$/.test(value),
      'La ruta debe empezar con / y no tener espacios.',
    ),
  icon: z.string().min(1, 'Elige un ícono.'),
  order: z.string().regex(/^\d{1,6}$/, 'Ingresa un número entero.'),
  permission: z.string().trim().max(60, 'Máximo 60 caracteres.'),
  parentId: z.string(),
  isActive: z.boolean(),
})

export type MenuItemFormValues = z.infer<typeof menuItemFormSchema>
