import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath, Resolver } from 'react-hook-form'
import {
  ChevronDown,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import { roleLabel } from '@/lib/role-labels'
import {
  userCreateSchema,
  userEditSchema,
  type UserCreateValues,
} from '@/schemas/user'

type BranchOption = { id: string; name: string }
type RoleOption = { id: string; name: string; baseRole: string }

type Props = {
  mode?: 'create' | 'edit'
  initialValues?: Pick<
    UserCreateValues,
    'name' | 'username' | 'email' | 'phone' | 'role' | 'branchIds'
  > & { roleId?: string }
  /** The owner's role cannot be changed. */
  roleLocked?: boolean
  /** Roles created in the Roles screen; the only ones that can be assigned. */
  roles?: RoleOption[]
  rolesLoading?: boolean
  branches: BranchOption[]
  branchesLoading?: boolean
  onSave: (values: UserCreateValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

function generatePassword() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

function generatePin() {
  const values = crypto.getRandomValues(new Uint32Array(1))
  return String((values[0] ?? 0) % 1_000_000).padStart(6, '0')
}

export function UserForm({
  mode = 'create',
  initialValues,
  roleLocked = false,
  roles = [],
  rolesLoading = false,
  branches,
  branchesLoading = false,
  onSave,
  onCancel,
  submitting = false,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<UserCreateValues>({
    resolver: zodResolver(
      mode === 'edit' ? userEditSchema : userCreateSchema,
    ) as unknown as Resolver<UserCreateValues>,
    defaultValues: {
      name: initialValues?.name ?? '',
      username: initialValues?.username ?? '',
      email: initialValues?.email ?? '',
      phone: initialValues?.phone ?? '',
      password: '',
      pin: mode === 'edit' ? '' : generatePin(),
      role: initialValues?.role ?? 'operator',
      roleId: initialValues?.roleId ?? '',
      branchIds: initialValues?.branchIds ?? [],
    },
  })
  const editing = mode === 'edit'
  const role = watch('role')
  const branchIds = watch('branchIds') ?? []
  const control =
    'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'
  const fieldClass = `${control} placeholder:text-muted/70 transition aria-[invalid=true]:border-red-400`

  async function submit(values: UserCreateValues) {
    if (
      !roleLocked &&
      values.role !== 'admin' &&
      values.branchIds.length === 0
    ) {
      setError('branchIds', {
        type: 'manual',
        message: 'Asigna al menos una sucursal.',
      })
      return
    }
    try {
      const { roleId, ...rest } = values
      await onSave({
        ...rest,
        ...(roleId ? { roleId } : {}),
        email: values.email.trim().toLowerCase(),
      })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in userCreateSchema.shape && typeof message === 'string') {
            setError(key as FieldPath<UserCreateValues>, {
              type: 'server',
              message,
            })
          }
        }
      } else {
        setError('root.server', {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos crear el usuario.',
        })
      }
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(submit)}>
      <ModalSection
        icon={<UserRound className="size-4" />}
        title="Datos del Usuario"
        tone="mint"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Nombre Completo"
            required
            placeholder="Nombre y apellidos"
            {...register('name')}
            error={errors.name?.message}
          />
          <TextField
            label="Usuario"
            required
            autoComplete="off"
            placeholder="usuario"
            {...register('username')}
            error={errors.username?.message}
          />
          <TextField
            label="Correo Electrónico"
            type="email"
            required
            placeholder="usuario@correo.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <TextField
            label="WhatsApp / Teléfono"
            type="tel"
            placeholder="Número de celular"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
      </ModalSection>
      {!editing && (
        <ModalSection
          icon={<KeyRound className="size-4" />}
          title="Acceso y Credenciales"
          tone="sky"
        >
          <div className="grid gap-1.5">
            <label
              htmlFor="user-password"
              className="text-ink text-sm font-medium"
            >
              Contraseña Temporal
            </label>
            <div className="flex gap-2">
              <input
                id="user-password"
                type="text"
                autoComplete="new-password"
                {...register('password')}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'user-password-error' : 'user-password-help'
                }
                className={`${fieldClass} min-w-0 flex-1`}
              />
              <Button
                type="button"
                className="shrink-0 px-3"
                onClick={() =>
                  setValue('password', generatePassword(), {
                    shouldValidate: true,
                  })
                }
              >
                <RefreshCw className="size-4" />
                Generar
              </Button>
            </div>
            {errors.password?.message ? (
              <p id="user-password-error" className="text-xs text-red-700">
                {errors.password.message}
              </p>
            ) : (
              <p id="user-password-help" className="text-muted text-xs">
                Cópiala antes de guardar; no se volverá a mostrar.
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="user-pin" className="text-ink text-sm font-medium">
              PIN de Recuperación
            </label>
            <div className="flex gap-2">
              <input
                id="user-pin"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                {...register('pin')}
                aria-invalid={Boolean(errors.pin)}
                aria-describedby={
                  errors.pin ? 'user-pin-error' : 'user-pin-help'
                }
                className={`${fieldClass} min-w-0 flex-1 font-mono tracking-[0.3em]`}
              />
              <Button
                type="button"
                className="shrink-0 px-3"
                onClick={() =>
                  setValue('pin', generatePin(), {
                    shouldValidate: true,
                  })
                }
              >
                <RefreshCw className="size-4" />
                Generar
              </Button>
            </div>
            {errors.pin?.message ? (
              <p id="user-pin-error" className="text-xs text-red-700">
                {errors.pin.message}
              </p>
            ) : (
              <p id="user-pin-help" className="text-muted text-xs">
                El usuario lo usará para recuperar su contraseña. Podrás verlo
                en su ficha.
              </p>
            )}
          </div>
        </ModalSection>
      )}
      <ModalSection
        icon={<ShieldCheck className="size-4" />}
        title="Rol y Sucursales"
        tone="amber"
      >
        <div className="grid gap-1.5">
          <label htmlFor="user-role" className="text-ink text-sm font-medium">
            Rol
          </label>
          {roleLocked ? (
            <p
              id="user-role"
              className={`${fieldClass} bg-surface text-muted flex items-center`}
            >
              {roleLabel('owner')}
            </p>
          ) : (
            <div className="relative">
              <select
                id="user-role"
                {...register('roleId', {
                  onChange: (event: { target: { value: string } }) => {
                    const chosen = roles.find(
                      (candidate) => candidate.id === event.target.value,
                    )
                    if (chosen) setValue('role', chosen.baseRole as typeof role)
                  },
                })}
                aria-invalid={Boolean(errors.roleId)}
                disabled={rolesLoading}
                className={`${fieldClass} appearance-none pr-9`}
              >
                <option value="">
                  {rolesLoading ? 'Cargando roles…' : 'Selecciona un rol'}
                </option>
                {roles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          )}
          {errors.roleId?.message && (
            <p className="text-xs text-red-700">{errors.roleId.message}</p>
          )}
          <p className="text-muted text-xs">
            {role === 'admin'
              ? 'Este rol ve todas las sucursales de la organización.'
              : 'El usuario verá solo las sucursales que le asignes.'}
          </p>
        </div>
        <div className="border-border grid gap-3 border-t pt-4">
          <span className="text-ink text-sm font-medium">
            Sucursales Asignadas
          </span>
          {branchesLoading ? (
            <div
              role="status"
              aria-busy="true"
              aria-label="Cargando sucursales…"
              className="grid gap-2 sm:grid-cols-2"
            >
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-[46px] rounded-lg" />
              ))}
            </div>
          ) : branches.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {branches.map((branch) => (
                <label
                  key={branch.id}
                  className="border-border bg-surface/50 hover:border-tealmax/40 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition"
                >
                  <input
                    type="checkbox"
                    value={branch.id}
                    {...register('branchIds')}
                    className="accent-tealmax size-4 shrink-0 cursor-pointer"
                  />
                  <span className="text-ink text-sm font-medium">
                    {branch.name}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">
              No hay sucursales activas. Crea una antes de asignar usuarios.
            </p>
          )}
          {errors.branchIds?.message && (
            <p className="text-xs text-red-700">{errors.branchIds.message}</p>
          )}
          {role === 'admin' && branchIds.length === 0 && (
            <p className="text-muted text-xs">
              La asignación es opcional para este rol.
            </p>
          )}
          {branchIds.length > 0 && (
            <p className="text-muted text-xs">
              {branchIds.length} sucursal{branchIds.length === 1 ? '' : 'es'}{' '}
              seleccionada{branchIds.length === 1 ? '' : 's'}.
            </p>
          )}
        </div>
      </ModalSection>
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
          {editing
            ? submitting
              ? 'Guardando…'
              : 'Guardar Cambios'
            : submitting
              ? 'Creando…'
              : 'Crear Usuario'}
        </Button>
      </FormActions>
    </form>
  )
}
