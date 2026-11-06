import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  CircleSlash,
  Clock,
  Plus,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Upload,
} from 'lucide-react'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import {
  buildDoseScheduleFields,
  frequencyColumns,
  isDoseFrequencyValid,
  loadDoseFrequencyFromSchedule,
  type DoseFrequencyType,
  type FrequencyMode,
} from '@/lib/treatments'
import { DoseFrequencyRow } from './DoseFrequencyRow'
import { DoctorForm } from '@/features/doctors/DoctorForm'
import {
  syncDoctorMedicalCenters,
  syncDoctorSpecialties,
} from '@/features/doctors/doctorLinks'
import type { DoctorFormValues } from '@/schemas/doctor'
import type { components, paths } from '@/lib/api-types'

type DoctorList =
  paths['/api/v1/doctors']['get']['responses'][200]['content']['application/json']

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function addDaysToDateString(dateStr: string, days: number) {
  const date = new Date(`${dateStr}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Tiempo transcurrido desde una fecha, p.ej. "1a 3d" (año y días) o "45d" si todavía no cumple un año. */
function elapsedSince(dateStr: string): string {
  const totalDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000),
  )
  const years = Math.floor(totalDays / 365)
  const days = totalDays % 365
  return years > 0 ? `${years}a ${days}d` : `${days}d`
}

/** Downloads a tenant-scoped file via fetch (credentials included) rather than a plain <a href>, since the document is never served as a static/public URL. */
export async function downloadFile(url: string, fallbackName: string) {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok)
    throw new Error(`No se pudo descargar el archivo (${response.status})`)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fallbackName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

type DoseSchedule = {
  id: string
  dosePerIntake: string
  times: string[]
  frequencyType: DoseFrequencyType
  intervalHours: number | null
  anchorAt: string | null
  weekdays: number[]
  monthdays: number[]
  effectiveFrom: string
  effectiveTo: string | null
  reason: string | null
  authorizedBy: string | null
  authorizationNote: string | null
  authorizationDocumentPath: string | null
}

type DoseLogStatus = 'scheduled' | 'taken' | 'skipped' | 'rescheduled'

type DoseLog = {
  id: string
  scheduledFor: string
  status: DoseLogStatus
  nominalQuantity: string
  actualQuantity: string | null
  skipReasonCode: string | null
  skipReasonNote: string | null
  rescheduledFor: string | null
}

const statusLabels: Record<DoseLogStatus, string> = {
  scheduled: 'Pendiente',
  taken: 'Tomada',
  skipped: 'Omitida',
  rescheduled: 'Reprogramada',
}
const statusChip: Record<DoseLogStatus, string> = {
  scheduled: 'bg-slate-100 text-slate-800',
  taken: 'bg-emerald-50 text-emerald-700',
  skipped: 'bg-amber-50 text-amber-700',
  rescheduled: 'bg-blue-50 text-blue-700',
}
const skipReasonLabels: Record<string, string> = {
  patient_unavailable: 'Paciente no disponible',
  side_effects: 'Efectos secundarios',
  out_of_stock: 'Sin inventario',
  medical_decision: 'Decisión médica',
  other: 'Otro',
}

/** Active (or most recent) dosing schedule, with the form to open a new version when the dose or schedule changes. */
export function DoseScheduleCard({
  treatmentId,
  medicationLabel,
  doseUnit,
  open: openProp,
  onOpenChange,
  showChangeButton = true,
}: {
  treatmentId: string
  /** Nombre del medicamento, para la columna "Producto" de la fila de frecuencia. */
  medicationLabel?: string
  doseUnit?: string
  /** Control externo del formulario (lo abre el menú de Acciones). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** En `false` oculta "Cambiar dosis"/"Definir horario", para mostrar la card solo de lectura (p.ej. junto a los datos del paciente). */
  showChangeButton?: boolean
}) {
  const queryClient = useQueryClient()
  const canWrite = useCan('treatments:write')
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = onOpenChange ?? setOpenState
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [dosePerIntake, setDosePerIntake] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [mode, setMode] = useState<FrequencyMode>('hours')
  const [hoursPreset, setHoursPreset] = useState<string>('8')
  const [customHours, setCustomHours] = useState('')
  const [daysPreset, setDaysPreset] = useState<string>('30')
  const [customDays, setCustomDays] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [monthdays, setMonthdays] = useState<number[]>([])
  const [weekdayTimes, setWeekdayTimes] = useState<string[]>([''])
  const [reason, setReason] = useState('')
  const [authorizedBy, setAuthorizedBy] = useState('')
  const [authorizedByDoctorId, setAuthorizedByDoctorId] = useState('')
  const [authorizationNote, setAuthorizationNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canWriteDoctors = useCan('doctors:write')
  const [doctorFormOpen, setDoctorFormOpen] = useState(false)

  const doctorOptions = useQuery({
    queryKey: ['doctors', 'picker'],
    queryFn: () => api<DoctorList>('/api/v1/doctors?isActive=true&rows=100'),
    enabled: open,
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
      setAuthorizedByDoctorId(doctor.id)
      setAuthorizedBy(`${doctor.firstName} ${doctor.lastName}`.trim())
    },
  })

  const schedules = useQuery({
    queryKey: ['treatments', treatmentId, 'dose-schedules'],
    queryFn: () =>
      api<{ data: DoseSchedule[] }>(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/dose-schedules`,
      ),
  })
  const active = schedules.data?.data.find((row) => !row.effectiveTo)
  const isChange = Boolean(active)
  const allSchedules = schedules.data?.data ?? []
  const firstEffectiveFrom = allSchedules.length
    ? allSchedules.reduce(
        (earliest, row) =>
          row.effectiveFrom < earliest ? row.effectiveFrom : earliest,
        allSchedules[0]!.effectiveFrom,
      )
    : null
  // Las versiones son por día (sin hora): la nueva no puede empezar el mismo
  // día que la activa o se solaparían, así que la fecha mínima es el día
  // siguiente a su inicio.
  const minEffectiveFrom = active
    ? addDaysToDateString(active.effectiveFrom.slice(0, 10), 1)
    : undefined

  /** Precarga los controles de frecuencia a partir del horario activo. */
  function loadFrequencyFromSchedule(schedule: DoseSchedule) {
    const value = loadDoseFrequencyFromSchedule(schedule)
    setMode(value.frequencyMode)
    setHoursPreset(value.hoursPreset)
    setCustomHours(value.customHours)
    setDaysPreset(value.daysPreset)
    setCustomDays(value.customDays)
    setStartTime(value.startTime)
    setWeekdays(value.weekdays)
    setMonthdays(value.monthdays)
    setWeekdayTimes(value.weekdayTimes)
  }

  function resetFrequencyFields() {
    setMode('hours')
    setHoursPreset('8')
    setCustomHours('')
    setDaysPreset('30')
    setCustomDays('')
    setStartTime('08:00')
    setWeekdays([])
    setMonthdays([])
    setWeekdayTimes([''])
  }

  /**
   * Carga el formulario con los datos reales justo antes de abrirlo, para
   * que nunca se quede con texto a medio escribir de una vez anterior que se
   * cerró sin guardar - cada apertura empieza desde la verdad (el horario
   * activo, o valores en blanco si todavía no hay ninguno).
   */
  // Precarga el formulario con el horario activo. Se ejecuta al abrirlo.
  function prefillForm() {
    if (active) {
      setDosePerIntake(active.dosePerIntake)
      loadFrequencyFromSchedule(active)
      const today = new Date().toISOString().slice(0, 10)
      const min = addDaysToDateString(active.effectiveFrom.slice(0, 10), 1)
      setEffectiveFrom(min > today ? min : today)
    } else {
      setDosePerIntake('')
      resetFrequencyFields()
      setEffectiveFrom(new Date().toISOString().slice(0, 10))
    }
    setReason('')
    setAuthorizedBy('')
    setAuthorizedByDoctorId('')
    setAuthorizationNote('')
    setFile(null)
  }
  const prepared = useRef(false)
  useEffect(() => {
    if (!open) {
      prepared.current = false
      return
    }
    if (prepared.current) return
    prepared.current = true
    prefillForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isFrequencyValid = isDoseFrequencyValid({
    frequencyMode: mode,
    hoursPreset,
    customHours,
    daysPreset,
    customDays,
    startTime,
    weekdays,
    monthdays,
    weekdayTimes,
  })

  const create = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.set('dose_per_intake', dosePerIntake)
      form.set('effective_from', effectiveFrom)
      const fields = buildDoseScheduleFields(
        {
          frequencyMode: mode,
          hoursPreset,
          customHours,
          daysPreset,
          customDays,
          startTime,
          weekdays,
          monthdays,
          weekdayTimes,
        },
        effectiveFrom,
      )
      for (const [key, value] of Object.entries(fields)) form.set(key, value)
      if (reason.trim()) form.set('reason', reason.trim())
      if (authorizedBy.trim()) form.set('authorized_by', authorizedBy.trim())
      if (authorizationNote.trim())
        form.set('authorization_note', authorizationNote.trim())
      if (file) form.set('authorization_document', file)
      return api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/dose-schedules`,
        { method: 'POST', body: form },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['treatments', treatmentId, 'dose-schedules'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['treatments', treatmentId, 'doses'],
      })
      setOpen(false)
      setReason('')
      setAuthorizedBy('')
      setAuthorizedByDoctorId('')
      setAuthorizationNote('')
      setFile(null)
    },
  })

  const columns = active ? frequencyColumns(active) : null

  return (
    <div className="border-border min-w-0 rounded-xl border bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-petroleo font-semibold">Programación de Dosis</h3>
        {canWrite && showChangeButton && (
          <Button onClick={() => setOpen(true)}>
            {isChange ? 'Cambiar dosis' : 'Definir horario'}
          </Button>
        )}
      </div>
      {active && columns ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Cantidad</dt>
            <dd className="text-ink mt-0.5 font-medium">
              {active.dosePerIntake}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Unidad</dt>
            <dd className="text-ink mt-0.5 font-medium">
              {doseUnit || 'unidad'}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Frecuencia</dt>
            <dd className="text-ink mt-0.5 font-medium">{columns.frequency}</dd>
          </div>
          <div>
            <dt className="text-muted">Toma</dt>
            <dd className="text-ink mt-0.5 font-medium">
              {columns.whenToTake}
            </dd>
          </div>
          {active.authorizationDocumentPath && (
            <div className="col-span-2">
              <Button
                type="button"
                onClick={() => {
                  setDownloadError(null)
                  downloadFile(
                    `${API_URL}/api/v1/treatments/${encodeURIComponent(treatmentId)}/dose-schedules/${encodeURIComponent(active.id)}/authorization-document`,
                    `autorizacion-${active.id}`,
                  ).catch((error: unknown) =>
                    setDownloadError(
                      error instanceof Error
                        ? error.message
                        : 'No se pudo descargar el documento',
                    ),
                  )
                }}
              >
                Ver documento de autorización
              </Button>
              {downloadError && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  {downloadError}
                </p>
              )}
            </div>
          )}
        </dl>
      ) : (
        <p className="text-muted text-sm">
          Este tratamiento todavía no tiene programación de dosis.
        </p>
      )}

      {open && (
        <Dialog
          title={isChange ? 'Cambiar Dosis' : 'Definir Programación de Dosis'}
          description={
            isChange
              ? 'Cierra el horario activo y abre uno nuevo. Requiere autorización médica.'
              : 'Define cuántas unidades y a qué horas se toma este medicamento.'
          }
          icon={<Clock className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setOpen(false)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              create.mutate()
            }}
          >
            <ModalSection
              icon={<Clock className="size-4" />}
              title={medicationLabel || 'Medicamento'}
              tone="mint"
            >
              <DoseFrequencyRow
                quantity={dosePerIntake}
                onQuantityChange={setDosePerIntake}
                unit={doseUnit ?? ''}
                value={{
                  frequencyMode: mode,
                  hoursPreset,
                  customHours,
                  daysPreset,
                  customDays,
                  startTime,
                  weekdays,
                  monthdays,
                  weekdayTimes,
                }}
                onChange={(next) => {
                  setMode(next.frequencyMode)
                  setHoursPreset(next.hoursPreset)
                  setCustomHours(next.customHours)
                  setDaysPreset(next.daysPreset)
                  setCustomDays(next.customDays)
                  setStartTime(next.startTime)
                  setWeekdays(next.weekdays)
                  setMonthdays(next.monthdays)
                  setWeekdayTimes(next.weekdayTimes)
                }}
              />
              <div className="flex items-end gap-3">
                <TextField
                  label="Vigente desde"
                  type="date"
                  required
                  className="w-40"
                  min={minEffectiveFrom}
                  value={effectiveFrom}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                />
                {firstEffectiveFrom ? (
                  <span className="text-muted mb-2 text-sm">
                    Transcurrido {elapsedSince(firstEffectiveFrom)}
                  </span>
                ) : null}
              </div>
              <TextAreaField
                label="Motivo (opcional)"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </ModalSection>
            {isChange && (
              <ModalSection
                icon={<ShieldCheck className="size-4" />}
                title="Autorización Médica"
                tone="amber"
              >
                <div className="grid gap-1.5">
                  <label
                    htmlFor="authorized-by-doctor"
                    className="text-ink text-sm font-medium"
                  >
                    Autorizado por
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      id="authorized-by-doctor"
                      required
                      value={authorizedByDoctorId}
                      onChange={(event) => {
                        const id = event.target.value
                        setAuthorizedByDoctorId(id)
                        const doctor = (doctorOptions.data?.data ?? []).find(
                          (item) => item.id === id,
                        )
                        setAuthorizedBy(
                          doctor
                            ? `${doctor.firstName} ${doctor.lastName}`.trim()
                            : '',
                        )
                      }}
                      disabled={doctorOptions.isPending}
                      className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">
                        {doctorOptions.isPending
                          ? 'Cargando médicos…'
                          : doctorOptions.isError
                            ? 'No se pudieron cargar los médicos'
                            : 'Selecciona un médico'}
                      </option>
                      {(doctorOptions.data?.data ?? []).map((doctor) => (
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
                  {doctorOptions.isError && (
                    <p role="alert" className="text-xs text-red-700">
                      No pudimos cargar la lista de médicos.
                    </p>
                  )}
                </div>
                <TextAreaField
                  label="Nota de autorización"
                  required
                  value={authorizationNote}
                  onChange={(event) => setAuthorizationNote(event.target.value)}
                />
                <div className="grid gap-1.5">
                  <span className="text-ink text-sm font-medium">
                    Documento de autorización
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(event) =>
                      setFile(event.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-fit"
                  >
                    <Upload className="size-4" />
                    {file ? file.name : 'Subir documento'}
                  </Button>
                </div>
              </ModalSection>
            )}
            {create.isError && (
              <p role="alert" className="text-sm text-red-700">
                {create.error.message}
              </p>
            )}
            <FormActions>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto"
                disabled={
                  create.isPending || !dosePerIntake || !isFrequencyValid
                }
              >
                {create.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
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

/** Occurrence-by-occurrence log: mark taken/skipped/rescheduled, or correct a past entry. */
export function DoseTimeline({ treatmentId }: { treatmentId: string }) {
  const queryClient = useQueryClient()
  const canLog = useCan('dose:log')
  const canCorrect = useCan('dose:correct')
  const [skipTarget, setSkipTarget] = useState<string | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null)
  const [correctTarget, setCorrectTarget] = useState<string | null>(null)
  const [skipReasonCode, setSkipReasonCode] = useState('patient_unavailable')
  const [skipReasonNote, setSkipReasonNote] = useState('')
  const [rescheduledFor, setRescheduledFor] = useState('')
  const [correctionNote, setCorrectionNote] = useState('')

  const doses = useQuery({
    queryKey: ['treatments', treatmentId, 'doses'],
    queryFn: () =>
      api<{ data: DoseLog[] }>(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/doses`,
      ),
  })

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['treatments', treatmentId, 'doses'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['treatments', treatmentId, 'inventory'],
      }),
    ])

  const take = useMutation({
    mutationFn: (doseLogId: string) =>
      api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/doses/${encodeURIComponent(doseLogId)}/take`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: invalidate,
  })
  const skip = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/doses/${encodeURIComponent(skipTarget!)}/skip`,
        {
          method: 'POST',
          body: JSON.stringify({
            skip_reason_code: skipReasonCode,
            skip_reason_note: skipReasonNote.trim() || null,
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      setSkipTarget(null)
      setSkipReasonNote('')
    },
  })
  const reschedule = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/doses/${encodeURIComponent(rescheduleTarget!)}/reschedule`,
        {
          method: 'POST',
          body: JSON.stringify({
            rescheduled_for: new Date(rescheduledFor).toISOString(),
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      setRescheduleTarget(null)
      setRescheduledFor('')
    },
  })
  const correct = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/doses/${encodeURIComponent(correctTarget!)}/correct`,
        {
          method: 'POST',
          body: JSON.stringify({ correction_note: correctionNote.trim() }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      setCorrectTarget(null)
      setCorrectionNote('')
    },
  })

  const rows = doses.data?.data ?? []

  // Sin tomas la card no existe: el estado vacío solo añadía ruido a la ficha.
  if (!rows.length) return null

  return (
    <div className="border-border mt-4 min-w-0 rounded-xl border bg-white p-5">
      <h3 className="text-petroleo mb-3 font-semibold">Tomas</h3>
      <ul className="grid gap-2">
        {rows.map((dose) => (
          <li
            key={dose.id}
            className="border-border flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm last:border-0 last:pb-0"
          >
            <div>
              <p className="text-ink font-medium">
                {new Date(dose.scheduledFor).toLocaleString('es')}
              </p>
              {dose.status === 'scheduled' &&
              new Date(dose.scheduledFor) < new Date() ? (
                <span className="mt-1 inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  Retrasada
                </span>
              ) : (
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusChip[dose.status]}`}
                >
                  {statusLabels[dose.status]}
                </span>
              )}
              {dose.skipReasonCode && (
                <span className="text-muted ml-2 text-xs">
                  {skipReasonLabels[dose.skipReasonCode] ?? dose.skipReasonCode}
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {dose.status === 'scheduled' && canLog && (
                <>
                  <Button onClick={() => take.mutate(dose.id)}>Tomar</Button>
                  <Button onClick={() => setSkipTarget(dose.id)}>Omitir</Button>
                  <Button onClick={() => setRescheduleTarget(dose.id)}>
                    Reprogramar
                  </Button>
                </>
              )}
              {dose.status !== 'scheduled' && canCorrect && (
                <Button onClick={() => setCorrectTarget(dose.id)}>
                  Corregir
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {skipTarget && (
        <Dialog
          title="Omitir Toma"
          description="Explica por qué no se tomó esta dosis."
          icon={<CircleSlash className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setSkipTarget(null)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              skip.mutate()
            }}
          >
            <ModalSection
              icon={<CircleSlash className="size-4" />}
              title="Motivo de la Omisión"
              tone="amber"
            >
              <label className="text-ink grid gap-1.5 text-sm font-medium">
                Motivo
                <select
                  value={skipReasonCode}
                  onChange={(event) => setSkipReasonCode(event.target.value)}
                  className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2"
                >
                  {Object.entries(skipReasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <TextAreaField
                label="Nota (obligatoria si el motivo es 'Otro')"
                value={skipReasonNote}
                onChange={(event) => setSkipReasonNote(event.target.value)}
              />
            </ModalSection>
            {skip.isError && (
              <p role="alert" className="text-sm text-red-700">
                {skip.error.message}
              </p>
            )}
            <FormActions>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setSkipTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto"
                disabled={skip.isPending}
              >
                {skip.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}

      {rescheduleTarget && (
        <Dialog
          title="Reprogramar Toma"
          description="Se crea una nueva toma pendiente en el horario elegido."
          icon={<CalendarClock className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setRescheduleTarget(null)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              reschedule.mutate()
            }}
          >
            <ModalSection
              icon={<CalendarClock className="size-4" />}
              title="Nuevo Horario"
              tone="sky"
            >
              <TextField
                label="Nueva fecha y hora"
                type="datetime-local"
                required
                value={rescheduledFor}
                onChange={(event) => setRescheduledFor(event.target.value)}
              />
            </ModalSection>
            {reschedule.isError && (
              <p role="alert" className="text-sm text-red-700">
                {reschedule.error.message}
              </p>
            )}
            <FormActions>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setRescheduleTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto"
                disabled={reschedule.isPending || !rescheduledFor}
              >
                {reschedule.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}

      {correctTarget && (
        <Dialog
          title="Corregir Registro"
          description="Revierte esta toma a pendiente. Queda en el historial, nunca se borra."
          icon={<RotateCcw className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setCorrectTarget(null)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              correct.mutate()
            }}
          >
            <ModalSection
              icon={<RotateCcw className="size-4" />}
              title="Detalle de la Corrección"
              tone="amber"
            >
              <TextAreaField
                label="Explica la corrección"
                required
                value={correctionNote}
                onChange={(event) => setCorrectionNote(event.target.value)}
              />
            </ModalSection>
            {correct.isError && (
              <p role="alert" className="text-sm text-red-700">
                {correct.error.message}
              </p>
            )}
            <FormActions>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setCorrectTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto"
                disabled={correct.isPending || !correctionNote.trim()}
              >
                {correct.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
    </div>
  )
}
