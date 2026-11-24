import { Select } from '@/components/ui/Select'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  CalendarDays,
  PackageCheck,
  Pill,
  Plus,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { OverflowTooltip } from '@/components/ui/MoreBubble'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import type { BoardCard } from '@/lib/board'
import { DoseScheduleCard } from '@/features/treatments/DoseTracking'
import { CreateTreatmentDialog } from '@/features/treatments/CreateTreatmentDialog'
import { SaleDateDialog } from './SaleDateDialog'
import type { PickerPatient } from '@/features/treatments/PatientPicker'
import { useCan } from '@/lib/permissions'
import {
  coveragePreview,
  dosesPerDayFromSchedule,
  formatDate,
  formatDurationYMD,
  frequencyFromFields,
  type DoseScheduleFrequency,
  type Medication,
  type PendingDoseChange,
  type Treatment,
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
  presentation: string | null
  /** Cuándo se creó el tratamiento. */
  created_at: string | null
  quantity_per_cycle: string
  delivered_quantity: string | null
  coverage_end_on: string | null
  responsible: { id: string; name: string } | null
}

type Patient = components['schemas']['Patient']

const fieldClass =
  'border-border focus:border-tealmax h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm outline-none'

const treatmentOptionLabel = (option: Eligible) =>
  option.name ? `${option.name} · ${option.medication}` : option.medication

function Fact({
  label,
  children,
  highlight = false,
}: {
  label: string
  children: string
  /** Resalta solo el valor con el fondo verde de los campos de solo lectura. */
  highlight?: boolean
}) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-ink font-medium">
        {highlight ? (
          <span className="inline-block rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-emerald-700">
            {children}
          </span>
        ) : (
          <OverflowTooltip>{children}</OverflowTooltip>
        )}
      </dd>
    </div>
  )
}

function ReadOnlyValue({ children }: { children: string }) {
  return (
    <span className="h-10 w-20 rounded-lg border border-emerald-300 bg-emerald-100 px-3 text-sm leading-10 text-emerald-700">
      {children}
    </span>
  )
}

type ActiveSchedule = DoseScheduleFrequency & {
  dosePerIntake: string
  effectiveTo: string | null
}

function CoverageSection({
  treatment,
  quantity,
  pendingDose,
  onQuantityChange,
  showQuantityError = false,
}: {
  treatment: Eligible
  /** Unidades que se entregan (texto del campo). */
  quantity: string
  /** Cambio de dosis pedido desde esta reposición: manda sobre la programación guardada. */
  pendingDose?: PendingDoseChange | null
  /** Si se pasa, la cantidad se puede cambiar; si no, se muestra solo lectura. */
  onQuantityChange?: (value: string) => void
  showQuantityError?: boolean
}) {
  const schedules = useQuery({
    queryKey: ['treatments', treatment.id, 'dose-schedules'],
    queryFn: () =>
      api<{ data: ActiveSchedule[] }>(
        `/api/v1/treatments/${encodeURIComponent(treatment.id)}/dose-schedules`,
      ),
  })
  const active = schedules.data?.data.find((row) => !row.effectiveTo)
  const quantityNumber = Number(quantity)
  const invalidQuantity =
    !quantity || Number.isNaN(quantityNumber) || quantityNumber <= 0
  // Con un cambio de dosis pendiente se calcula con la programación nueva, que es la que regirá al entregar.
  const plan = pendingDose
    ? {
        dosePerIntake: Number(pendingDose.dose_per_intake),
        intakesPerDay: dosesPerDayFromSchedule(
          frequencyFromFields(pendingDose),
        ),
      }
    : active
      ? {
          dosePerIntake: Number(active.dosePerIntake),
          intakesPerDay: dosesPerDayFromSchedule(active),
        }
      : null
  const startDate = new Date().toISOString().slice(0, 10)
  const preview =
    plan && !invalidQuantity
      ? coveragePreview({
          // La cantidad entregada es en unidades de medicamento, no en cajas.
          quantityPerCycle: quantityNumber,
          ...plan,
          startDate,
        })
      : null
  return (
    <ModalSection
      icon={<CalendarClock className="size-4" />}
      title="Cantidad Y Cobertura"
      defaultCollapsed={false}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-3">
        <div className="grid gap-0">
          <div className="flex items-center gap-2">
            <span className="text-ink text-sm font-medium whitespace-nowrap">
              Unidades por Envase
            </span>
            <ReadOnlyValue>
              {String(Number(treatment.quantity_per_cycle))}
            </ReadOnlyValue>
            {treatment.dose_unit && (
              <span className="text-ink text-sm whitespace-nowrap">
                {treatment.dose_unit}
              </span>
            )}
          </div>
          {treatment.presentation && (
            <p className="text-muted -mt-1.5 text-xs leading-none">
              {treatment.presentation}
            </p>
          )}
        </div>
        <div className="grid gap-0">
          <div className="flex items-center gap-2">
            <span className="text-ink text-sm font-medium whitespace-nowrap">
              Cantidad Entregada
            </span>
            {onQuantityChange ? (
              <input
                id="cycle-delivered-quantity"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => onQuantityChange(event.target.value)}
                aria-invalid={showQuantityError && invalidQuantity}
                className="border-border text-ink focus:border-petroleo h-10 w-24 rounded-lg border bg-white px-3 text-sm outline-none aria-[invalid=true]:border-red-400"
              />
            ) : (
              <ReadOnlyValue>{quantity || '—'}</ReadOnlyValue>
            )}
          </div>
          {treatment.dose_unit && (
            <p className="text-muted -mt-1.5 text-xs leading-none">
              {treatment.dose_unit}
            </p>
          )}
          {showQuantityError && invalidQuantity && (
            <p className="mt-1 text-xs text-red-700">
              Ingresa una cantidad mayor a cero.
            </p>
          )}
        </div>
      </div>
      <div className="border-border rounded-lg border bg-white p-3">
        <div className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <CalendarDays className="size-4" />
          Cobertura estimada
        </div>
        {preview ? (
          <p className="text-petroleo font-display mt-1 text-xl font-bold tracking-tight">
            {formatDurationYMD(preview.days, startDate)}
          </p>
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
  initialTreatment,
  editCard,
  onClose,
}: {
  initialTreatment?: { patientId: string; treatmentId: string }
  /** Si se pasa, el formulario muestra esa reposición en vez de crear una. */
  editCard?: BoardCard
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const editing = editCard !== undefined
  const [patientId, setPatientId] = useState(
    editCard?.patient.id ?? initialTreatment?.patientId ?? '',
  )
  const [treatmentId, setTreatmentId] = useState(
    editCard?.treatment_id ?? initialTreatment?.treatmentId ?? '',
  )
  const [showErrors, setShowErrors] = useState(false)
  const [treatmentFormOpen, setTreatmentFormOpen] = useState(false)
  const canCreateTreatment = useCan('treatments:write')

  // En edición el tratamiento ya tiene su reposición abierta, así que no sale
  // en la lista de elegibles: se leen sus datos directamente.
  const editTreatment = useQuery({
    queryKey: ['treatments', 'detail', editCard?.treatment_id],
    queryFn: () =>
      api<Treatment>(
        `/api/v1/treatments/${encodeURIComponent(editCard!.treatment_id)}`,
      ),
    enabled: editing,
  })
  const editMedication = useQuery({
    queryKey: ['medications', 'detail', editTreatment.data?.medicationId],
    queryFn: () =>
      api<Medication>(
        `/api/v1/medications/${encodeURIComponent(editTreatment.data!.medicationId)}`,
      ),
    enabled: editing && Boolean(editTreatment.data?.medicationId),
  })

  // Se pide por paciente: la lista global se corta en 50 y podía dejar fuera
  // tratamientos válidos del paciente elegido.
  const eligible = useQuery({
    queryKey: ['eligible-treatments', patientId],
    queryFn: () =>
      api<{ data: Eligible[] }>(
        `/api/v1/cycles/eligible-treatments?patient_id=${encodeURIComponent(patientId)}`,
      ),
    enabled: Boolean(patientId) && !editing,
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
  const editSelected: Eligible | undefined =
    editCard && editTreatment.data && editMedication.data
      ? {
          id: editTreatment.data.id,
          name: editTreatment.data.name ?? null,
          patient: { id: editCard.patient.id, name: editCard.patient.nombre },
          medication: editCard.medication.nombre,
          branch_id: editCard.branch.id,
          branch_name: editCard.branch.nombre,
          prescriber_name: editTreatment.data.prescriberName ?? null,
          dose_unit: editMedication.data.doseUnit,
          presentation: editMedication.data.presentation ?? null,
          created_at: editTreatment.data.createdAt ?? null,
          quantity_per_cycle: String(editTreatment.data.quantityPerCycle),
          delivered_quantity:
            editTreatment.data.deliveredQuantity != null
              ? String(editTreatment.data.deliveredQuantity)
              : null,
          coverage_end_on: editTreatment.data.coverageEndOn
            ? editTreatment.data.coverageEndOn.slice(0, 10)
            : null,
          responsible: editCard.responsible
            ? { id: editCard.responsible.id, name: editCard.responsible.nombre }
            : null,
        }
      : undefined
  const selected = editing
    ? editSelected
    : (patientTreatments.find((option) => option.id === treatmentId) ??
      (patientTreatments.length === 1 ? patientTreatments[0] : undefined))

  // Cantidad a entregar, en unidades del medicamento. Se propone la entregada
  // en el tratamiento (o una caja completa) y se puede cambiar, p. ej. 5 de
  // una caja de 30; al cambiar de tratamiento vuelve a proponerse la del nuevo.
  const [quantityOverride, setQuantityOverride] = useState<{
    treatmentId: string
    value: string
  } | null>(null)
  const quantityInput = editCard
    ? String(Number(editCard.expected_quantity))
    : quantityOverride && quantityOverride.treatmentId === selected?.id
      ? quantityOverride.value
      : selected
        ? String(
            Number(selected.delivered_quantity ?? selected.quantity_per_cycle),
          )
        : ''
  const invalidQuantity =
    !quantityInput ||
    Number.isNaN(Number(quantityInput)) ||
    Number(quantityInput) <= 0

  // Cambio de la programación de dosis pedido desde esta reposición. No se
  // aplica al tratamiento: queda pendiente en la reposición y se aplica al
  // marcarla como entregada. Al crear vive en el formulario (por tratamiento,
  // para no arrastrarlo a otro); al ver una reposición ya creada se guarda en ella.
  const [draftDose, setDraftDose] = useState<{
    treatmentId: string
    change: PendingDoseChange
  } | null>(null)
  const [savedDose, setSavedDose] = useState<PendingDoseChange | null>(
    editCard?.pending_dose_schedule ?? null,
  )
  const pendingDose = editing
    ? savedDose
    : draftDose && draftDose.treatmentId === selected?.id
      ? draftDose.change
      : null
  const savePendingDose = useMutation({
    mutationFn: (change: PendingDoseChange | null) =>
      api(
        `/api/v1/cycles/${encodeURIComponent(editCard!.cycle_id)}/pending-dose-schedule`,
        {
          method: 'PUT',
          body: JSON.stringify({ pending_dose_schedule: change }),
        },
      ),
    onSuccess: async (_result, change) => {
      setSavedDose(change)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['board'] }),
        queryClient.invalidateQueries({ queryKey: ['cycles'] }),
      ])
      toast.push(
        change
          ? 'Cambio de dosis guardado: se aplicará al marcar entregado.'
          : 'Cambio de dosis descartado.',
        'success',
      )
    },
    onError: (error) => toast.push(error.message, 'error'),
  })
  function setPendingDoseChange(change: PendingDoseChange | null) {
    if (editing) savePendingDose.mutate(change)
    else if (selected)
      setDraftDose(change ? { treatmentId: selected.id, change } : null)
  }

  function selectPatient(id: string) {
    setPatientId(id)
    setTreatmentId('')
  }

  const create = useMutation({
    mutationFn: (saleDate: string) =>
      api<{ cycle_id: string; treatment_id: string }>('/api/v1/cycles', {
        method: 'POST',
        body: JSON.stringify({
          treatment_id: selected?.id,
          expected_on: saleDate,
          expected_quantity: Number(quantityInput),
          // El cambio de dosis no toca el tratamiento: viaja con la reposición
          // y se aplica al marcarla como entregada.
          ...(pendingDose ? { pending_dose_schedule: pendingDose } : {}),
        }),
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

  // Al pulsar "Registrar Reposición" se pide la fecha de venta en un modal; la
  // reposición se crea cuando se confirma esa fecha.
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)

  function submit() {
    if (editing || create.isPending) return
    if (!patientId || !selected || invalidQuantity) {
      setShowErrors(true)
      return
    }
    create.reset()
    setSaleDialogOpen(true)
  }

  return (
    <Dialog
      title={editing ? 'Editar Reposición' : 'Crear Reposición'}
      description={
        editing
          ? 'Datos de la reposición y de su tratamiento.'
          : 'La reposición es el ciclo de compra de un tratamiento: se programa para cuando termina su cobertura.'
      }
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
          action={
            !editing &&
            canCreateTreatment && (
              <Button
                type="button"
                variant="ghost"
                className="size-6 px-0"
                aria-label="Crear tratamiento"
                title="Crear tratamiento"
                onClick={() => setTreatmentFormOpen(true)}
              >
                <Plus className="size-4" />
              </Button>
            )
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Paciente
              </span>
              <Select
                value={patientId}
                onChange={(event) => selectPatient(event.target.value)}
                disabled={editing}
                aria-invalid={showErrors && !patientId}
                className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
              >
                <option value="">Seleccione Un Paciente…</option>
                {editCard &&
                  !(patients.data?.data ?? []).some(
                    (patient) => patient.id === patientId,
                  ) && (
                    <option value={editCard.patient.id}>
                      {editCard.patient.nombre}
                    </option>
                  )}
                {(patients.data?.data ?? []).map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                    {patient.phone ? ` - ${formatPhone(patient.phone)}` : ''}
                  </option>
                ))}
              </Select>
              {showErrors && !patientId && (
                <p className="text-xs text-red-700">Campo requerido.</p>
              )}
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Tratamiento
              </span>
              <Select
                value={selected?.id ?? ''}
                title={selected ? treatmentOptionLabel(selected) : undefined}
                onChange={(event) => setTreatmentId(event.target.value)}
                disabled={editing || !patientId || !patientTreatments.length}
                aria-invalid={showErrors && Boolean(patientId) && !selected}
                className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
              >
                <option value="">
                  {editing
                    ? 'Cargando tratamiento…'
                    : !patientId
                      ? 'Primero elige un paciente'
                      : patientTreatments.length
                        ? 'Selecciona el tratamiento'
                        : 'Sin tratamientos disponibles'}
                </option>
                {editing && selected && (
                  <option value={selected.id}>
                    {treatmentOptionLabel(selected)}
                  </option>
                )}
                {patientTreatments.map((option) => (
                  <option key={option.id} value={option.id}>
                    {treatmentOptionLabel(option)}
                  </option>
                ))}
              </Select>
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
              <Fact label="Tratamiento Creado">
                {selected.created_at
                  ? formatDate(
                      new Date(selected.created_at).toLocaleDateString('en-CA'),
                    )
                  : '—'}
              </Fact>
              <Fact
                label="Fin De Cobertura"
                highlight={Boolean(selected.coverage_end_on)}
              >
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
                deferred={{
                  pending: pendingDose,
                  onChange: setPendingDoseChange,
                }}
              />
            </div>
            <CoverageSection
              treatment={selected}
              quantity={quantityInput}
              pendingDose={pendingDose}
              onQuantityChange={
                editing
                  ? undefined
                  : (value) =>
                      setQuantityOverride({ treatmentId: selected.id, value })
              }
              showQuantityError={showErrors}
            />
          </>
        )}

        <FormActions>
          {editing ? (
            <Button type="button" onClick={onClose}>
              Cerrar
            </Button>
          ) : (
            <>
              <Button type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="hover:bg-emerald-700"
              >
                Registrar Reposición
              </Button>
            </>
          )}
        </FormActions>
      </form>
      {saleDialogOpen && !editing && selected && (
        <SaleDateDialog
          description={`${selected.patient.name} · ${selected.medication}`}
          submitLabel="Crear Reposición"
          pending={create.isPending}
          error={
            create.isError
              ? `No pudimos registrar la reposición. ${create.error.message}`
              : undefined
          }
          onConfirm={(date) => create.mutate(date)}
          onClose={() => setSaleDialogOpen(false)}
        />
      )}
      {treatmentFormOpen && canCreateTreatment && (
        <CreateTreatmentDialog
          initialPatient={
            (patients.data?.data.find((item) => item.id === patientId) ??
              null) as PickerPatient | null
          }
          withCycle={false}
          onCreated={(treatment, values) => {
            // Solo se crea el tratamiento: se deja elegido para registrar su
            // reposición con "Registrar Reposición" (fecha de venta incluida).
            setPatientId(treatment.patientId)
            setTreatmentId(treatment.id)
            setQuantityOverride({
              treatmentId: treatment.id,
              value: String(
                Number(values.deliveredQuantity ?? treatment.quantityPerCycle),
              ),
            })
            toast.push(
              'Tratamiento creado. Completa la reposición y regístrala.',
              'success',
            )
          }}
          onClose={() => setTreatmentFormOpen(false)}
        />
      )}
    </Dialog>
  )
}
