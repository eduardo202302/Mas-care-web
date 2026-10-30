import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import {
  Briefcase,
  Building2,
  ChevronDown,
  Link as LinkIcon,
  MapPin,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import {
  companyFormSchema,
  companyIndustries,
  companyLinks,
  companyStatuses,
  companyTypes,
  generateCompanyPin,
  normalizeCompanyDomain,
  type CompanyFormValues,
} from '@/schemas/company'
import { LinkField } from './CopyLink'

type Props = {
  mode?: 'create' | 'edit'
  initialValues?: CompanyFormValues
  linkToken?: string
  onLogoChange?: (logo: string | null) => Promise<void>
  onSave: (values: CompanyFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

const fieldClass =
  'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400'

const statusLabels = {
  active: 'Activa',
  inactive: 'Inactiva',
} as const

const MAX_LOGO_FILE_BYTES = 5 * 1024 * 1024
const MAX_LOGO_DATA_URL_LENGTH = 400_000
const LOGO_SIZE = 256

async function imageFileToLogo(file: File) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, LOGO_SIZE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Canvas no disponible')
  }
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return canvas.toDataURL('image/webp', 0.9)
}

export function CompanyForm({
  mode = 'create',
  initialValues,
  linkToken,
  onLogoChange,
  onSave,
  onCancel,
  submitting = false,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: initialValues ?? {
      name: '',
      email: '',
      logo: '',
      status: 'active',
      pin: generateCompanyPin(),
      domain: '',
      phone: '',
      ownerName: '',
      industry: '',
      type: '',
      city: '',
      state: '',
      postalCode: '',
      employeeCount: '',
      annualRevenue: '',
      timezone: '',
      description: '',
      linkedinUrl: '',
    },
  })

  const logoInput = useRef<HTMLInputElement>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [processingLogo, setProcessingLogo] = useState(false)
  const domain = watch('domain')
  const logo = watch('logo')
  const links = companyLinks(domain, linkToken ?? '')

  async function handleLogoFile(file: File | undefined) {
    if (!file) return
    setLogoError(null)
    if (!file.type.startsWith('image/')) {
      setLogoError('Selecciona una imagen PNG, JPG o WebP.')
      return
    }
    if (file.size > MAX_LOGO_FILE_BYTES) {
      setLogoError('La imagen supera los 5 MB.')
      return
    }
    const previous = logo
    setProcessingLogo(true)
    try {
      const dataUrl = await imageFileToLogo(file)
      if (dataUrl.length > MAX_LOGO_DATA_URL_LENGTH) {
        setLogoError(
          'La imagen es demasiado grande. Prueba con una más pequeña.',
        )
        return
      }
      setValue('logo', dataUrl, { shouldDirty: true, shouldValidate: true })
      if (onLogoChange) {
        try {
          await onLogoChange(dataUrl)
        } catch {
          setValue('logo', previous, {
            shouldDirty: true,
            shouldValidate: true,
          })
          setLogoError('No pudimos guardar el logo. Inténtalo de nuevo.')
        }
      }
    } catch {
      setLogoError('No pudimos procesar la imagen. Prueba con otro archivo.')
    } finally {
      setProcessingLogo(false)
    }
  }

  async function handleRemoveLogo() {
    const previous = logo
    setLogoError(null)
    setValue('logo', '', { shouldDirty: true, shouldValidate: true })
    if (!onLogoChange) return
    setProcessingLogo(true)
    try {
      await onLogoChange(null)
    } catch {
      setValue('logo', previous, { shouldDirty: true, shouldValidate: true })
      setLogoError('No pudimos quitar el logo. Inténtalo de nuevo.')
    } finally {
      setProcessingLogo(false)
    }
  }

  async function submit(values: CompanyFormValues) {
    try {
      await onSave({
        ...values,
        email: values.email.trim().toLowerCase(),
        logo: values.logo.trim(),
        domain: normalizeCompanyDomain(values.domain) || values.domain,
      })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in companyFormSchema.shape && typeof message === 'string') {
            setError(key as FieldPath<CompanyFormValues>, {
              type: 'server',
              message,
            })
          }
        }
      } else {
        setError('root.server', {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar la compañía.',
        })
      }
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <ModalSection
        icon={<Building2 className="size-4" />}
        title="Información básica"
        tone="mint"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="border-border bg-surface grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border">
            {logo ? (
              <img
                src={logo}
                alt="Logo de la compañía"
                className="size-full object-cover"
              />
            ) : (
              <Building2 className="text-muted size-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <input
              ref={logoInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                void handleLogoFile(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => logoInput.current?.click()}
                disabled={processingLogo}
              >
                <Upload className="size-4" />
                {processingLogo
                  ? 'Procesando…'
                  : logo
                    ? 'Cambiar logo'
                    : 'Subir logo'}
              </Button>
              {logo && (
                <Button
                  type="button"
                  disabled={processingLogo}
                  onClick={() => {
                    void handleRemoveLogo()
                  }}
                >
                  <Trash2 className="size-4" />
                  Quitar
                </Button>
              )}
            </div>
            <p className="text-muted mt-2 text-xs">
              PNG, JPG o WebP. Máximo 5 MB.{' '}
              {onLogoChange
                ? 'El logo se guarda al seleccionarlo.'
                : 'Se guarda al pulsar Guardar cambios.'}
            </p>
            {(logoError || errors.logo?.message) && (
              <p role="alert" className="mt-1 text-xs text-red-700">
                {logoError ?? errors.logo?.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Nombre"
            required
            placeholder="Farmacia Los Valles"
            {...register('name')}
            error={errors.name?.message}
          />
          <TextField
            label="Correo electrónico"
            type="email"
            required
            placeholder="contacto@farmacia.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <TextField
            label="Teléfono"
            type="tel"
            placeholder="+52 55 1234 5678"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="company-status"
            className="text-ink text-sm font-medium"
          >
            Estado
          </label>
          <div className="relative">
            <select
              id="company-status"
              {...register('status')}
              aria-invalid={Boolean(errors.status)}
              className={`${fieldClass} h-10 appearance-none pr-9`}
            >
              {companyStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
            <ChevronDown
              className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="company-pin" className="text-ink text-sm font-medium">
            PIN
          </label>
          <div className="flex gap-2">
            <input
              id="company-pin"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              {...register('pin')}
              aria-invalid={Boolean(errors.pin)}
              aria-describedby={
                errors.pin ? 'company-pin-error' : 'company-pin-help'
              }
              className={`${fieldClass} h-10 min-w-0 flex-1 font-mono tracking-[0.3em]`}
            />
            <Button
              type="button"
              className="shrink-0 px-3"
              onClick={() =>
                setValue('pin', generateCompanyPin(), { shouldValidate: true })
              }
            >
              <RefreshCw className="size-4" />
              Generar
            </Button>
          </div>
          {errors.pin?.message ? (
            <p id="company-pin-error" className="text-xs text-red-700">
              {errors.pin.message}
            </p>
          ) : (
            <p id="company-pin-help" className="text-muted text-xs">
              Identificador interno de la compañía. También forma parte de los
              enlaces.
            </p>
          )}
        </div>
      </ModalSection>

      <ModalSection
        icon={<Briefcase className="size-4" />}
        title="Perfil de la empresa"
        tone="sky"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Propietario de la empresa"
            placeholder="Eduardo Vallejo"
            {...register('ownerName')}
            error={errors.ownerName?.message}
          />
          <div className="grid gap-1.5">
            <label
              htmlFor="company-industry"
              className="text-ink text-sm font-medium"
            >
              Industria
            </label>
            <div className="relative">
              <select
                id="company-industry"
                {...register('industry')}
                aria-invalid={Boolean(errors.industry)}
                className={`${fieldClass} h-10 appearance-none pr-9`}
              >
                <option value="">Selecciona una opción</option>
                {companyIndustries.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <label
              htmlFor="company-type"
              className="text-ink text-sm font-medium"
            >
              Tipo
            </label>
            <div className="relative">
              <select
                id="company-type"
                {...register('type')}
                aria-invalid={Boolean(errors.type)}
                className={`${fieldClass} h-10 appearance-none pr-9`}
              >
                <option value="">Selecciona una opción</option>
                {companyTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
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
            label="Número de empleados"
            type="number"
            min={0}
            {...register('employeeCount')}
            error={errors.employeeCount?.message}
          />
          <TextField
            label="Ingresos anuales"
            type="number"
            min={0}
            {...register('annualRevenue')}
            error={errors.annualRevenue?.message}
          />
        </div>
        <TextField
          label="Descripción"
          {...register('description')}
          error={errors.description?.message}
        />
        <TextField
          label="Página de empresa en LinkedIn"
          placeholder="https://www.linkedin.com/company/..."
          {...register('linkedinUrl')}
          error={errors.linkedinUrl?.message}
        />
      </ModalSection>

      <ModalSection
        icon={<MapPin className="size-4" />}
        title="Ubicación"
        tone="amber"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Ciudad"
            {...register('city')}
            error={errors.city?.message}
          />
          <TextField
            label="Estado/Región"
            {...register('state')}
            error={errors.state?.message}
          />
          <TextField
            label="Código Postal"
            {...register('postalCode')}
            error={errors.postalCode?.message}
          />
          <TextField
            label="Huso horario"
            placeholder="America/Mexico_City"
            {...register('timezone')}
            error={errors.timezone?.message}
          />
        </div>
      </ModalSection>

      <ModalSection
        icon={<LinkIcon className="size-4" />}
        title="Links"
        tone="mint"
      >
        <div className="grid gap-1.5">
          <TextField
            label="Dominio"
            required
            placeholder="https://farmacia.com"
            {...register('domain')}
            error={errors.domain?.message}
          />
          <p className="text-muted text-xs">
            Los enlaces se generan automáticamente a partir de este dominio.
          </p>
        </div>
        <LinkField
          label="Link para registrarse"
          value={links.registrationLink}
        />
        <LinkField label="Link para iniciar sesión" value={links.loginLink} />
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
            ? mode === 'edit'
              ? 'Guardando…'
              : 'Creando…'
            : mode === 'edit'
              ? 'Guardar cambios'
              : 'Crear compañía'}
        </Button>
      </FormActions>
    </form>
  )
}
