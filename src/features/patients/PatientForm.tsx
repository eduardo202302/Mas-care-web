import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { CustomFields } from '@/components/CustomFields'
import { useCustomProperties, validateCustomValues } from '@/lib/custom-properties'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import { api } from '@/lib/http'
import type { components, paths } from '@/lib/api-types'
import { patientSchema, type PatientFormValues } from '@/schemas/patient'

type BranchOption = Pick<components['schemas']['Branch'], 'id' | 'name'>

export function PatientForm({
  branches,
  patient,
  onSave,
  onCancel,
  submitting = false,
}: {
  branches: BranchOption[]
  patient?: components['schemas']['Patient']
  onSave: (values: PatientFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          fullName: patient.fullName,
          primaryBranchId: patient.primaryBranchId,
          documentId: patient.documentId ?? '',
          // The API returns an ISO timestamp; <input type="date"> needs YYYY-MM-DD.
          birthDate: patient.birthDate?.slice(0, 10) ?? '',
          phone: patient.phone ?? '',
          phoneHasWhatsapp: patient.phoneHasWhatsapp,
          email: patient.email ?? '',
          address: patient.address ?? '',
          zone: patient.zone ?? '',
          preferredChannel: patient.preferredChannel,
          careNotes: patient.careNotes ?? '',
          responsibleUserId: patient.responsibleUserId ?? '',
        }
      : {
          fullName: '',
          primaryBranchId: branches[0]?.id ?? '',
          documentId: '',
          birthDate: '',
          phone: '',
          phoneHasWhatsapp: false,
          email: '',
          address: '',
          zone: '',
          preferredChannel: 'whatsapp',
          careNotes: '',
          responsibleUserId: '',
        },
  })

  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    ((patient as { customValues?: Record<string, unknown> } | undefined)?.customValues) ?? {},
  )
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
  const customDefs = useCustomProperties('patient').data?.data ?? []

  const documentId = watch('documentId')
  const phone = watch('phone')
  const [debouncedDuplicateInput, setDebouncedDuplicateInput] = useState({
    documentId: '',
    phone: '',
  })
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedDuplicateInput({
        documentId: documentId?.trim() ?? '',
        phone: phone?.trim() ?? '',
      })
    }, 450)
    return () => window.clearTimeout(timer)
  }, [documentId, phone])
  const duplicateCheck = useQuery({
    queryKey: [
      'patient-duplicates',
      debouncedDuplicateInput.documentId,
      debouncedDuplicateInput.phone,
    ],
    enabled:
      debouncedDuplicateInput.documentId.length > 0 ||
      debouncedDuplicateInput.phone.length >= 5,
    queryFn: () => {
      const body: components['schemas']['PatientDuplicateCheck'] = {
        ...(debouncedDuplicateInput.documentId
          ? { documentId: debouncedDuplicateInput.documentId }
          : {}),
        ...(debouncedDuplicateInput.phone
          ? { phone: debouncedDuplicateInput.phone }
          : {}),
      }
      type DuplicateResponse =
        paths['/api/v1/patients/check-duplicates']['post']['responses'][200]['content']['application/json']
      return api<DuplicateResponse>('/api/v1/patients/check-duplicates', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
  })
  const possibleDuplicates = (duplicateCheck.data?.data ?? []).filter(
    (duplicate) => duplicate.id !== patient?.id,
  )

  async function submit(values: PatientFormValues) {
    const check = validateCustomValues(customDefs, customValues)
    if (!check.ok) {
      setCustomErrors(check.errors)
      return
    }
    setCustomErrors({})
    try {
      await onSave({ ...values, customValues: check.values })
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const fields = error.fields
        if (fields && typeof fields === 'object') {
          for (const [key, message] of Object.entries(fields)) {
            if (key in patientSchema.shape && typeof message === 'string')
              setError(key as FieldPath<PatientFormValues>, {
                type: 'server',
                message,
              })
            else if (typeof message === 'string')
              setCustomErrors((current) => ({ ...current, [key]: message }))
          }
        }
      } else {
        setError('root.server' as FieldPath<PatientFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar al paciente.',
        })
      }
    }
  }

  const fieldClass =
    'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400'

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-6">
      {possibleDuplicates.length > 0 && (
        <aside
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-950"
          role="status"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">Posible paciente duplicado</p>
            <p className="mt-0.5 text-xs text-amber-900/80">
              Revisa estas fichas antes de continuar.
            </p>
            <ul className="mt-2 grid gap-1">
              {possibleDuplicates.map((duplicate) => (
                <li key={duplicate.id}>
                  <Link
                    className="font-medium underline underline-offset-2"
                    to={`/pacientes/${encodeURIComponent(duplicate.id)}`}
                    target="_blank"
                  >
                    {duplicate.fullName} · revisar ficha
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
      <section className="grid gap-4">
        <div className="border-border border-b pb-2">
          <h3 className="text-petroleo text-sm font-semibold">
            Identificación
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Nombre completo"
              required
              placeholder="Nombre y apellidos"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
          </div>
          <TextField
            label="Documento"
            placeholder="DPI, cédula o pasaporte"
            {...register('documentId')}
            error={errors.documentId?.message}
          />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            {...register('birthDate')}
            error={errors.birthDate?.message}
          />
        </div>
      </section>
      <section className="grid gap-4">
        <div className="border-border border-b pb-2">
          <h3 className="text-petroleo text-sm font-semibold">Contacto</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Teléfono"
            type="tel"
            placeholder="+502 5555 5555"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <TextField
            label="Correo electrónico"
            type="email"
            placeholder="paciente@correo.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <label className="border-border bg-surface/50 hover:border-tealmax/40 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition sm:col-span-2">
            <input
              type="checkbox"
              className="accent-tealmax mt-0.5 size-4 shrink-0 cursor-pointer"
              checked={watch('phoneHasWhatsapp')}
              onChange={(event) =>
                setValue('phoneHasWhatsapp', event.target.checked)
              }
            />
            <span>
              <span className="text-ink block text-sm font-medium">
                Este teléfono tiene WhatsApp
              </span>
              <span className="text-muted block text-xs">
                Lo usaremos para recordatorios y confirmaciones.
              </span>
            </span>
          </label>
          <TextField
            label="Dirección"
            placeholder="Calle, número y colonia"
            {...register('address')}
            error={errors.address?.message}
          />
          <TextField
            label="Zona"
            placeholder="Zona o municipio"
            {...register('zone')}
            error={errors.zone?.message}
          />
        </div>
      </section>
      <section className="grid gap-4">
        <div className="border-border border-b pb-2">
          <h3 className="text-petroleo text-sm font-semibold">Atención</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label
              htmlFor="patient-branch"
              className="text-ink text-sm font-medium"
            >
              Sucursal
            </label>
            <div className="relative">
              <select
                id="patient-branch"
                {...register('primaryBranchId')}
                aria-invalid={Boolean(errors.primaryBranchId)}
                aria-describedby={
                  errors.primaryBranchId ? 'patient-branch-error' : undefined
                }
                className={`${fieldClass} h-10 appearance-none pr-9`}
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
            {errors.primaryBranchId?.message && (
              <p id="patient-branch-error" className="text-xs text-red-700">
                {errors.primaryBranchId.message}
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <label
              htmlFor="patient-channel"
              className="text-ink text-sm font-medium"
            >
              Canal preferido
            </label>
            <div className="relative">
              <select
                id="patient-channel"
                {...register('preferredChannel')}
                className={`${fieldClass} h-10 appearance-none pr-9`}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="call">Llamada</option>
                <option value="sms">SMS</option>
                <option value="telegram">Telegram</option>
              </select>
              <ChevronDown
                className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
            <p className="text-muted text-xs">
              Cómo preferimos contactar al paciente.
            </p>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <label
              htmlFor="patient-notes"
              className="text-ink text-sm font-medium"
            >
              Notas de cuidado
            </label>
            <textarea
              id="patient-notes"
              rows={4}
              placeholder="Alergias, indicaciones o detalles relevantes…"
              {...register('careNotes')}
              className={`${fieldClass} min-h-24 resize-y py-2.5`}
            />
            {errors.careNotes?.message && (
              <p className="text-xs text-red-700">{errors.careNotes.message}</p>
            )}
          </div>
        </div>
      </section>
      {errors.root?.server?.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {errors.root.server.message}
        </p>
      )}
      <CustomFields
        entity="patient"
        values={customValues}
        errors={customErrors}
        onChange={setCustomValues}
      />
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
            : patient
              ? 'Guardar cambios'
              : 'Crear paciente'}
        </Button>
      </FormActions>
    </form>
  )
}
