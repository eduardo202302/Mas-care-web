import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Pill } from 'lucide-react'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  medicationSchema,
  type MedicationFormValues,
} from '@/schemas/medication'

export function MedicationForm({
  readOnly = false,
  onEdit,
  medication,
  onSave,
  onCancel,
  submitting = false,
}: {
  medication?: components['schemas']['Medication']
  onSave: (values: MedicationFormValues) => Promise<void>
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
    <form onSubmit={handleSubmit(submit)} className="grid gap-5">
      <FormFields readOnly={readOnly}>
        <ModalSection
          icon={<Pill className="size-4" />}
          title="Identificación"
          tone="mint"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Nombre Comercial"
              {...register('brandName')}
              error={errors.brandName?.message}
            />
            <TextField
              label="Nombre Genérico"
              {...register('genericName')}
              error={errors.genericName?.message}
            />
            <TextField
              label="Principio Activo"
              {...register('activeIngredient')}
              error={errors.activeIngredient?.message}
            />
          </div>
        </ModalSection>

        <ModalSection
          icon={<Pill className="size-4" />}
          title="Presentación y Dosis"
          tone="sky"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Presentación"
              required
              placeholder="Caja con tabletas"
              {...register('presentation')}
              error={errors.presentation?.message}
            />
            <TextField
              label="Unidad de Dosis"
              required
              placeholder="tableta, ml…"
              {...register('doseUnit')}
              error={errors.doseUnit?.message}
            />
            <TextField
              label="Unidades por Envase"
              type="number"
              min="0.01"
              step="any"
              required
              {...register('unitsPerPackage', { valueAsNumber: true })}
              error={errors.unitsPerPackage?.message}
            />
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
        submitLabel={medication ? 'Guardar Cambios' : 'Crear Medicamento'}
      />
    </form>
  )
}
