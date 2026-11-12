import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClock,
  ClipboardList,
  FileText,
  Inbox,
  Mail,
  Phone,
  Plus,
  SearchX,
  Send,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { InfoCard } from '@/components/ui/InfoCard'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'
import { pageQuery } from '@/lib/paging'
import type { components, paths } from '@/lib/api-types'

type CompanyActivity = components['schemas']['CompanyActivity']
type CompanyActivityType = CompanyActivity['type']
type CompanyActivityCreateBody = components['schemas']['CompanyActivityCreate']
type CompanyActivityList =
  paths['/api/v1/companies/{id}/activities']['get']['responses'][200]['content']['application/json']

type MainTab = 'catchup' | 'activities'
type SubTab = 'all' | CompanyActivityType

const typeMeta: Record<
  CompanyActivityType,
  {
    label: string
    icon: ReactNode
    tone: string
    createLabel: string
    emptyText: string
    bodyLabel: string
    needsTitle?: boolean
    needsContact?: boolean
    needsDue?: boolean
  }
> = {
  note: {
    label: 'Notas',
    icon: <FileText className="size-4" />,
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    createLabel: 'Crear una nota',
    emptyText: 'Sin notas.',
    bodyLabel: 'Nota',
  },
  email: {
    label: 'Correos electrónicos',
    icon: <Mail className="size-4" />,
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    createLabel: 'Crear un correo electrónico',
    emptyText: 'Sin correos electrónicos registrados.',
    bodyLabel: 'Mensaje',
    needsTitle: true,
    needsContact: true,
  },
  call: {
    label: 'Llamadas',
    icon: <Phone className="size-4" />,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    createLabel: 'Hacer una llamada telefónica',
    emptyText: 'Sin llamadas registradas.',
    bodyLabel: 'Notas de la llamada',
    needsContact: true,
  },
  task: {
    label: 'Tareas',
    icon: <ClipboardList className="size-4" />,
    tone: 'border-violet-200 bg-violet-50 text-violet-700',
    createLabel: 'Crear una tarea',
    emptyText: 'Ninguna tarea.',
    bodyLabel: 'Descripción',
    needsTitle: true,
    needsDue: true,
  },
  meeting: {
    label: 'Reuniones',
    icon: <Users className="size-4" />,
    tone: 'border-teal-200 bg-teal-50 text-teal-700',
    createLabel: 'Programar una reunión',
    emptyText: 'Sin reuniones registradas.',
    bodyLabel: 'Agenda',
    needsTitle: true,
    needsContact: true,
    needsDue: true,
  },
}

const subTabs: TabItem<SubTab>[] = [
  { value: 'all', label: 'Todas las actividades' },
  { value: 'note', label: 'Notas' },
  { value: 'email', label: 'Correos electrónicos' },
  { value: 'call', label: 'Llamadas' },
  { value: 'task', label: 'Tareas' },
  { value: 'meeting', label: 'Reuniones' },
]

function formatWhen(iso: string) {
  const date = new Date(iso)
  return `${date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })} a las ${date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' })}`
}

function monthLabel(iso: string) {
  const label = new Date(iso).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function ActivityRow({ activity }: { activity: CompanyActivity }) {
  const meta = typeMeta[activity.type]
  return (
    <div className="border-border min-w-0 rounded-lg border bg-white p-3">
      <div className="flex items-start gap-2.5">
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full border ${meta.tone}`}
        >
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="text-ink min-w-0 text-sm font-semibold break-words">
              {activity.title || meta.bodyLabel}
              {activity.contactName ? ` · ${activity.contactName}` : ''}
            </p>
            <span className="text-muted shrink-0 text-xs">
              {formatWhen(activity.occurredAt)}
            </span>
          </div>
          {activity.body && (
            <p className="text-muted mt-0.5 text-xs whitespace-pre-wrap">
              {activity.body}
            </p>
          )}
          <p className="text-muted mt-1 text-[11px]">
            {meta.label.replace(/s$/, '')} de {activity.authorName}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="bg-tealmax/10 text-petroleo grid size-10 place-items-center rounded-full">
        {icon}
      </span>
      <p className="text-muted text-sm">{text}</p>
    </div>
  )
}

function ActivityCreateForm({
  type,
  onSave,
  onCancel,
  submitting,
}: {
  type: CompanyActivityType
  onSave: (body: CompanyActivityCreateBody) => Promise<void>
  onCancel: () => void
  submitting: boolean
}) {
  const meta = typeMeta[type]
  const [title, setTitle] = useState('')
  const [contactName, setContactName] = useState('')
  const [body, setBody] = useState('')
  const [dueAt, setDueAt] = useState('')

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        void onSave({
          type,
          title: meta.needsTitle ? title.trim() || null : null,
          contactName: meta.needsContact ? contactName.trim() || null : null,
          body: body.trim() || null,
          dueAt: meta.needsDue && dueAt ? new Date(dueAt).toISOString() : null,
        })
      }}
    >
      {meta.needsTitle && (
        <TextField
          label={type === 'email' ? 'Asunto' : 'Título'}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required={type === 'task' || type === 'meeting'}
        />
      )}
      {meta.needsContact && (
        <TextField
          label="Contacto"
          placeholder="Nombre del contacto"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
        />
      )}
      {meta.needsDue && (
        <TextField
          label="Fecha y hora"
          type="datetime-local"
          value={dueAt}
          onChange={(event) => setDueAt(event.target.value)}
        />
      )}
      <TextAreaField
        label={meta.bodyLabel}
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <FormActions>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={submitting}
        >
          {submitting ? 'Guardando…' : 'Guardar'}
        </Button>
      </FormActions>
    </form>
  )
}

export function CompanyActivityPanel({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient()
  const [mainTab, setMainTab] = useState<MainTab>('catchup')
  const [subTab, setSubTab] = useState<SubTab>('all')
  const [creating, setCreating] = useState<{
    type: CompanyActivityType
    label: string
  } | null>(null)

  const list = useQuery({
    queryKey: ['companies', companyId, 'activities', subTab],
    queryFn: () =>
      api<CompanyActivityList>(
        `/api/v1/companies/${encodeURIComponent(companyId)}/activities?${pageQuery(
          { type: subTab === 'all' ? undefined : subTab, rows: 50 },
        )}`,
      ),
    enabled: mainTab === 'activities',
  })

  const recent = useQuery({
    queryKey: ['companies', companyId, 'activities', 'recent'],
    queryFn: () =>
      api<CompanyActivityList>(
        `/api/v1/companies/${encodeURIComponent(companyId)}/activities?${pageQuery({ rows: 6 })}`,
      ),
    enabled: mainTab === 'catchup',
  })

  const create = useMutation({
    mutationFn: (body: CompanyActivityCreateBody) =>
      api<CompanyActivity>(
        `/api/v1/companies/${encodeURIComponent(companyId)}/activities`,
        { method: 'POST', body: JSON.stringify(body) },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['companies', companyId, 'activities'],
      })
      setCreating(null)
    },
  })

  const items = list.data?.data ?? []
  const groups: { label: string; items: CompanyActivity[] }[] = []
  for (const item of items) {
    const label = monthLabel(item.occurredAt)
    const group = groups.at(-1)
    if (group && group.label === label) group.items.push(item)
    else groups.push({ label, items: [item] })
  }

  const recentItems = recent.data?.data ?? []

  return (
    <div className="border-border overflow-hidden rounded-xl border bg-white">
      <Tabs
        tabs={[
          { value: 'catchup', label: 'Ponerse al día' },
          { value: 'activities', label: 'Actividades' },
        ]}
        value={mainTab}
        onChange={setMainTab}
        className="px-2 pt-1"
      />

      {mainTab === 'catchup' ? (
        <div className="p-4">
          <InfoCard
            icon={<CalendarClock className="size-4" />}
            title="Interacciones recientes"
            action={
              <button
                type="button"
                onClick={() =>
                  setCreating({
                    type: 'meeting',
                    label: typeMeta.meeting.createLabel,
                  })
                }
                className="text-tealmax text-xs font-semibold hover:underline"
              >
                Programar una reunión
              </button>
            }
          >
            <div className="@container">
              <div className="grid gap-4 @xl:grid-cols-2">
                <div className="min-w-0">
                  <h4 className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                    Entrante
                  </h4>
                  <EmptyState
                    icon={<Inbox className="size-4" />}
                    text="No se ha registrado ninguna actividad entrante en este registro."
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                    Salida
                  </h4>
                  {recent.isFetching ? (
                    <p className="text-muted text-sm">Cargando...</p>
                  ) : recentItems.length ? (
                    <div className="grid gap-2">
                      {recentItems.map((activity) => (
                        <ActivityRow key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Send className="size-4" />}
                      text="Todavía no hay interacciones registradas."
                    />
                  )}
                </div>
              </div>
            </div>
          </InfoCard>
        </div>
      ) : (
        <div className="p-4">
          <div className="-mt-1 mb-3 space-y-2">
            <Tabs tabs={subTabs} value={subTab} onChange={setSubTab} dense />
            {subTab !== 'all' && (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="primary"
                  className="h-9 px-3 text-xs"
                  onClick={() =>
                    setCreating({
                      type: subTab,
                      label: typeMeta[subTab].createLabel,
                    })
                  }
                >
                  <Plus className="size-4" />
                  {typeMeta[subTab].createLabel}
                </Button>
              </div>
            )}
          </div>
          {list.isFetching ? (
            <p className="text-muted py-6 text-center text-sm">Cargando...</p>
          ) : groups.length ? (
            <div className="grid gap-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <h4 className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                    {group.label}
                  </h4>
                  <div className="grid gap-2">
                    {group.items.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX className="size-4" />}
              text={
                subTab === 'all'
                  ? 'Sin actividad registrada.'
                  : typeMeta[subTab].emptyText
              }
            />
          )}
        </div>
      )}

      {creating && (
        <Dialog
          title={creating.label}
          icon={typeMeta[creating.type].icon}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setCreating(null)}
        >
          <ActivityCreateForm
            key={creating.type}
            type={creating.type}
            submitting={create.isPending}
            onCancel={() => setCreating(null)}
            onSave={(body) => create.mutateAsync(body).then(() => undefined)}
          />
        </Dialog>
      )}
    </div>
  )
}
