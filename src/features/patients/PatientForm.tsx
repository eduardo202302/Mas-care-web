import { Select } from '@/components/ui/Select'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import {
  ChevronDown,
  HeartPulse,
  MapPin,
  Phone,
  Pill,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { AddressMapPicker } from '@/components/AddressMapPicker'
import { CustomFields } from '@/components/CustomFields'
import {
  useCustomProperties,
  validateCustomValues,
} from '@/lib/custom-properties'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { useStatusDraftChanged } from '@/components/ui/StatusDraft'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { ApiError, api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components } from '@/lib/api-types'
import { DOCUMENT_INPUT_MAX_LENGTH, maskDocumentInput } from '@/lib/document'
import { PHONE_INPUT_MAX_LENGTH, maskPhoneInput } from '@/lib/phone'
import {
  patientCreateSchema,
  patientSchema,
  todayISO,
  type PatientFormValues,
} from '@/schemas/patient'
import { createTreatmentFromForm } from '@/lib/treatments'
import { newIdempotencyKey } from '@/lib/operations'
import { useUiStore } from '@/stores/ui-store'
import { PatientDoctorsPanel } from './PatientDoctorsPanel'
import { PatientConditionsPanel } from './PatientConditionsPanel'
import { PatientTreatmentsPanel } from './PatientTreatmentsPanel'
import {
  PendingConditionsPanel,
  PendingDoctorsPanel,
  PendingTreatmentsPanel,
  type PendingCondition,
  type PendingDoctor,
  type PendingTreatment,
} from './PendingRelationPanels'
import { RelationTabHeader } from './RelationParts'

function addressText(
  details: components['schemas']['Patient']['addressDetails'],
  key: string,
): string {
  const value = (details as Record<string, unknown> | null)?.[key]
  return typeof value === 'string' ? value : ''
}

/** Serializa de forma estable ignorando valores vacíos, para comparar cambios. */
function normalizeCustom(values: Record<string, unknown>): string {
  const entries = Object.entries(values)
    .filter(
      ([, v]) =>
        v !== undefined &&
        v !== null &&
        v !== '' &&
        !(Array.isArray(v) && v.length === 0),
    )
    .sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(entries)
}

type BranchOption = Pick<components['schemas']['Branch'], 'id' | 'name'>

type PatientTab = 'datos' | 'medicos' | 'tratamientos' | 'condiciones'

const controlClass =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

export function PatientForm({
  branches,
  patient,
  onSave,
  onCancel,
  submitting = false,
}: {
  branches: BranchOption[]
  patient?: components['schemas']['Patient']
  onSave: (values: PatientFormValues) => Promise<string | void>
  onCancel: () => void
  submitting?: boolean
}) {
  const canWrite = useCan('patients:write')
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  // Sucursal recomendada al crear: la del usuario (la que tiene activa) si puede
  // asignarla; si no, la primera a la que tiene acceso.
  const recommendedBranchId =
    branches.find((branch) => branch.id === activeBranchId)?.id ??
    branches[0]?.id ??
    ''
  const [activeTab, setActiveTab] = useState<PatientTab>('datos')
  const [medicosAddOpen, setMedicosAddOpen] = useState(false)
  const [condicionesAddOpen, setCondicionesAddOpen] = useState(false)
  const [tratamientosAddOpen, setTratamientosAddOpen] = useState(false)
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([])
  const [pendingConditions, setPendingConditions] = useState<
    PendingCondition[]
  >([])
  const [pendingTreatments, setPendingTreatments] = useState<
    PendingTreatment[]
  >([])
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null)
  // Al editar, los contadores de las pestañas salen de las mismas consultas
  // (y la misma caché) que usan los paneles de cada pestaña.
  const patientId = patient?.id ?? ''
  const linkedDoctors = useQuery({
    queryKey: ['patients', patientId, 'doctors'],
    queryFn: () =>
      api<{ data: unknown[] }>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors`,
      ),
    enabled: Boolean(patientId),
  })
  const linkedConditions = useQuery({
    queryKey: ['patients', patientId, 'conditions'],
    queryFn: () =>
      api<{ data: unknown[] }>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions`,
      ),
    enabled: Boolean(patientId),
  })
  const linkedTreatments = useQuery({
    queryKey: ['treatments', { patientId }],
    queryFn: () =>
      api<{ data: unknown[] }>(
        `/api/v1/treatments?patient_id=${encodeURIComponent(patientId)}&limit=15`,
      ),
    enabled: Boolean(patientId),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors, isDirty },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(
      (patient ? patientSchema : patientCreateSchema) as typeof patientSchema,
    ),
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
          address: addressText(patient.addressDetails, 'address'),
          state: addressText(patient.addressDetails, 'region'),
          city: addressText(patient.addressDetails, 'city'),
          sector: addressText(patient.addressDetails, 'sector'),
          latitude: addressText(patient.addressDetails, 'latitude'),
          longitude: addressText(patient.addressDetails, 'longitude'),
          preferredChannel: patient.preferredChannel,
          careNotes: patient.careNotes ?? '',
          responsibleUserId: patient.responsibleUserId ?? '',
        }
      : {
          fullName: '',
          primaryBranchId: recommendedBranchId,
          documentId: '',
          birthDate: '',
          phone: '',
          phoneHasWhatsapp: true,
          email: '',
          address: '',
          state: '',
          city: '',
          sector: '',
          latitude: '',
          longitude: '',
          preferredChannel: 'whatsapp',
          careNotes: '',
          responsibleUserId: '',
        },
  })

  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    (patient as { customValues?: Record<string, unknown> } | undefined)
      ?.customValues ?? {},
  )
  const [initialCustomValues] = useState(customValues)
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
  const customDefs = useCustomProperties('patient').data?.data ?? []

  const documentId = watch('documentId')
  const phone = watch('phone')
  const primaryBranchId = watch('primaryBranchId')
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
      return api<{ fields: ('documentId' | 'phone')[] }>(
        '/api/v1/patients/check-duplicates',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      )
    },
  })
  // Al editar, el documento y teléfono que ya son del propio paciente no cuentan como duplicado.
  const duplicateFields = (duplicateCheck.data?.fields ?? []).filter(
    (field) =>
      !patient ||
      (field === 'documentId'
        ? debouncedDuplicateInput.documentId !== (patient.documentId ?? '')
        : debouncedDuplicateInput.phone !== (patient.phone ?? '')),
  )
  const documentDuplicate = duplicateFields.includes('documentId')
  const phoneDuplicate = duplicateFields.includes('phone')

  async function commitPending(patientId: string) {
    const doctors = [...pendingDoctors]
    for (const item of doctors) {
      await api(`/api/v1/patients/${encodeURIComponent(patientId)}/doctors`, {
        method: 'POST',
        body: JSON.stringify({
          doctorId: item.doctorId,
          isPrimary: item.isPrimary,
          notes: item.notes || null,
        }),
      })
      setPendingDoctors((current) =>
        current.filter((d) => d.doctorId !== item.doctorId),
      )
    }
    const conditions = [...pendingConditions]
    for (const item of conditions) {
      await api(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions`,
        {
          method: 'POST',
          body: JSON.stringify({
            healthConditionId: item.healthConditionId,
            status: item.status,
            diagnosedOn: item.diagnosedOn || null,
            notes: item.notes || null,
            isPrimary: item.isPrimary,
          }),
        },
      )
      setPendingConditions((current) =>
        current.filter((c) => c.healthConditionId !== item.healthConditionId),
      )
    }
    const treatmentsToSend = [...pendingTreatments]
    const treatmentGroupId = newIdempotencyKey()
    for (const item of treatmentsToSend) {
      await createTreatmentFromForm(patientId, item.values, treatmentGroupId)
      setPendingTreatments((current) => current.filter((t) => t !== item))
    }
  }

  // Edición sin cambios en la pestaña Datos (campos + propiedades personalizadas).
  // Las demás pestañas se guardan por su cuenta vía API.
  const statusChanged = useStatusDraftChanged()
  const unchanged =
    Boolean(patient) &&
    !isDirty &&
    !statusChanged &&
    normalizeCustom(customValues) === normalizeCustom(initialCustomValues)

  async function submit(values: PatientFormValues) {
    const check = validateCustomValues(customDefs, customValues)
    if (!check.ok) {
      setCustomErrors(check.errors)
      return
    }
    setCustomErrors({})
    let patientId: string
    try {
      if (patient) {
        await onSave({ ...values, customValues: check.values })
        patientId = patient.id
      } else if (createdPatientId) {
        patientId = createdPatientId
      } else {
        const result = await onSave({ ...values, customValues: check.values })
        if (typeof result !== 'string')
          throw new Error('No pudimos obtener el ID del paciente creado.')
        patientId = result
        setCreatedPatientId(result)
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 400 || error.status === 409)
      ) {
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
      return
    }
    if (!patient) {
      try {
        await commitPending(patientId)
      } catch {
        setError('root.server' as FieldPath<PatientFormValues>, {
          type: 'server',
          message:
            'El paciente se guardó, pero no pudimos completar todas las relaciones pendientes (médicos, tratamientos o condiciones). Vuelve a guardar para terminar.',
        })
        return
      }
    }
    onCancel()
  }

  const control = controlClass

  const tabs: TabItem<PatientTab>[] = [
    { value: 'datos', label: 'Datos' },
    {
      value: 'medicos',
      label: 'Médicos',
      icon: <Stethoscope className="size-4" />,
      badge: patient ? linkedDoctors.data?.data.length : pendingDoctors.length,
    },
    {
      value: 'tratamientos',
      label: 'Tratamientos',
      icon: <Pill className="size-4" />,
      badge: patient
        ? linkedTreatments.data?.data.length
        : pendingTreatments.length,
    },
    {
      value: 'condiciones',
      label: 'Condiciones',
      icon: <HeartPulse className="size-4" />,
      badge: patient
        ? linkedConditions.data?.data.length
        : pendingConditions.length,
    },
  ]

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-5">
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
      {activeTab === 'datos' && (
        <>
          <ModalSection
            icon={<UserRound className="size-4" />}
            title="Identificación"
            collapsible
            defaultCollapsed
            forceOpen={Boolean(
              errors.fullName ||
              errors.documentId ||
              errors.birthDate ||
              documentDuplicate,
            )}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="Nombre Completo"
                  required
                  placeholder="Nombre y apellidos"
                  {...register('fullName')}
                  error={errors.fullName?.message}
                />
              </div>
              <TextField
                label="Documento"
                required={!patient}
                placeholder="DPI, cédula o pasaporte"
                maxLength={DOCUMENT_INPUT_MAX_LENGTH}
                {...register('documentId', {
                  onChange: (e) => {
                    e.target.value = maskDocumentInput(e.target.value)
                  },
                })}
                error={
                  errors.documentId?.message ??
                  (documentDuplicate
                    ? 'Ya existe un paciente con este documento.'
                    : undefined)
                }
              />
              <TextField
                label="Fecha de Nacimiento"
                type="date"
                min="1900-01-01"
                max={todayISO()}
                {...register('birthDate')}
                error={errors.birthDate?.message}
              />
            </div>
          </ModalSection>

          <ModalSection
            icon={<Phone className="size-4" />}
            title="Contacto"
            collapsible
            defaultCollapsed
            forceOpen={Boolean(errors.phone || errors.email || phoneDuplicate)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="WhatsApp"
                required={!patient}
                type="tel"
                placeholder="(809) 555-1234"
                maxLength={PHONE_INPUT_MAX_LENGTH}
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = maskPhoneInput(e.target.value)
                  },
                })}
                error={
                  errors.phone?.message ??
                  (phoneDuplicate
                    ? 'Ya existe un paciente con este teléfono.'
                    : undefined)
                }
              />
              <TextField
                label="Correo Electrónico"
                type="email"
                placeholder="paciente@correo.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
          </ModalSection>

          <ModalSection
            icon={<MapPin className="size-4" />}
            title="Dirección"
            collapsible
            defaultCollapsed
            forceOpen={Boolean(
              errors.address ||
              errors.state ||
              errors.city ||
              errors.sector ||
              errors.latitude ||
              errors.longitude,
            )}
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
                  setValue('latitude', next.latitude, { shouldDirty: true })
                  setValue('longitude', next.longitude, {
                    shouldDirty: true,
                  })
                }}
              />
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextAreaField
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
            icon={<Stethoscope className="size-4" />}
            title="Atención"
            collapsible
            defaultCollapsed
            forceOpen={Boolean(errors.primaryBranchId || errors.careNotes)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label
                  htmlFor="patient-branch"
                  className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
                >
                  Sucursal
                </label>
                <div className="relative">
                  <Select
                    id="patient-branch"
                    {...register('primaryBranchId')}
                    aria-invalid={Boolean(errors.primaryBranchId)}
                    aria-describedby={
                      errors.primaryBranchId
                        ? 'patient-branch-error'
                        : undefined
                    }
                    className={`${control} appearance-none pr-9`}
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
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
                {!patient &&
                  recommendedBranchId &&
                  primaryBranchId === recommendedBranchId && (
                    <p className="text-muted text-xs">
                      Sucursal recomendada: la tuya.
                    </p>
                  )}
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <label
                  htmlFor="patient-notes"
                  className="text-ink text-sm font-medium"
                >
                  Notas de Cuidado{' '}
                  <span className="text-muted font-normal">(Opcional)</span>
                </label>
                <TextAreaField
                  id="patient-notes"
                  className="min-h-8 py-1.5 text-xs"
                  placeholder="Alergias, indicaciones o detalles relevantes…"
                  {...register('careNotes')}
                />
                {errors.careNotes?.message && (
                  <p className="text-xs text-red-700">
                    {errors.careNotes.message}
                  </p>
                )}
              </div>
            </div>
          </ModalSection>
          <CustomFields
            entity="patient"
            values={customValues}
            errors={customErrors}
            onChange={setCustomValues}
          />
        </>
      )}

      {activeTab === 'medicos' && (
        <div className="grid gap-3">
          <RelationTabHeader
            description="Médicos asociados a este paciente."
            addLabel="Agregar Médico"
            canWrite={canWrite}
            onAdd={() => setMedicosAddOpen(true)}
          />
          {patient ? (
            <PatientDoctorsPanel
              patientId={patient.id}
              addOpen={medicosAddOpen}
              onCloseAdd={() => setMedicosAddOpen(false)}
            />
          ) : (
            <PendingDoctorsPanel
              pending={pendingDoctors}
              setPending={setPendingDoctors}
              addOpen={medicosAddOpen}
              onCloseAdd={() => setMedicosAddOpen(false)}
            />
          )}
        </div>
      )}

      {activeTab === 'tratamientos' && (
        <div className="grid gap-3">
          <RelationTabHeader
            description="Tratamientos de este paciente."
            addLabel="Agregar Tratamiento"
            canWrite={canWrite}
            onAdd={() => setTratamientosAddOpen(true)}
          />
          {patient ? (
            <PatientTreatmentsPanel
              patientId={patient.id}
              patientName={patient.fullName}
              defaultBranchId={patient.primaryBranchId}
              defaultResponsibleUserId={patient.responsibleUserId}
              addOpen={tratamientosAddOpen}
              onCloseAdd={() => setTratamientosAddOpen(false)}
            />
          ) : (
            <PendingTreatmentsPanel
              pending={pendingTreatments}
              setPending={setPendingTreatments}
              patientName={watch('fullName')}
              defaultBranchId={primaryBranchId}
              addOpen={tratamientosAddOpen}
              onCloseAdd={() => setTratamientosAddOpen(false)}
            />
          )}
        </div>
      )}

      {activeTab === 'condiciones' && (
        <div className="grid gap-3">
          <RelationTabHeader
            description="Condiciones de salud de este paciente."
            addLabel="Agregar Condición"
            canWrite={canWrite}
            onAdd={() => setCondicionesAddOpen(true)}
          />
          {patient ? (
            <PatientConditionsPanel
              patientId={patient.id}
              addOpen={condicionesAddOpen}
              onCloseAdd={() => setCondicionesAddOpen(false)}
            />
          ) : (
            <PendingConditionsPanel
              pending={pendingConditions}
              setPending={setPendingConditions}
              addOpen={condicionesAddOpen}
              onCloseAdd={() => setCondicionesAddOpen(false)}
            />
          )}
        </div>
      )}

      {errors.root?.server?.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
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
          disabled={
            submitting || unchanged || documentDuplicate || phoneDuplicate
          }
          title={unchanged ? 'No hay cambios para guardar' : undefined}
        >
          {submitting
            ? 'Guardando…'
            : patient
              ? 'Guardar Cambios'
              : 'Crear Paciente'}
        </Button>
      </FormActions>
    </form>
  )
}
