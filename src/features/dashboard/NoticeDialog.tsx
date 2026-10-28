import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Clipboard,
  Copy,
  MessageCircle,
  Phone,
  ShieldAlert,
} from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/http'
import type {
  MessageChannel,
  NoticePreview,
  NoticeTarget,
} from '@/lib/operations'
import { noticeChannelFor } from '@/lib/operations'

export function NoticeDialog({
  target,
  onClose,
  onLogged,
}: {
  target: NoticeTarget
  onClose: () => void
  onLogged?: () => void
}) {
  const queryClient = useQueryClient()
  const [channel, setChannel] = useState<MessageChannel>(
    noticeChannelFor(target.preferredChannel),
  )
  const [copied, setCopied] = useState(false)
  const [logged, setLogged] = useState(false)

  const preview = useQuery({
    queryKey: ['notice-preview', target.treatmentId, channel],
    queryFn: () =>
      api<NoticePreview>(
        `/api/v1/treatments/${encodeURIComponent(target.treatmentId)}/notice-preview?channel=${channel}`,
      ),
  })

  const log = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(target.treatmentId)}/notice-logged`,
        {
          method: 'POST',
          body: JSON.stringify({ channel }),
        },
      ),
    onSuccess: async () => {
      setLogged(true)
      onLogged?.()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({
          queryKey: ['patients', target.patientId, 'activities'],
        }),
      ])
    },
  })

  const data = preview.data
  const hasPhone = Boolean(data?.phone)
  const canOpen = Boolean(
    (channel === 'whatsapp' && data?.wa_me_url) ||
    (channel === 'call' && data?.tel_url),
  )
  const openUrl = channel === 'whatsapp' ? data?.wa_me_url : data?.tel_url

  async function copyMessage() {
    if (!data?.body) return
    try {
      await navigator.clipboard.writeText(data.body)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog
      title="Avisar al paciente"
      description={`${target.patientName} · ${target.medicationName}`}
      onClose={onClose}
    >
      <div className="grid gap-4">
        <div
          role="tablist"
          aria-label="Canal del aviso"
          className="border-border grid grid-cols-2 gap-1 rounded-lg border bg-slate-50 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={channel === 'whatsapp'}
            onClick={() => {
              setChannel('whatsapp')
              setLogged(false)
            }}
            className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
              channel === 'whatsapp'
                ? 'text-petroleo bg-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={channel === 'call'}
            onClick={() => {
              setChannel('call')
              setLogged(false)
            }}
            className={`flex h-9 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
              channel === 'call'
                ? 'text-petroleo bg-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Phone className="size-4" />
            Llamada
          </button>
        </div>

        {!target.phoneHasWhatsapp && channel === 'whatsapp' && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Este teléfono no está marcado con WhatsApp. Verifica el número antes
            de enviar.
          </p>
        )}

        {target.reminderConsent ? (
          <p className="border-tealmax/20 bg-tealmax/5 rounded-lg border px-3 py-2 text-xs text-teal-900">
            El paciente autorizó recordatorios por{' '}
            {target.preferredChannel === 'whatsapp'
              ? 'WhatsApp'
              : target.preferredChannel === 'call'
                ? 'llamada'
                : 'SMS'}
            .
          </p>
        ) : (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            Sin consentimiento registrado para recordatorios. Confirma con el
            paciente antes de contactarlo.
          </p>
        )}

        {preview.isLoading && (
          <div className="grid gap-2" aria-busy="true">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          </div>
        )}
        {preview.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos preparar el mensaje. {preview.error.message}
          </p>
        )}

        {data && (
          <>
            <div className="border-border rounded-lg border bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                  {data.template_name || 'Mensaje sugerido'}
                </p>
                <span className="text-muted text-xs">
                  {data.phone || 'Sin teléfono'}
                </span>
              </div>
              <p className="text-ink text-sm leading-6 whitespace-pre-wrap">
                {data.body}
              </p>
            </div>

            {data.consent_warning && !target.reminderConsent && (
              <p className="text-xs text-amber-800">{data.consent_warning}</p>
            )}

            {logged && (
              <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <Check className="size-4" />
                Aviso registrado en el historial del paciente.
              </p>
            )}
            {log.isError && (
              <p role="alert" className="text-xs text-red-700">
                No pudimos registrar el aviso. {log.error.message}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" onClick={copyMessage} disabled={!data.body}>
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
                {copied ? 'Copiado' : 'Copiar mensaje'}
              </Button>
              <Button
                type="button"
                onClick={() => log.mutate()}
                disabled={log.isPending}
              >
                <Copy className="size-4" />
                {log.isPending ? 'Registrando…' : 'Registrar sin abrir'}
              </Button>
              {canOpen ? (
                <a
                  href={openUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => log.mutate()}
                  className="bg-tealmax hover:bg-petroleo focus-visible:ring-tealmax inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {channel === 'whatsapp' ? (
                    <MessageCircle className="size-4" />
                  ) : (
                    <Phone className="size-4" />
                  )}
                  {channel === 'whatsapp' ? 'Abrir WhatsApp' : 'Llamar ahora'}
                </a>
              ) : (
                <Button variant="primary" disabled>
                  {channel === 'whatsapp' ? 'Abrir WhatsApp' : 'Llamar ahora'}
                </Button>
              )}
            </div>
            {!hasPhone && (
              <p className="text-muted text-xs">
                Agrega un teléfono al paciente para abrir el canal.
              </p>
            )}
            <p className="text-muted text-center text-xs">
              Max Care no envía mensajes automáticamente. El envío se realiza
              desde tu WhatsApp o teléfono.
            </p>
          </>
        )}
      </div>
    </Dialog>
  )
}
