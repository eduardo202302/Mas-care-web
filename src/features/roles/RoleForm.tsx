import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { CircleAlert, LayoutList, ShieldCheck } from 'lucide-react'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { ModalSection } from '@/components/ui/ModalSection'
import { useStatusDraftChanged } from '@/components/ui/StatusDraft'
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

/** Compara dos mapas de permisos por pantalla (solo los accesos concedidos). */
function sameGrants(a: GrantMap, b: GrantMap): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const x = a[key]
    const y = b[key]
    if (!x || !y) return false
    if (
      Boolean(x.canView) !== Boolean(y.canView) ||
      Boolean(x.canCreate) !== Boolean(y.canCreate) ||
      Boolean(x.canEdit) !== Boolean(y.canEdit) ||
      Boolean(x.canDelete) !== Boolean(y.canDelete)
    )
      return false
  }
  return true
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
  const statusChanged = useStatusDraftChanged()
  const system = role?.isSystem ?? false
  // Master siempre tiene todas las sucursales y pantallas: solo su descripción cambia.
  const locked = role?.key === 'master'
  const [grants, setGrants] = useState<GrantMap>(() =>
    Object.fromEntries(
      (role?.items ?? []).map(({ menuItemId, ...flags }) => [
        menuItemId,
        flags,
      ]),
    ),
  )
  const [initialGrants] = useState(grants)
  const grantsChanged = !sameGrants(grants, initialGrants)
  const [screensError, setScreensError] = useState<string | null>(null)
  const screensErrorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (screensError)
      screensErrorRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [screensError])
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      allBranches: role?.allBranches ?? false,
      isActive: role?.isActive ?? true,
    },
  })

  function changeGrants(next: GrantMap) {
    setGrants(next)
    setScreensError(null)
  }

  async function submit(values: RoleFormValues) {
    const items = Object.entries(grants).map(([menuItemId, flags]) => ({
      menuItemId,
      ...flags,
    }))
    // Un rol sin pantallas no puede abrir nada: Master queda exento.
    if (!locked && !items.some((item) => item.canView)) {
      setScreensError('Selecciona al menos una pantalla para este rol.')
      return
    }
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
    <form noValidate className="grid gap-5" onSubmit={handleSubmit(submit)}>
      {screensError && (
        <div
          ref={screensErrorRef}
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {screensError}
        </div>
      )}
      <FormFields readOnly={readOnly}>
        <ModalSection
          icon={<ShieldCheck className="size-4" />}
          title="Datos Del Rol"
        >
          {system ? (
            <p className="bg-surface text-muted rounded-lg px-3 py-2 text-sm">
              <strong className="text-ink">{role?.name}</strong> siempre tiene
              todas las sucursales y todas las pantallas: solo puedes cambiar su
              descripción.
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
          {!system && !role && (
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
          forceOpen={Boolean(screensError)}
        >
          <MenuPermissionTree
            catalog={catalog}
            value={grants}
            onChange={changeGrants}
            disabled={locked}
          />
          <p className="text-muted text-xs">
            Marca al menos una pantalla. Al marcarla se incluye su grupo en el
            menú y se conceden los accesos que necesita para funcionar.
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
        unchanged={
          Boolean(role) && !isDirty && !grantsChanged && !statusChanged
        }
        submitLabel={role ? 'Guardar Cambios' : 'Crear Rol'}
      />
    </form>
  )
}
