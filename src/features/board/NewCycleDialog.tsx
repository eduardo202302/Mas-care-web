import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  CalendarDays,
  PackageCheck,
  Pill,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import type { BoardColumnKey } from '@/lib/board'
import { DoseScheduleCard } from '@/features/treatments/DoseTracking'
import {
  coveragePreview,
  dosesPerDayFromSchedule,
  formatDate,
  formatDurationYMD,
  type DoseScheduleFrequency,
} from '@/lib/treatments'
import { formatPhone } from '@/lib/phone'
import type { components } from '@/lib/api-types'

type Eligible = {
  id: string
  name: string | null
  patient: { id: string; name: string }
  medication: string
  branch_id: string
  branch_name: string | null
  prescriber_name: string | null
  dose_unit: string
  quantity_per_cycle: string
  coverage_end_on: string | null
  responsible: { id: string; name: string } | null
}

type Patient = components['schemas']['Patient']

const fieldClass =
  'border-border focus:border-tealmax h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm outline-none'

const treatmentOptionLabel = (option: Eligible) =>
  option.name ? `${option.name} · ${option.medication}` : option.medication

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-ink truncate font-medium">{children}</dd>
    </div>
  )
}

type ActiveSchedule = DoseScheduleFrequency & {
  dosePerIntake: string
  effectiveTo: string | null
}

function CoverageSection({ treatment }: { treatment: Eligible }) {
  const schedules = useQuery({
    queryKey: ['treatments', treatment.id, 'dose-schedules'],
    queryFn: () =>
      api<{ data: ActiveSchedule[] }>(
        `/api/v1/treatments/${encodeURIComponent(treatment.id)}/dose-schedules`,
      ),
  })
  const active = schedules.data?.data.find((row) => !row.effectiveTo)
  const preview = active
    ? coveragePreview({
        quantityPerCycle: Number(treatment.quantity_per_cycle),
        dosePerIntake: Number(active.dosePerIntake),
        intakesPerDay: dosesPerDayFromSchedule(active),
        startDate: new Date().toISOString().slice(0, 10),
      })
    : null
  return (
    <ModalSection
      icon={<CalendarClock className="size-4" />}
      title="Cantidad Y Cobertura"
      defaultCollapsed={false}
    >
      <div className="flex max-w-xs items-center justify-between gap-3">
        <span className="text-ink text-sm font-medium">
          Unidades por Envase
        </span>
        <span className="h-10 w-28 rounded-lg border border-emerald-300 bg-emerald-100 px-3 text-sm leading-10 text-emerald-700">
          {treatment.quantity_per_cycle}
        </span>
      </div>
      <div className="border-border rounded-lg border bg-white p-3">
        <div className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <CalendarDays className="size-4" />
          Cobertura estimada
        </div>
        {preview ? (
          <>
            <p className="text-petroleo font-display mt-1 text-xl font-bold tracking-tight">
              {formatDurationYMD(preview.days)}
            </p>
            <p className="text-ink text-sm">
              Cubre {formatDurationYMD(preview.days)}
            </p>
          </>
        ) : (
          <p className="text-muted mt-1 text-sm leading-6">
            Define la programación de dosis del tratamiento para ver la
            cobertura estimada.
          </p>
        )}
      </div>
    </ModalSection>
  )
}

/**
 * Una reposición (ciclo) siempre nace de un tratamiento activo que no tiene
 * otra reposición abierta. Medicamento, sucursal, cantidad y fecha vienen del
 * tratamiento y solo se muestran; la reposición nace en la etapa inicial
 * del tablero.
 */
export function NewCycleDialog({
  initialStatus,
  initialTreatment,
  onClose,
}: {
  initialStatus?: BoardColumnKey
  initialTreatment?: { patientId: string; treatmentId: string }
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const status: BoardColumnKey = initialStatus ?? 'to_notify'
  const [patientId, setPatientId] = useState(initialTreatment?.patientId ?? '')
  const [treatmentId, setTreatmentId] = useState(
    initialTreatment?.treatmentId ?? '',
  )
  const [showErrors, setShowErrors] = useState(false)

  // Se pide por paciente: la lista global se corta en 50 y podía dejar fuera
  // tratamientos válidos del paciente elegido.
  const eligible = useQuery({
    queryKey: ['eligible-treatments', patientId],
    queryFn: () =>
      api<{ data: Eligible[] }>(
        `/api/v1/cycles/eligible-treatments?patient_id=${encodeURIComponent(patientId)}`,
      ),
    enabled: Boolean(patientId),
  })
  const patients = useQuery({
    queryKey: ['patients', { limit: 100 }],
    queryFn: () => api<{ data: Patient[] }>('/api/v1/patients?limit=100'),
  })
  const eligibleOptions = eligible.data?.data ?? []
  const patientTreatments = eligibleOptions.filter(
    (option) => option.patient.id === patientId,
  )
  const noEligible =
    Boolean(patientId) && eligible.isSuccess && !patientTreatments.length
  const activeTreatments = useQuery({
    queryKey: ['treatments', { patientId, status: 'active' }],
    queryFn: () =>
      api<{ data: unknown[] }>(
        `/api/v1/treatments?patient_id=${encodeURIComponent(patientId)}&status=active&limit=1`,
      ),
    enabled: noEligible,
  })
  // Con un solo tratamiento disponible se toma directo; con varios se elige.
  const selected =
    patientTreatments.find((option) => option.id === treatmentId) ??
    (patientTreatments.length === 1 ? patientTreatments[0] : undefined)

  function selectPatient(id: string) {
    setPatientId(id)
    setTreatmentId('')
  }

  const create = useMutation({
    mutationFn: () =>
      api<{ cycle_id: string; treatment_id: string }>('/api/v1/cycles', {
        method: 'POST',
        body: JSON.stringify({ treatment_id: selected?.id, status }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['board'] })
      await queryClient.invalidateQueries({ queryKey: ['cycles'] })
      await queryClient.invalidateQueries({ queryKey: ['eligible-treatments'] })
      await queryClient.invalidateQueries({ queryKey: ['treatments'] })
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.push('Reposición registrada.', 'success')
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  function submit() {
    if (create.isPending) return
    if (!patientId || !selected) {
      setShowErrors(true)
      return
    }
    create.mutate()
  }

  return (
    <Dialog
      title="Crear Reposición"
      description="La reposición es el ciclo de compra de un tratamiento: se programa para cuando termina su cobertura."
      icon={<PackageCheck className="size-6" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
      size="lg"
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <ModalSection
          icon={<User className="size-4" />}
          title="Paciente Y Tratamiento"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Paciente
              </span>
              <select
                value={patientId}
                onChange={(event) => selectPatient(event.target.value)}
                aria-invalid={showErrors && !patientId}
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
              {showErrors && !patientId && (
                <p className="text-xs text-red-700">Campo requerido.</p>
              )}
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Tratamiento
              </span>
              <select
                value={selected?.id ?? ''}
                onChange={(event) => setTreatmentId(event.target.value)}
                disabled={!patientId || !patientTreatments.length}
                aria-invalid={showErrors && Boolean(patientId) && !selected}
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
                    {treatmentOptionLabel(option)}
                  </option>
                ))}
              </select>
              {showErrors && patientId && !selected && (
                <p className="text-xs text-red-700">Campo requerido.</p>
              )}
            </label>
          </div>
          {patients.isError && (
            <p role="alert" className="text-sm text-red-700">
              No pudimos cargar los pacientes.{' '}
              {(patients.error as Error).message}
            </p>
          )}
          {noEligible && activeTreatments.isSuccess && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
            >
              {activeTreatments.data.data.length
                ? 'Los tratamientos activos de este paciente ya tienen una reposición abierta en el tablero. Cuando se cierre o se entregue, podrás crear la siguiente.'
                : 'Este paciente no tiene tratamientos activos. Crea primero el tratamiento y su reposición se generará automáticamente.'}
            </p>
          )}
        </ModalSection>

        <ModalSection
          icon={<Pill className="size-4" />}
          title="Datos Del Tratamiento"
          defaultCollapsed={false}
        >
          {selected ? (
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Fact label="Medicamento">{selected.medication}</Fact>
              <Fact label="Sucursal">{selected.branch_name ?? '—'}</Fact>
              <Fact label="Doctor">{selected.prescriber_name ?? '—'}</Fact>
              <Fact label="Unidades Por Envase">
                {selected.quantity_per_cycle}
              </Fact>
              <Fact label="Fin De Cobertura">
                {selected.coverage_end_on
                  ? formatDate(selected.coverage_end_on)
                  : 'Sin fecha'}
              </Fact>
            </dl>
          ) : (
            <p className="text-muted text-sm">
              Elige el paciente y su tratamiento para ver el medicamento, la
              sucursal y la cobertura de los que se repone.
            </p>
          )}
        </ModalSection>

        {selected && (
          <>
            {/* El formulario de dosis va en un portal: sin esto su submit burbujea y registraría la reposición. */}
            <div onSubmit={(event) => event.stopPropagation()}>
              <DoseScheduleCard
                treatmentId={selected.id}
                medicationLabel={selected.medication}
                doseUnit={selected.dose_unit}
              />
            </div>
            <CoverageSection treatment={selected} />
          </>
        )}

        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos registrar la reposición. {create.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={create.isPending}
            className="hover:bg-emerald-700"
          >
            {create.isPending ? 'Registrando…' : 'Registrar Reposición'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
