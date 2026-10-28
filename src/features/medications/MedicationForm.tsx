import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  medicationSchema,
  type MedicationFormValues,
} from '@/schemas/medication'

export function MedicationForm({
  medication,
  onSave,
  onCancel,
  submitting = false,
}: {
  medication?: components['schemas']['Medication']
  onSave: (values: MedicationFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: medication
      ? {
          brandName: medication.brandName ?? '',
          genericName: medication.genericName ?? '',
          activeIngredient: medication.activeIngredient ?? '',
          presentation: medication.presentation,
          doseUnit: medication.doseUnit,
          unitsPerPackage: Number(medication.unitsPerPackage) || 1,
        }
      : {
          brandName: '',
          genericName: '',
          activeIngredient: '',
          presentation: '',
          doseUnit: 'tableta',
          unitsPerPackage: 1,
        },
  })

  async function submit(values: MedicationFormValues) {
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
          if (key in medicationSchema.shape && typeof message === 'string')
            setError(key as FieldPath<MedicationFormValues>, {
              type: 'server',
              message,
            })
        }
      } else {
        setError('root.server' as FieldPath<MedicationFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar el medicamento.',
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5 sm:grid-cols-2">
      <TextField
        label="Nombre comercial"
        {...register('brandName')}
        error={errors.brandName?.message}
      />
      <TextField
        label="Nombre genérico"
        {...register('genericName')}
        error={errors.genericName?.message}
      />
      <TextField
        label="Principio activo"
        {...register('activeIngredient')}
        error={errors.activeIngredient?.message}
      />
      <TextField
        label="Presentación"
        required
        placeholder="Caja con tabletas"
        {...register('presentation')}
        error={errors.presentation?.message}
      />
      <TextField
        label="Unidad de dosis"
        required
        placeholder="tableta, ml…"
        {...register('doseUnit')}
        error={errors.doseUnit?.message}
      />
      <TextField
        label="Unidades por envase"
        type="number"
        min="0.01"
        step="any"
        required
        {...register('unitsPerPackage', { valueAsNumber: true })}
        error={errors.unitsPerPackage?.message}
      />
      {errors.root?.server?.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2"
        >
          {errors.root.server.message}
        </p>
      )}
      <FormActions className="sm:col-span-2">
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
            : medication
              ? 'Guardar cambios'
              : 'Crear medicamento'}
        </Button>
      </FormActions>
    </form>
  )
}
