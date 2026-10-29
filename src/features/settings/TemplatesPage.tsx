import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle,
  MessageSquareText,
  Pencil,
  Phone,
  Plus,
  Send,
} from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useActiveBranch } from '@/lib/active-branch'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import type { paths } from '@/lib/api-types'
import { useCan } from '@/lib/permissions'
import type {
  MessageChannel,
  MessageTemplate,
  TemplateList,
} from '@/lib/operations'
import { TemplateTestSendDialog } from './TemplateTestSendDialog'
import { TemplateFormDialog } from './TemplateFormDialog'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

// Fields the API returns for WhatsApp templates; the generated type predates them.
type WaInfo = { attemptNumber?: number; waStatus?: 'draft' | 'pending' | 'approved' | 'rejected'; waTemplateName?: string | null }
const waStatusLabels = { draft: 'borrador', pending: 'pendiente', approved: 'aprobada', rejected: 'rechazada' } as const

const channelMeta: Record<
  MessageChannel,
  { title: string; icon: typeof Phone }
> = {
  whatsapp: { title: 'WhatsApp', icon: MessageCircle },
  call: { title: 'Llamadas', icon: Phone },
  telegram: { title: 'Telegram', icon: Send },
}

export default function TemplatesPage() {
  const queryClient = useQueryClient()
  const canWrite = useCan('templates:write')
  const canTest = useCan('automation:manage')
  const [testing, setTesting] = useState<{ id: string; name: string } | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MessageTemplate | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  // Templates of the working branch plus the organization-wide ones.
  const { branchId, ready: branchReady } = useActiveBranch()

  const templates = useQuery({
    queryKey: ['templates', 'all', branchId ?? 'all', page, rows],
    queryFn: () =>
      api<TemplateList>(
        `/api/v1/message-templates?${pageQuery({
          kind: 'refill_notice',
          branch_id: branchId,
          page,
          rows,
        })}`,
      ),
    enabled: branchReady,
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })

  const toggle = useMutation({
    mutationFn: (template: MessageTemplate) =>
      api<MessageTemplate>(
        `/api/v1/message-templates/${encodeURIComponent(template.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: !template.isActive }),
        },
      ),
    onSuccess: async (template) => {
      setFeedback(
        template.isActive ? 'Plantilla activada.' : 'Plantilla desactivada.',
      )
      await queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const branchMap = new Map(
    (branches.data?.data ?? []).map((branch) => [branch.id, branch]),
  )
  const byChannel = (channel: MessageChannel) =>
    (templates.data?.data ?? []).filter(
      (template) => template.channel === channel,
    )

  return (
    <div className="animate-in">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">Ajustes</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Plantillas de aviso
          </h1>
          <p className="text-muted mt-2 text-sm">
            Mensajes base para avisar reposiciones por WhatsApp o llamada.
          </p>
        </div>
        {canWrite && (
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nueva plantilla
          </Button>
        )}
      </div>

      {feedback && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {feedback}
        </p>
      )}
      {templates.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar las plantillas. {templates.error.message}
        </p>
      )}
      {toggle.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos actualizar la plantilla. {toggle.error.message}
        </p>
      )}

      {templates.isLoading || !branchReady ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
          {[0, 1].map((item) => (
            <Skeleton key={item} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (templates.data?.data.length ?? 0) === 0 ? (
        <EmptyState
          title="Aún no hay plantillas"
          description="Crea una plantilla para que el equipo tenga un mensaje claro al avisar una reposición."
          action={
            canWrite ? (
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <Plus className="size-4" />
                Nueva plantilla
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {(['whatsapp', 'telegram', 'call'] as const).map((channel) => {
            const meta = channelMeta[channel]
            const Icon = meta.icon
            const items = byChannel(channel)
            return (
              <section
                key={channel}
                className="border-border shadow-card rounded-xl border bg-white"
              >
                <header className="border-border flex items-center gap-2 border-b px-5 py-4">
                  <span className="bg-surface text-tealmax grid size-9 place-items-center rounded-lg">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-petroleo font-display text-lg font-bold">
                      {meta.title}
                    </h2>
                    <p className="text-muted text-xs">
                      {items.length}{' '}
                      {items.length === 1 ? 'plantilla' : 'plantillas'}
                    </p>
                  </div>
                </header>
                {items.length === 0 ? (
                  <p className="text-muted px-5 py-8 text-center text-sm">
                    No hay plantillas de {meta.title.toLowerCase()}.
                  </p>
                ) : (
                  <div className="divide-border divide-y">
                    {items.map((template) => {
                      const branch = template.branchId
                        ? branchMap.get(template.branchId)
                        : undefined
                      return (
                        <article key={template.id} className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-ink text-sm font-semibold">
                              {template.name}
                            </h3>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                                template.isActive
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                  : 'border-slate-200 bg-slate-100 text-slate-700'
                              }`}
                            >
                              {template.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                            {branch ? (
                              <BranchTag
                                name={branch.name}
                                labelColor={branch.labelColor}
                              />
                            ) : (
                              <span className="text-muted text-[11px]">
                                Toda la organización
                              </span>
                            )}
                          </div>
                          {template.channel !== 'call' && (
                            <p className="text-muted mt-1 text-[11px]">
                              {{ 1: 'Primer aviso', 2: 'Primer recordatorio', 3: 'Último recordatorio' }[(template as WaInfo).attemptNumber ?? 1] ?? 'Aviso'}
                              {template.channel === 'whatsapp' && (
                                <> · Meta: {waStatusLabels[(template as WaInfo).waStatus ?? 'draft']}
                                  {(template as WaInfo).waTemplateName ? ` (${(template as WaInfo).waTemplateName})` : ''}</>
                              )}
                            </p>
                          )}
                          <p className="text-muted mt-2 line-clamp-4 text-xs leading-5 whitespace-pre-wrap">
                            {template.body}
                          </p>
                          {canWrite && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                className="h-8 px-3 text-xs"
                                onClick={() => {
                                  setEditing(template)
                                  setFormOpen(true)
                                }}
                              >
                                <Pencil className="size-3.5" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                className="h-8 px-3 text-xs"
                                onClick={() => toggle.mutate(template)}
                                disabled={
                                  toggle.isPending &&
                                  toggle.variables?.id === template.id
                                }
                              >
                                {template.isActive ? 'Desactivar' : 'Activar'}
                              </Button>
                              {canTest && template.channel === 'whatsapp' && (template as WaInfo).waStatus === 'approved' && (
                                <Button
                                  variant="ghost"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => setTesting({ id: template.id, name: template.name })}
                                >
                                  Enviar prueba
                                </Button>
                              )}
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      <p className="text-muted mt-5 flex items-start gap-2 text-xs">
        <MessageSquareText className="mt-0.5 size-4 shrink-0" />
        Variables disponibles: {'{{paciente}}'}, {'{{medicamento}}'},{' '}
        {'{{fecha}}'} y {'{{farmacia}}'}. El equipo puede editarlas al momento
        de avisar.
      </p>

      <Pagination
        page={page}
        rows={rows}
        total={templates.data?.total ?? 0}
        onChange={setPage}
        onRowsChange={(next) => {
          setRows(next)
          setPage(1)
        }}
        disabled={templates.isFetching}
      />

      {testing && (
        <TemplateTestSendDialog
          templateId={testing.id}
          templateName={testing.name}
          onClose={() => setTesting(null)}
        />
      )}
      {formOpen && (
        <TemplateFormDialog
          key={editing?.id ?? 'new'}
          template={editing ?? undefined}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSaved={setFeedback}
        />
      )}
    </div>
  )
}
