import { Select } from '@/components/ui/Select'
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import type { FieldPath } from 'react-hook-form'
import {
  CalendarClock,
  CalendarDays,
  FileText,
  Paperclip,
  Pill,
  Plus,
  Search,
  Timer,
  X,
} from 'lucide-react'
import { CustomFields } from '@/components/CustomFields'
import {
  useCustomProperties,
  validateCustomValues,
} from '@/lib/custom-properties'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { api, ApiError } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components } from '@/lib/api-types'
import {
  coveragePreview,
  defaultDoseFrequencyValue,
  dosesPerDayFromFrequency,
  emptyDoseFrequencyValue,
  dosesPerDayFromSchedule,
  formatDurationYMD,
  isDoseFrequencyValid,
  medicationName,
  suggestedDeliveredQuantity,
  todayInputValue,
  type DoseScheduleFrequency,
  type FrequencyMode,
  type Medication,
  type Treatment,
} from '@/lib/treatments'
import {
  makeTreatmentSchema,
  type TreatmentFormValues,
  type TreatmentSaveValues,
} from '@/schemas/treatment'
import { todayDateOnly } from '@/lib/prescription'
import { useStatusDraftChanged } from '@/components/ui/StatusDraft'
import { DoseFrequencyRow } from './DoseFrequencyRow'
import { MedicationImage } from '@/features/medications/MedicationImage'
import { DoseScheduleCard, openFile } from './DoseTracking'
import { MedicationQuickCreateDialog } from '@/features/medications/MedicationQuickCreateDialog'
import { NewDoctorButton } from '@/features/doctors/NewDoctorButton'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

type BranchOption = Pick<components['schemas']['Branch'], 'id' | 'name'>
type DoctorOption = {
  id: string
  firstName: string
  lastName: string
  licenseNumber?: string | null
  specialties?: { specialty: { name: string } }[]
}

const doctorFullName = (doctor: DoctorOption) =>
  `${doctor.firstName} ${doctor.lastName}`.trim()

const serverFields: Record<string, FieldPath<TreatmentFormValues>> = {
  name: 'name',
  medication_id: 'medicationId',
  dose_per_intake: 'dosePerIntake',
  intakes_per_day: 'intakesPerDay',
  quantity_per_cycle: 'quantityPerCycle',
  start_date: 'startDate',
  prescriber_name: 'prescriberName',
  prescriber_id: 'prescriberId',
  prescription_expires_on: 'prescriptionExpiresOn',
  branch_id: 'branchId',
  responsible_user_id: 'responsibleUserId',
  notes: 'notes',
}

const fieldClass =
  'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400'

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

export function TreatmentForm({
  treatment,
  patientName,
  medications: medicationsProp,
  branches,
  doctors: doctorsProp = [],
  doctorsLoading = false,
  defaultBranchId,
  defaultResponsibleUserId,
  onSave,
  onCancel,
  submitting = false,
  columns = false,
  leadingBlock = null,
}: {
  /** Reparte los bloques en columnas de 3 (alta de tratamiento). */
  columns?: boolean
  /** Bloque que va primero en la primera columna (el selector de paciente del alta). */
  leadingBlock?: ReactNode
  treatment?: Treatment
  /** Nombre del paciente, para fijarlo como título de la sección de medicamento. */
  patientName?: string
  medications: Medication[]
  branches: BranchOption[]
  /** Médicos activos, para elegir el prescriptor con un select. */
  doctors?: DoctorOption[]
  doctorsLoading?: boolean
  defaultBranchId?: string
  defaultResponsibleUserId?: string | null
  onSave: (values: TreatmentSaveValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  // Medicamentos y médicos recién creados desde los botones "+": se suman a las
  // listas por si la caché del selector aún no los trae.
  const statusChanged = useStatusDraftChanged()
  const [createdMedications, setCreatedMedications] = useState<Medication[]>([])
  const [createdDoctors, setCreatedDoctors] = useState<DoctorOption[]>([])
  const [medicationFormOpen, setMedicationFormOpen] = useState(false)
  const canCreateMedication = useCan('medications:write')
  const medications = useMemo(
    () => [
      ...medicationsProp,
      ...createdMedications.filter(
        (created) => !medicationsProp.some((item) => item.id === created.id),
      ),
    ],
    [medicationsProp, createdMedications],
  )
  const doctors = useMemo(
    () => [
      ...doctorsProp,
      ...createdDoctors.filter(
        (created) => !doctorsProp.some((item) => item.id === created.id),
      ),
    ],
    [doctorsProp, createdDoctors],
  )
  const today = todayDateOnly()
  const dateSchema = useMemo(
    () =>
      makeTreatmentSchema({
        today,
        // Al editar, un inicio ya guardado (aunque sea pasado) no se rechaza.
        savedStartDate: treatment?.startDate.slice(0, 10),
      }),
    [today, treatment?.startDate],
  )
  const selectedAtOpen = treatment
    ? medications.find((medication) => medication.id === treatment.medicationId)
    : undefined
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState(
    selectedAtOpen ? medicationName(selectedAtOpen) : '',
  )
  const [listOpen, setListOpen] = useState(false)
  // Texto crudo del input de dosis: con `Number()` en cada tecla, "0." se
  // volvía 0 y no se podían escribir decimales.
  const [doseInput, setDoseInput] = useState('')
  const [deliveredQuantity, setDeliveredQuantity] = useState(
    treatment?.deliveredQuantity != null
      ? String(Number(treatment.deliveredQuantity))
      : String(Number(treatment?.quantityPerCycle ?? 30)),
  )
  const [showFrequencyError, setShowFrequencyError] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<TreatmentFormValues>({
    resolver: zodResolver(dateSchema),
    defaultValues: treatment
      ? {
          name: treatment.name ?? '',
          medicationId: treatment.medicationId,
          dosePerIntake: Number(treatment.dosePerIntake),
          intakesPerDay: Number(treatment.intakesPerDay),
          quantityPerCycle: Number(treatment.quantityPerCycle),
          deliveredQuantity:
            treatment.deliveredQuantity != null
              ? Number(treatment.deliveredQuantity)
              : Number(treatment.quantityPerCycle),
          startDate: treatment.startDate.slice(0, 10),
          endDate: treatment.endDate?.slice(0, 10) ?? '',
          // Si el tratamiento es antiguo y no tiene médico vinculado, el
          // prescriptor en texto libre se muestra igual en el select.
          prescriberId:
            treatment.prescriberDoctorId ?? treatment.prescriberName ?? '',
          prescriberName: treatment.prescriberName ?? '',
          prescriptionExpiresOn: treatment.prescriptionExpiresOn?.slice(0, 10),
          branchId: treatment.branchId,
          responsibleUserId: treatment.responsibleUserId ?? '',
          notes: treatment.notes ?? '',
          // No se usan al editar (ver <DoseScheduleCard>), pero el tipo los exige.
          ...defaultDoseFrequencyValue(),
        }
      : {
          name: '',
          medicationId: '',
          dosePerIntake: NaN,
          intakesPerDay: 1,
          quantityPerCycle: 30,
          deliveredQuantity: 30,
          startDate: todayInputValue(),
          endDate: '',
          prescriberId: '',
          prescriberName: '',
          prescriptionExpiresOn: '',
          ...defaultDoseFrequencyValue(),
          branchId: defaultBranchId ?? branches[0]?.id ?? '',
          responsibleUserId: defaultResponsibleUserId ?? '',
          notes: '',
        },
  })
  const prescriptionInputRef = useRef<HTMLInputElement>(null)
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const hasSavedPrescription = Boolean(
    (treatment as { prescriptionDocumentPath?: string | null } | undefined)
      ?.prescriptionDocumentPath,
  )
  // Al editar, un inicio ya guardado en el pasado se respeta; el resto no puede
  // ser anterior a hoy.
  const savedStart = treatment?.startDate.slice(0, 10) ?? ''
  const minStartDate = savedStart && savedStart < today ? savedStart : today
  const savedExpiry = treatment?.prescriptionExpiresOn?.slice(0, 10) ?? ''
  // Una vigencia ya guardada que quedó en el pasado se respeta al editar; las
  // fechas nuevas no pueden ser anteriores a hoy.
  const minPrescriptionDate =
    savedExpiry && savedExpiry < today ? savedExpiry : today
  // La vigencia solo se pide cuando hay una receta (recién adjuntada o ya guardada).
  const showPrescriptionExpiry =
    prescriptionFile !== null || hasSavedPrescription
  const prescriptionExpiresOn = watch('prescriptionExpiresOn') ?? ''
  const prescriptionDue =
    Boolean(prescriptionExpiresOn) && prescriptionExpiresOn <= today
  const medicationId = watch('medicationId')
  const selectedMedication = medications.find(
    (medication) => medication.id === medicationId,
  )
  // "Unidades por Envase" ya no la edita el usuario: siempre refleja el
  // empaque del medicamento elegido.
  useEffect(() => {
    if (!selectedMedication) return
    setValue(
      'quantityPerCycle',
      Number(selectedMedication.unitsPerPackage) || 0,
      { shouldValidate: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicationId])
  const filteredMedications = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    if (!term) return medications.slice(0, 8)
    return medications
      .filter((medication) =>
        [
          medication.brandName,
          medication.genericName,
          medication.activeIngredient,
          medication.presentation,
        ].some((value) => value?.toLocaleLowerCase('es').includes(term)),
      )
      .slice(0, 8)
  }, [medications, search])

  const quantityPerCycle = Number(watch('quantityPerCycle'))
  const deliveredValue = watch('deliveredQuantity')
  const hasDelivery = treatment?.deliveredQuantity != null
  // Al crear es la cantidad que se planea entregar (queda en la reposición);
  // al editar solo existe una vez que el tratamiento recibió una entrega.
  const showQuantity = !treatment || hasDelivery
  const dosePerIntake = Number(watch('dosePerIntake'))
  const intakesPerDay = Number(watch('intakesPerDay'))
  const startDate = watch('startDate')

  function chooseMedication(medication: Medication) {
    setValue('medicationId', medication.id, {
      shouldValidate: true,
      shouldDirty: true,
    })
    setSearch(medicationName(medication))
    setListOpen(false)
  }

  function clearMedication() {
    setValue('medicationId', '', { shouldValidate: false, shouldDirty: true })
    setSearch('')
    setListOpen(true)
    searchRef.current?.focus()
  }

  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    (treatment as { customValues?: Record<string, unknown> } | undefined)
      ?.customValues ?? {},
  )
  const prescriberId = watch('prescriberId') ?? ''
  // Médico guardado en la última carga: distingue un doctor dado de baja de un
  // prescriptor antiguo escrito a mano.
  const savedDoctorId = treatment?.prescriberDoctorId ?? ''
  const savedPrescriberName = treatment?.prescriberName ?? ''
  const selectedIsDoctor = doctors.some((doctor) => doctor.id === prescriberId)
  const sortedDoctors = useMemo(
    () =>
      [...doctors].sort((a, b) =>
        doctorFullName(a).localeCompare(doctorFullName(b), 'es', {
          sensitivity: 'base',
        }),
      ),
    [doctors],
  )
  // Un médico guardado que ya no está activo se mantiene como opción para no
  // borrarlo al editar otro campo.
  const prescriberNotInList =
    Boolean(savedDoctorId) &&
    prescriberId === savedDoctorId &&
    !selectedIsDoctor
  // Tratamientos antiguos con prescriptor en texto y sin médico vinculado.
  const legacyPrescriberName =
    !selectedIsDoctor && prescriberId !== savedDoctorId ? prescriberId : ''

  const [initialCustomValues] = useState(customValues)
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
  const customDefs = useCustomProperties('treatment').data?.data ?? []

  // Horario de la primera toma: solo se pide al crear (treatment === undefined).
  // Al editar, cambiar un horario ya activo tiene su propio flujo con
  // autorización médica, ver <DoseScheduleCard> más abajo.
  const [frequencyMode, setFrequencyMode] = useState<FrequencyMode>(
    emptyDoseFrequencyValue().frequencyMode,
  )
  const [hoursPreset, setHoursPreset] = useState(
    emptyDoseFrequencyValue().hoursPreset,
  )
  const [customHours, setCustomHours] = useState('')
  const [daysPreset, setDaysPreset] = useState(
    emptyDoseFrequencyValue().daysPreset,
  )
  const [customDays, setCustomDays] = useState('')
  const [startTime, setStartTime] = useState(
    emptyDoseFrequencyValue().startTime,
  )
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [monthdays, setMonthdays] = useState<number[]>([])
  const [weekdayTimes, setWeekdayTimes] = useState<string[]>(
    emptyDoseFrequencyValue().weekdayTimes,
  )
  const frequencyValue = {
    frequencyMode,
    hoursPreset,
    customHours,
    daysPreset,
    customDays,
    startTime,
    weekdays,
    monthdays,
    weekdayTimes,
  }
  const isFrequencyValid = treatment || isDoseFrequencyValid(frequencyValue)

  // Al editar, el horario real vive en el DoseSchedule activo ("Programación
  // de Dosis"), no en `treatment.intakesPerDay` (legado, fijo desde el alta).
  const activeSchedule = useQuery({
    queryKey: ['treatments', treatment?.id, 'dose-schedules'],
    queryFn: () =>
      api<{
        data: (DoseScheduleFrequency & {
          dosePerIntake: string
          effectiveTo: string | null
        })[]
      }>(
        `/api/v1/treatments/${encodeURIComponent(treatment!.id)}/dose-schedules`,
      ),
    enabled: Boolean(treatment),
  })
  const activeDoseSchedule = activeSchedule.data?.data.find(
    (row) => !row.effectiveTo,
  )

  // Para un tratamiento nuevo, `intakesPerDay` nunca lo edita el usuario (se
  // manda fijo al crear la dosis): la cobertura estimada debe salir de la
  // programación real que se eligió arriba, no de ese campo legado.
  const preview = coveragePreview({
    // La cantidad entregada es en unidades; si no hay, una caja completa.
    quantityPerCycle: deliveredValue ?? quantityPerCycle,
    dosePerIntake: activeDoseSchedule
      ? Number(activeDoseSchedule.dosePerIntake)
      : dosePerIntake,
    intakesPerDay: !treatment
      ? dosesPerDayFromFrequency(frequencyValue)
      : activeDoseSchedule
        ? dosesPerDayFromSchedule(activeDoseSchedule)
        : intakesPerDay,
    startDate: startDate ?? '',
  })

  const endDate = watch('endDate') ?? ''
  const suggestion = suggestedDeliveredQuantity({
    startDate: startDate ?? '',
    endDate,
    dosePerIntake: activeDoseSchedule
      ? Number(activeDoseSchedule.dosePerIntake)
      : dosePerIntake,
    dosesPerDay: !treatment
      ? dosesPerDayFromFrequency(frequencyValue)
      : activeDoseSchedule
        ? dosesPerDayFromSchedule(activeDoseSchedule)
        : intakesPerDay,
  })
  // Mientras nadie edite la cantidad entregada, propone lo necesario hasta la
  // fecha de fin; sin fecha de fin, una caja completa.
  const defaultDelivered =
    suggestion?.units ?? (quantityPerCycle > 0 ? quantityPerCycle : undefined)
  const [deliveredEdited, setDeliveredEdited] = useState(Boolean(treatment))
  useEffect(() => {
    if (deliveredEdited || defaultDelivered === undefined) return
    setDeliveredQuantity(String(defaultDelivered))
    setValue('deliveredQuantity', defaultDelivered, { shouldValidate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDelivered, deliveredEdited])

  async function submit(values: TreatmentFormValues) {
    if (!isFrequencyValid) {
      setShowFrequencyError(true)
      return
    }
    if (showPrescriptionExpiry && !values.prescriptionExpiresOn) {
      setError('prescriptionExpiresOn', {
        type: 'validate',
        message: 'Campo requerido.',
      })
      return
    }
    if (
      values.prescriptionExpiresOn &&
      values.prescriptionExpiresOn < minPrescriptionDate
    ) {
      setError('prescriptionExpiresOn', {
        type: 'validate',
        message: 'No puede ser anterior a hoy.',
      })
      return
    }
    const check = validateCustomValues(customDefs, customValues)
    if (!check.ok) {
      setCustomErrors(check.errors)
      return
    }
    setCustomErrors({})
    // El select puede devolver un id de médico o un prescriptor heredado en
    // texto: se separa para que la API reciba el campo correcto.
    const chosen = values.prescriberId ?? ''
    const isDoctor =
      doctors.some((doctor) => doctor.id === chosen) ||
      (Boolean(savedDoctorId) && chosen === savedDoctorId)
    const prescriber = {
      prescriberId: isDoctor ? chosen : '',
      prescriberName: isDoctor ? '' : chosen,
    }
    try {
      await onSave({
        ...values,
        ...prescriber,
        deliveredQuantity: showQuantity ? values.deliveredQuantity : null,
        // La dosis y las tomas ya no se editan aquí: se conservan las del
        // tratamiento (o 1/1 en un alta) para que la API siga calculando igual.
        dosePerIntake: dosePerIntake || 1,
        intakesPerDay: intakesPerDay || 1,
        ...(treatment ? {} : frequencyValue),
        customValues: check.values,
        prescriptionFile,
      })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        let mapped = false
        for (const [key, message] of Object.entries(error.fields)) {
          const field = serverFields[key]
          if (field && typeof message === 'string') {
            setError(field, { type: 'server', message })
            mapped = true
          }
        }
        if (!mapped)
          setError('root.server' as FieldPath<TreatmentFormValues>, {
            type: 'server',
            message: error.message,
          })
      } else {
        setError('root.server' as FieldPath<TreatmentFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar el tratamiento.',
        })
      }
    }
  }

  // Edición sin cambios: campos, propiedades personalizadas y receta adjunta.
  const unchanged =
    Boolean(treatment) &&
    !isDirty &&
    !statusChanged &&
    prescriptionFile === null &&
    normalizeCustom(customValues) === normalizeCustom(initialCustomValues)

  const medicationBlock = (
    <div
      className={
        columns ? undefined : 'sticky top-0 z-10 -mb-5 bg-[#EAF7F0] pt-3 pb-5'
      }
    >
      <ModalSection
        icon={<Pill className="size-4" />}
        title={patientName || 'Medicamento'}
      >
        <div className="sm:col-span-2">
          <TextField
            label="Nombre del tratamiento"
            required
            placeholder="Ej. Control de hipertensión"
            maxLength={160}
            autoComplete="off"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:col-span-2 sm:flex-row sm:flex-wrap sm:items-start">
          <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-1.5 sm:min-w-64">
            <div className="flex h-5 items-center gap-1">
              <label
                htmlFor="treatment-medication"
                className="text-ink text-sm font-medium"
              >
                Medicamento <span className="text-red-700">*</span>
              </label>
              {canCreateMedication && (
                <Button
                  type="button"
                  variant="ghost"
                  className="size-6 px-0"
                  aria-label="Crear medicamento"
                  title="Crear medicamento"
                  onClick={() => setMedicationFormOpen(true)}
                >
                  <Plus className="size-4" />
                </Button>
              )}
            </div>
            {selectedMedication ? (
              <div className="border-border flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2">
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-semibold">
                    {medicationName(selectedMedication)}
                  </p>
                  <p className="text-muted truncate text-xs">
                    <span className="font-semibold">
                      {selectedMedication.presentation}
                    </span>{' '}
                    · Contenido:{' '}
                    <span className="font-semibold">
                      {String(selectedMedication.unitsPerPackage)}
                    </span>{' '}
                    · Ud.:{' '}
                    <span className="font-semibold">
                      {selectedMedication.doseUnit}
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 shrink-0 px-2 text-xs"
                  onClick={clearMedication}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <input
                    id="treatment-medication"
                    ref={searchRef}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setValue('medicationId', '', { shouldDirty: true })
                      setListOpen(true)
                    }}
                    onFocus={() => setListOpen(true)}
                    onBlur={() =>
                      window.setTimeout(() => setListOpen(false), 120)
                    }
                    placeholder="Buscar por nombre o presentación…"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={listOpen}
                    aria-controls="treatment-medication-options"
                    aria-autocomplete="list"
                    aria-invalid={Boolean(errors.medicationId)}
                    className={`${fieldClass} pr-9 pl-9`}
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Limpiar búsqueda"
                      onClick={() => {
                        setSearch('')
                        searchRef.current?.focus()
                      }}
                      className="text-muted hover:text-ink absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                {listOpen && (
                  <div
                    id="treatment-medication-options"
                    role="listbox"
                    aria-label="Medicamentos"
                    className="app-scroll border-border mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white p-1 shadow-lg"
                  >
                    {filteredMedications.length ? (
                      filteredMedications.map((medication) => (
                        <button
                          key={medication.id}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => chooseMedication(medication)}
                          className="hover:bg-surface flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left"
                        >
                          <span className="text-ink text-sm font-medium">
                            {medicationName(medication)}
                          </span>
                          <span className="text-muted text-xs">
                            {medication.presentation}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-muted px-3 py-2 text-sm">
                        No encontramos medicamentos con esa búsqueda.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            {errors.medicationId && (
              <p className="text-xs text-red-700">
                {errors.medicationId.message}
              </p>
            )}
            {!medications.length && (
              <p className="text-muted text-xs">
                Primero registra un medicamento en el catálogo.
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-start gap-4 sm:ml-auto">
            <div className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">
                Adjuntar Receta
              </span>
              <input
                ref={prescriptionInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                aria-label="Adjuntar Receta"
                onChange={(event) =>
                  setPrescriptionFile(event.target.files?.[0] ?? null)
                }
              />
              {prescriptionFile ? (
                <div className="border-border flex h-10 max-w-44 items-center gap-1 rounded-lg border bg-white pr-1 pl-3 text-sm">
                  <Paperclip className="text-tealmax size-4 shrink-0" />
                  <span
                    className="text-ink min-w-0 flex-1 truncate"
                    title={prescriptionFile.name}
                  >
                    {prescriptionFile.name}
                  </span>
                  <button
                    type="button"
                    aria-label="Quitar receta"
                    className="text-muted rounded p-1 hover:text-red-700"
                    onClick={() => {
                      setPrescriptionFile(null)
                      if (prescriptionInputRef.current)
                        prescriptionInputRef.current.value = ''
                      // Sin receta no hay vigencia que pedir: se descarta la que se
                      // puso con ella (una ya guardada en el tratamiento se conserva).
                      if (!hasSavedPrescription && !savedExpiry) {
                        setValue('prescriptionExpiresOn', '', {
                          shouldValidate: false,
                        })
                        clearErrors('prescriptionExpiresOn')
                      }
                    }}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  className="h-10"
                  onClick={() => prescriptionInputRef.current?.click()}
                >
                  <Paperclip className="size-4" />
                  {hasSavedPrescription ? 'Reemplazar' : 'Adjuntar'}
                </Button>
              )}
              {hasSavedPrescription && !prescriptionFile && treatment && (
                <button
                  type="button"
                  className="text-tealmax w-fit text-xs hover:underline"
                  onClick={() =>
                    openFile(
                      `${API_URL}/api/v1/treatments/${encodeURIComponent(treatment.id)}/prescription-document`,
                    ).catch((error: unknown) =>
                      setError(
                        'root.server' as FieldPath<TreatmentFormValues>,
                        {
                          type: 'server',
                          message:
                            error instanceof Error
                              ? error.message
                              : 'No se pudo abrir la receta',
                        },
                      ),
                    )
                  }
                >
                  Ver Receta
                </button>
              )}
            </div>
            {showPrescriptionExpiry && (
              <div className="grid gap-1.5">
                <label
                  htmlFor="treatment-prescription-expires"
                  className={`text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*'] ${prescriptionDue ? 'text-red-700' : 'text-ink'}`}
                >
                  Vigencia Receta
                </label>
                <input
                  id="treatment-prescription-expires"
                  type="date"
                  min={minPrescriptionDate}
                  {...register('prescriptionExpiresOn')}
                  aria-invalid={Boolean(errors.prescriptionExpiresOn)}
                  className={`${fieldClass} w-40 ${
                    prescriptionDue
                      ? 'border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-200'
                      : ''
                  }`}
                />
                {errors.prescriptionExpiresOn?.message && (
                  <p className="max-w-40 text-xs text-red-700">
                    {errors.prescriptionExpiresOn.message}
                  </p>
                )}
                {prescriptionDue && !errors.prescriptionExpiresOn && (
                  <p className="max-w-40 text-xs text-red-700">
                    La receta ya llegó a su fecha de vigencia.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </ModalSection>
    </div>
  )

  const validityBlock = (
    <ModalSection icon={<CalendarDays className="size-4" />} title="Vigencia">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Fecha de inicio"
          type="date"
          required
          min={minStartDate}
          {...register('startDate')}
          error={errors.startDate?.message}
        />
        <TextField
          label="Fecha de fin"
          type="date"
          min={startDate || today}
          {...register('endDate')}
          error={errors.endDate?.message}
        />
        <div className="grid gap-1.5">
          <div className="flex items-center gap-1">
            <label
              htmlFor="treatment-prescriber"
              className="text-ink text-sm font-medium"
            >
              Doctor
            </label>
            <NewDoctorButton
              onCreated={(created) => {
                setCreatedDoctors((current) => [...current, created])
                setValue('prescriberId', created.id, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }}
            />
          </div>
          <Select
            id="treatment-prescriber"
            {...register('prescriberId')}
            // Select controlado por valor: si los médicos (`doctors`) todavía
            // estaban cargando cuando este <Select> se montó, la opción del
            // médico guardado no existía aún y el navegador no podía
            // seleccionarla. Fijar `value` fuerza a React a re-sincronizar
            // la selección en cuanto la opción correcta aparece.
            value={prescriberId}
            aria-invalid={Boolean(errors.prescriberId)}
            aria-describedby={
              errors.prescriberId ? 'treatment-prescriber-error' : undefined
            }
            className={`${fieldClass} appearance-none`}
          >
            <option value="">
              {doctorsLoading
                ? 'Cargando médicos…'
                : doctors.length
                  ? 'Sin doctor'
                  : 'Sin doctor (no hay médicos activos)'}
            </option>
            {/* Un médico guardado que ya no está activo no debe perderse. */}
            {prescriberNotInList && prescriberId && (
              <option value={prescriberId}>
                {savedPrescriberName || 'Médico no listado'}
              </option>
            )}
            {/* Prescriptor antiguo en texto libre, sin médico vinculado. */}
            {legacyPrescriberName && (
              <option value={legacyPrescriberName}>
                {legacyPrescriberName}
              </option>
            )}
            {sortedDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctorFullName(doctor)}
                {doctor.specialties?.length
                  ? ` · ${doctor.specialties[0]?.specialty.name}`
                  : ''}
              </option>
            ))}
          </Select>
          {errors.prescriberId?.message && (
            <p id="treatment-prescriber-error" className="text-xs text-red-700">
              {errors.prescriberId.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="treatment-branch"
            className="text-ink text-sm font-medium"
          >
            Sucursal <span className="text-red-700">*</span>
          </label>
          {/* La sucursal es la del paciente y no se edita. */}
          <input type="hidden" {...register('branchId')} />
          <p
            id="treatment-branch"
            className="border-border text-muted bg-surface h-10 w-full rounded-lg border px-3 text-sm leading-10"
          >
            {branches.find((branch) => branch.id === watch('branchId'))?.name ??
              'Sin sucursal asignada'}
          </p>
          {errors.branchId?.message && (
            <p className="text-xs text-red-700">{errors.branchId.message}</p>
          )}
        </div>
      </div>
    </ModalSection>
  )

  const doseBlock = treatment ? (
    <DoseScheduleCard
      treatmentId={treatment.id}
      medicationLabel={
        selectedMedication ? medicationName(selectedMedication) : ''
      }
      doseUnit={selectedMedication?.doseUnit ?? ''}
    />
  ) : (
    <ModalSection
      icon={<Timer className="size-4" />}
      title="Dosis Del Tratamiento"
    >
      <DoseFrequencyRow
        quantity={doseInput}
        onQuantityChange={(value) => {
          setDoseInput(value)
          setValue('dosePerIntake', value === '' ? NaN : Number(value), {
            shouldValidate: true,
          })
        }}
        unit={selectedMedication?.doseUnit || ''}
        quantityError={errors.dosePerIntake?.message}
        value={frequencyValue}
        requireTomaTime
        onChange={(next) => {
          setFrequencyMode(next.frequencyMode)
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
      {showFrequencyError && !isFrequencyValid && (
        <p role="alert" className="text-xs text-red-700">
          Campo requerido. Selecciona la frecuencia, los días (si aplica) y la
          hora de toma.
        </p>
      )}
      <p className="text-muted text-xs leading-5">
        Para cambiar este horario más adelante, edita el tratamiento.
      </p>
    </ModalSection>
  )

  const quantityBlock = (
    <ModalSection
      icon={<CalendarClock className="size-4" />}
      title="Cantidad Y Cobertura"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-3">
        <div className="grid gap-0">
          <div className="flex items-center gap-2">
            <label
              htmlFor="treatment-quantity-per-cycle"
              className="text-ink text-sm font-medium whitespace-nowrap"
            >
              Unidades por Envase
            </label>
            <input
              id="treatment-quantity-per-cycle"
              type="number"
              disabled
              readOnly
              value={quantityPerCycle || ''}
              className="h-10 w-20 rounded-lg border border-emerald-300 bg-emerald-100 px-3 text-sm text-emerald-700 outline-none"
            />
            {selectedMedication?.doseUnit && (
              <span className="text-ink text-sm whitespace-nowrap">
                {selectedMedication.doseUnit}
              </span>
            )}
          </div>
          {selectedMedication?.presentation && (
            <p className="text-muted -mt-1.5 text-xs leading-none">
              {selectedMedication.presentation}
            </p>
          )}
        </div>
        {showQuantity && (
          <div className="grid gap-0">
            <div className="flex items-center gap-2">
              <label
                htmlFor="treatment-delivered-quantity"
                className="text-ink text-sm font-medium whitespace-nowrap"
              >
                {hasDelivery ? 'Cantidad Entregada' : 'Cantidad a Entregar'}
              </label>
              <input
                id="treatment-delivered-quantity"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={deliveredQuantity}
                onChange={(event) => {
                  const raw = event.target.value
                  setDeliveredEdited(true)
                  setDeliveredQuantity(raw)
                  setValue(
                    'deliveredQuantity',
                    raw === '' ? null : Number(raw),
                    { shouldDirty: true, shouldValidate: true },
                  )
                }}
                className="border-border text-ink focus:border-petroleo h-10 w-24 rounded-lg border bg-white px-3 text-sm outline-none"
              />
            </div>
            {selectedMedication?.doseUnit && (
              <p className="text-muted -mt-1.5 text-xs leading-none">
                {selectedMedication.doseUnit}
              </p>
            )}
          </div>
        )}
      </div>
      {showQuantity && suggestion && (
        <p className="text-muted text-xs">
          Sugerido: {suggestion.units}{' '}
          {selectedMedication?.doseUnit || 'unidades'} para cubrir{' '}
          {suggestion.days} {suggestion.days === 1 ? 'día' : 'días'} de
          tratamiento.
          {String(suggestion.units) !== deliveredQuantity && (
            <>
              {' '}
              <button
                type="button"
                className="text-petroleo font-medium underline"
                onClick={() => {
                  setDeliveredQuantity(String(suggestion.units))
                  setValue('deliveredQuantity', suggestion.units, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              >
                Usar sugerido
              </button>
            </>
          )}
        </p>
      )}
      {showQuantity && errors.deliveredQuantity?.message && (
        <p className="text-xs text-red-700">
          {errors.deliveredQuantity.message}
        </p>
      )}
      {errors.quantityPerCycle?.message && (
        <p className="text-xs text-red-700">
          {errors.quantityPerCycle.message}
        </p>
      )}
      <div className="border-border rounded-lg border bg-white p-3">
        <div className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <CalendarDays className="size-4" />
          Cobertura estimada
        </div>
        {preview ? (
          <>
            <p className="text-petroleo font-display mt-1 text-xl font-bold tracking-tight">
              {formatDurationYMD(preview.days, startDate)}
            </p>
          </>
        ) : (
          <p className="text-muted mt-1 text-sm leading-6">
            {!treatment &&
            ((frequencyMode === 'weekday' && weekdays.length === 0) ||
              (frequencyMode === 'monthday' && monthdays.length === 0))
              ? 'Selecciona los días de toma para ver la cobertura estimada.'
              : 'Completa la cantidad y la fecha de inicio para ver la cobertura estimada.'}
          </p>
        )}
      </div>
    </ModalSection>
  )

  const notesBlock = (
    <ModalSection icon={<FileText className="size-4" />} title="Notas">
      <TextAreaField
        label="Notas"
        rows={3}
        placeholder="Indicaciones adicionales del tratamiento…"
        {...register('notes')}
      />
    </ModalSection>
  )

  // En columnas, el bloque inicial (paciente) y los de abajo se reparten de 3 en 3, en el mismo orden.
  const blocks = [
    ...(leadingBlock ? [leadingBlock] : []),
    medicationBlock,
    validityBlock,
    doseBlock,
    quantityBlock,
    notesBlock,
  ]
  const columnCount = Math.ceil(blocks.length / 3)

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit, () => setShowFrequencyError(true))}
      className="grid gap-5"
    >
      {columns ? (
        <div
          className="grid gap-5 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
          style={{ '--cols': columnCount } as CSSProperties}
        >
          {Array.from({ length: columnCount }, (_, column) => (
            <div key={column} className="grid content-start gap-5">
              {blocks.slice(column * 3, column * 3 + 3).map((block, row) => (
                <Fragment key={row}>{block}</Fragment>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          {medicationBlock}
          {validityBlock}
          {doseBlock}
          {quantityBlock}
          {notesBlock}
        </>
      )}

      {errors.root?.server?.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {errors.root.server.message}
        </p>
      )}
      <CustomFields
        entity="treatment"
        values={customValues}
        errors={customErrors}
        onChange={setCustomValues}
      />
      {selectedMedication?.primaryImageId && (
        // Solo en papel: la foto del medicamento sola, en su propia página.
        <div className="hidden break-before-page print:flex print:justify-center">
          <MedicationImage
            medicationId={selectedMedication.id}
            attachmentId={selectedMedication.primaryImageId}
            alt={`Foto de ${medicationName(selectedMedication)}`}
            className="max-h-[240mm] max-w-full object-contain"
          />
        </div>
      )}
      <FormActions>
        <Button type="button" className="w-full sm:w-auto" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={submitting || unchanged}
          title={unchanged ? 'No hay cambios para guardar' : undefined}
        >
          {submitting
            ? 'Guardando…'
            : treatment
              ? 'Guardar Cambios'
              : 'Crear Tratamiento'}
        </Button>
      </FormActions>
      {medicationFormOpen && canCreateMedication && (
        <MedicationQuickCreateDialog
          onCreated={(created) => {
            setCreatedMedications((current) => [...current, created])
            chooseMedication(created)
          }}
          onClose={() => setMedicationFormOpen(false)}
        />
      )}
    </form>
  )
}
