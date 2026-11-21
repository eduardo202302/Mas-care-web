import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath, Resolver } from 'react-hook-form'
import { useState } from 'react'
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { Skeleton } from '@/components/ui/Skeleton'
import { useStatusDraftChanged } from '@/components/ui/StatusDraft'
import { TextField } from '@/components/ui/TextField'
import { cn } from '@/lib/cn'
import { PHONE_INPUT_MAX_LENGTH, maskPhoneInput } from '@/lib/phone'
import { ApiError } from '@/lib/http'
import {
  userCreateSchema,
  userEditSchema,
  type UserCreateValues,
} from '@/schemas/user'

type BranchOption = { id: string; name: string }
type RoleOption = { id: string; name: string; allBranches: boolean }

type Props = {
  mode?: 'create' | 'edit'
  initialValues?: Pick<
    UserCreateValues,
    'name' | 'username' | 'email' | 'phone' | 'branchIds'
  > & { roleId?: string; roleName?: string }
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
    getValues,
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
      roleId: initialValues?.roleId ?? '',
      branchIds: initialValues?.branchIds ?? [],
    },
  })
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const editing = mode === 'edit'
  const selectedRoleId = watch('roleId')
  const allBranches = Boolean(
    roles.find((candidate) => candidate.id === selectedRoleId)?.allBranches,
  )
  const branchIds = watch('branchIds') ?? []
  const [currentName, currentUsername, currentEmail, currentPhone] = watch([
    'name',
    'username',
    'email',
    'phone',
  ])
  const statusChanged = useStatusDraftChanged()
  const initialBranchIds = initialValues?.branchIds ?? []
  const unchanged =
    editing &&
    !statusChanged &&
    currentName === (initialValues?.name ?? '') &&
    currentUsername === (initialValues?.username ?? '') &&
    currentEmail === (initialValues?.email ?? '') &&
    (currentPhone ?? '') === (initialValues?.phone ?? '') &&
    (selectedRoleId ?? '') === (initialValues?.roleId ?? '') &&
    branchIds.length === initialBranchIds.length &&
    initialBranchIds.every((id) => branchIds.includes(id))
  const allSelected =
    branches.length > 0 && branches.every((b) => branchIds.includes(b.id))
  const [scopeChoice, setScopeChoice] = useState<'all' | 'some' | null>(null)
  const branchScope = scopeChoice ?? (allSelected ? 'all' : 'some')
  function chooseBranchScope(scope: 'all' | 'some') {
    setScopeChoice(scope)
    if (scope === 'all')
      setValue(
        'branchIds',
        branches.map((branch) => branch.id),
        { shouldDirty: true, shouldValidate: true },
      )
  }
  // The current role may be missing from `roles` (still loading, no permission
  // to list roles, or deactivated); keep it visible so editing does not blank it.
  const missingCurrentRole =
    editing &&
    initialValues?.roleId &&
    initialValues.roleName &&
    !roles.some((candidate) => candidate.id === initialValues.roleId)
      ? { id: initialValues.roleId, name: initialValues.roleName }
      : null
  const control =
    'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'
  const fieldClass = `${control} placeholder:text-muted/70 transition aria-[invalid=true]:border-red-400`

  async function copyPassword() {
    const password = getValues('password')
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function submit(values: UserCreateValues) {
    if (!allBranches && values.branchIds.length === 0) {
      setError('branchIds', {
        type: 'manual',
        message: 'Asigna al menos una sucursal.',
      })
      return
    }
    try {
      const { roleId, ...rest } = values
      // Only send the role when it changed: re-sending an unchanged (possibly
      // deactivated) role would be rejected by the API.
      const roleChanged = !editing || roleId !== initialValues?.roleId
      await onSave({
        ...rest,
        ...(roleId && roleChanged ? { roleId } : {}),
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
    <form noValidate className="grid gap-5" onSubmit={handleSubmit(submit)}>
      <ModalSection
        icon={<UserRound className="size-4" />}
        title="Datos Del Usuario"
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
            label="WhatsApp"
            required
            type="tel"
            placeholder="(809) 555-1234"
            inputMode="tel"
            maxLength={PHONE_INPUT_MAX_LENGTH}
            {...register('phone', {
              onChange: (e) => {
                e.target.value = maskPhoneInput(e.target.value)
              },
            })}
            error={errors.phone?.message}
          />
        </div>
      </ModalSection>
      {!editing && (
        <ModalSection
          icon={<KeyRound className="size-4" />}
          title="Acceso Y Credenciales"
        >
          <div className="grid gap-1.5">
            <label
              htmlFor="user-password"
              className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
            >
              Contraseña Temporal
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  // El placeholder (un espacio) deja saber por CSS si el campo está vacío.
                  placeholder=" "
                  {...register('password')}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? 'user-password-error'
                      : 'user-password-help'
                  }
                  className={`${fieldClass} peer w-full pr-9`}
                />
                <button
                  type="button"
                  aria-label="Borrar contraseña"
                  title="Borrar contraseña"
                  className="text-muted hover:text-ink absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md transition peer-placeholder-shown:hidden hover:bg-slate-100"
                  onClick={() => {
                    const input = document.getElementById(
                      'user-password',
                    ) as HTMLInputElement | null
                    if (!input) return
                    // El setter nativo hace que react-hook-form detecte el cambio.
                    Object.getOwnPropertyDescriptor(
                      HTMLInputElement.prototype,
                      'value',
                    )?.set?.call(input, '')
                    input.dispatchEvent(new Event('input', { bubbles: true }))
                    input.focus()
                  }}
                >
                  <X className="size-4" />
                </button>
              </div>
              <Button
                type="button"
                className="shrink-0 px-3"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                className="shrink-0 px-3"
                onClick={() => {
                  setValue('password', generatePassword(), {
                    shouldValidate: true,
                  })
                  setCopied(false)
                }}
              >
                <RefreshCw className="size-4" />
                Generar
              </Button>
              <Button
                type="button"
                className="shrink-0 px-3"
                aria-label="Copiar contraseña"
                onClick={copyPassword}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? 'Copiada' : 'Copiar'}
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
            <label
              htmlFor="user-pin"
              className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
            >
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
        title="Rol Y Sucursales"
      >
        <div className="grid gap-1.5">
          <label
            htmlFor="user-role"
            className={cn(
              'text-ink text-sm font-medium',
              !editing && "after:ml-0.5 after:text-red-600 after:content-['*']",
            )}
          >
            Rol
          </label>
          <div className="relative">
            <select
              id="user-role"
              {...register('roleId')}
              value={selectedRoleId ?? ''}
              aria-invalid={Boolean(errors.roleId)}
              disabled={rolesLoading}
              className={`${fieldClass} appearance-none pr-9`}
            >
              <option value="">
                {rolesLoading ? 'Cargando roles…' : 'Selecciona un rol'}
              </option>
              {missingCurrentRole && (
                <option value={missingCurrentRole.id}>
                  {missingCurrentRole.name}
                </option>
              )}
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
          {errors.roleId?.message && (
            <p className="text-xs text-red-700">{errors.roleId.message}</p>
          )}
          <p className="text-muted text-xs">
            {allBranches
              ? 'Este rol ve todas las sucursales de la organización.'
              : 'El usuario verá solo las sucursales que le asignes.'}
          </p>
        </div>
        <div className="border-border grid gap-3 border-t pt-4">
          <span
            className={cn(
              'text-ink text-sm font-medium',
              !allBranches &&
                "after:ml-0.5 after:text-red-600 after:content-['*']",
            )}
          >
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
            <>
              <div
                role="radiogroup"
                aria-label="Alcance de sucursales"
                className="grid gap-2 sm:grid-cols-2"
              >
                {(
                  [
                    ['all', 'Todas las sucursales'],
                    ['some', 'Elegir sucursales'],
                  ] as const
                ).map(([value, text]) => (
                  <label
                    key={value}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition',
                      branchScope === value
                        ? 'border-tealmax bg-tealmax/10'
                        : 'border-border bg-surface/50 hover:border-tealmax/40',
                    )}
                  >
                    <input
                      type="radio"
                      name="branch-scope"
                      checked={branchScope === value}
                      onChange={() => chooseBranchScope(value)}
                      className="accent-tealmax size-4 shrink-0 cursor-pointer"
                    />
                    <span className="text-ink text-sm font-semibold">
                      {text}
                    </span>
                  </label>
                ))}
              </div>
              {branchScope === 'some' && (
                <MultiSelect
                  label="Sucursales"
                  placeholder="Selecciona una o más sucursales"
                  emptyText="No hay sucursales activas."
                  options={branches}
                  value={branchIds}
                  onChange={(ids) =>
                    setValue('branchIds', ids, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              )}
            </>
          ) : (
            <p className="text-muted text-sm">
              No hay sucursales activas. Crea una antes de asignar usuarios.
            </p>
          )}
          {errors.branchIds?.message && (
            <p className="text-xs text-red-700">{errors.branchIds.message}</p>
          )}
          {allBranches && branchIds.length === 0 && (
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
          disabled={submitting || unchanged}
          title={
            unchanged && !submitting ? 'No hay cambios para guardar' : undefined
          }
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
