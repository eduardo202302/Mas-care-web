import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarDays,
  Package,
  PackageCheck,
  RefreshCw,
  User,
} from 'lucide-react'
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
import { formatDate, medicationName, type Medication } from '@/lib/treatments'
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
  // El tratamiento siempre se elige entre los del paciente seleccionado.
  const patientTreatments = eligibleOptions.filter(
    (option) => option.patient.id === patientId,
  )
  const stageName = (key: BoardColumnKey) =>
    pipeline?.stages.find((s) => s.system_status === key)?.name ??
    boardColumnLabels[key]
  // La API nombra el producto como "genérico|marca presentación"; hay que
  // compararlo así, o el select de Producto nunca se precarga y el formulario
  // queda deshabilitado.
  const eligibleMedicationLabel = (medication: Medication) =>
    `${medication.genericName ?? medication.brandName ?? medication.presentation} ${medication.presentation}`.trim()
  const matchedMedication = medications.data?.data.find(
    (medication) =>
      eligibleMedicationLabel(medication) === selected?.medication ||
      medicationName(medication) === selected?.medication,
  )
  const branchId = branchOverride ?? selected?.branch_id ?? ''
  const medicationId = medicationOverride ?? matchedMedication?.id ?? ''
  const responsibleUserId =
    responsibleOverride ?? selected?.responsible?.id ?? ''
  const treatmentName = treatmentNameOverride ?? selected?.medication ?? ''
  // Con un tratamiento elegido, producto y sucursal ya vienen de él: el ciclo
  // se crea solo con treatment_id. Exigirlos aquí bloqueaba el botón cuando el
  // nombre del producto del catálogo no coincidía con el del tratamiento.
  const formComplete = Boolean(treatmentId && quantity && coverageEndOn)

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
    // Con un solo tratamiento disponible se toma directo; con varios se elige.
    const options = eligibleOptions.filter((o) => o.patient.id === id)
    if (options.length === 1) selectTreatment(options[0]!)
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
      api<{ cycle_id: string; treatment_id: string }>('/api/v1/cycles', {
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
      await queryClient.invalidateQueries({ queryKey: ['treatments'] })
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.push('Reposición registrada.', 'success')
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
      title="Nueva Reposición"
      description="La reposición es el ciclo: elige el paciente y su tratamiento, y registra dónde compró el medicamento."
      icon={<PackageCheck className="size-6" />}
      compactHeader
      bodyClassName="pt-3"
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
          icon={<User className="size-4" />}
          title="Paciente"
          tone="mint"
        >
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
              Paciente
            </span>
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
          {!patientId && (
            <p className="text-muted text-xs">
              Elige primero al paciente para ver los tratamientos que lleva.
            </p>
          )}
        </ModalSection>

        <ModalSection
          icon={<RefreshCw className="size-4" />}
          title="Tratamiento Que Lleva"
          tone="sky"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Tratamiento
              </span>
              <select
                value={treatmentId}
                onChange={(event) => {
                  const option = patientTreatments.find(
                    (row) => row.id === event.target.value,
                  )
                  if (option) selectTreatment(option)
                  else clearTreatment()
                }}
                disabled={!patientId || !patientTreatments.length}
                className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
              >
                <option value="">
                  {!patientId
                    ? 'Primero elige un paciente'
                    : patientTreatments.length
                      ? 'Selecciona el tratamiento'
                      : 'Sin tratamientos disponibles'}
                </option>
                {patientTreatments.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.medication}
                  </option>
                ))}
              </select>
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
          {patientId && !patientTreatments.length && eligible.isSuccess && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
            >
              Este paciente no tiene tratamientos activos sin ciclo abierto.
              Crea el tratamiento o cierra el ciclo que ya tiene en el tablero.
            </p>
          )}
          {selected && (
            <dl className="border-border grid grid-cols-2 gap-3 rounded-lg border bg-white p-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
                  Le Toca Reponer
                </dt>
                <dd className="text-ink font-medium">
                  {selected.coverage_end_on
                    ? formatDate(selected.coverage_end_on)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
                  Cantidad Por Ciclo
                </dt>
                <dd className="text-ink font-medium">
                  {selected.quantity_per_cycle}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
                  Responsable
                </dt>
                <dd className="text-ink font-medium">
                  {selected.responsible?.name ?? 'Sin responsable'}
                </dd>
              </div>
            </dl>
          )}
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
          icon={<Package className="size-4" />}
          title="Producto Y Sucursal"
          tone="sky"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Sucursal</span>
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
            No pudimos registrar la reposición. {create.error.message}
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
            {creatingAgain ? 'Registrando…' : 'Registrar y agregar otra'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!formComplete || create.isPending}
            className="hover:bg-emerald-700"
          >
            {creatingFinal ? 'Registrando…' : 'Registrar Reposición'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
