import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { MenuItemDto } from '@/lib/menu'
import { roleLabel } from '@/lib/role-labels'
import type { components } from '@/lib/api-types'
import { assignableRoles } from '@/schemas/user'
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
}

const fieldClass =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm transition outline-none focus:ring-2'

export function RoleForm({
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
      {system ? (
        <p className="bg-surface text-muted rounded-lg px-3 py-2 text-sm">
          <strong className="text-ink">{role?.name}</strong> es un rol del
          sistema: su nombre, rol base y estado no se pueden cambiar.
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
        <textarea
          id="role-description"
          rows={2}
          {...register('description')}
          className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
        />
        {errors.description?.message && (
          <p className="text-xs text-red-700">{errors.description.message}</p>
        )}
      </div>
      {!system && (
        <>
          <div className="grid gap-1.5">
            <label htmlFor="role-base" className="text-ink text-sm font-medium">
              Rol base
            </label>
            <div className="relative">
              <select
                id="role-base"
                {...register('baseRole')}
                className={fieldClass}
              >
                {assignableRoles.map((value) => (
                  <option key={value} value={value}>
                    {roleLabel(value)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
            <p className="text-muted text-xs">
              Define qué puede hacer el usuario con los datos. Las pantallas
              marcadas abajo solo controlan qué ve en el menú.
            </p>
            {errors.baseRole?.message && (
              <p className="text-xs text-red-700">{errors.baseRole.message}</p>
            )}
          </div>
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
            <p className="text-xs text-red-700">{errors.isActive.message}</p>
          )}
        </>
      )}
      <fieldset className="grid gap-3">
        <legend className="text-ink mb-1 text-sm font-medium">
          Pantallas permitidas
        </legend>
        <MenuPermissionTree
          catalog={catalog}
          value={grants}
          onChange={setGrants}
          disabled={owner}
        />
        <p className="text-muted text-xs">
          Al marcar una pantalla se incluye su grupo en el menú.
        </p>
      </fieldset>
      {errors.root?.server?.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {errors.root.server.message}
        </p>
      )}
      <FormActions>
        <Button type="button" className="w-full sm:w-auto" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={submitting}
        >
          {submitting ? 'Guardando…' : role ? 'Guardar cambios' : 'Crear rol'}
        </Button>
      </FormActions>
    </form>
  )
}
