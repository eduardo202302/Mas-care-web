import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'

type Status = {
  bot_connected: boolean
  linked: boolean
  linked_at: string | null
}

/**
 * Telegram link of one patient. The patient has to open a single-use link
 * themselves, so a chat is never linked on their behalf.
 */
export function PatientTelegramPanel({
  patientId,
  canEdit,
}: {
  patientId: string
  canEdit: boolean
}) {
  const queryClient = useQueryClient()
  const key = ['patients', patientId, 'telegram']
  const status = useQuery({
    queryKey: key,
    queryFn: () =>
      api<Status>(`/api/v1/patients/${encodeURIComponent(patientId)}/telegram`),
  })
  const [link, setLink] = useState<{ url: string; expires_at: string } | null>(
    null,
  )
  const [copied, setCopied] = useState(false)
  const create = useMutation({
    mutationFn: () =>
      api<{ url: string; expires_at: string }>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/telegram-link`,
        { method: 'POST' },
      ),
    onSuccess: (data) => {
      setCopied(false)
      setLink(data)
    },
  })
  const unlink = useMutation({
    mutationFn: () =>
      api(`/api/v1/patients/${encodeURIComponent(patientId)}/telegram`, {
        method: 'DELETE',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  if (!status.data) return null
  const {
    bot_connected: botConnected,
    linked,
    linked_at: linkedAt,
  } = status.data

  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <h2 className="text-petroleo mb-3 font-semibold">Telegram</h2>
      {!botConnected ? (
        <p className="text-muted text-sm">
          La organización no tiene un bot de Telegram conectado. Se conecta en
          Ajustes → Automatización.
        </p>
      ) : linked ? (
        <>
          <p className="text-sm">
            Vinculado
            {linkedAt
              ? ` el ${new Date(linkedAt).toLocaleDateString('es')}`
              : ''}
            .
          </p>
          {canEdit && (
            <Button
              className="mt-3 h-8 px-2 text-xs"
              disabled={unlink.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    '¿Desvincular el Telegram de este paciente? Los avisos pendientes por Telegram se cancelan.',
                  )
                )
                  unlink.mutate()
              }}
            >
              Desvincular
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="text-muted text-sm">
            Sin vincular. El paciente debe abrir un enlace personal en su
            teléfono; hasta entonces los avisos salen por otro canal.
          </p>
          {canEdit && (
            <Button
              className="mt-3 h-8 px-2 text-xs"
              disabled={create.isPending}
              onClick={() => create.mutate()}
            >
              Generar enlace de vinculación
            </Button>
          )}
        </>
      )}
      {(create.isError || unlink.isError) && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {(create.error ?? unlink.error)?.message}
        </p>
      )}
      {link && (
        <Dialog
          title="Enlace de vinculación"
          description="Envíaselo al paciente. Es personal, sirve una sola vez y caduca en 7 días."
          onClose={() => setLink(null)}
        >
          <div className="grid gap-3">
            <input
              readOnly
              aria-label="Enlace de Telegram"
              value={link.url}
              onFocus={(event) => event.currentTarget.select()}
              className="border-border h-10 rounded-lg border bg-slate-50 px-3 text-sm"
            />
            <p className="text-muted text-xs">
              Caduca el {new Date(link.expires_at).toLocaleDateString('es')}. No
              se vuelve a mostrar.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={async () => {
                  await navigator.clipboard?.writeText(link.url)
                  setCopied(true)
                }}
              >
                {copied ? 'Copiado' : 'Copiar enlace'}
              </Button>
              <Button variant="primary" onClick={() => setLink(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  )
}
