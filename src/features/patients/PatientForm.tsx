import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  HeartPulse,
  MapPin,
  Package,
  Phone,
  Pill,
  Plus,
  RefreshCw,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react'
import { AddressMapPicker } from '@/components/AddressMapPicker'
import { CustomFields } from '@/components/CustomFields'
import {
  useCustomProperties,
  validateCustomValues,
} from '@/lib/custom-properties'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { ApiError, api } from '@/lib/http'
import { boardColumnLabels, boardColumns, type BoardColumnKey } from '@/lib/board'
import { usePipeline } from '@/lib/pipeline'
import { useCan } from '@/lib/permissions'
import type { components, paths } from '@/lib/api-types'
import { patientSchema, type PatientFormValues } from '@/schemas/patient'
import type { DoctorFormValues } from '@/schemas/doctor'
import type { HealthConditionFormValues } from '@/schemas/healthCondition'
import { DoctorForm } from '@/features/doctors/DoctorForm'
import {
  syncDoctorMedicalCenters,
  syncDoctorSpecialties,
} from '@/features/doctors/doctorLinks'
import { HealthConditionForm } from '@/features/health-conditions/HealthConditionForm'
import { medicationName } from '@/lib/treatments'
import { PatientDoctorsPanel } from './PatientDoctorsPanel'
import {
  PatientConditionsPanel,
  conditionStatusLabels,
} from './PatientConditionsPanel'
import { PatientTreatmentsPanel } from './PatientTreatmentsPanel'

function addressText(
  details: components['schemas']['Patient']['addressDetails'],
  key: string,
): string {
  const value = (details as Record<string, unknown> | null)?.[key]
  return typeof value === 'string' ? value : ''
}

type BranchOption = Pick<components['schemas']['Branch'], 'id' | 'name'>
type ConditionStatus = components['schemas']['PatientConditionLink']['status']
type DoctorList =
  paths['/api/v1/doctors']['get']['responses'][200]['content']['application/json']
type HealthConditionList =
  paths['/api/v1/health-conditions']['get']['responses'][200]['content']['application/json']
type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']
type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

type PendingDoctor = {
  doctorId: string
  name: string
  isPrimary: boolean
  notes: string
}
type PendingCondition = {
  healthConditionId: string
  name: string
  status: ConditionStatus
  diagnosedOn: string
  notes: string
}
type PendingTreatment = {
  name: string
  status: BoardColumnKey
  type: string
  priority: string
  branchId: string
  medicationId: string
  medicationLabel: string
  responsibleUserId: string
  quantityPerCycle: string
  coverageEndOn: string
}

type PatientTab = 'datos' | 'medicos' | 'tratamientos' | 'condiciones'

const controlClass =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

const stageOptions = boardColumns.filter((key) => key !== 'closed')

const cycleTypeOptions = [
  { value: 'regular', label: 'Regular' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'special', label: 'Especial' },
] as const

const cyclePriorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
] as const

function PendingDoctorsEditor({
  pending,
  setPending,
}: {
  pending: PendingDoctor[]
  setPending: Dispatch<SetStateAction<PendingDoctor[]>>
}) {
  const queryClient = useQueryClient()
  const canWriteDoctors = useCan('doctors:write')
  const [doctorId, setDoctorId] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [notes, setNotes] = useState('')
  const [doctorFormOpen, setDoctorFormOpen] = useState(false)

  const doctorOptions = useQuery({
    queryKey: ['doctors', 'picker'],
    queryFn: () => api<DoctorList>('/api/v1/doctors?isActive=true&rows=100'),
  })
  const createDoctor = useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      const doctor = await api<components['schemas']['Doctor']>(
        '/api/v1/doctors',
        {
          method: 'POST',
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            licenseNumber: values.licenseNumber || null,
            phone: values.phone || null,
            email: values.email || null,
            notes: values.notes || null,
          }),
        },
      )
      await syncDoctorSpecialties(doctor.id, [], values.specialtyIds)
      await syncDoctorMedicalCenters(doctor.id, [], values.medicalCenterIds)
      return doctor
    },
    onSuccess: async (doctor) => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      setDoctorFormOpen(false)
      setDoctorId(doctor.id)
    },
  })

  const hasPrimary = pending.some((item) => item.isPrimary)
  const pendingIds = new Set(pending.map((item) => item.doctorId))
  const availableDoctors = (doctorOptions.data?.data ?? []).filter(
    (doctor) => !pendingIds.has(doctor.id),
  )

  function addPending() {
    const doctor = (doctorOptions.data?.data ?? []).find(
      (item) => item.id === doctorId,
    )
    if (!doctor) return
    setPending((current) => [
      ...current,
      {
        doctorId,
        name: `${doctor.firstName} ${doctor.lastName}`,
        isPrimary: hasPrimary ? false : isPrimary,
        notes: notes.trim(),
      },
    ])
    setDoctorId('')
    setIsPrimary(false)
    setNotes('')
  }

  return (
    <div className="grid gap-4">
      {pending.length > 0 && (
        <ul className="grid gap-2">
          {pending.map((item) => (
            <li
              key={item.doctorId}
              className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
            >
              <div>
                <p className="text-ink text-sm font-medium">
                  {item.name}
                  {item.isPrimary && (
                    <span className="bg-tealmax/10 text-tealmax ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                      Principal
                    </span>
                  )}
                </p>
                {item.notes && (
                  <p className="text-muted text-xs">{item.notes}</p>
                )}
              </div>
              <button
                type="button"
                title="Quitar"
                onClick={() =>
                  setPending((current) =>
                    current.filter((d) => d.doctorId !== item.doctorId),
                  )
                }
                className="text-muted shrink-0 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <label
            htmlFor="pending-doctor"
            className="text-ink text-sm font-medium"
          >
            Médico
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="pending-doctor"
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              disabled={doctorOptions.isPending}
              className={`${controlClass} min-w-0 flex-1`}
            >
              <option value="">
                {doctorOptions.isPending
                  ? 'Cargando médicos…'
                  : availableDoctors.length
                    ? 'Selecciona un médico existente'
                    : 'No hay médicos disponibles'}
              </option>
              {availableDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
            {canWriteDoctors && (
              <Button
                type="button"
                className="shrink-0"
                onClick={() => setDoctorFormOpen(true)}
              >
                <Plus className="size-4" />
                Nuevo Médico
              </Button>
            )}
          </div>
        </div>
        <label
          className={
            hasPrimary
              ? 'text-muted flex items-center gap-2 text-sm'
              : 'text-ink flex items-center gap-2 text-sm'
          }
        >
          <input
            type="checkbox"
            checked={hasPrimary ? false : isPrimary}
            disabled={hasPrimary}
            onChange={(event) => setIsPrimary(event.target.checked)}
          />
          Médico Principal
        </label>
        <div className="sm:col-span-2">
          <TextAreaField
            label="Notas (Opcional)"
            className="min-h-8 py-1.5 text-xs"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!doctorId}
            onClick={addPending}
          >
            Agregar a la Lista
          </Button>
        </div>
      </div>
      {doctorFormOpen && (
        <Dialog
          title="Nuevo Médico"
          icon={<Stethoscope className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          size="lg"
          onClose={() => setDoctorFormOpen(false)}
        >
          <DoctorForm
            onSave={(values) =>
              createDoctor.mutateAsync(values).then(() => undefined)
            }
            onCancel={() => setDoctorFormOpen(false)}
            submitting={createDoctor.isPending}
          />
        </Dialog>
      )}
    </div>
  )
}

function PendingConditionsEditor({
  pending,
  setPending,
}: {
  pending: PendingCondition[]
  setPending: Dispatch<SetStateAction<PendingCondition[]>>
}) {
  const queryClient = useQueryClient()
  const canWriteConditions = useCan('health-conditions:write')
  const [healthConditionId, setHealthConditionId] = useState('')
  const [status, setStatus] = useState<ConditionStatus>('active')
  const [diagnosedOn, setDiagnosedOn] = useState('')
  const [notes, setNotes] = useState('')
  const [conditionFormOpen, setConditionFormOpen] = useState(false)

  const conditionOptions = useQuery({
    queryKey: ['health-conditions', 'picker'],
    queryFn: () =>
      api<HealthConditionList>(
        '/api/v1/health-conditions?isActive=true&rows=100',
      ),
  })
  const createCondition = useMutation({
    mutationFn: (values: HealthConditionFormValues) =>
      api<components['schemas']['HealthCondition']>(
        '/api/v1/health-conditions',
        {
          method: 'POST',
          body: JSON.stringify({
            name: values.name,
            description: values.description || null,
          }),
        },
      ),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['health-conditions'] })
      setConditionFormOpen(false)
      setHealthConditionId(created.id)
    },
  })

  const pendingIds = new Set(pending.map((item) => item.healthConditionId))
  const availableConditions = (conditionOptions.data?.data ?? []).filter(
    (condition) => !pendingIds.has(condition.id),
  )

  function addPending() {
    const condition = (conditionOptions.data?.data ?? []).find(
      (item) => item.id === healthConditionId,
    )
    if (!condition) return
    setPending((current) => [
      ...current,
      {
        healthConditionId,
        name: condition.name,
        status,
        diagnosedOn,
        notes: notes.trim(),
      },
    ])
    setHealthConditionId('')
    setStatus('active')
    setDiagnosedOn('')
    setNotes('')
  }

  return (
    <div className="grid gap-4">
      {pending.length > 0 && (
        <ul className="grid gap-2">
          {pending.map((item) => (
            <li
              key={item.healthConditionId}
              className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
            >
              <div>
                <p className="text-ink text-sm font-medium">
                  {item.name}{' '}
                  <span className="text-muted text-xs">
                    · {conditionStatusLabels[item.status]}
                  </span>
                </p>
                {item.notes && (
                  <p className="text-muted text-xs">{item.notes}</p>
                )}
              </div>
              <button
                type="button"
                title="Quitar"
                onClick={() =>
                  setPending((current) =>
                    current.filter(
                      (c) => c.healthConditionId !== item.healthConditionId,
                    ),
                  )
                }
                className="text-muted shrink-0 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <label
            htmlFor="pending-condition"
            className="text-ink text-sm font-medium"
          >
            Condición
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="pending-condition"
              value={healthConditionId}
              onChange={(event) => setHealthConditionId(event.target.value)}
              disabled={conditionOptions.isPending}
              className={`${controlClass} min-w-0 flex-1`}
            >
              <option value="">
                {conditionOptions.isPending
                  ? 'Cargando condiciones…'
                  : availableConditions.length
                    ? 'Selecciona una condición existente'
                    : 'No hay condiciones disponibles'}
              </option>
              {availableConditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.name}
                </option>
              ))}
            </select>
            {canWriteConditions && (
              <Button
                type="button"
                className="shrink-0"
                onClick={() => setConditionFormOpen(true)}
              >
                <Plus className="size-4" />
                Nueva Condición
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="pending-condition-status"
            className="text-ink text-sm font-medium"
          >
            Estado
          </label>
          <select
            id="pending-condition-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ConditionStatus)
            }
            className={controlClass}
          >
            {Object.entries(conditionStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="pending-condition-diagnosed"
            className="text-ink text-sm font-medium"
          >
            Fecha de Diagnóstico (Opcional)
          </label>
          <input
            id="pending-condition-diagnosed"
            type="date"
            value={diagnosedOn}
            onChange={(event) => setDiagnosedOn(event.target.value)}
            className={controlClass}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="Notas (Opcional)"
            className="min-h-8 py-1.5 text-xs"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!healthConditionId}
            onClick={addPending}
          >
            Agregar a la Lista
          </Button>
        </div>
      </div>
      {conditionFormOpen && (
        <Dialog
          title="Nueva Condición de Salud"
          icon={<HeartPulse className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setConditionFormOpen(false)}
        >
          <HealthConditionForm
            onSave={(values) =>
              createCondition.mutateAsync(values).then(() => undefined)
            }
            onCancel={() => setConditionFormOpen(false)}
            submitting={createCondition.isPending}
          />
        </Dialog>
      )}
    </div>
  )
}

function PendingTreatmentsEditor({
  pending,
  setPending,
  defaultBranchId,
}: {
  pending: PendingTreatment[]
  setPending: Dispatch<SetStateAction<PendingTreatment[]>>
  defaultBranchId?: string
}) {
  const canWriteTreatments = useCan('treatments:write')
  const [cycleFormOpen, setCycleFormOpen] = useState(false)
  const { data: pipeline } = usePipeline()

  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', rows: 100 }],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&rows=100'),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const users = useQuery({
    queryKey: ['users', { rows: 100 }],
    queryFn: () => api<UserList>('/api/v1/users?rows=100'),
  })

  const [name, setName] = useState('')
  const [status, setStatus] = useState<BoardColumnKey>('to_notify')
  const [type, setType] = useState('')
  const [priority, setPriority] = useState('')
  const [branchId, setBranchId] = useState(defaultBranchId ?? '')
  const [medicationId, setMedicationId] = useState('')
  const [responsibleUserId, setResponsibleUserId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [coverageEndOn, setCoverageEndOn] = useState('')

  const stageName = (key: BoardColumnKey) =>
    pipeline?.stages.find((stage) => stage.system_status === key)?.name ??
    boardColumnLabels[key]
  const formComplete = Boolean(
    name.trim() && quantity && coverageEndOn && branchId && medicationId,
  )

  function resetForm() {
    setName('')
    setStatus('to_notify')
    setType('')
    setPriority('')
    setBranchId(defaultBranchId ?? '')
    setMedicationId('')
    setResponsibleUserId('')
    setQuantity('')
    setCoverageEndOn('')
  }

  function removePending(index: number) {
    setPending((current) => current.filter((_, i) => i !== index))
  }

  function addPending() {
    const medication = (medications.data?.data ?? []).find(
      (item) => item.id === medicationId,
    )
    if (!medication) return
    setPending((current) => [
      ...current,
      {
        name: name.trim(),
        status,
        type,
        priority,
        branchId,
        medicationId,
        medicationLabel: medicationName(medication),
        responsibleUserId,
        quantityPerCycle: quantity,
        coverageEndOn,
      },
    ])
    resetForm()
    setCycleFormOpen(false)
  }

  return (
    <div className="grid gap-4">
      {pending.length > 0 && (
        <ul className="grid gap-2">
          {pending.map((item, index) => (
            <li
              key={`${item.medicationId}-${index}`}
              className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
            >
              <div>
                <p className="text-ink text-sm font-medium">{item.name}</p>
                <p className="text-muted text-xs">
                  {item.medicationLabel} · {boardColumnLabels[item.status]}
                </p>
              </div>
              <button
                type="button"
                title="Quitar"
                onClick={() => removePending(index)}
                className="text-muted shrink-0 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {canWriteTreatments && (
        <Button
          type="button"
          className="w-fit"
          onClick={() => setCycleFormOpen(true)}
        >
          <Plus className="size-4" />
          Nuevo
        </Button>
      )}
      {cycleFormOpen && (
        <Dialog
          title="Nuevo Tratamiento"
          description="Define el tratamiento y el ciclo de reposición con el que inicia este paciente."
          icon={<Plus className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          size="lg"
          onClose={() => setCycleFormOpen(false)}
        >
          <div className="grid gap-4">
            <ModalSection
              icon={<RefreshCw className="size-4" />}
              title="Tratamiento"
              tone="mint"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-ink text-sm font-medium">
                    Tratamiento
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nombre del Tratamiento"
                    className={controlClass}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-ink text-sm font-medium">Etapa</span>
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as BoardColumnKey)
                    }
                    className={controlClass}
                  >
                    {stageOptions.map((key) => (
                      <option key={key} value={key}>
                        {stageName(key)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </ModalSection>

            <div className="grid gap-4 sm:grid-cols-2">
              <ModalSection
                icon={<RefreshCw className="size-4" />}
                title="Ciclo"
                tone="sky"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-ink text-sm font-medium">
                      Tipo de Ciclo
                    </span>
                    <select
                      value={type}
                      onChange={(event) => setType(event.target.value)}
                      className={controlClass}
                    >
                      <option value="">Sin Definir</option>
                      {cycleTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-ink text-sm font-medium">
                      Prioridad
                    </span>
                    <select
                      value={priority}
                      onChange={(event) => setPriority(event.target.value)}
                      className={controlClass}
                    >
                      <option value="">Sin Definir</option>
                      {cyclePriorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </ModalSection>

              <ModalSection
                icon={<CalendarDays className="size-4" />}
                title="Información del Ciclo"
                tone="amber"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-ink text-sm font-medium">
                      Cantidad
                    </span>
                    <input
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      placeholder="—"
                      className={controlClass}
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-ink text-sm font-medium">
                      Fecha de Cierre
                    </span>
                    <input
                      type="date"
                      value={coverageEndOn}
                      onChange={(event) =>
                        setCoverageEndOn(event.target.value)
                      }
                      className={controlClass}
                    />
                  </label>
                </div>
                <label className="grid gap-1.5">
                  <span className="text-ink text-sm font-medium">
                    Responsable
                  </span>
                  <select
                    value={responsibleUserId}
                    onChange={(event) =>
                      setResponsibleUserId(event.target.value)
                    }
                    className={controlClass}
                  >
                    <option value="">Sin Responsable</option>
                    {(users.data?.data ?? []).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
              </ModalSection>
            </div>

            <ModalSection
              icon={<Package className="size-4" />}
              title="Producto Y Sucursal"
              tone="sky"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-ink text-sm font-medium">
                    Sucursal
                  </span>
                  <select
                    value={branchId}
                    onChange={(event) => setBranchId(event.target.value)}
                    className={controlClass}
                  >
                    <option value="">Seleccione…</option>
                    {(branches.data?.data ?? []).map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-ink text-sm font-medium">
                    Producto
                  </span>
                  <select
                    value={medicationId}
                    onChange={(event) => setMedicationId(event.target.value)}
                    className={controlClass}
                  >
                    <option value="">Seleccione…</option>
                    {(medications.data?.data ?? []).map((medication) => (
                      <option key={medication.id} value={medication.id}>
                        {medicationName(medication)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </ModalSection>

            <FormActions>
              <Button type="button" onClick={() => setCycleFormOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!formComplete}
                onClick={addPending}
              >
                Agregar a la Lista
              </Button>
            </FormActions>
          </div>
        </Dialog>
      )}
    </div>
  )
}

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
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
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
          primaryBranchId: branches[0]?.id ?? '',
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
          }),
        },
      )
      setPendingConditions((current) =>
        current.filter(
          (c) => c.healthConditionId !== item.healthConditionId,
        ),
      )
    }
    const treatmentsToSend = [...pendingTreatments]
    for (const item of treatmentsToSend) {
      await api('/api/v1/cycles', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: patientId,
          branch_id: item.branchId,
          medication_id: item.medicationId,
          name: item.name || undefined,
          responsible_user_id: item.responsibleUserId || undefined,
          quantity_per_cycle: item.quantityPerCycle,
          coverage_end_on: item.coverageEndOn || undefined,
          status: item.status,
          priority: item.priority || undefined,
          type: item.type || undefined,
        }),
      })
      setPendingTreatments((current) => current.filter((t) => t !== item))
    }
  }

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
      badge: patient ? undefined : pendingDoctors.length,
    },
    {
      value: 'tratamientos',
      label: 'Tratamientos',
      icon: <Pill className="size-4" />,
      badge: patient ? undefined : pendingTreatments.length,
    },
    {
      value: 'condiciones',
      label: 'Condiciones',
      icon: <HeartPulse className="size-4" />,
      badge: patient ? undefined : pendingConditions.length,
    },
  ]

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5">
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
      {activeTab === 'datos' && (
        <>
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
                <p className="font-semibold">Posible Paciente Duplicado</p>
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
          <ModalSection
            icon={<UserRound className="size-4" />}
            title="Identificación"
            tone="mint"
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
                placeholder="DPI, cédula o pasaporte"
                {...register('documentId')}
                error={errors.documentId?.message}
              />
              <TextField
                label="Fecha de Nacimiento"
                type="date"
                {...register('birthDate')}
                error={errors.birthDate?.message}
              />
            </div>
          </ModalSection>

          <ModalSection
            icon={<Phone className="size-4" />}
            title="Contacto"
            tone="sky"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="WhatsApp"
                type="tel"
                placeholder="+502 5555 5555"
                {...register('phone')}
                error={errors.phone?.message}
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
            tone="amber"
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
            icon={<Stethoscope className="size-4" />}
            title="Atención"
            tone="amber"
          >
            <div className="grid gap-3 sm:grid-cols-2">
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
                  </select>
                  <ChevronDown
                    className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
                {errors.primaryBranchId?.message && (
                  <p
                    id="patient-branch-error"
                    className="text-xs text-red-700"
                  >
                    {errors.primaryBranchId.message}
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

      {activeTab === 'medicos' &&
        (patient ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-muted text-sm">
                Médicos asociados a este paciente.
              </p>
              {canWrite && (
                <Button
                  type="button"
                  className="shrink-0"
                  onClick={() => setMedicosAddOpen(true)}
                >
                  <Plus className="size-4" />
                  Agregar Médico
                </Button>
              )}
            </div>
            <PatientDoctorsPanel
              patientId={patient.id}
              addOpen={medicosAddOpen}
              onCloseAdd={() => setMedicosAddOpen(false)}
            />
          </div>
        ) : (
          <PendingDoctorsEditor
            pending={pendingDoctors}
            setPending={setPendingDoctors}
          />
        ))}

      {activeTab === 'tratamientos' &&
        (patient ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-muted text-sm">
                Tratamientos de este paciente.
              </p>
              {canWrite && (
                <Button
                  type="button"
                  className="shrink-0"
                  onClick={() => setTratamientosAddOpen(true)}
                >
                  <Plus className="size-4" />
                  Agregar Tratamiento
                </Button>
              )}
            </div>
            <PatientTreatmentsPanel
              patientId={patient.id}
              defaultBranchId={patient.primaryBranchId}
              defaultResponsibleUserId={patient.responsibleUserId}
              addOpen={tratamientosAddOpen}
              onCloseAdd={() => setTratamientosAddOpen(false)}
            />
          </div>
        ) : (
          <PendingTreatmentsEditor
            pending={pendingTreatments}
            setPending={setPendingTreatments}
            defaultBranchId={primaryBranchId}
          />
        ))}

      {activeTab === 'condiciones' &&
        (patient ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-muted text-sm">
                Condiciones de salud de este paciente.
              </p>
              {canWrite && (
                <Button
                  type="button"
                  className="shrink-0"
                  onClick={() => setCondicionesAddOpen(true)}
                >
                  <Plus className="size-4" />
                  Agregar Condición
                </Button>
              )}
            </div>
            <PatientConditionsPanel
              patientId={patient.id}
              addOpen={condicionesAddOpen}
              onCloseAdd={() => setCondicionesAddOpen(false)}
            />
          </div>
        ) : (
          <PendingConditionsEditor
            pending={pendingConditions}
            setPending={setPendingConditions}
          />
        ))}

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
          disabled={submitting}
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
