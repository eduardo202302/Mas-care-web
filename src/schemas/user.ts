import { z } from 'zod'

export const assignableRoles = [
  'admin',
  'pharmacist',
  'operator',
  'read_only',
] as const

export const userCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresa al menos 2 caracteres.')
    .max(120, 'Máximo 120 caracteres.'),
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres.')
    .max(40, 'Máximo 40 caracteres.')
    .regex(
      /^[A-Za-z0-9._-]+$/,
      'Usa letras, números, punto, guion o guion bajo.',
    ),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo válido.')
    .max(254, 'Máximo 254 caracteres.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Ingresa un número válido.')
    .max(20, 'Máximo 20 caracteres.')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Usa al menos 8 caracteres.')
    .max(128, 'Máximo 128 caracteres.'),
  pin: z
    .string()
    .trim()
    .length(6, 'El PIN debe tener 6 dígitos.')
    .regex(/^\d{6}$/, 'El PIN debe tener 6 dígitos numéricos.'),
  role: z.enum(assignableRoles),
  /** Role created in the Roles screen; `role` follows its base role. */
  roleId: z.string().min(1, 'Selecciona un rol.'),
  branchIds: z.array(z.string()),
})

/** Form values; 
oleId is optional because the owner's role is not editable. */
export type UserCreateValues = Omit<
  z.infer<typeof userCreateSchema>,
  'roleId'
> & { roleId?: string }

export const userEditSchema = userCreateSchema.extend({
  password: z.string().optional(),
  pin: z.string().optional(),
  role: z.string(),
  roleId: z.string().optional(),
})
