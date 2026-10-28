import { z } from 'zod'
import { assignableRoles } from './user'

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresa al menos 2 caracteres.')
    .max(80, 'Máximo 80 caracteres.'),
  description: z.string().trim().max(300, 'Máximo 300 caracteres.'),
  baseRole: z.enum(assignableRoles),
  isActive: z.boolean(),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>

export type RoleGrant = {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}
