import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Package, Plus, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import {
  boardColumnLabels,
  boardColumns,
  type BoardColumnKey,
} from '@/lib/board'
import { usePipeline } from '@/lib/pipeline'
import { useMe } from '@/lib/permissions'
import { medicationName, type Medication } from '@/lib/treatments'
import { formatPhone } from '@/lib/phone'
import type { components } from '@/lib/api-types'

type Eligible = {
  id: string
  patient: { id: string; name: string }
  medication: string
  branch_id: string
  quantity_per_cycle: string
  coverage_end_on: string | null
  responsible: { id: string; name: string } | null
}

type Patient = components['schemas']['Patient']

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

const fieldClass =
  'border-border focus:border-tealmax h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm outline-none'
const readOnlyFieldClass =
  'border-border h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-muted'

/**
 * Cycles are always born from an existing treatment. Only active treatments
 * without an open cycle are offered, and the new cycle lands in the chosen stage.
 */
export function NewCycleDialog({
  initialStatus,
  onClose,
}: {
  initialStatus?: BoardColumnKey
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: pipeline } = usePipeline()
  const { data: me } = useMe()
  const [status, setStatus] = useState<BoardColumnKey>(
    initialStatus ?? 'to_notify',
  )
  const [treatmentId, setTreatmentId] = useState('')
  const [patientId, setPatientId] = useState('')
  const [type, setType] = useState('')
  const [priority, setPriority] = useState('')
  const [branchOverride, setBranchOverride] = useState<string | null>(null)
  const [medicationOverride, setMedicationOverride] = useState<string | null>(
    null,
  )
  const [responsibleOverride, setResponsibleOverride] = useState<string | null>(
    null,
  )
  const [treatmentNameOverride, setTreatmentNameOverride] = useState<
    string | null
  >(null)
  const [quantity, setQuantity] = useState('')
  const [coverageEndOn, setCoverageEndOn] = useState('')

  const eligible = useQuery({
    queryKey: ['eligible-treatments'],
    queryFn: () =>
      api<{ data: Eligible[] }>('/api/v1/cycles/eligible-treatments'),
  })
  const patients = useQuery({
    queryKey: ['patients', { limit: 100 }],
    queryFn: () => api<{ data: Patient[] }>('/api/v1/patients?limit=100'),
  })
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', limit: 100 }],
    queryFn: () =>
      api<{ data: Medication[] }>(
        '/api/v1/medications?archived=false&limit=100',
      ),
  })
  const users = useQuery({
    queryKey: ['users', { limit: 100 }],
    queryFn: () =>
      api<{ data: { id: string; name: string }[] }>('/api/v1/users?limit=100'),
  })
  const eligibleOptions = eligible.data?.data ?? []
  const selected = eligibleOptions.find((option) => option.id === treatmentId)
  const stageName = (key: BoardColumnKey) =>
    pipeline?.stages.find((s) => s.system_status === key)?.name ??
    boardColumnLabels[key]
  const matchedMedication = medications.data?.data.find(
    (medication) => medicationName(medication) === selected?.medication,
  )
  const branchId = branchOverride ?? selected?.branch_id ?? ''
  const medicationId = medicationOverride ?? matchedMedication?.id ?? ''
  const responsibleUserId =
    responsibleOverride ?? selected?.responsible?.id ?? ''
  const treatmentName = treatmentNameOverride ?? selected?.medication ?? ''
  const formComplete = Boolean(
    treatmentName &&
    patientId &&
    quantity &&
    coverageEndOn &&
    branchId &&
    medicationId,
  )

  function selectTreatment(option: Eligible) {
    setTreatmentId(option.id)
    setBranchOverride(null)
    setMedicationOverride(null)
    setResponsibleOverride(null)
    setTreatmentNameOverride(null)
    setQuantity(option.quantity_per_cycle)
    setCoverageEndOn(option.coverage_end_on ?? '')
  }

  function clearTreatment() {
    setTreatmentId('')
    setBranchOverride(null)
    setMedicationOverride(null)
    setResponsibleOverride(null)
    setTreatmentNameOverride(null)
    setQuantity('')
    setCoverageEndOn('')
  }

  function selectPatient(id: string) {
    setPatientId(id)
    const option = eligibleOptions.find((o) => o.patient.id === id)
    if (option) selectTreatment(option)
    else clearTreatment()
  }

  const resetForm = () => {
    setPatientId('')
    clearTreatment()
    setType('')
    setPriority('')
  }

  const create = useMutation({
    mutationFn: (variables: { again: boolean }) =>
      api('/api/v1/cycles', {
        method: 'POST',
        body: JSON.stringify({
          treatment_id: treatmentId || undefined,
          patient_id: !treatmentId ? patientId || undefined : undefined,
          status,
          type: type || undefined,
          priority: priority || undefined,
          branch_id: branchId || undefined,
          medication_id: medicationId || undefined,
          responsible_user_id: responsibleUserId || undefined,
          quantity_per_cycle: quantity || undefined,
          coverage_end_on: coverageEndOn || undefined,
          name: treatmentName || undefined,
        }),
      }).then(() => variables),
    onSuccess: async (variables) => {
      await queryClient.invalidateQueries({ queryKey: ['board'] })
      await queryClient.invalidateQueries({ queryKey: ['cycles'] })
      await queryClient.invalidateQueries({ queryKey: ['eligible-treatments'] })
      toast.push('Ciclo creado.', 'success')
      if (variables.again) {
        resetForm()
      } else {
        onClose()
      }
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  const creatingAgain = create.isPending && create.variables?.again === true
  const creatingFinal = create.isPending && create.variables?.again === false

  return (
    <Dialog
      title="Nuevo Ciclo"
      description="El ciclo se creará a partir de un tratamiento existente sin un ciclo abierto."
      icon={<Plus className="size-6" />}
      onClose={onClose}
      size="lg"
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (formComplete && !create.isPending) create.mutate({ again: false })
        }}
      >
        <ModalSection
          icon={<RefreshCw className="size-4" />}
          title="Tratamiento"
          tone="mint"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Tratamiento</span>
              <input
                value={treatmentName}
                onChange={(event) =>
                  setTreatmentNameOverride(event.target.value)
                }
                placeholder="Nombre del Tratamiento"
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Etapa</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as BoardColumnKey)
                }
                className={fieldClass}
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
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Embudo</span>
              <input
                value="Ciclo de Reposición"
                readOnly
                tabIndex={-1}
                className={readOnlyFieldClass}
              />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-ink text-sm font-medium">
                  Tipo de Ciclo
                </span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className={fieldClass}
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
                <span className="text-ink text-sm font-medium">Prioridad</span>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className={fieldClass}
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
                <span className="text-ink text-sm font-medium">Cantidad</span>
                <input
                  disabled={!treatmentId && !treatmentName}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="—"
                  className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-ink text-sm font-medium">
                  Fecha de Cierre
                </span>
                <input
                  type="date"
                  disabled={!treatmentId && !treatmentName}
                  value={coverageEndOn}
                  onChange={(event) => setCoverageEndOn(event.target.value)}
                  className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
                />
              </label>
            </div>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Responsable</span>
              <select
                value={responsibleUserId}
                onChange={(event) => setResponsibleOverride(event.target.value)}
                className={fieldClass}
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
          icon={<User className="size-4" />}
          title="Acuerdo de Asociado con"
          tone="mint"
        >
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Paciente</span>
            <select
              value={patientId}
              onChange={(event) => selectPatient(event.target.value)}
              className={fieldClass}
            >
              <option value="">Seleccione Un Paciente…</option>
              {(patients.data?.data ?? []).map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                  {patient.phone ? ` - ${formatPhone(patient.phone)}` : ''}
                </option>
              ))}
            </select>
          </label>
          {patients.isError && (
            <p role="alert" className="text-sm text-red-700">
              No pudimos cargar los pacientes.{' '}
              {(patients.error as Error).message}
            </p>
          )}
        </ModalSection>

        <ModalSection
          icon={<Package className="size-4" />}
          title="Producto Y Compañía"
          tone="sky"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Compañía</span>
              <select
                value={branchId}
                onChange={(event) => setBranchOverride(event.target.value)}
                className={fieldClass}
              >
                <option value="">Seleccione…</option>
                {(me?.branches ?? []).map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Producto</span>
              <select
                value={medicationId}
                onChange={(event) => setMedicationOverride(event.target.value)}
                className={fieldClass}
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

        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos crear el ciclo. {create.error.message}
          </p>
        )}

        <FormActions>
          <Button
            type="button"
            onClick={onClose}
            className="hover:border-red-200 hover:bg-red-50 hover:text-red-800"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!formComplete || create.isPending}
            onClick={() => create.mutate({ again: true })}
          >
            {creatingAgain ? 'Creando…' : 'Crear y agregar otro'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!formComplete || create.isPending}
            className="hover:bg-emerald-700"
          >
            {creatingFinal ? 'Creando…' : 'Crear'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
