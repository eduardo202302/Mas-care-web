import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Building2, Palette } from 'lucide-react'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { branchSchema, type BranchFormValues } from '@/schemas/branch'

/** Mismo control que el resto de la app: alto fijo, borde y anillo de foco. */
const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'

type Props = {
  initialValues?: BranchFormValues
  onSave: (values: BranchFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  /** Muestra el formulario bloqueado, como visor de la ficha. */
  readOnly?: boolean
  /** Desbloquea los campos desde el botón Editar del modo ver. */
  onEdit?: () => void
}

export function BranchForm({
  readOnly = false,
  onEdit,
  initialValues,
  onSave,
  onCancel,
  submitting = false,
}: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialValues ?? { name: '', labelColor: '#0e7c86' },
  })
  async function submit(values: BranchFormValues) {
    try {
      await onSave(values)
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error.status === 400 &&
        'fields' in error &&
        typeof error.fields === 'object' &&
        error.fields !== null
      ) {
        for (const [key, message] of Object.entries(error.fields as object)) {
          if (
            (key === 'name' || key === 'labelColor') &&
            typeof message === 'string'
          )
            setError(key as FieldPath<BranchFormValues>, {
              type: 'server',
              message,
            })
        }
      } else {
        setError('root.server', {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar la sucursal.',
        })
      }
    }
  }
  return (
    <form className="grid gap-5" onSubmit={handleSubmit(submit)}>
      <FormFields readOnly={readOnly}>
        <ModalSection
          icon={<Building2 className="size-4" />}
          title="Datos de la Sucursal"
          tone="mint"
        >
          <TextField
            label="Nombre de Sucursal"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Sucursal Centro"
          />
        </ModalSection>

        <ModalSection
          icon={<Palette className="size-4" />}
          title="Etiqueta de Color"
          tone="sky"
        >
          <div className="grid gap-1.5">
            <label
              htmlFor="labelColor"
              className="text-ink text-sm font-medium"
            >
              Color de la Etiqueta
            </label>
            <div className={`${control} flex items-center gap-3`}>
              <input
                type="color"
                id="labelColor"
                {...register('labelColor')}
                aria-invalid={Boolean(errors.labelColor)}
                className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="text-muted text-sm">
                Identifica visualmente esta sucursal.
              </span>
            </div>
            {errors.labelColor?.message && (
              <p className="text-xs text-red-700">
                {errors.labelColor.message}
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
      </FormFields>
      <FormFooter
        readOnly={readOnly}
        onEdit={onEdit}
        onClose={onCancel}
        submitting={submitting}
        submitLabel={initialValues ? 'Guardar Cambios' : 'Crear Sucursal'}
      />
    </form>
  )
}
