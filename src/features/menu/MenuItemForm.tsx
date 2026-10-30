import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { ChevronDown, ListTree, TextCursorInput } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import { cn } from '@/lib/cn'
import { menuIcons } from '@/lib/menu'
import { menuItemFormSchema, type MenuItemFormValues } from '@/schemas/menu'

type ParentOption = { id: string; label: string }

type Props = {
  mode: 'create' | 'edit'
  initialValues?: MenuItemFormValues
  /** Top-level items that can hold this item (never itself or a child). */
  parents: ParentOption[]
  /** Items that have submenus cannot be moved under another parent. */
  parentLocked?: boolean
  onSave: (values: MenuItemFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

const fieldClass =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400'

const emptyValues: MenuItemFormValues = {
  key: '',
  label: '',
  path: '',
  icon: 'circle',
  order: '0',
  permission: '',
  parentId: '',
  isActive: true,
}

function SelectField({
  id,
  label,
  error,
  locked = false,
  children,
  ...props
}: {
  id: string
  label: string
  error?: string
  /** Read-only look; a disabled select would drop its value from the form. */
  locked?: boolean
  children: React.ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={cn(
            fieldClass,
            locked && 'bg-surface text-muted pointer-events-none',
          )}
          aria-invalid={Boolean(error)}
          tabIndex={locked ? -1 : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}

export function MenuItemForm({
  mode,
  initialValues,
  parents,
  parentLocked = false,
  onSave,
  onCancel,
  submitting = false,
}: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: initialValues ?? emptyValues,
  })
  const editing = mode === 'edit'

  async function submit(values: MenuItemFormValues) {
    try {
      await onSave(values)
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in menuItemFormSchema.shape && typeof message === 'string') {
            setError(key as FieldPath<MenuItemFormValues>, {
              type: 'server',
              message,
            })
          }
        }
      }
      setError('root.server', {
        type: 'server',
        message:
          error instanceof Error
            ? error.message
            : 'No pudimos guardar el ítem.',
      })
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(submit)}>
      <ModalSection
        icon={<TextCursorInput className="size-4" />}
        title="Datos del Ítem"
        tone="mint"
      >
        <TextField
          label="Nombre"
          required
          placeholder="pacientes"
          readOnly={editing}
          {...register('key')}
          error={errors.key?.message}
        />
        <TextField
          label="Etiqueta"
          required
          placeholder="Pacientes"
          {...register('label')}
          error={errors.label?.message}
        />
        <TextField
          label="Ruta"
          placeholder="/pacientes (vacío para un grupo de submenús)"
          {...register('path')}
          error={errors.path?.message}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            id="menu-icon"
            label="Ícono"
            error={errors.icon?.message}
            {...register('icon')}
          >
            {Object.keys(menuIcons).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Orden"
            required
            inputMode="numeric"
            {...register('order')}
            error={errors.order?.message}
          />
        </div>
      </ModalSection>

      <ModalSection
        icon={<ListTree className="size-4" />}
        title="Ubicación y Visibilidad"
        tone="sky"
      >
        <SelectField
          id="menu-parent"
          label="Menú Padre"
          error={errors.parentId?.message}
          locked={parentLocked}
          {...register('parentId')}
        >
          <option value="">Ninguno (nivel superior)</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.label}
            </option>
          ))}
        </SelectField>
        {parentLocked && (
          <p className="text-muted text-xs">
            Este ítem tiene submenús, por eso debe quedarse en el nivel
            superior.
          </p>
        )}
        <label className="border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3">
          <input
            type="checkbox"
            {...register('isActive')}
            className="accent-tealmax size-4 cursor-pointer"
          />
          <span className="text-ink text-sm font-medium">
            Activo (Visible en el Menú)
          </span>
        </label>
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
          {submitting
            ? 'Guardando…'
            : editing
              ? 'Guardar Cambios'
              : 'Crear Ítem'}
        </Button>
      </FormActions>
    </form>
  )
}
