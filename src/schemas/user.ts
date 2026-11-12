import { z } from 'zod'
import { phoneField } from '@/schemas/phone'

export const userCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Campo requerido.')
    .max(120, 'Máximo 120 caracteres.'),
  username: z
    .string()
    .trim()
    .min(1, 'Campo requerido.')
    .min(3, 'Mínimo 3 caracteres.')
    .max(40, 'Máximo 40 caracteres.')
    .regex(
      /^[A-Za-z0-9._-]+$/,
      'Usa letras, números, punto, guion o guion bajo.',
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Campo requerido.')
    .email('Ingresa un correo válido.')
    .max(254, 'Máximo 254 caracteres.'),
  phone: phoneField.optional(),
  password: z
    .string()
    .min(1, 'Campo requerido.')
    .min(8, 'Usa al menos 8 caracteres.')
    .max(128, 'Máximo 128 caracteres.'),
  pin: z
    .string()
    .trim()
    .min(1, 'Campo requerido.')
    .length(6, 'El PIN debe tener 6 dígitos.')
    .regex(/^\d{6}$/, 'El PIN debe tener 6 dígitos numéricos.'),
  /** Role created in the Roles screen; it defines permissions and branch access. */
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
  roleId: z.string().optional(),
})
