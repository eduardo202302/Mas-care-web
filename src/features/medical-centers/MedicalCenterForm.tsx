import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Building2, ChevronDown, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  medicalCenterSchema,
  medicalCenterTypeLabels,
  medicalCenterTypes,
  type MedicalCenterFormValues,
} from '@/schemas/medicalCenter'

export function MedicalCenterForm({
  center,
  onSave,
  onCancel,
  submitting = false,
}: {
  center?: components['schemas']['MedicalCenter']
  onSave: (values: MedicalCenterFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MedicalCenterFormValues>({
    resolver: zodResolver(medicalCenterSchema),
    defaultValues: center
      ? {
          name: center.name,
          centerType: center.centerType,
          rnc: center.rnc ?? '',
          phone: center.phone ?? '',
          email: center.email ?? '',
          address: center.address ?? '',
          province: center.province ?? '',
          municipality: center.municipality ?? '',
          notes: center.notes ?? '',
        }
      : {
          name: '',
          centerType: 'clinic',
          rnc: '',
          phone: '',
          email: '',
          address: '',
          province: '',
          municipality: '',
          notes: '',
        },
  })

  async function submit(values: MedicalCenterFormValues) {
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
          if (key in medicalCenterSchema.shape && typeof message === 'string')
            setError(key as FieldPath<MedicalCenterFormValues>, {
              type: 'server',
              message,
            })
        }
      } else {
        setError('root.server' as FieldPath<MedicalCenterFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar el centro médico.',
        })
      }
    }
  }

  const fieldClass =
    'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400'

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5">
      <ModalSection icon={<Building2 className="size-4" />} title="Datos generales" tone="mint">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Nombre"
              required
              placeholder="Hospital General"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="center-type" className="text-ink text-sm font-medium">
              Tipo
            </label>
            <div className="relative">
              <select
                id="center-type"
                {...register('centerType')}
                className={`${fieldClass} appearance-none pr-9`}
              >
                {medicalCenterTypes.map((type) => (
                  <option key={type} value={type}>
                    {medicalCenterTypeLabels[type]}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>
          <TextField
            label="RNC"
            {...register('rnc')}
            error={errors.rnc?.message}
          />
          <div className="grid gap-1.5 sm:col-span-2">
            <label htmlFor="center-notes" className="text-ink text-sm font-medium">
              Notas
            </label>
            <textarea
              id="center-notes"
              rows={3}
              {...register('notes')}
              className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 rounded-lg border bg-white px-3 py-2 text-sm transition outline-none focus:ring-2"
            />
            {errors.notes?.message && (
              <p className="text-xs text-red-700">{errors.notes.message}</p>
            )}
          </div>
        </div>
      </ModalSection>
      <ModalSection icon={<Phone className="size-4" />} title="Contacto" tone="sky">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Teléfono"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <TextField
            label="Correo electrónico"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
      </ModalSection>
      <ModalSection icon={<MapPin className="size-4" />} title="Ubicación" tone="amber">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Dirección"
              {...register('address')}
              error={errors.address?.message}
            />
          </div>
          <TextField
            label="Provincia"
            {...register('province')}
            error={errors.province?.message}
          />
          <TextField
            label="Municipio"
            {...register('municipality')}
            error={errors.municipality?.message}
          />
        </div>
      </ModalSection>
      {errors.root?.server?.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
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
            : center
              ? 'Guardar cambios'
              : 'Crear centro médico'}
        </Button>
      </FormActions>
    </form>
  )
}
