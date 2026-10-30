import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Mail } from 'lucide-react'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  filterControlClass,
} from '@/components/ui/AdvancedFilter'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/EmptyState'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'

type OutboxStatus =
  'pending' | 'sending' | 'sent' | 'failed' | 'cancelled' | 'dry_run'
type OutboxRow = {
  id: string
  status: OutboxStatus
  channel: 'whatsapp' | 'telegram' | 'call'
  attempt_number: number
  attempts: number
  last_error: string | null
  scheduled_for: string
  sent_at: string | null
  created_at: string
  patient: { id: string; name: string }
  template: { id: string; name: string }
}
type OutboxPage = { data: OutboxRow[]; next_cursor: string | null }
type Unassigned = {
  id: string
  channel?: string
  from_phone: string | null
  text: string | null
  button: string | null
  received_at: string
}

const statusLabels: Record<OutboxStatus, string> = {
  pending: 'Pendiente',
  sending: 'Enviando',
  sent: 'Enviado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
  dry_run: 'Modo prueba',
}
const statusStyle: Record<OutboxStatus, string> = {
  pending: 'border-sky-200 bg-sky-50 text-sky-900',
  sending: 'border-sky-200 bg-sky-50 text-sky-900',
  sent: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  failed: 'border-red-200 bg-red-50 text-red-800',
  cancelled: 'border-slate-300 bg-slate-100 text-slate-800',
  dry_run: 'border-amber-200 bg-amber-50 text-amber-950',
}
const channelLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  call: 'Llamada',
}

/** The API stores a short code, never provider text. This turns the known ones into something staff can act on. */
const errorLabels: Record<string, string> = {
  manual_cancel: 'Cancelado por el personal',
  kill_switch: 'Apagado de emergencia',
  automation_paused: 'Avisos pausados',
  automation_disabled: 'La automatización estaba apagada',
  consent_revoked: 'El paciente revocó el consentimiento',
  patient_replied: 'El paciente respondió',
  cycle_closed: 'El ciclo ya no está abierto',
  telegram_unlinked: 'Se desvinculó el Telegram',
  telegram_not_linked: 'El paciente no tiene Telegram vinculado',
  template_unavailable: 'La plantilla ya no está disponible',
  interrupted:
    'Envío interrumpido: confirma en el teléfono si llegó antes de reintentar',
  manual_retry: 'Reintento pedido por el personal',
  tg_403: 'El paciente bloqueó el bot de Telegram',
  rate_limited: 'Límite de envíos del proveedor',
}
const explainError = (code: string | null) =>
  code ? (errorLabels[code] ?? code) : ''
const when = (value: string | null) =>
  value ? new Date(value).toLocaleString('es') : '—'

function Queue() {
  const queryClient = useQueryClient()
  const canAct = useCan('outbox:retry')
  const [status, setStatus] = useState<OutboxStatus | ''>('')
  const [filterOpen, setFilterOpen] = useState(false)
  const list = useInfiniteQuery({
    queryKey: ['outbox', status],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '30' })
      if (status) params.set('status', status)
      if (pageParam) params.set('cursor', pageParam)
      return api<OutboxPage>(`/api/v1/outbox?${params.toString()}`)
    },
    initialPageParam: '',
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    refetchInterval: 30_000,
  })
  const act = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'cancel' | 'retry' }) =>
      api(`/api/v1/outbox/${id}/${action}`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outbox'] }),
  })
  const rows = list.data?.pages.flatMap((page) => page.data) ?? []

  return (
    <section aria-label="Cola de envíos">
      <FilterBarRow aria-label="Filtros de avisos">
        <AdvancedFilterButton
          open={filterOpen}
          count={status ? 1 : 0}
          onClick={() => setFilterOpen(true)}
        />
        <p className="text-muted ml-auto text-xs">
          Se actualiza solo cada 30 segundos.
        </p>
      </FilterBarRow>
      <ActiveFilterChips
        chips={
          status
            ? [{ key: 'status', label: 'Estado', value: statusLabels[status] }]
            : []
        }
        onRemove={() => setStatus('')}
      />
      {filterOpen && (
        <AdvancedFilterDialog
          open
          title="Filtro Avanzado"
          description="Acota la cola de envíos por estado."
          onClose={() => setFilterOpen(false)}
          onClear={() => {
            setStatus('')
            setFilterOpen(false)
          }}
          clearDisabled={!status}
          onApply={() => setFilterOpen(false)}
        >
          <FilterField label="Estado" icon={<Mail className="size-4" />}>
            <select
              aria-label="Filtrar por estado"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as OutboxStatus | '')
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todos</option>
              {(Object.keys(statusLabels) as OutboxStatus[]).map((key) => (
                <option key={key} value={key}>
                  {statusLabels[key]}
                </option>
              ))}
            </select>
          </FilterField>
        </AdvancedFilterDialog>
      )}
      {act.isError && (
        <p role="alert" className="mb-2 text-sm text-red-700">
          {act.error.message}
        </p>
      )}
      {list.isLoading ? (
        <p className="text-muted text-sm" aria-busy="true">
          Cargando…
        </p>
      ) : list.isError ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar la cola. {list.error.message}
        </p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No hay mensajes"
          description="Cuando el motor planifique avisos, aparecerán aquí."
        />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-surface text-muted text-[11px] tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Aviso</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Detalle</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/pacientes/${row.patient.id}`}
                      className="text-petroleo font-semibold hover:underline"
                    >
                      {row.patient.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {channelLabels[row.channel] ?? row.channel}
                  </td>
                  <td className="px-4 py-3">
                    {row.attempt_number === 1
                      ? 'Primer aviso'
                      : `Recordatorio ${row.attempt_number - 1}`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[row.status]}`}
                    >
                      {statusLabels[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {when(row.sent_at ?? row.scheduled_for)}
                  </td>
                  <td className="text-muted px-4 py-3 text-xs">
                    {explainError(row.last_error)}
                  </td>
                  <td className="px-4 py-3">
                    {canAct &&
                      (row.status === 'pending' ||
                        row.status === 'dry_run') && (
                        <Button
                          className="h-8 px-2 text-xs"
                          aria-label={`Cancelar el aviso de ${row.patient.name}`}
                          disabled={act.isPending}
                          onClick={() =>
                            act.mutate({ id: row.id, action: 'cancel' })
                          }
                        >
                          Cancelar
                        </Button>
                      )}
                    {canAct &&
                      (row.status === 'failed' ||
                        row.status === 'cancelled') && (
                        <Button
                          className="h-8 px-2 text-xs"
                          aria-label={`Reintentar el aviso de ${row.patient.name}`}
                          disabled={act.isPending}
                          onClick={() =>
                            act.mutate({ id: row.id, action: 'retry' })
                          }
                        >
                          Reintentar
                        </Button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {list.hasNextPage && (
        <div className="mt-3 flex justify-center">
          <Button
            onClick={() => list.fetchNextPage()}
            disabled={list.isFetchingNextPage}
          >
            {list.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </Button>
        </div>
      )}
    </section>
  )
}

function AssignDialog({
  reply,
  onClose,
}: {
  reply: Unassigned
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [patientId, setPatientId] = useState('')
  const patients = useQuery({
    queryKey: ['patients', 'assign', search],
    queryFn: () =>
      api<{
        data: { id: string; fullName: string; documentId: string | null }[]
      }>(`/api/v1/patients?q=${encodeURIComponent(search)}&limit=8`),
    enabled: search.trim().length >= 2,
  })
  const assign = useMutation({
    mutationFn: () =>
      api(`/api/v1/inbound/${reply.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inbound'] })
      onClose()
    },
  })
  return (
    <Dialog
      title="Asignar respuesta a un paciente"
      description="Se procesará con las reglas de siempre: botones, bajas o texto libre para revisar."
      onClose={onClose}
    >
      <div className="grid gap-3">
        <blockquote className="border-border rounded-lg border bg-slate-50 p-3 text-sm whitespace-pre-wrap">
          {reply.text ??
            (reply.button === 'confirm'
              ? 'Pulsó «Confirmar»'
              : reply.button === 'need_help'
                ? 'Pulsó «Necesito hablar»'
                : '(sin texto)')}
        </blockquote>
        <input
          aria-label="Buscar paciente"
          placeholder="Nombre o documento del paciente"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPatientId('')
          }}
          className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
        />
        {(patients.data?.data ?? []).length > 0 && (
          <ul
            className="border-border max-h-48 overflow-y-auto rounded-lg border p-1"
            role="listbox"
            aria-label="Resultados"
          >
            {patients.data!.data.map((patient) => (
              <li key={patient.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={patientId === patient.id}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${patientId === patient.id ? 'bg-teal-50 font-semibold' : 'hover:bg-surface'}`}
                  onClick={() => setPatientId(patient.id)}
                >
                  {patient.fullName}
                  {patient.documentId ? ` · ${patient.documentId}` : ''}
                </button>
              </li>
            ))}
          </ul>
        )}
        {assign.isError && (
          <p role="alert" className="text-sm text-red-700">
            {assign.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!patientId || assign.isPending}
            onClick={() => assign.mutate()}
          >
            Asignar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function UnassignedReplies() {
  const [selected, setSelected] = useState<Unassigned | null>(null)
  const list = useQuery({
    queryKey: ['inbound', 'unassigned'],
    queryFn: () => api<{ data: Unassigned[] }>('/api/v1/inbound/unassigned'),
    refetchInterval: 30_000,
  })
  const rows = list.data?.data ?? []
  return (
    <section aria-label="Respuestas sin asignar">
      <p className="text-muted mb-3 text-sm">
        Respuestas que no se pudieron atribuir a un solo paciente: el número o
        el chat no coincide con nadie, o coincide con varios. Nada se procesa
        hasta que las asignas.
      </p>
      {list.isLoading ? (
        <p className="text-muted text-sm" aria-busy="true">
          Cargando…
        </p>
      ) : list.isError ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar las respuestas. {list.error.message}
        </p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Todo asignado"
          description="No hay respuestas esperando a que alguien las atienda."
        />
      ) : (
        <ul className="grid gap-3">
          {rows.map((reply) => (
            <li
              key={reply.id}
              className="border-border flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-white p-4"
            >
              <div className="min-w-0">
                <p className="text-sm whitespace-pre-wrap">
                  {reply.text ??
                    (reply.button ? `Botón: ${reply.button}` : '(sin texto)')}
                </p>
                <p className="text-muted mt-1 text-xs">
                  {reply.from_phone ?? 'Chat de Telegram'} ·{' '}
                  {when(reply.received_at)}
                </p>
              </div>
              <Button
                className="h-8 px-2 text-xs"
                onClick={() => setSelected(reply)}
              >
                Asignar a un paciente
              </Button>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <AssignDialog reply={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}

/** Staff view of the automatic notices: what is queued, what failed, and the replies nobody has taken yet. */
export default function AvisosPage() {
  const canAssign = useCan('inbound:assign')
  const [tab, setTab] = useState<'queue' | 'unassigned'>('queue')
  const tabClass = (value: string) =>
    `rounded-md px-3 py-2 text-sm font-semibold ${tab === value ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`
  return (
    <div className="animate-in">
      <PageHeader
        title="Avisos"
        subtitle="Los avisos automáticos a los pacientes y sus respuestas."
      />
      <div
        className="bg-surface mb-4 inline-flex rounded-lg p-1"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={tab === 'queue'}
          className={tabClass('queue')}
          onClick={() => setTab('queue')}
        >
          Cola de envíos
        </button>
        {canAssign && (
          <button
            role="tab"
            aria-selected={tab === 'unassigned'}
            className={tabClass('unassigned')}
            onClick={() => setTab('unassigned')}
          >
            Respuestas sin asignar
          </button>
        )}
      </div>
      {tab === 'queue' ? <Queue /> : <UnassignedReplies />}
    </div>
  )
}
