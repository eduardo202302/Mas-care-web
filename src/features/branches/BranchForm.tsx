import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { Building2, MapPin, Palette, UserRound } from 'lucide-react'
import { AddressMapPicker } from '@/components/AddressMapPicker'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { ModalSection } from '@/components/ui/ModalSection'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { PHONE_INPUT_MAX_LENGTH, maskPhoneInput } from '@/lib/phone'
import { branchSchema, type BranchFormValues } from '@/schemas/branch'

/** Mismo control que el resto de la app: alto fijo, borde y anillo de foco. */
const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'

type BranchTab = 'datos' | 'encargado'

const fieldKeys = [
  'name',
  'labelColor',
  'address',
  'city',
  'state',
  'postalCode',
  'sector',
  'latitude',
  'longitude',
  'description',
  'managerName',
  'managerPhone',
  'managerEmail',
] as const

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
  const [activeTab, setActiveTab] = useState<BranchTab>('datos')
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialValues ?? {
      name: '',
      labelColor: '#0e7c86',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      sector: '',
      latitude: '',
      longitude: '',
      description: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
    },
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
            (fieldKeys as readonly string[]).includes(key) &&
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

  const tabs: TabItem<BranchTab>[] = [
    { value: 'datos', label: 'Datos', icon: <Building2 className="size-4" /> },
    {
      value: 'encargado',
      label: 'Encargado',
      icon: <UserRound className="size-4" />,
    },
  ]

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(submit)} noValidate>
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
      <FormFields readOnly={readOnly}>
        {activeTab === 'datos' && (
          <>
            <ModalSection
              icon={<Building2 className="size-4" />}
              title="Datos de la Sucursal"
            >
              <TextField
                label="Nombre de Sucursal"
                required
                {...register('name')}
                error={errors.name?.message}
                placeholder="Sucursal Centro"
              />
              <TextAreaField
                label="Descripción (Opcional)"
                className="min-h-8 py-1.5 text-xs"
                placeholder="Detalles relevantes sobre esta sucursal…"
                error={errors.description?.message}
                {...register('description')}
              />
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
                    setValue('address', next.address, { shouldDirty: true })
                    setValue('city', next.city, { shouldDirty: true })
                    setValue('state', next.state, { shouldDirty: true })
                    setValue('sector', next.sector, { shouldDirty: true })
                    setValue('latitude', next.latitude, {
                      shouldDirty: true,
                    })
                    setValue('longitude', next.longitude, {
                      shouldDirty: true,
                    })
                  }}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextField
                    label="Dirección"
                    placeholder="G5CJ+2X Santo Domingo Este"
                    {...register('address')}
                    error={errors.address?.message}
                  />
                </div>
                <TextField
                  label="Región"
                  {...register('state')}
                  error={errors.state?.message}
                />
                <TextField
                  label="Ciudad"
                  {...register('city')}
                  error={errors.city?.message}
                />
                <TextField
                  label="Sector"
                  {...register('sector')}
                  error={errors.sector?.message}
                />
                <TextField
                  label="Latitud"
                  placeholder="14.6349"
                  {...register('latitude')}
                  error={errors.latitude?.message}
                />
                <TextField
                  label="Longitud"
                  placeholder="-90.5069"
                  {...register('longitude')}
                  error={errors.longitude?.message}
                />
              </div>
            </ModalSection>

            <ModalSection
              icon={<Palette className="size-4" />}
              title="Etiqueta de Color"
            >
              <div className="grid gap-1.5">
                <label
                  htmlFor="labelColor"
                  className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
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
          </>
        )}

        {activeTab === 'encargado' && (
          <ModalSection
            icon={<UserRound className="size-4" />}
            title="Encargado de la Sucursal"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="Nombre del Encargado"
                  placeholder="Nombre y apellidos"
                  {...register('managerName')}
                  error={errors.managerName?.message}
                />
              </div>
              <TextField
                label="WhatsApp"
                type="tel"
                placeholder="(809) 555-1234"
                inputMode="tel"
                maxLength={PHONE_INPUT_MAX_LENGTH}
                {...register('managerPhone', {
                  onChange: (e) => {
                    e.target.value = maskPhoneInput(e.target.value)
                  },
                })}
                error={errors.managerPhone?.message}
              />
              <TextField
                label="Correo Electrónico"
                type="email"
                placeholder="encargado@correo.com"
                {...register('managerEmail')}
                error={errors.managerEmail?.message}
              />
            </div>
          </ModalSection>
        )}

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
