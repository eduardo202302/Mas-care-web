import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { branchSchema, type BranchFormValues } from '@/schemas/branch'

type Props = {
  initialValues?: BranchFormValues
  onSave: (values: BranchFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function BranchForm({
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
      <TextField
        label="Nombre de sucursal"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Sucursal Centro"
      />
      <div className="grid gap-1.5">
        <label htmlFor="labelColor" className="text-ink text-sm font-medium">
          Color de etiqueta
        </label>
        <div className="border-border flex h-10 items-center gap-3 rounded-lg border px-3">
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
          <p className="text-xs text-red-700">{errors.labelColor.message}</p>
        )}
      </div>
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
            : initialValues
              ? 'Guardar cambios'
              : 'Crear sucursal'}
        </Button>
      </FormActions>
    </form>
  )
}
