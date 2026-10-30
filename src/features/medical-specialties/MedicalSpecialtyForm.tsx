import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  medicalSpecialtySchema,
  type MedicalSpecialtyFormValues,
} from '@/schemas/medicalSpecialty'

export function MedicalSpecialtyForm({
  specialty,
  onSave,
  onCancel,
  submitting = false,
}: {
  specialty?: components['schemas']['MedicalSpecialty']
  onSave: (values: MedicalSpecialtyFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MedicalSpecialtyFormValues>({
    resolver: zodResolver(medicalSpecialtySchema),
    defaultValues: specialty
      ? { name: specialty.name, description: specialty.description ?? '' }
      : { name: '', description: '' },
  })

  async function submit(values: MedicalSpecialtyFormValues) {
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
          if (
            key in medicalSpecialtySchema.shape &&
            typeof message === 'string'
          )
            setError(key as FieldPath<MedicalSpecialtyFormValues>, {
              type: 'server',
              message,
            })
        }
      } else if (error instanceof ApiError && error.status === 409) {
        setError('name', { type: 'server', message: error.message })
      } else {
        setError('root.server' as FieldPath<MedicalSpecialtyFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar la especialidad.',
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5">
      <ModalSection
        icon={<Stethoscope className="size-4" />}
        title="Datos de la Especialidad"
        tone="mint"
      >
        <TextField
          label="Nombre"
          required
          placeholder="Cardiología"
          {...register('name')}
          error={errors.name?.message}
        />
        <div className="grid gap-1.5">
          <label
            htmlFor="specialty-description"
            className="text-ink text-sm font-medium"
          >
            Descripción
          </label>
          <textarea
            id="specialty-description"
            rows={1}
            {...register('description')}
            className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 resize-none rounded-lg border bg-white px-3 py-2 text-sm transition outline-none focus:ring-2"
          />
          {errors.description?.message && (
            <p className="text-xs text-red-700">{errors.description.message}</p>
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
      <FormActions className="py-2.5">
        <Button
          type="button"
          className="h-9 w-full sm:w-auto"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="h-9 w-full sm:w-auto"
          disabled={submitting}
        >
          {submitting
            ? 'Guardando…'
            : specialty
              ? 'Guardar cambios'
              : 'Crear especialidad'}
        </Button>
      </FormActions>
    </form>
  )
}
