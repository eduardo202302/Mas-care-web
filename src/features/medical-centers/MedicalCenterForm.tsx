import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Building2, ChevronDown, MapPin, Phone } from 'lucide-react'
import { AddressMapPicker } from '@/components/AddressMapPicker'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { ApiError } from '@/lib/http'
import { maskPhoneInput, PHONE_INPUT_MAX_LENGTH } from '@/lib/phone'
import { maskRncInput, RNC_INPUT_MAX_LENGTH } from '@/lib/rnc'
import type { components } from '@/lib/api-types'
import {
  medicalCenterSchema,
  medicalCenterTypeLabels,
  medicalCenterTypes,
  type MedicalCenterFormValues,
} from '@/schemas/medicalCenter'

function addressText(
  details: components['schemas']['MedicalCenter']['addressDetails'],
  key: string,
): string {
  const value = (details as Record<string, unknown> | null)?.[key]
  return typeof value === 'string' ? value : ''
}

export function MedicalCenterForm({
  readOnly = false,
  onEdit,
  center,
  onSave,
  onCancel,
  submitting = false,
}: {
  center?: components['schemas']['MedicalCenter']
  onSave: (values: MedicalCenterFormValues) => Promise<void>
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
    setValue,
    getValues,
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
          address: addressText(center.addressDetails, 'address'),
          state: addressText(center.addressDetails, 'region'),
          city: addressText(center.addressDetails, 'city'),
          sector: addressText(center.addressDetails, 'sector'),
          latitude: addressText(center.addressDetails, 'latitude'),
          longitude: addressText(center.addressDetails, 'longitude'),
          notes: center.notes ?? '',
        }
      : {
          name: '',
          centerType: 'clinic',
          rnc: '',
          phone: '',
          email: '',
          address: '',
          state: '',
          city: '',
          sector: '',
          latitude: '',
          longitude: '',
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
    <form noValidate onSubmit={handleSubmit(submit)} className="grid gap-5">
      <FormFields readOnly={readOnly}>
        <ModalSection
          icon={<Building2 className="size-4" />}
          title="Datos Generales"
        >
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
              <label
                htmlFor="center-type"
                className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
              >
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
              required
              inputMode="numeric"
              placeholder="101-01234-5"
              maxLength={RNC_INPUT_MAX_LENGTH}
              {...register('rnc')}
              onChange={(event) =>
                setValue('rnc', maskRncInput(event.target.value), {
                  shouldDirty: true,
                })
              }
              error={errors.rnc?.message}
            />
            <div className="sm:col-span-2">
              <TextAreaField
                label="Notas"
                id="center-notes"
                {...register('notes')}
                error={errors.notes?.message}
              />
            </div>
          </div>
        </ModalSection>
        <ModalSection icon={<Phone className="size-4" />} title="Contacto">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Teléfono"
              required
              type="tel"
              inputMode="tel"
              placeholder="(809) 555-1234"
              maxLength={PHONE_INPUT_MAX_LENGTH}
              {...register('phone')}
              onChange={(event) =>
                setValue('phone', maskPhoneInput(event.target.value), {
                  shouldDirty: true,
                })
              }
              error={errors.phone?.message}
            />
            <TextField
              label="Correo electrónico"
              required
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
        </ModalSection>
        <ModalSection
          icon={<MapPin className="size-4" />}
          title="Dirección"
          action={
            <AddressMapPicker
              getValues={() => ({
                address: getValues('address') ?? '',
                city: getValues('city') ?? '',
                state: getValues('state') ?? '',
                sector: getValues('sector') ?? '',
                latitude: getValues('latitude') ?? '',
                longitude: getValues('longitude') ?? '',
              })}
              onApply={(next) => {
                setValue('address', next.address, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue('city', next.city, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue('state', next.state, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue('sector', next.sector, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue('latitude', next.latitude, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setValue('longitude', next.longitude, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label="Dirección"
                required
                placeholder="G5CJ+2X Santo Domingo Este"
                {...register('address')}
                error={errors.address?.message}
              />
            </div>
            <TextField
              label="Región"
              required
              {...register('state')}
              error={errors.state?.message}
            />
            <TextField
              label="Ciudad"
              required
              {...register('city')}
              error={errors.city?.message}
            />
            <TextField
              label="Sector"
              required
              {...register('sector')}
              error={errors.sector?.message}
            />
            <TextField
              label="Latitud"
              required
              placeholder="14.6349"
              {...register('latitude')}
              error={errors.latitude?.message}
            />
            <TextField
              label="Longitud"
              required
              placeholder="-90.5069"
              {...register('longitude')}
              error={errors.longitude?.message}
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
        submitLabel={center ? 'Guardar cambios' : 'Crear centro médico'}
      />
    </form>
  )
}
