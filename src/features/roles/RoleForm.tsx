import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { KeyRound, LayoutList, ShieldCheck } from 'lucide-react'
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
import { permissionGroups } from './permissionCatalog'

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
  // Master siempre tiene todos los permisos, sucursales y pantallas: solo su descripción cambia.
  const locked = role?.key === 'master'
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
    setValue,
    control,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissions: role?.permissions ?? [],
      allBranches: role?.allBranches ?? false,
      isActive: role?.isActive ?? true,
    },
  })

  const permissions = useWatch({ control, name: 'permissions' })
  const allBranches = useWatch({ control, name: 'allBranches' })
  const selected = new Set(permissions)

  function togglePermissions(actions: string[], checked: boolean) {
    const next = new Set(permissions)
    for (const action of actions) {
      if (checked) next.add(action)
      else next.delete(action)
    }
    setValue('permissions', [...next], { shouldDirty: true })
  }

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
        >
          {system ? (
            <p className="bg-surface text-muted rounded-lg px-3 py-2 text-sm">
              <strong className="text-ink">{role?.name}</strong> siempre tiene
              todos los permisos, todas las sucursales y todas las pantallas:
              solo puedes cambiar su descripción.
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
          icon={<KeyRound className="size-4" />}
          title="Permisos"
        >
          <label className="border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              checked={locked || allBranches}
              disabled={locked}
              onChange={(event) =>
                setValue('allBranches', event.target.checked, {
                  shouldDirty: true,
                })
              }
              className="accent-tealmax size-4 cursor-pointer"
            />
            <span className="text-ink text-sm font-medium">
              Acceso a todas las sucursales
            </span>
          </label>
          <div className="grid gap-4">
            {permissionGroups.map((group) => {
              const actions = group.permissions.map((item) => item.action)
              const allOn = locked || actions.every((a) => selected.has(a))
              return (
                <fieldset key={group.title} className="grid gap-1.5">
                  <legend className="mb-1 flex w-full items-center justify-between">
                    <span className="text-ink text-sm font-semibold">
                      {group.title}
                    </span>
                    {!locked && (
                      <button
                        type="button"
                        className="text-tealmax text-xs hover:underline"
                        onClick={() => togglePermissions(actions, !allOn)}
                      >
                        {allOn ? 'Quitar Todos' : 'Marcar Todos'}
                      </button>
                    )}
                  </legend>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.action}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={locked || selected.has(permission.action)}
                          disabled={locked}
                          onChange={(event) =>
                            togglePermissions(
                              [permission.action],
                              event.target.checked,
                            )
                          }
                          className="accent-tealmax size-4 cursor-pointer"
                        />
                        <span className="text-ink">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )
            })}
          </div>
          <p className="text-muted text-xs">
            Solo puedes otorgar permisos que tu propio rol tiene.
          </p>
        </ModalSection>

        <ModalSection
          icon={<LayoutList className="size-4" />}
          title="Pantallas Permitidas"
        >
          <MenuPermissionTree
            catalog={catalog}
            value={grants}
            onChange={setGrants}
            disabled={locked}
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
