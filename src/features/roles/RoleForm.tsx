import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { LayoutList, ShieldCheck } from 'lucide-react'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { MenuItemDto } from '@/lib/menu'
import type { components } from '@/lib/api-types'
import {
  roleFormSchema,
  type RoleFormValues,
  type RoleGrant,
} from '@/schemas/role'
import type { GrantMap } from './grants'
import { MenuPermissionTree } from './MenuPermissionTree'

type RoleDto = components['schemas']['Role']

export type RoleSavePayload = {
  values: RoleFormValues
  items: ({ menuItemId: string } & RoleGrant)[]
}

type Props = {
  role?: RoleDto
  catalog: MenuItemDto[]
  onSave: (payload: RoleSavePayload) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  /** Muestra el formulario bloqueado, como visor de la ficha. */
  readOnly?: boolean
  /** Desbloquea los campos desde el botón Editar del modo ver. */
  onEdit?: () => void
}

export function RoleForm({
  readOnly = false,
  onEdit,
  role,
  catalog,
  onSave,
  onCancel,
  submitting = false,
}: Props) {
  const system = role?.isSystem ?? false
  const owner = role?.key === 'owner'
  const [grants, setGrants] = useState<GrantMap>(() =>
    Object.fromEntries(
      (role?.items ?? []).map(({ menuItemId, ...flags }) => [
        menuItemId,
        flags,
      ]),
    ),
  )
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      baseRole:
        (role?.baseRole as RoleFormValues['baseRole'] | undefined) ??
        'operator',
      isActive: role?.isActive ?? true,
    },
  })

  async function submit(values: RoleFormValues) {
    const items = Object.entries(grants).map(([menuItemId, flags]) => ({
      menuItemId,
      ...flags,
    }))
    try {
      await onSave({ values, items })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in roleFormSchema.shape && typeof message === 'string') {
            setError(key as FieldPath<RoleFormValues>, {
              type: 'server',
              message,
            })
          }
        }
      }
      setError('root.server', {
        type: 'server',
        message:
          error instanceof Error ? error.message : 'No pudimos guardar el rol.',
      })
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(submit)}>
      <FormFields readOnly={readOnly}>
        <ModalSection
          icon={<ShieldCheck className="size-4" />}
          title="Datos del Rol"
          tone="mint"
        >
          {system ? (
            <p className="bg-surface text-muted rounded-lg px-3 py-2 text-sm">
              <strong className="text-ink">{role?.name}</strong> es un rol del
              sistema: su nombre y estado no se pueden cambiar.
              {owner && ' El Propietario siempre accede a todo el menú.'}
            </p>
          ) : (
            <TextField
              label="Nombre"
              required
              placeholder="Ej. Cajero"
              {...register('name')}
              error={errors.name?.message}
            />
          )}
          <div className="grid gap-1.5">
            <label
              htmlFor="role-description"
              className="text-ink text-sm font-medium"
            >
              Descripción
            </label>
            <TextAreaField
              id="role-description"
              className="min-h-8 py-1.5 text-xs"
              {...register('description')}
            />
            {errors.description?.message && (
              <p className="text-xs text-red-700">
                {errors.description.message}
              </p>
            )}
          </div>
          {!system && (
            <>
              <label className="border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="accent-tealmax size-4 cursor-pointer"
                />
                <span className="text-ink text-sm font-medium">
                  Activo (se puede asignar a usuarios)
                </span>
              </label>
              {errors.isActive?.message && (
                <p className="text-xs text-red-700">
                  {errors.isActive.message}
                </p>
              )}
            </>
          )}
        </ModalSection>

        <ModalSection
          icon={<LayoutList className="size-4" />}
          title="Pantallas Permitidas"
          tone="sky"
        >
          <MenuPermissionTree
            catalog={catalog}
            value={grants}
            onChange={setGrants}
            disabled={owner}
          />
          <p className="text-muted text-xs">
            Al marcar una pantalla se incluye su grupo en el menú.
          </p>
        </ModalSection>
        {errors.root?.server?.message && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {errors.root.server.message}
          </p>
        )}
      </FormFields>
      <FormFooter
        readOnly={readOnly}
        onEdit={onEdit}
        onClose={onCancel}
        submitting={submitting}
        submitLabel={role ? 'Guardar Cambios' : 'Crear Rol'}
      />
    </form>
  )
}
