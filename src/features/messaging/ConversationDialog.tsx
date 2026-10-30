import { useInfiniteQuery } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { ModalSection } from '@/components/ui/ModalSection'
import { api } from '@/lib/http'

type Item =
  | {
      kind: 'notice'
      id: string
      at: string
      status: string
      channel: string
      attempt: number
      template: string
      error: string | null
    }
  | {
      kind: 'reply'
      id: string
      at: string
      channel: string
      text: string | null
      button: string | null
    }
type Page = { data: Item[]; next_before: string | null }

const channelLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  call: 'Llamada',
}
const statusLabels: Record<string, string> = {
  pending: 'Pendiente de envío',
  sending: 'Enviando',
  sent: 'Enviado',
  delivered: 'Entregado',
  read: 'Leído',
  failed: 'Fallido',
  cancelled: 'Cancelado',
  replied: 'Respondido',
}
const buttonLabels: Record<string, string> = {
  confirm: 'Pulsó «Confirmar»',
  need_help: 'Pulsó «Necesito hablar»',
}

/**
 * The conversation with a patient: automatic notices with their delivery
 * state, and the replies. Message text is sensitive, so every open of this
 * dialog is audited by the API and needs outbox:view.
 */
export function ConversationDialog({
  patientId,
  onClose,
}: {
  patientId: string
  onClose: () => void
}) {
  const messages = useInfiniteQuery({
    queryKey: ['patients', patientId, 'messages'],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '30' })
      if (pageParam) params.set('before', pageParam)
      return api<Page>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/messages?${params.toString()}`,
      )
    },
    initialPageParam: '',
    getNextPageParam: (last) => last.next_before ?? undefined,
  })
  const items = messages.data?.pages.flatMap((page) => page.data) ?? []
  return (
    <Dialog
      title="Conversación"
      description="Avisos automáticos y respuestas del paciente. Cada consulta queda registrada."
      icon={<MessageCircle className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
      size="lg"
    >
      <ModalSection
        icon={<MessageCircle className="size-4" />}
        title="Mensajes"
        tone="mint"
        action={
          items.length ? (
            <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-semibold">
              {items.length}
            </span>
          ) : undefined
        }
      >
        {messages.isLoading ? (
          <p className="text-muted text-sm" aria-busy="true">
            Cargando…
          </p>
        ) : messages.isError ? (
          <p role="alert" className="text-sm text-red-700">
            No pudimos cargar la conversación. {messages.error.message}
          </p>
        ) : items.length === 0 ? (
          <p className="text-muted text-sm">
            Todavía no hay avisos ni respuestas con este paciente.
          </p>
        ) : (
          <ol className="grid max-h-[55vh] gap-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <li
                key={`${item.kind}-${item.id}`}
                className={`max-w-[85%] rounded-lg border p-2.5 text-sm ${
                  item.kind === 'reply'
                    ? 'border-teal-200 bg-teal-50'
                    : 'border-border ml-auto bg-white'
                }`}
              >
                {item.kind === 'reply' ? (
                  <p className="whitespace-pre-wrap">
                    {item.text ??
                      (item.button
                        ? (buttonLabels[item.button] ?? item.button)
                        : '(sin texto)')}
                  </p>
                ) : (
                  <p>
                    {item.attempt === 1
                      ? 'Primer Aviso'
                      : `Recordatorio ${item.attempt - 1}`}{' '}
                    · {item.template}
                    <span className="text-muted block text-xs">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </p>
                )}
                <p className="text-muted mt-1 text-[11px]">
                  {item.kind === 'reply' ? 'Paciente' : 'Farmacia'} ·{' '}
                  {channelLabels[item.channel] ?? item.channel} ·{' '}
                  {new Date(item.at).toLocaleString('es')}
                </p>
              </li>
            ))}
          </ol>
        )}
      </ModalSection>
      {messages.hasNextPage && (
        <div className="mt-3 flex justify-center">
          <Button
            className="h-9"
            onClick={() => messages.fetchNextPage()}
            disabled={messages.isFetchingNextPage}
          >
            {messages.isFetchingNextPage
              ? 'Cargando…'
              : 'Ver Mensajes Anteriores'}
          </Button>
        </div>
      )}
    </Dialog>
  )
}
