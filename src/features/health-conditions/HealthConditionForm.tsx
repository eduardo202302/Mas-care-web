import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { HeartPulse } from 'lucide-react'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  healthConditionSchema,
  type HealthConditionFormValues,
} from '@/schemas/healthCondition'

export function HealthConditionForm({
  readOnly = false,
  onEdit,
  condition,
  onSave,
  onCancel,
  submitting = false,
}: {
  condition?: components['schemas']['HealthCondition']
  onSave: (values: HealthConditionFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  /** Muestra el formulario bloqueado, como visor de la ficha. */
  readOnly?: boolean
  /** Desbloquea los campos desde el botón Editar del modo ver. */
  onEdit?: () => void
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<HealthConditionFormValues>({
    resolver: zodResolver(healthConditionSchema),
    defaultValues: condition
      ? { name: condition.name, description: condition.description ?? '' }
      : { name: '', description: '' },
  })

  async function submit(values: HealthConditionFormValues) {
    try {
      await onSave(values)
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in healthConditionSchema.shape && typeof message === 'string')
            setError(key as FieldPath<HealthConditionFormValues>, {
              type: 'server',
              message,
            })
        }
      } else if (error instanceof ApiError && error.status === 409) {
        setError('name', { type: 'server', message: error.message })
      } else {
        setError('root.server' as FieldPath<HealthConditionFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar la condición de salud.',
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5">
      <FormFields readOnly={readOnly}>
        <ModalSection
          icon={<HeartPulse className="size-4" />}
          title="Datos de la Condición"
          tone="mint"
        >
          <TextField
            label="Nombre"
            required
            placeholder="Hipertensión"
            {...register('name')}
            error={errors.name?.message}
          />
          <div className="grid gap-1.5">
            <label
              htmlFor="condition-description"
              className="text-ink text-sm font-medium"
            >
              Descripción{' '}
              <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <TextAreaField
              id="condition-description"
              className="min-h-8 py-1.5 text-xs"
              {...register('description')}
            />
            {errors.description?.message && (
              <p className="text-xs text-red-700">
                {errors.description.message}
              </p>
            )}
          </div>
        </ModalSection>
        {errors.root?.server?.message && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
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
        submitLabel={condition ? 'Guardar Cambios' : 'Crear Condición'}
      />
    </form>
  )
}
