import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { ArrowLeft, FileText, Mail, Phone, Users } from 'lucide-react'
import { CustomValuesView, customPropertyGroups } from '@/components/CustomFields'
import { useCustomProperties } from '@/lib/custom-properties'
import { PropertiesDialog, type PropertyGroup } from '@/components/PropertiesDialog'
import { RecordActionsMenu, type RecordAction } from '@/components/RecordActionsMenu'
import { StatusChip } from '@/components/StatusChip'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components, paths } from '@/lib/api-types'
import {
  daysRemainingLabel,
  derivedStatusLabel,
  formatDate,
  medicationName,
  treatmentPauta,
  treatmentStatusLabel,
  type Medication,
  type Treatment,
} from '@/lib/treatments'
import { activityDetail, activityLabelFor, taskDueLabel, taskTypeLabels, type TaskList } from '@/lib/operations'
import { cycleStatusLabels, type CycleTableResponse } from '@/lib/board'
import { incidentTypeLabels, type Incident } from '@/lib/incidents'
import type { TreatmentFormValues } from '@/schemas/treatment'
import { PauseDialog, useSetAutomationPaused } from '@/features/messaging/PauseAutomation'
import { TreatmentForm } from './TreatmentForm'
import { TreatmentActionDialog, type TreatmentActionType } from './TreatmentActionDialog'

type ActivityList =
  paths['/api/v1/patients/{id}/activities']['get']['responses'][200]['content']['application/json']
type ActivityKind = 'note' | 'call' | 'email' | 'meeting'

const kindTitle: Record<ActivityKind, string> = {
  note: 'Añadir nota',
  call: 'Registrar llamada',
  email: 'Registrar correo',
  meeting: 'Registrar reunión',
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <h2 className="text-petroleo mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  )
}

const authorName = (activity: object) =>
  (activity as { author?: { name?: string } | null }).author?.name

/** Treatment record: properties on the left, history/cycles in the middle, associations on the right. */
export default function TreatmentDetailPage() {
  const { patientId = '', id = '' } = useParams()
  const queryClient = useQueryClient()
  const canWrite = useCan('treatments:write')
  const canWriteActivity = useCan('patients:write')
  const canReadTasks = useCan('tasks:read')
  const [tab, setTab] = useState<'history' | 'cycles'>('history')
  const [kind, setKind] = useState<ActivityKind | null>(null)
  const [body, setBody] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const treatmentDefs = useCustomProperties('treatment').data?.data ?? []
  const [editing, setEditing] = useState(false)
  const [action, setAction] = useState<TreatmentActionType | null>(null)
  const [askingPause, setAskingPause] = useState(false)
  const automation = useSetAutomationPaused('treatments', id, [['treatments', id], ['outbox']])

  const treatment = useQuery({
    queryKey: ['treatments', id],
    queryFn: () => api<Treatment>(`/api/v1/treatments/${encodeURIComponent(id)}`),
  })
  const patient = useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => api<components['schemas']['Patient']>(`/api/v1/patients/${encodeURIComponent(patientId)}`),
  })
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', limit: 100 }],
    queryFn: () => api<{ data: Medication[] }>('/api/v1/medications?archived=false&limit=100'),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<{ data: { id: string; name: string; labelColor?: string }[] }>('/api/v1/branches'),
  })
  const users = useQuery({
    queryKey: ['users', { limit: 100 }],
    queryFn: () => api<{ data: { id: string; name: string }[] }>('/api/v1/users?limit=100'),
  })
  const activities = useInfiniteQuery({
    queryKey: ['patients', patientId, 'activities', { treatmentId: id }],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '25', treatment_id: id })
      if (pageParam) params.set('cursor', pageParam)
      return api<ActivityList>(`/api/v1/patients/${encodeURIComponent(patientId)}/activities?${params.toString()}`)
    },
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
  const cycles = useQuery({
    queryKey: ['cycles', 'treatment', id],
    queryFn: () => api<CycleTableResponse>(`/api/v1/cycles?treatment_ids=${encodeURIComponent(id)}&limit=50`),
  })
  const tasks = useQuery({
    queryKey: ['tasks', 'treatment', id],
    queryFn: () => api<TaskList>(`/api/v1/tasks?treatment_id=${encodeURIComponent(id)}&status=open&limit=20`),
    enabled: canReadTasks,
  })
  const incidents = useQuery({
    queryKey: ['patients', patientId, 'incidents'],
    queryFn: () => api<{ data: Incident[] }>(`/api/v1/patients/${encodeURIComponent(patientId)}/incidents`),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['treatments'] })
    await queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'activities'] })
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
          ...(kind === 'email' || kind === 'meeting' ? { occurredOn: date } : {}),
        }),
      }),
    onSuccess: async () => {
      await invalidate()
      setKind(null)
      setBody('')
    },
  })
  const save = useMutation({
    mutationFn: (values: TreatmentFormValues) =>
      api<Treatment>(`/api/v1/treatments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
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
        }),
      }),
    onSuccess: async () => {
      await invalidate()
      setEditing(false)
    },
  })

  if (treatment.isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (treatment.isError || !treatment.data) {
    return (
      <div>
        <Link to={`/pacientes/${patientId}`} className="text-tealmax inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="size-4" />
          Volver al paciente
        </Link>
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          No pudimos cargar esta ficha. {treatment.error?.message}
        </p>
      </div>
    )
  }

  const record = treatment.data
  const medication = medications.data?.data.find((item) => item.id === record.medicationId)
  const branch = branches.data?.data.find((item) => item.id === record.branchId)
  const responsible = users.data?.data.find((item) => item.id === record.responsibleUserId)?.name
  const derived = derivedStatusLabel(record.derived_status)
  const rows = activities.data?.pages.flatMap((page) => page.data) ?? []
  const openIncidents = (incidents.data?.data ?? []).filter(
    (incident) => incident.status !== 'resolved' && (incident as { treatmentId?: string | null }).treatmentId === id,
  )
  const openCycles = (cycles.data?.data ?? []).filter((card) => !card.closed_at)
  const isActiveOrPaused = record.status === 'active' || record.status === 'paused'

  async function viewFullHistory() {
    setTab('history')
    let more = activities.hasNextPage
    while (more) more = (await activities.fetchNextPage()).hasNextPage
  }
  const actions: RecordAction[] = [
    ...(canWrite && record.status !== 'finished' ? [{ label: 'Editar', onClick: () => setEditing(true) }] : []),
    ...(canWrite && isActiveOrPaused && record.status === 'active'
      ? [{ label: 'Pausar', onClick: () => setAction('pause') }]
      : []),
    ...(canWrite && isActiveOrPaused
      ? [{ label: 'Finalizar', danger: true, onClick: () => setAction('finish') }]
      : []),
    ...(canWrite && record.status === 'active'
      ? [(record as { automationPaused?: boolean }).automationPaused
          ? { label: 'Reanudar avisos automáticos', onClick: () => automation.mutate({ paused: false }) }
          : { label: 'Pausar avisos automáticos', onClick: () => setAskingPause(true) }]
      : []),
    { label: 'Ver historial completo', onClick: () => void viewFullHistory() },
    { label: 'Ver todas las propiedades', onClick: () => setPropertiesOpen(true) },
  ]
  const treatmentValues = (record as { customValues?: Record<string, unknown> }).customValues ?? {}
  const groups: PropertyGroup[] = [
    {
      name: 'Datos',
      items: [
        { label: 'Paciente', value: patient.data?.fullName },
        { label: 'Medicamento', value: medicationName(medication) },
        { label: 'Pauta', value: treatmentPauta(record, medication) },
        { label: 'Cantidad por ciclo', value: String(record.quantityPerCycle) },
        { label: 'Inicio', value: formatDate(record.startDate) },
        { label: 'Notas', value: record.notes },
      ],
    },
    {
      name: 'Tratamiento',
      items: [
        { label: 'Estado', value: treatmentStatusLabel(record.status) },
        { label: 'Motivo del estado', value: record.statusReason },
        { label: 'Prescriptor', value: record.prescriberName },
        { label: 'Receta vence', value: formatDate(record.prescriptionExpiresOn) },
      ],
    },
    {
      name: 'Cobertura',
      items: [
        { label: 'Fin de cobertura', value: formatDate(record.coverageEndOn) },
        { label: 'Días restantes', value: daysRemainingLabel(record.days_remaining) },
        { label: 'Última entrega', value: formatDate(record.lastDeliveryOn) },
        { label: 'Cobertura ajustada a mano', value: record.coverageManuallyAdjusted ? 'Sí' : 'No' },
        { label: 'Motivo del ajuste', value: record.coverageAdjustReason },
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
  const tabButton = (value: 'history' | 'cycles', label: string) => (
    <button
      className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === value ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`}
      onClick={() => setTab(value)}
    >
      {label}
    </button>
  )

  return (
    <div className="animate-in">
      <Link to={`/pacientes/${patientId}`} className="text-muted hover:text-petroleo mb-5 inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="size-4" />
        {patient.data?.fullName ?? 'Paciente'}
      </Link>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-tealmax mb-1 text-sm">Ficha del tratamiento</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">{medicationName(medication)}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {derived ? <StatusChip status={derived} /> : <span className="text-muted text-sm">{treatmentStatusLabel(record.status)}</span>}
            {record.prescription_flag && <StatusChip status="Receta por renovar" />}
          </div>
        </div>
        <RecordActionsMenu actions={actions} />
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(250px,0.9fr)_minmax(360px,1.35fr)_minmax(230px,0.8fr)]">
        <div className="grid gap-4">
          <Panel title="Datos del tratamiento">
            <dl className="grid gap-3 text-sm">
              <div><dt className="text-muted">Pauta</dt><dd className="mt-0.5">{treatmentPauta(record, medication)}</dd></div>
              <div><dt className="text-muted">Cantidad por ciclo</dt><dd className="mt-0.5">{String(record.quantityPerCycle)}</dd></div>
              <div><dt className="text-muted">Fin de cobertura</dt><dd className="mt-0.5">{formatDate(record.coverageEndOn)} · {daysRemainingLabel(record.days_remaining)}</dd></div>
              <div><dt className="text-muted">Prescriptor</dt><dd className="mt-0.5">{record.prescriberName || '—'}</dd></div>
              <div><dt className="text-muted">Receta vence</dt><dd className="mt-0.5">{formatDate(record.prescriptionExpiresOn)}</dd></div>
              <div><dt className="text-muted">Responsable</dt><dd className="mt-0.5">{responsible ?? 'Sin responsable'}</dd></div>
              <div><dt className="text-muted">Notas</dt><dd className="mt-0.5 whitespace-pre-wrap">{record.notes || 'Sin notas'}</dd></div>
              <div><dt className="text-muted">Avisos automáticos</dt><dd className="mt-0.5">{(record as { automationPaused?: boolean }).automationPaused ? 'Pausados' : 'Activos'}</dd></div>
            </dl>
          </Panel>
          <CustomValuesView entity="treatment" values={treatmentValues} />
        </div>

        <section className="border-border min-h-[420px] rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="bg-surface flex rounded-lg p-1">
              {tabButton('history', 'Historial')}
              {tabButton('cycles', 'Ciclos')}
            </div>
            {tab === 'history' && canWriteActivity && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setKind('note')}><FileText className="size-4" />Nota</Button>
                <Button onClick={() => setKind('call')}><Phone className="size-4" />Llamada</Button>
                <Button onClick={() => setKind('email')}><Mail className="size-4" />Correo</Button>
                <Button onClick={() => setKind('meeting')}><Users className="size-4" />Reunión</Button>
              </div>
            )}
          </div>
          {tab === 'history' ? (
            <div className="mt-6">
              {rows.length ? (
                <>
                  <ol className="border-border relative ml-2 grid gap-5 border-l pl-5">
                    {rows.map((activity) => {
                      const detail = activityDetail(activity)
                      return (
                        <li key={activity.id} className="relative">
                          <span className="bg-tealmax absolute top-1 -left-[26px] size-2.5 rounded-full ring-4 ring-white" />
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-petroleo text-sm font-semibold">{activityLabelFor(activity.type)}</p>
                            <time className="text-muted text-xs">{new Date(activity.occurredAt).toLocaleString('es')}</time>
                          </div>
                          {detail && <p className="text-ink mt-1 text-sm leading-6 whitespace-pre-wrap">{detail}</p>}
                          {authorName(activity) && <p className="text-muted mt-1 text-[11px]">Registrado por {authorName(activity)}</p>}
                        </li>
                      )
                    })}
                  </ol>
                  {activities.hasNextPage && (
                    <div className="mt-4 flex justify-center">
                      <Button onClick={() => activities.fetchNextPage()} disabled={activities.isFetchingNextPage}>
                        {activities.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState title="Sin actividad todavía" description="Las notas, llamadas, correos, reuniones y cambios de este tratamiento aparecerán aquí." />
              )}
            </div>
          ) : (
            <div className="mt-6">
              {cycles.data?.data.length ? (
                <ul className="grid gap-2">
                  {cycles.data.data.map((card) => (
                    <li key={card.cycle_id} className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                      <span className="font-medium">{cycleStatusLabels[card.status]}</span>
                      <span className="text-muted">Fecha prevista {formatDate(card.expected_on)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Sin ciclos" description="Este tratamiento no tiene ciclos recientes." />
              )}
            </div>
          )}
        </section>

        <div className="grid gap-4">
          <Panel title="Paciente">
            <Link to={`/pacientes/${patientId}`} className="text-petroleo hover:text-tealmax text-sm font-semibold hover:underline">
              {patient.data?.fullName ?? 'Ver paciente'}
            </Link>
          </Panel>
          <Panel title="Sucursal">
            <p className="text-sm">{branch?.name ?? '—'}</p>
          </Panel>
          <Panel title="Ciclos abiertos">
            {openCycles.length ? (
              <ul className="grid gap-2 text-sm">
                {openCycles.map((card) => (
                  <li key={card.cycle_id}>{cycleStatusLabels[card.status]} · {formatDate(card.expected_on)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Sin ciclos abiertos.</p>
            )}
          </Panel>
          <Panel title="Tareas abiertas">
            {tasks.data?.data.length ? (
              <ul className="grid gap-3">
                {tasks.data.data.map((task) => (
                  <li key={task.id} className="border-border border-b pb-3 last:border-0 last:pb-0">
                    <p className="text-ink text-sm font-semibold">{task.title}</p>
                    <p className="text-muted mt-0.5 text-xs">{taskTypeLabels[task.type]} · {taskDueLabel(task)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Sin tareas abiertas.</p>
            )}
          </Panel>
          <Panel title="Incidencias abiertas">
            {openIncidents.length ? (
              <ul className="grid gap-3">
                {openIncidents.map((incident) => (
                  <li key={incident.id} className="border-border border-b pb-3 last:border-0 last:pb-0">
                    <Link to={`/incidencias?incident=${incident.id}`} className="text-petroleo hover:text-tealmax text-sm font-semibold hover:underline">
                      {incidentTypeLabels[incident.type]}
                    </Link>
                    <p className="text-muted mt-1 line-clamp-2 text-xs">{incident.description}</p>
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
        <Dialog title={kindTitle[kind]} description="Este registro quedará en el historial del tratamiento." onClose={() => setKind(null)}>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              addActivity.mutate()
            }}
          >
            {(kind === 'email' || kind === 'meeting') && (
              <label className="text-ink grid gap-1 text-sm font-medium">
                Fecha
                <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="border-border h-10 rounded-lg border px-3 text-sm" />
              </label>
            )}
            <label className="text-ink grid gap-1 text-sm font-medium">
              Resumen
              <textarea rows={5} required value={body} onChange={(event) => setBody(event.target.value)} className="border-border focus:border-tealmax rounded-lg border px-3 py-2 text-sm outline-none" />
            </label>
            {addActivity.isError && <p role="alert" className="text-sm text-red-700">{addActivity.error.message}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setKind(null)}>Cancelar</Button>
              <Button variant="primary" type="submit" disabled={addActivity.isPending || !body.trim()}>Guardar</Button>
            </div>
          </form>
        </Dialog>
      )}
      {askingPause && (
        <PauseDialog
          subject="para este tratamiento"
          pending={automation.isPending}
          error={automation.error?.message}
          onClose={() => setAskingPause(false)}
          onConfirm={(text) => automation.mutate({ paused: true, ...(text ? { reason: text } : {}) }, { onSuccess: () => setAskingPause(false) })}
        />
      )}
      {propertiesOpen && <PropertiesDialog title="Todas las propiedades" groups={groups} onClose={() => setPropertiesOpen(false)} />}
      {editing && (
        <Dialog title="Editar tratamiento" description="Define la pauta, la cobertura y los datos de la receta." onClose={() => setEditing(false)} size="lg">
          <TreatmentForm
            treatment={record}
            medications={medications.data?.data ?? []}
            branches={branches.data?.data ?? []}
            users={users.data?.data ?? []}
            onSave={(values) => save.mutateAsync(values).then(() => undefined)}
            onCancel={() => setEditing(false)}
            submitting={save.isPending}
          />
        </Dialog>
      )}
      {action && (
        <TreatmentActionDialog action={action} treatment={record} onClose={() => setAction(null)} onCompleted={invalidate} />
      )}
    </div>
  )
}
