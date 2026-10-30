import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  ArrowLeft,
  Check,
  ClipboardList,
  FileText,
  Mail,
  MessageCircle,
  PackageCheck,
  Phone,
  Plus,
  TriangleAlert,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { CustomValuesView, customPropertyGroups } from '@/components/CustomFields'
import { useCustomProperties } from '@/lib/custom-properties'
import { PropertiesDialog, type PropertyGroup } from '@/components/PropertiesDialog'
import { RecordActionsMenu, type RecordAction } from '@/components/RecordActionsMenu'
import { EnrollAutomationButton } from '@/features/automation/AutomationRules'
import { PatientTelegramPanel } from '@/features/telegram/PatientTelegramPanel'
import { ConversationDialog } from '@/features/messaging/ConversationDialog'
import { PatientAutomationPanel } from '@/features/messaging/PauseAutomation'
import { EmptyState } from '@/components/EmptyState'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'
import { formatPhone } from '@/lib/phone'
import { useCan, useMe } from '@/lib/permissions'
import type { components, paths } from '@/lib/api-types'
import {
  medicationName,
  type Medication,
  type Treatment,
} from '@/lib/treatments'
import {
  activityDetail,
  activityLabelFor,
  noticeChannelFor,
  taskDueLabel,
  taskTypeLabels,
  type NoticeTarget,
  type Task,
  type TaskList,
} from '@/lib/operations'
import type { PatientFormValues } from '@/schemas/patient'
import type { TreatmentFormValues } from '@/schemas/treatment'
import { PatientDetailSkeleton } from './PatientDetailSkeleton'
import { PatientForm } from './PatientForm'
import {
  TreatmentActionDialog,
  type TreatmentActionType,
} from '@/features/treatments/TreatmentActionDialog'
import { TreatmentForm } from '@/features/treatments/TreatmentForm'
import {
  ActiveTreatmentsPanel,
  TreatmentList,
} from '@/features/treatments/TreatmentList'
import { NoticeDialog } from '@/features/dashboard/NoticeDialog'
import { DeliveryDialog } from '@/features/dashboard/DeliveryDialog'
import { TaskFormDialog } from '@/features/tasks/TaskFormDialog'
import { IncidentFormDialog } from '@/features/incidents/IncidentFormDialog'
import {
  incidentTypeLabels,
  type Incident,
} from '@/lib/incidents'
import { TransferDialog } from '@/features/transfers/TransferDialog'
import { PatientTransfersPanel } from '@/features/transfers/PatientTransfersPanel'
import { PatientDoctorsPanel } from './PatientDoctorsPanel'
import { PatientConditionsPanel } from './PatientConditionsPanel'
import { PatientInfoPackPanel } from './PatientInfoPackPanel'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type CaregiverList =
  paths['/api/v1/patients/{id}/caregivers']['get']['responses'][200]['content']['application/json']
type ActivityList =
  paths['/api/v1/patients/{id}/activities']['get']['responses'][200]['content']['application/json']
type TreatmentListResponse =
  paths['/api/v1/treatments']['get']['responses'][200]['content']['application/json']
type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']
type PatientIncidentList =
  paths['/api/v1/patients/{id}/incidents']['get']['responses'][200]['content']['application/json']

const authorName = (activity: object) =>
  (activity as { author?: { name?: string } | null }).author?.name

const activityDialogTitle = {
  note: 'Añadir nota',
  call: 'Registrar llamada',
  email: 'Registrar correo',
  meeting: 'Registrar reunión',
} as const

function Panel({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-petroleo font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function QuickAction({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: LucideIcon
  label: string
  tone: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-muted hover:text-petroleo flex flex-col items-center gap-1 text-[11px] font-medium"
    >
      <span
        className={`grid size-8 place-items-center rounded-full border transition hover:brightness-95 ${tone}`}
      >
        <Icon className="size-3.5" />
      </span>
      {label}
    </button>
  )
}

export default function PatientDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const canUpdate = useCan('patients:write')
  const canArchive = useCan('patients:archive')
  const canAddActivity = useCan('patients:write')
  const canRecordConsent = useCan('patients:write')
  const canWriteTreatment = useCan('treatments:write')
  const canManageTreatment = useCan('treatments:manage')
  const canReadTasks = useCan('tasks:read')
  const canWriteTasks = useCan('tasks:write')
  const canCreateIncident = useCan('incident:create')
  const canTransfer = useCan('patient:transfer')
  const canViewMessages = useCan('outbox:view')
  const { data: me } = useMe()
  const [activeTab, setActiveTab] = useState<
    'history' | 'treatments' | 'infopack' | 'transfers'
  >('history')
  const [transferOpen, setTransferOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [activityType, setActivityType] = useState<
    'note' | 'call' | 'email' | 'meeting' | null
  >(null)
  const [activityBody, setActivityBody] = useState('')
  const [activityDate, setActivityDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [conversationOpen, setConversationOpen] = useState(false)
  const patientDefs = useCustomProperties('patient').data?.data ?? []
  const [consentOpen, setConsentOpen] = useState(false)
  const [consentGranted, setConsentGranted] = useState(true)
  const [consentChannel, setConsentChannel] =
    useState<components['schemas']['ConsentInput']['channel']>('whatsapp')
  const [consentEvidence, setConsentEvidence] = useState('')
  const [treatmentFormOpen, setTreatmentFormOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(
    null,
  )
  const [treatmentAction, setTreatmentAction] = useState<{
    type: TreatmentActionType
    treatment: Treatment
  } | null>(null)
  const [noticeTreatment, setNoticeTreatment] = useState<Treatment | null>(null)
  const [deliveryTreatment, setDeliveryTreatment] = useState<Treatment | null>(
    null,
  )
  const [taskOpen, setTaskOpen] = useState(false)
  const [incidentOpen, setIncidentOpen] = useState(false)

  const patient = useQuery({
    queryKey: ['patients', id],
    queryFn: () =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(id)}`,
      ),
    enabled: Boolean(id),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const caregivers = useQuery({
    queryKey: ['patients', id, 'caregivers'],
    queryFn: () =>
      api<CaregiverList>(
        `/api/v1/patients/${encodeURIComponent(id)}/caregivers`,
      ),
    enabled: Boolean(id),
  })
  const activities = useInfiniteQuery({
    queryKey: ['patients', id, 'activities'],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '25' })
      if (pageParam) params.set('cursor', pageParam)
      return api<ActivityList>(
        `/api/v1/patients/${encodeURIComponent(id)}/activities?${params.toString()}`,
      )
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(id),
  })
  const treatments = useQuery({
    queryKey: ['treatments', { patientId: id }],
    queryFn: () =>
      api<TreatmentListResponse>(
        `/api/v1/treatments?patient_id=${encodeURIComponent(id)}&limit=15`,
      ),
    enabled: Boolean(id),
  })
  const patientTasks = useQuery({
    queryKey: ['tasks', 'patient', id],
    queryFn: () =>
      api<TaskList>(
        `/api/v1/tasks?patient_id=${encodeURIComponent(id)}&status=open&limit=20`,
      ),
    enabled: Boolean(id) && canReadTasks,
  })
  const patientIncidents = useQuery({
    queryKey: ['patients', id, 'incidents'],
    queryFn: () =>
      api<PatientIncidentList>(
        `/api/v1/patients/${encodeURIComponent(id)}/incidents`,
      ),
    enabled: Boolean(id),
  })
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', limit: 15 }],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&limit=15'),
  })
  const users = useQuery({
    queryKey: ['users', { limit: 15 }],
    queryFn: () => api<UserList>('/api/v1/users?limit=15'),
  })
  const update = useMutation({
    mutationFn: (values: PatientFormValues) => {
      const body: components['schemas']['PatientPatch'] = {
        ...values,
        documentId: values.documentId || null,
        birthDate: values.birthDate || null,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
        zone: values.zone || null,
        careNotes: values.careNotes || null,
        responsibleUserId: values.responsibleUserId || null,
      }
      return api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify(body) },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients', id] })
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      setEditing(false)
    },
  })
  const addActivity = useMutation({
    mutationFn: (
      input: Omit<components['schemas']['ActivityInput'], 'type'> & {
        type: 'note' | 'call' | 'email' | 'meeting'
        occurredOn?: string
      },
    ) =>
      api<components['schemas']['Activity']>(
        `/api/v1/patients/${encodeURIComponent(id)}/activities`,
        { method: 'POST', body: JSON.stringify(input) },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['patients', id, 'activities'],
      })
      setActivityType(null)
      setActivityBody('')
    },
  })
  const recordConsent = useMutation({
    mutationFn: (input: components['schemas']['ConsentInput']) =>
      api<components['schemas']['PatientConsent']>(
        `/api/v1/patients/${encodeURIComponent(id)}/consent`,
        { method: 'POST', body: JSON.stringify(input) },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients', id] })
      setConsentOpen(false)
      setConsentEvidence('')
    },
  })
  const archive = useMutation({
    mutationFn: () =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(id)}/archive`,
        { method: 'POST' },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      await queryClient.invalidateQueries({ queryKey: ['patients', id] })
    },
  })
  const duplicate = useMutation({
    mutationFn: () =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(id)}/duplicate`,
        { method: 'POST' },
      ),
    onSuccess: async (copy) => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      navigate(`/pacientes/${encodeURIComponent(copy.id)}`)
    },
  })
  async function viewFullHistory() {
    setActiveTab('history')
    let more = activities.hasNextPage
    while (more) more = (await activities.fetchNextPage()).hasNextPage
  }
  async function invalidateTreatments() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['treatments'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      queryClient.invalidateQueries({
        queryKey: ['patients', id, 'activities'],
      }),
    ])
  }
  const saveTreatment = useMutation({
    mutationFn: ({
      values,
      treatment,
    }: {
      values: TreatmentFormValues
      treatment?: Treatment
    }) => {
      if (treatment) {
        const body: components['schemas']['TreatmentPatch'] = {
          medication_id: values.medicationId,
          branch_id: values.branchId,
          responsible_user_id: values.responsibleUserId || null,
          dose_per_intake: values.dosePerIntake,
          intakes_per_day: values.intakesPerDay,
          quantity_per_cycle: values.quantityPerCycle,
          start_date: values.startDate,
          prescriber_name: values.prescriberName?.trim() || null,
          prescription_expires_on: values.prescriptionExpiresOn || null,
          notes: values.notes?.trim() || null,
          custom_values: values.customValues,
        } as components['schemas']['TreatmentPatch']
        return api<Treatment>(
          `/api/v1/treatments/${encodeURIComponent(treatment.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      const body: components['schemas']['TreatmentCreate'] = {
        patient_id: id,
        medication_id: values.medicationId,
        branch_id: values.branchId,
        responsible_user_id: values.responsibleUserId || null,
        dose_per_intake: values.dosePerIntake,
        intakes_per_day: values.intakesPerDay,
        quantity_per_cycle: values.quantityPerCycle,
        start_date: values.startDate,
        prescriber_name: values.prescriberName?.trim() || null,
        prescription_expires_on: values.prescriptionExpiresOn || null,
        notes: values.notes?.trim() || null,
        custom_values: values.customValues,
      } as components['schemas']['TreatmentCreate']
      return api<Treatment>('/api/v1/treatments', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async () => {
      await invalidateTreatments()
      closeTreatmentForm()
    },
  })
  const resumeTreatment = useMutation({
    mutationFn: (treatment: Treatment) =>
      api<Treatment>(
        `/api/v1/treatments/${encodeURIComponent(treatment.id)}/resume`,
        { method: 'POST' },
      ),
    onSuccess: invalidateTreatments,
  })
  const completeTask = useMutation({
    mutationFn: (task: Task) =>
      api<Task>(`/api/v1/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'done' }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({
          queryKey: ['patients', id, 'activities'],
        }),
      ])
    },
  })
  const prepareTask = useMutation({
    mutationFn: (task: Task) => {
      if (!task.cycleId) throw new Error('La tarea no tiene un ciclo asociado.')
      return api(
        `/api/v1/cycles/${encodeURIComponent(task.cycleId)}/mark-prepared`,
        { method: 'POST' },
      )
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['treatments'] }),
      ])
    },
  })
  function closeTreatmentForm() {
    setTreatmentFormOpen(false)
    setEditingTreatment(null)
  }
  function handleTreatmentAction(
    action: TreatmentActionType | 'resume',
    treatment: Treatment,
  ) {
    if (action === 'resume') {
      resumeTreatment.mutate(treatment)
      return
    }
    setTreatmentAction({ type: action, treatment })
  }

  if (patient.isLoading) return <PatientDetailSkeleton />
  if (patient.isError || !patient.data)
    return (
      <div>
        <Link
          to="/pacientes"
          className="text-tealmax inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          Volver a pacientes
        </Link>
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar esta ficha. {patient.error?.message}
        </p>
      </div>
    )

  const record = patient.data
  const branch = branches.data?.data.find(
    (item) => item.id === record.primaryBranchId,
  )
  const responsible =
    record.responsibleUserId === me?.user.id
      ? me.user.name
      : record.responsibleUserId
        ? 'Usuario asignado'
        : 'Sin responsable'
  const channelLabels: Record<string, string> = { whatsapp: 'WhatsApp', call: 'Llamada', sms: 'SMS', telegram: 'Telegram' }
  const treatmentRows = treatments.data?.data ?? []
  const medicationsById = new Map<string, Medication>(
    (medications.data?.data ?? []).map((medication) => [
      medication.id,
      medication,
    ]),
  )
  const activeTreatments = treatmentRows.filter(
    (treatment) => treatment.status === 'active',
  )
  const activityRows = activities.data?.pages.flatMap((page) => page.data) ?? []
  const openTasks = patientTasks.data?.data ?? []
  const openIncidents: Incident[] = (patientIncidents.data?.data ?? []).filter(
    (incident) => incident.status !== 'resolved',
  )
  const noticeTarget: NoticeTarget | null = noticeTreatment
    ? {
        treatmentId: noticeTreatment.id,
        patientId: record.id,
        patientName: record.fullName,
        medicationName: medicationName(
          medicationsById.get(noticeTreatment.medicationId),
        ),
        phone: record.phone,
        phoneHasWhatsapp: record.phoneHasWhatsapp,
        preferredChannel: noticeChannelFor(record.preferredChannel),
        reminderConsent: record.reminderConsent,
      }
    : null
  const taskActionError =
    completeTask.error?.message ?? prepareTask.error?.message

  const recordActions: RecordAction[] = [
    ...(canUpdate ? [{ label: 'Editar', onClick: () => setEditing(true) }] : []),
    ...(canTransfer && !record.archivedAt
      ? [{ label: 'Trasladar', onClick: () => setTransferOpen(true) }]
      : []),
    ...(canUpdate && !record.archivedAt
      ? [
          {
            label: 'Duplicar (sin tratamientos)',
            onClick: () => {
              if (
                window.confirm(
                  'Se creará una copia del paciente SIN sus tratamientos, documento ni teléfono, para no duplicar ciclos de reposición. ¿Continuar?',
                )
              )
                duplicate.mutate()
            },
          },
        ]
      : []),
    ...(canArchive && !record.archivedAt
      ? [{ label: 'Archivar', danger: true, onClick: () => archive.mutate() }]
      : []),
    ...(canViewMessages ? [{ label: 'Ver conversación', onClick: () => setConversationOpen(true) }] : []),
    { label: 'Ver historial completo', onClick: () => void viewFullHistory() },
    {
      label: 'Ver todas las propiedades',
      onClick: () => setPropertiesOpen(true),
    },
  ]
  const patientValues = (record as { customValues?: Record<string, unknown> }).customValues ?? {}
  const propertyGroups: PropertyGroup[] = [
    {
      name: 'Datos',
      items: [
        { label: 'Nombre completo', value: record.fullName },
        { label: 'Documento', value: record.documentId },
        { label: 'Fecha de nacimiento', value: record.birthDate?.slice(0, 10) },
        { label: 'Notas de cuidado', value: record.careNotes },
        { label: 'Estado', value: record.archivedAt ? 'Archivado' : 'Activo' },
      ],
    },
    {
      name: 'Contacto',
      items: [
        { label: 'Teléfono', value: record.phone ? formatPhone(record.phone) : undefined },
        { label: 'Tiene WhatsApp', value: record.phoneHasWhatsapp ? 'Sí' : 'No' },
        { label: 'Correo', value: record.email },
        { label: 'Dirección', value: record.address },
        { label: 'Zona', value: record.zone },
        { label: 'Canal preferido', value: channelLabels[record.preferredChannel] },
        {
          label: 'Consentimiento de recordatorios',
          value: record.reminderConsent ? 'Otorgado' : 'Sin consentimiento vigente',
        },
      ],
    },
    {
      name: 'Tratamiento',
      items: treatmentRows.flatMap((treatment, index) => [
        {
          label: `Tratamiento ${index + 1}`,
          value: `${medicationName(medicationsById.get(treatment.medicationId))} · ${treatment.status}`,
        },
        {
          label: `Receta vence (${index + 1})`,
          value: treatment.prescriptionExpiresOn?.slice(0, 10),
        },
      ]),
    },
    {
      name: 'Cobertura',
      items: treatmentRows.map((treatment, index) => ({
        label: `Fin de cobertura (${index + 1})`,
        value: treatment.coverageEndOn?.slice(0, 10),
      })),
    },
    {
      name: 'Asignación',
      items: [
        { label: 'Sucursal', value: branch?.name },
        { label: 'Responsable', value: responsible },
      ],
    },
    ...customPropertyGroups(patientDefs, patientValues),
  ]

  return (
    <div className="animate-in">
      <Link
        to="/pacientes"
        className="text-muted hover:text-petroleo mb-2 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" />
        Pacientes
      </Link>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-tealmax text-sm">Ficha del paciente</p>
          <h1 className="font-display text-petroleo text-2xl font-bold tracking-tight">
            {record.fullName}
            {record.phone ? (
              <span className="text-muted text-lg font-medium">
                {' - '}
                {formatPhone(record.phone)}
              </span>
            ) : null}
          </h1>
          {(canAddActivity || canWriteTasks) && (
            <div className="mt-3 flex flex-wrap gap-4">
              {canAddActivity && (
                <QuickAction
                  icon={FileText}
                  label="Nota"
                  tone="border-amber-200 bg-amber-50 text-amber-700"
                  onClick={() => setActivityType('note')}
                />
              )}
              {canAddActivity && (
                <QuickAction
                  icon={Mail}
                  label="Correo"
                  tone="border-sky-200 bg-sky-50 text-sky-700"
                  onClick={() => setActivityType('email')}
                />
              )}
              {canAddActivity && (
                <QuickAction
                  icon={Phone}
                  label="Llamada"
                  tone="border-emerald-200 bg-emerald-50 text-emerald-700"
                  onClick={() => setActivityType('call')}
                />
              )}
              {canWriteTasks && (
                <QuickAction
                  icon={ClipboardList}
                  label="Tarea"
                  tone="border-violet-200 bg-violet-50 text-violet-700"
                  onClick={() => setTaskOpen(true)}
                />
              )}
              {canAddActivity && (
                <QuickAction
                  icon={Users}
                  label="Reunión"
                  tone="border-teal-200 bg-teal-50 text-teal-700"
                  onClick={() => setActivityType('meeting')}
                />
              )}
            </div>
          )}
        </div>
        <div className="grid justify-items-end gap-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!record.archivedAt && <EnrollAutomationButton patientId={record.id} />}
            <RecordActionsMenu actions={recordActions} />
          </div>
          <div className="flex justify-end">
            {branch ? (
              <BranchTag name={branch.name} labelColor={branch.labelColor} solid />
            ) : (
              <span className="text-muted text-sm">Sin sucursal asignada</span>
            )}
          </div>
        </div>
      </header>
      {record.archivedAt && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Este paciente está archivado.
        </p>
      )}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(250px,0.9fr)_minmax(360px,1.35fr)_minmax(230px,0.8fr)]">
        <div className="grid gap-4">
          <Panel title="Datos del paciente">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted">Responsable</dt>
                <dd className="mt-0.5">{responsible}</dd>
              </div>
              <div>
                <dt className="text-muted">WhatsApp</dt>
                <dd className="mt-0.5">
                  {record.phone ? formatPhone(record.phone) : 'Sin WhatsApp'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Correo</dt>
                <dd className="mt-0.5">{record.email || 'Sin correo'}</dd>
              </div>
              <div>
                <dt className="text-muted">Fecha de nacimiento</dt>
                <dd className="mt-0.5">
                  {record.birthDate
                    ? new Date(record.birthDate).toLocaleDateString('es', {
                        timeZone: 'UTC',
                      })
                    : 'Sin registrar'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Dirección y zona</dt>
                <dd className="mt-0.5">
                  {[record.address, record.zone].filter(Boolean).join(' · ') ||
                    'Sin registrar'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Notas de cuidado</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">
                  {record.careNotes || 'Sin notas'}
                </dd>
              </div>
            </dl>
          </Panel>
          <CustomValuesView entity="patient" values={patientValues} />
          <PatientTelegramPanel patientId={record.id} canEdit={canUpdate} />
          <PatientAutomationPanel
            patientId={record.id}
            paused={Boolean((record as { automationPaused?: boolean }).automationPaused)}
            reason={(record as { automationPausedReason?: string | null }).automationPausedReason}
            canEdit={canUpdate && !record.archivedAt}
          />
          <Panel title="Canal preferido">
            <p className="text-ink text-sm">
              {channelLabels[record.preferredChannel]}
              {record.phone ? ' · WhatsApp disponible' : ''}
            </p>
          </Panel>
          <Panel
            title="Consentimiento"
            action={
              canRecordConsent && (
                <Button
                  className="h-8 px-2 text-xs"
                  onClick={() => setConsentOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Registrar
                </Button>
              )
            }
          >
            <p className="text-sm">
              {record.reminderConsent
                ? 'Consentimiento otorgado'
                : 'Sin consentimiento vigente'}
            </p>
            {record.reminderConsentAt && (
              <p className="text-muted mt-1 text-xs">
                Registrado{' '}
                {new Date(record.reminderConsentAt).toLocaleDateString('es')}
              </p>
            )}
          </Panel>
        </div>
        <section className="border-border min-h-[480px] rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="bg-surface flex rounded-lg p-1">
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === 'history' ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`}
                onClick={() => setActiveTab('history')}
              >
                Historial
              </button>
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === 'treatments' ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`}
                onClick={() => setActiveTab('treatments')}
              >
                Tratamientos
              </button>
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === 'infopack' ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`}
                onClick={() => setActiveTab('infopack')}
              >
                InfoPack
              </button>
              <button
                className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === 'transfers' ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`}
                onClick={() => setActiveTab('transfers')}
              >
                Traspasos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeTab === 'history' ? (
                canWriteTreatment &&
                activeTreatments.length === 1 && (
                  <Button
                    variant="coral"
                    onClick={() =>
                      setNoticeTreatment(activeTreatments[0] ?? null)
                    }
                  >
                    <MessageCircle className="size-4" />
                    Avisar
                  </Button>
                )
              ) : activeTab === 'treatments' ? (
                canWriteTreatment && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingTreatment(null)
                      setTreatmentFormOpen(true)
                    }}
                  >
                    <Plus className="size-4" />
                    Nuevo tratamiento
                  </Button>
                )
              ) : null}
            </div>
          </div>
          {activeTab === 'history' ? (
            <div className="mt-6">
              {activities.isLoading ? (
                <div
                  role="status"
                  aria-busy="true"
                  aria-label="Cargando historial…"
                  className="grid gap-5"
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="grid gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : activityRows.length ? (
                <>
                  <ol className="border-border relative ml-2 grid gap-5 border-l pl-5">
                    {activityRows.map((activity) => {
                      const detail = activityDetail(activity)
                      return (
                        <li key={activity.id} className="relative">
                          <span className="bg-tealmax absolute top-1 -left-[26px] size-2.5 rounded-full ring-4 ring-white" />
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-petroleo text-sm font-semibold">
                              {activityLabelFor(activity.type)}
                            </p>
                            <time className="text-muted text-xs">
                              {new Date(activity.occurredAt).toLocaleString(
                                'es',
                              )}
                            </time>
                          </div>
                          {detail && (
                            <p className="text-ink mt-1 text-sm leading-6 whitespace-pre-wrap">
                              {detail}
                            </p>
                          )}
                          {authorName(activity) && (
                            <p className="text-muted mt-1 text-[11px]">
                              Registrado por {authorName(activity)}
                            </p>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                  {activities.hasNextPage && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => activities.fetchNextPage()}
                        disabled={activities.isFetchingNextPage}
                      >
                        {activities.isFetchingNextPage
                          ? 'Cargando…'
                          : 'Cargar más'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="El historial está vacío"
                  description="Las notas, llamadas y cambios de tratamiento aparecerán aquí."
                />
              )}
            </div>
          ) : activeTab === 'treatments' ? (
            <div className="mt-6">
              {treatments.isError ? (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  No pudimos cargar los tratamientos. {treatments.error.message}
                </p>
              ) : treatments.isLoading ? (
                <div
                  role="status"
                  aria-busy="true"
                  aria-label="Cargando tratamientos…"
                  className="grid gap-3"
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-border grid gap-2 rounded-xl border p-4"
                    >
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : treatmentRows.length ? (
                <TreatmentList
                  treatments={treatmentRows}
                  medications={medicationsById}
                  canWrite={canWriteTreatment}
                  canManage={canManageTreatment}
                  onEdit={(treatment) => {
                    setEditingTreatment(treatment)
                    setTreatmentFormOpen(true)
                  }}
                  onAction={handleTreatmentAction}
                  onNotice={setNoticeTreatment}
                  onDeliver={setDeliveryTreatment}
                />
              ) : (
                <EmptyState
                  title="Sin tratamientos todavía"
                  description={
                    canWriteTreatment
                      ? 'Registra el primer tratamiento para dar seguimiento a la cobertura y la receta.'
                      : 'Cuando el paciente tenga tratamientos, aparecerán aquí.'
                  }
                />
              )}
              {resumeTreatment.isError && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {resumeTreatment.error.message}
                </p>
              )}
            </div>
          ) : activeTab === 'infopack' ? (
            <div className="mt-6">
              <PatientInfoPackPanel
                patientId={record.id}
                treatments={treatmentRows}
                medicationsById={medicationsById}
              />
            </div>
          ) : (
            <div className="mt-6">
              <PatientTransfersPanel patientId={record.id} />
            </div>
          )}
        </section>
        <div className="grid gap-4">
          <Panel title="Tratamientos activos">
            {treatments.isLoading ? (
              <div
                role="status"
                aria-busy="true"
                aria-label="Cargando tratamientos activos…"
                className="grid gap-3"
              >
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="grid gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : treatments.isError ? (
              <p className="text-muted text-sm">
                No se pudieron cargar los tratamientos.
              </p>
            ) : (
              <ActiveTreatmentsPanel
                treatments={activeTreatments}
                medications={medicationsById}
              />
            )}
          </Panel>
          <Panel title="Médicos">
            <PatientDoctorsPanel patientId={record.id} />
          </Panel>
          <Panel title="Cuidadores">
            {caregivers.isLoading ? (
              <div
                role="status"
                aria-busy="true"
                aria-label="Cargando cuidadores…"
                className="grid gap-3"
              >
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="grid gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : caregivers.data?.data.length ? (
              <ul className="grid gap-3">
                {caregivers.data.data.map((caregiver) => (
                  <li
                    key={caregiver.id}
                    className="border-border border-b pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold">
                      {caregiver.fullName}
                      {caregiver.isPrimary ? ' · Principal' : ''}
                    </p>
                    <p className="text-muted mt-0.5 text-xs">
                      {caregiver.relationship} · {caregiver.phone}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">
                No hay cuidadores registrados.
              </p>
            )}
          </Panel>
          <Panel title="Condiciones de salud">
            <PatientConditionsPanel patientId={record.id} />
          </Panel>
          <Panel
            title="Tareas abiertas"
            action={
              canWriteTasks && (
                <Button
                  className="h-8 px-2 text-xs"
                  onClick={() => setTaskOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Nueva
                </Button>
              )
            }
          >
            {taskActionError && (
              <p role="alert" className="mb-2 text-xs text-red-700">
                {taskActionError}
              </p>
            )}
            {patientTasks.isLoading ? (
              <div className="grid gap-2" aria-busy="true">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : openTasks.length ? (
              <ul className="grid gap-3">
                {openTasks.map((task) => (
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
                    {canWriteTasks && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.type === 'prepare_delivery' &&
                          task.cycleId &&
                          canWriteTreatment && (
                            <Button
                              className="h-7 px-2 text-[11px]"
                              onClick={() => prepareTask.mutate(task)}
                              disabled={
                                prepareTask.isPending &&
                                prepareTask.variables?.id === task.id
                              }
                            >
                              <PackageCheck className="size-3" />
                              Preparado
                            </Button>
                          )}
                        <Button
                          className="h-7 px-2 text-[11px]"
                          onClick={() => completeTask.mutate(task)}
                          disabled={
                            completeTask.isPending &&
                            completeTask.variables?.id === task.id
                          }
                        >
                          <Check className="size-3" />
                          Completar
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Sin tareas abiertas.</p>
            )}
          </Panel>
          <Panel
            title="Incidencias abiertas"
            action={
              canCreateIncident && (
                <Button
                  className="h-8 px-2 text-xs"
                  onClick={() => setIncidentOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Nueva
                </Button>
              )
            }
          >
            {patientIncidents.isLoading ? (
              <div className="grid gap-2" aria-busy="true">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : openIncidents.length ? (
              <ul className="grid gap-3">
                {openIncidents.map((incident) => (
                  <li
                    key={incident.id}
                    className="border-border border-b pb-3 last:border-0 last:pb-0"
                  >
                    <Link
                      to={`/incidencias?incident=${incident.id}`}
                      className="text-petroleo hover:text-tealmax inline-flex items-start gap-2 text-sm font-semibold hover:underline"
                    >
                      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                      {incidentTypeLabels[incident.type]}
                    </Link>
                    <p className="text-muted mt-1 line-clamp-2 text-xs">
                      {incident.description}
                    </p>
                    <p className="text-muted mt-1 text-[11px]">
                      {incident.assignee?.name ?? 'Sin asignar'}
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
      {conversationOpen && <ConversationDialog patientId={record.id} onClose={() => setConversationOpen(false)} />}
      {propertiesOpen && (
        <PropertiesDialog
          title="Todas las propiedades"
          groups={propertyGroups}
          onClose={() => setPropertiesOpen(false)}
        />
      )}
      {editing && (
        <Dialog
          title="Editar paciente"
          description="Actualiza los datos de la ficha."
          onClose={() => setEditing(false)}
          size="lg"
        >
          <PatientForm
            patient={record}
            branches={branches.data?.data ?? []}
            onSave={(values) =>
              update.mutateAsync(values).then(() => undefined)
            }
            onCancel={() => setEditing(false)}
            submitting={update.isPending}
          />
        </Dialog>
      )}
      {activityType && canAddActivity && (
        <Dialog
          title={activityDialogTitle[activityType]}
          description="Este registro quedará en el historial del paciente."
          onClose={() => setActivityType(null)}
        >
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              addActivity.mutate({
                type: activityType,
                body: activityBody.trim(),
                metadata: {},
                ...(activityType === 'email' || activityType === 'meeting'
                  ? { occurredOn: activityDate }
                  : {}),
              })
            }}
          >
            <label
              htmlFor="activity-body"
              className="text-ink text-sm font-medium"
            >
              {activityType === 'note'
                ? 'Nota'
                : activityType === 'call'
                  ? 'Resumen de la llamada'
                  : activityType === 'email'
                    ? 'Resumen del correo'
                    : 'Resumen de la reunión'}
            </label>
            {(activityType === 'email' || activityType === 'meeting') && (
              <label className="text-ink grid gap-1 text-sm font-medium">
                Fecha
                <input
                  type="date"
                  required
                  value={activityDate}
                  onChange={(event) => setActivityDate(event.target.value)}
                  className="border-border h-10 rounded-lg border px-3 text-sm"
                />
              </label>
            )}
            <textarea
              id="activity-body"
              rows={5}
              required
              value={activityBody}
              onChange={(event) => setActivityBody(event.target.value)}
              className="border-border focus:border-tealmax rounded-lg border px-3 py-2 text-sm outline-none"
            />
            {addActivity.isError && (
              <p role="alert" className="text-sm text-red-700">
                {addActivity.error.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setActivityType(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={addActivity.isPending || !activityBody.trim()}
              >
                {addActivity.isPending
                  ? 'Guardando…'
                  : activityType === 'note'
                    ? 'Añadir nota'
                    : activityType === 'call'
                      ? 'Guardar llamada'
                      : activityType === 'email'
                        ? 'Guardar correo'
                        : 'Guardar reunión'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
      {consentOpen && canRecordConsent && (
        <Dialog
          title="Registrar consentimiento"
          description="Guarda la decisión y el canal autorizado por el paciente."
          onClose={() => setConsentOpen(false)}
        >
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              recordConsent.mutate({
                granted: consentGranted,
                channel: consentChannel,
                evidence: consentEvidence || null,
              })
            }}
          >
            <label className="text-ink flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(event) => setConsentGranted(event.target.checked)}
              />
              El paciente otorga consentimiento
            </label>
            <div className="grid gap-1.5">
              <label
                htmlFor="consent-channel"
                className="text-ink text-sm font-medium"
              >
                Canal
              </label>
              <select
                id="consent-channel"
                value={consentChannel}
                onChange={(event) =>
                  setConsentChannel(event.target.value as typeof consentChannel)
                }
                className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="call">Llamada</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <TextField
              label="Evidencia (opcional)"
              value={consentEvidence}
              onChange={(event) => setConsentEvidence(event.target.value)}
              placeholder="Referencia o detalle del consentimiento"
            />
            {recordConsent.isError && (
              <p role="alert" className="text-sm text-red-700">
                {recordConsent.error.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setConsentOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={recordConsent.isPending}
              >
                Registrar consentimiento
              </Button>
            </div>
          </form>
        </Dialog>
      )}
      {treatmentFormOpen && (
        <Dialog
          title={editingTreatment ? 'Editar tratamiento' : 'Nuevo tratamiento'}
          description="Define la pauta, la cobertura y los datos de la receta."
          onClose={closeTreatmentForm}
          size="lg"
        >
          <TreatmentForm
            key={editingTreatment?.id ?? 'new'}
            treatment={editingTreatment ?? undefined}
            medications={medications.data?.data ?? []}
            branches={branches.data?.data ?? []}
            users={users.data?.data ?? []}
            defaultBranchId={record.primaryBranchId}
            defaultResponsibleUserId={record.responsibleUserId}
            onSave={(values) =>
              saveTreatment
                .mutateAsync({
                  values,
                  treatment: editingTreatment ?? undefined,
                })
                .then(() => undefined)
            }
            onCancel={closeTreatmentForm}
            submitting={saveTreatment.isPending}
          />
        </Dialog>
      )}
      {treatmentAction && (
        <TreatmentActionDialog
          action={treatmentAction.type}
          treatment={treatmentAction.treatment}
          onClose={() => setTreatmentAction(null)}
          onCompleted={invalidateTreatments}
        />
      )}
      {noticeTarget && (
        <NoticeDialog
          target={noticeTarget}
          onClose={() => setNoticeTreatment(null)}
          onLogged={() =>
            queryClient.invalidateQueries({
              queryKey: ['patients', id, 'activities'],
            })
          }
        />
      )}
      {deliveryTreatment && (
        <DeliveryDialog
          treatmentId={deliveryTreatment.id}
          patientName={record.fullName}
          medicationName={medicationName(
            medicationsById.get(deliveryTreatment.medicationId),
          )}
          defaultQuantity={deliveryTreatment.quantityPerCycle}
          onClose={() => setDeliveryTreatment(null)}
          onCompleted={() =>
            queryClient.invalidateQueries({
              queryKey: ['patients', id, 'activities'],
            })
          }
        />
      )}
      {transferOpen && canTransfer && (
        <TransferDialog
          patientId={record.id}
          patientName={record.fullName}
          currentBranchId={record.primaryBranchId}
          branches={branches.data?.data ?? []}
          treatments={treatmentRows}
          medications={medicationsById}
          onClose={() => setTransferOpen(false)}
        />
      )}
      {taskOpen && (
        <TaskFormDialog
          patientId={record.id}
          patientName={record.fullName}
          branchId={record.primaryBranchId}
          treatmentOptions={activeTreatments.map((treatment) => ({
            id: treatment.id,
            label: medicationName(medicationsById.get(treatment.medicationId)),
          }))}
          onClose={() => setTaskOpen(false)}
          onCreated={() =>
            queryClient.invalidateQueries({
              queryKey: ['patients', id, 'activities'],
            })
          }
        />
      )}
      {incidentOpen && (
        <IncidentFormDialog
          defaultBranchId={record.primaryBranchId}
          defaultPatient={{ id: record.id, fullName: record.fullName }}
          onClose={() => setIncidentOpen(false)}
          onCreated={() =>
            queryClient.invalidateQueries({
              queryKey: ['patients', id, 'incidents'],
            })
          }
        />
      )}
    </div>
  )
}
