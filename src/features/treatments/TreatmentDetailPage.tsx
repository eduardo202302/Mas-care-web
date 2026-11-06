import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarCheck,
  FileText,
  Mail,
  Phone,
  PhoneCall,
  Pill,
  Plus,
  StickyNote,
  Users,
} from 'lucide-react'
import {
  CustomValuesView,
  customPropertyGroups,
} from '@/components/CustomFields'
import { useCustomProperties } from '@/lib/custom-properties'
import {
  PropertiesDialog,
  type PropertyGroup,
} from '@/components/PropertiesDialog'
import {
  RecordActionsMenu,
  type RecordAction,
} from '@/components/RecordActionsMenu'
import { StatusChip } from '@/components/StatusChip'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components } from '@/lib/api-types'
import {
  derivedStatusLabel,
  formatDate,
  formatQuantity,
  frequencyColumns,
  medicationName,
  treatmentStatusLabel,
  type DoseScheduleFrequency,
  type Medication,
  type Treatment,
  updateTreatmentFromForm,
} from '@/lib/treatments'
import { taskDueLabel, taskTypeLabels, type TaskList } from '@/lib/operations'
import { incidentTypeLabels, type Incident } from '@/lib/incidents'
import type { TreatmentSaveValues } from '@/schemas/treatment'
import {
  PauseDialog,
  useSetAutomationPaused,
} from '@/features/messaging/PauseAutomation'
import { TreatmentForm } from './TreatmentForm'
import {
  TreatmentActionDialog,
  type TreatmentActionType,
} from './TreatmentActionDialog'
import { DoseScheduleCard, DoseTimeline } from './DoseTracking'
import { InventoryPanel } from './InventoryPanel'
import { ActivityHistory } from '@/components/ActivityHistory'
import { PatientDoctorsPanel } from '@/features/patients/PatientDoctorsPanel'

type ActivityKind = 'note' | 'call' | 'email' | 'meeting'
type DoctorPickerList = {
  data: {
    id: string
    firstName: string
    lastName: string
    licenseNumber?: string | null
  }[]
}

const kindTitle: Record<ActivityKind, string> = {
  note: 'Añadir Nota',
  call: 'Registrar Llamada',
  email: 'Registrar Correo',
  meeting: 'Registrar Reunión',
}

function Panel({
  title,
  children,
  action,
  inlineAction = false,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
  /** Deja la acción pegada al título en vez de empujarla al extremo derecho. */
  inlineAction?: boolean
}) {
  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <div
        className={
          inlineAction
            ? 'mb-4 flex items-center gap-2'
            : 'mb-4 flex items-center justify-between gap-2'
        }
      >
        <h2 className="text-petroleo font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Treatment record: properties on the left, history/cycles in the middle, associations on the right. */
export default function TreatmentDetailPage() {
  const { patientId = '', id = '' } = useParams()
  const queryClient = useQueryClient()
  const canWrite = useCan('treatments:write')
  const canWriteActivity = useCan('patients:write')
  const canReadTasks = useCan('tasks:read')
  const canReadDoctors = useCan('doctors:read')
  const [tab, setTab] = useState<'history' | 'doses'>('history')
  const [kind, setKind] = useState<ActivityKind | null>(null)
  const [body, setBody] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const treatmentDefs = useCustomProperties('treatment').data?.data ?? []
  const [editing, setEditing] = useState(false)
  const [doctorAddOpen, setDoctorAddOpen] = useState(false)
  const [action, setAction] = useState<TreatmentActionType | null>(null)
  const [askingPause, setAskingPause] = useState(false)
  const automation = useSetAutomationPaused('treatments', id, [
    ['treatments', id],
    ['outbox'],
  ])

  const treatment = useQuery({
    queryKey: ['treatments', id],
    queryFn: () =>
      api<Treatment>(`/api/v1/treatments/${encodeURIComponent(id)}`),
  })
  const patient = useQuery({
    queryKey: ['patients', patientId],
    queryFn: () =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(patientId)}`,
      ),
  })
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', limit: 100 }],
    queryFn: () =>
      api<{ data: Medication[] }>(
        '/api/v1/medications?archived=false&limit=100',
      ),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () =>
      api<{ data: { id: string; name: string; labelColor?: string }[] }>(
        '/api/v1/branches',
      ),
  })
  const users = useQuery({
    queryKey: ['users', { limit: 100 }],
    queryFn: () =>
      api<{ data: { id: string; name: string }[] }>('/api/v1/users?limit=100'),
  })
  // Médicos activos para el select de prescriptor.
  const doctorPicker = useQuery({
    queryKey: ['doctors', 'picker'],
    queryFn: () =>
      api<DoctorPickerList>('/api/v1/doctors?isActive=true&rows=100'),
    enabled: editing && canReadDoctors,
  })
  const tasks = useQuery({
    queryKey: ['tasks', 'treatment', id],
    queryFn: () =>
      api<TaskList>(
        `/api/v1/tasks?treatment_id=${encodeURIComponent(id)}&status=open&limit=20`,
      ),
    enabled: canReadTasks,
  })
  const incidents = useQuery({
    queryKey: ['patients', patientId, 'incidents'],
    queryFn: () =>
      api<{ data: Incident[] }>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/incidents`,
      ),
  })
  // Otros medicamentos agregados junto con este, en la misma sesión del
  // perfil de salud ("Medicamentos de esta indicación").
  const groupId = (treatment.data as Treatment | undefined)?.prescriptionGroupId
  const siblings = useQuery({
    queryKey: ['treatments', 'group', groupId],
    queryFn: () =>
      api<{ data: Treatment[] }>(
        `/api/v1/treatments?prescription_group_id=${encodeURIComponent(groupId!)}`,
      ),
    enabled: Boolean(groupId),
  })
  const siblingIds = (siblings.data?.data ?? [])
    .map((item) => item.id)
    .filter((siblingId) => siblingId !== id)
  const siblingSchedules = useQuery({
    queryKey: ['treatments', 'group-schedules', siblingIds],
    queryFn: async () => {
      const entries = await Promise.all(
        siblingIds.map(async (treatmentId) => {
          const result = await api<{
            data: (DoseScheduleFrequency & { effectiveTo: string | null })[]
          }>(
            `/api/v1/treatments/${encodeURIComponent(treatmentId)}/dose-schedules`,
          )
          return [
            treatmentId,
            result.data.find((row) => !row.effectiveTo) ?? null,
          ] as const
        }),
      )
      return new Map(entries)
    },
    enabled: siblingIds.length > 0,
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['treatments'] })
    await queryClient.invalidateQueries({
      queryKey: ['patients', patientId, 'activities'],
    })
    await queryClient.invalidateQueries({ queryKey: ['cycles'] })
  }
  const addActivity = useMutation({
    mutationFn: () =>
      api(`/api/v1/patients/${encodeURIComponent(patientId)}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          type: kind,
          body: body.trim(),
          treatmentId: id,
          metadata: {},
          ...(kind === 'email' || kind === 'meeting'
            ? { occurredOn: date }
            : {}),
        }),
      }),
    onSuccess: async () => {
      await invalidate()
      setKind(null)
      setBody('')
    },
  })
  const save = useMutation({
    mutationFn: (values: TreatmentSaveValues) =>
      updateTreatmentFromForm(id, values),
    onSuccess: async () => {
      await invalidate()
      setEditing(false)
    },
  })

  if (treatment.isLoading)
    return <Skeleton className="h-96 w-full rounded-xl" />
  if (treatment.isError || !treatment.data) {
    return (
      <div>
        <Link
          to={`/pacientes/${patientId}`}
          className="text-tealmax inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          Volver al paciente
        </Link>
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar esta ficha. {treatment.error?.message}
        </p>
      </div>
    )
  }

  const record = treatment.data
  const medication = medications.data?.data.find(
    (item) => item.id === record.medicationId,
  )
  const branch = branches.data?.data.find((item) => item.id === record.branchId)
  const responsible = users.data?.data.find(
    (item) => item.id === record.responsibleUserId,
  )?.name
  const derived = derivedStatusLabel(record.derived_status)
  const isExpired = Boolean(
    record.endDate && new Date(record.endDate) < new Date(),
  )
  const openIncidents = (incidents.data?.data ?? []).filter(
    (incident) =>
      incident.status !== 'resolved' &&
      (incident as { treatmentId?: string | null }).treatmentId === id,
  )
  const isActiveOrPaused =
    record.status === 'active' || record.status === 'paused'

  async function viewFullHistory() {
    setTab('history')
  }
  const actions: RecordAction[] = [
    ...(canWrite && record.status !== 'finished'
      ? [{ label: 'Editar', onClick: () => setEditing(true) }]
      : []),
    ...(canWrite && isActiveOrPaused && record.status === 'active'
      ? [{ label: 'Pausar', onClick: () => setAction('pause') }]
      : []),
    ...(canWrite && isActiveOrPaused
      ? [
          {
            label: 'Finalizar',
            danger: true,
            onClick: () => setAction('finish'),
          },
        ]
      : []),
    ...(canWrite && record.status === 'active'
      ? [
          (record as { automationPaused?: boolean }).automationPaused
            ? {
                label: 'Reanudar avisos automáticos',
                onClick: () => automation.mutate({ paused: false }),
              }
            : {
                label: 'Pausar avisos automáticos',
                onClick: () => setAskingPause(true),
              },
        ]
      : []),
    { label: 'Ver historial completo', onClick: () => void viewFullHistory() },
    {
      label: 'Ver todas las propiedades',
      onClick: () => setPropertiesOpen(true),
    },
  ]
  const treatmentValues =
    (record as { customValues?: Record<string, unknown> }).customValues ?? {}
  const groups: PropertyGroup[] = [
    {
      name: 'Datos',
      items: [
        { label: 'Paciente', value: patient.data?.fullName },
        { label: 'Medicamento', value: medicationName(medication) },
        { label: 'Cantidad por Ciclo', value: String(record.quantityPerCycle) },
        { label: 'Inicio', value: formatDate(record.startDate) },
        { label: 'Notas', value: record.notes },
      ],
    },
    {
      name: 'Tratamiento',
      items: [
        { label: 'Estado', value: treatmentStatusLabel(record.status) },
        { label: 'Doctor', value: record.prescriberName },
        { label: 'Fecha de fin', value: formatDate(record.endDate) },
      ],
    },
    {
      name: 'Cobertura',
      items: [
        { label: 'Fin de cobertura', value: formatDate(record.coverageEndOn) },
        { label: 'Última entrega', value: formatDate(record.lastDeliveryOn) },
      ],
    },
    {
      name: 'Asignación',
      items: [
        { label: 'Sucursal', value: branch?.name },
        { label: 'Responsable', value: responsible },
      ],
    },
    ...customPropertyGroups(treatmentDefs, treatmentValues),
  ]
  const tabButton = (value: 'history' | 'doses', label: string) => (
    <button
      className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === value ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`}
      onClick={() => setTab(value)}
    >
      {label}
    </button>
  )

  return (
    <div>
      {/* Barra fija: `-top-8` + `-mt-8` cancelan el `py-8` de <main>, que es el
          contenedor de scroll (AppLayout). Vive FUERA del wrapper `.animate-in`
          porque la animación deja un `transform` aplicado y un ancestro
          transformado puede impedir que `position: sticky` se pegue. */}
      <div className="bg-modulos border-border sticky -top-8 z-20 -mx-5 -mt-8 border-b px-5 pt-2.5 pb-2 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link
              to={`/pacientes/${patientId}`}
              className="text-muted hover:text-petroleo inline-flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="size-3.5" />
              {patient.data?.fullName ?? 'Paciente'}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-muted text-[11px] font-semibold tracking-wide uppercase">
                Tratamiento
              </span>
              {derived ? (
                <StatusChip
                  status={derived}
                  className="px-2 py-0.5 text-[11px]"
                />
              ) : (
                <span className="text-muted text-xs">
                  {treatmentStatusLabel(record.status)}
                </span>
              )}
              {record.prescription_flag && (
                <StatusChip
                  status="Receta por renovar"
                  className="px-2 py-0.5 text-[11px]"
                />
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <RecordActionsMenu actions={actions} />
          </div>
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h1 className="font-display text-petroleo truncate text-xl font-bold tracking-tight">
            {medicationName(medication)}
          </h1>
          <span className="text-tealmax shrink-0 text-xs font-medium">
            #{record.numericId}
          </span>
        </div>
      </div>

      <div className="animate-in">
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(250px,0.9fr)_minmax(360px,1.35fr)_minmax(230px,0.8fr)]">
          <div className="grid min-w-0 gap-4">
            <Panel title="Datos del Tratamiento">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Cantidad por Ciclo</dt>
                  <dd className="mt-0.5">{String(record.quantityPerCycle)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Creación</dt>
                  <dd className="mt-0.5">{formatDate(record.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Vencimiento</dt>
                  <dd className="mt-0.5">
                    {record.endDate ? (
                      <span className={isExpired ? 'text-red-600' : undefined}>
                        {formatDate(record.endDate)}
                      </span>
                    ) : (
                      <span className="text-muted">Sin definir</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Fin Cobertura Medicamento</dt>
                  <dd className="mt-0.5">{formatDate(record.coverageEndOn)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted">Doctor</dt>
                  <dd className="mt-0.5">{record.prescriberName || '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted">Notas</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap">
                    {record.notes || 'Sin notas'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted">Avisos Automáticos</dt>
                  <dd className="mt-0.5">
                    {(record as { automationPaused?: boolean }).automationPaused
                      ? 'Pausados'
                      : 'Activos'}
                  </dd>
                </div>
              </dl>
            </Panel>
            {siblingIds.length > 0 && (
              <Panel title="Medicamentos de esta indicación">
                <div className="app-scroll overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-muted border-border border-b text-xs font-semibold tracking-wide uppercase">
                        <th className="py-2 pr-3">Producto</th>
                        <th className="py-2 pr-3">Cantidad</th>
                        <th className="py-2 pr-3">Unidad</th>
                        <th className="py-2 pr-3">Frecuencia</th>
                        <th className="py-2">Hora de toma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(siblings.data?.data ?? [])
                        .filter((item) => item.id !== id)
                        .map((item) => {
                          const itemMedication = medications.data?.data.find(
                            (candidate) => candidate.id === item.medicationId,
                          )
                          const schedule = siblingSchedules.data?.get(item.id)
                          const columns = schedule
                            ? frequencyColumns(schedule)
                            : { frequency: 'Sin horario', whenToTake: '—' }
                          return (
                            <tr
                              key={item.id}
                              className="border-border border-b last:border-0"
                            >
                              <td className="py-2 pr-3">
                                <Link
                                  to={`/pacientes/${encodeURIComponent(patientId)}/tratamientos/${encodeURIComponent(item.id)}`}
                                  className="text-tealmax hover:underline"
                                >
                                  {medicationName(itemMedication)}
                                </Link>
                              </td>
                              <td className="py-2 pr-3">
                                {formatQuantity(item.dosePerIntake)}
                              </td>
                              <td className="py-2 pr-3">
                                {itemMedication?.doseUnit || 'unidad'}
                              </td>
                              <td className="py-2 pr-3">{columns.frequency}</td>
                              <td className="py-2">{columns.whenToTake}</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}
            <InventoryPanel treatmentId={id} />
            <CustomValuesView entity="treatment" values={treatmentValues} />
          </div>

          <section className="border-border min-h-[420px] min-w-0 rounded-xl border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <div className="bg-surface flex rounded-lg p-1">
                  {tabButton('history', 'Historial')}
                  {tabButton('doses', 'Dosis')}
                </div>
                <span
                  className="text-tealmax min-w-0 truncate text-sm font-semibold"
                  title={medicationName(medication) || undefined}
                >
                  {medicationName(medication) || '—'}
                </span>
              </div>
              {tab === 'history' && canWriteActivity && (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setKind('note')}>
                    <FileText className="size-4" />
                    Nota
                  </Button>
                  <Button onClick={() => setKind('call')}>
                    <Phone className="size-4" />
                    Llamada
                  </Button>
                  <Button onClick={() => setKind('email')}>
                    <Mail className="size-4" />
                    Correo
                  </Button>
                  <Button onClick={() => setKind('meeting')}>
                    <Users className="size-4" />
                    Reunión
                  </Button>
                </div>
              )}
            </div>
            {tab === 'history' ? (
              <div className="mt-6">
                <ActivityHistory
                  patientId={patientId}
                  treatmentId={id}
                  emptyTitle="Sin actividad todavía"
                  emptyDescription="Las notas, llamadas, correos, reuniones y cambios de este tratamiento aparecerán aquí."
                />
              </div>
            ) : (
              <div className="mt-6">
                <DoseScheduleCard
                  treatmentId={id}
                  medicationLabel={medicationName(medication)}
                  doseUnit={medication?.doseUnit ?? ''}
                />
                <DoseTimeline treatmentId={id} />
              </div>
            )}
          </section>

          <div className="grid min-w-0 gap-4">
            <Panel title="Paciente">
              <dl className="grid gap-2 text-sm">
                <div className="flex min-w-0 gap-1.5">
                  <dt className="text-muted shrink-0">Sucursal:</dt>
                  <dd className="text-ink min-w-0 truncate font-medium">
                    {branch?.name ?? '—'}
                  </dd>
                </div>
                <div className="flex min-w-0 gap-1.5">
                  <dt className="text-muted shrink-0">Paciente:</dt>
                  <dd className="min-w-0 truncate">
                    <Link
                      to={`/pacientes/${patientId}`}
                      className="text-petroleo hover:text-tealmax font-semibold hover:underline"
                    >
                      {patient.data?.fullName ?? 'Ver paciente'}
                    </Link>
                  </dd>
                </div>
                {/* Solo la condición principal: el listado completo vive en la
                    ficha del paciente. */}
                {patient.data?.primaryConditionName && (
                  <div className="flex min-w-0 gap-1.5">
                    <dt className="text-muted shrink-0">Condición:</dt>
                    <dd className="text-ink min-w-0 truncate font-medium">
                      {patient.data.primaryConditionName}
                    </dd>
                  </div>
                )}
              </dl>
            </Panel>
            <Panel
              title="Médicos"
              inlineAction
              action={
                canWriteActivity && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="size-6 px-0"
                    aria-expanded={doctorAddOpen}
                    aria-label="Agregar médico"
                    onClick={() => setDoctorAddOpen(true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                )
              }
            >
              <PatientDoctorsPanel
                patientId={patientId}
                addOpen={doctorAddOpen}
                onCloseAdd={() => setDoctorAddOpen(false)}
              />
            </Panel>
            <Panel title="Tareas Abiertas">
              {tasks.data?.data.length ? (
                <ul className="grid gap-3">
                  {tasks.data.data.map((task) => (
                    <li
                      key={task.id}
                      className="border-border border-b pb-3 last:border-0 last:pb-0"
                    >
                      <p className="text-ink text-sm font-semibold">
                        {task.title}
                      </p>
                      <p className="text-muted mt-0.5 text-xs">
                        {taskTypeLabels[task.type]} · {taskDueLabel(task)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm">Sin tareas abiertas.</p>
              )}
            </Panel>
            <Panel title="Incidencias Abiertas">
              {openIncidents.length ? (
                <ul className="grid gap-3">
                  {openIncidents.map((incident) => (
                    <li
                      key={incident.id}
                      className="border-border border-b pb-3 last:border-0 last:pb-0"
                    >
                      <Link
                        to={`/incidencias?incident=${incident.id}`}
                        className="text-petroleo hover:text-tealmax text-sm font-semibold hover:underline"
                      >
                        {incidentTypeLabels[incident.type]}
                      </Link>
                      <p className="text-muted mt-1 line-clamp-2 text-xs">
                        {incident.description}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm">Sin incidencias abiertas.</p>
              )}
            </Panel>
          </div>
        </div>

        {kind && (
          <Dialog
            title={kindTitle[kind]}
            description="Este registro quedará en el historial del tratamiento."
            icon={
              kind === 'note' ? (
                <StickyNote className="size-5" />
              ) : kind === 'call' ? (
                <PhoneCall className="size-5" />
              ) : kind === 'email' ? (
                <Mail className="size-5" />
              ) : (
                <CalendarCheck className="size-5" />
              )
            }
            compactHeader
            bodyClassName="pt-3"
            onClose={() => setKind(null)}
          >
            <form
              className="grid gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                addActivity.mutate()
              }}
            >
              <ModalSection
                icon={
                  kind === 'note' ? (
                    <StickyNote className="size-4" />
                  ) : kind === 'call' ? (
                    <PhoneCall className="size-4" />
                  ) : kind === 'email' ? (
                    <Mail className="size-4" />
                  ) : (
                    <CalendarCheck className="size-4" />
                  )
                }
                title={kindTitle[kind]}
                tone="mint"
              >
                {(kind === 'email' || kind === 'meeting') && (
                  <TextField
                    label="Fecha"
                    type="date"
                    required
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                )}
                <TextAreaField
                  label="Resumen"
                  rows={5}
                  required
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </ModalSection>
              {addActivity.isError && (
                <p role="alert" className="text-sm text-red-700">
                  {addActivity.error.message}
                </p>
              )}
              <FormActions>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => setKind(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={addActivity.isPending || !body.trim()}
                >
                  {addActivity.isPending ? 'Guardando…' : 'Guardar'}
                </Button>
              </FormActions>
            </form>
          </Dialog>
        )}
        {askingPause && (
          <PauseDialog
            subject="para este tratamiento"
            pending={automation.isPending}
            error={automation.error?.message}
            onClose={() => setAskingPause(false)}
            onConfirm={(text) =>
              automation.mutate(
                { paused: true, ...(text ? { reason: text } : {}) },
                { onSuccess: () => setAskingPause(false) },
              )
            }
          />
        )}
        {propertiesOpen && (
          <PropertiesDialog
            title="Todas las Propiedades"
            groups={groups}
            onClose={() => setPropertiesOpen(false)}
          />
        )}
        {editing && (
          <Dialog
            title="Editar Tratamiento"
            description="Define la pauta, la cobertura y los datos de la receta."
            icon={<Pill className="size-5" />}
            compactHeader
            printable
            bodyClassName="pt-0"
            onClose={() => setEditing(false)}
            size="lg"
          >
            <TreatmentForm
              treatment={record}
              patientName={patient.data?.fullName}
              medications={medications.data?.data ?? []}
              branches={branches.data?.data ?? []}
              users={users.data?.data ?? []}
              doctors={doctorPicker.data?.data ?? []}
              doctorsLoading={doctorPicker.isLoading}
              onSave={(values) =>
                save.mutateAsync(values).then(() => undefined)
              }
              onCancel={() => setEditing(false)}
              submitting={save.isPending}
            />
          </Dialog>
        )}
        {action && (
          <TreatmentActionDialog
            action={action}
            treatment={record}
            onClose={() => setAction(null)}
            onCompleted={invalidate}
          />
        )}
      </div>
    </div>
  )
}
