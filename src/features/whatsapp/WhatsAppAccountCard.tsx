import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/http'

type Account = { connected: boolean; phone_number_id: string | null }
const accountKey = ['whatsapp-account']

/**
 * Connects the organization own WhatsApp Business number. The access token is
 * stored encrypted by the API and is never shown again after saving.
 */
export function WhatsAppAccountCard() {
  const queryClient = useQueryClient()
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [token, setToken] = useState('')
  const account = useQuery({
    queryKey: accountKey,
    queryFn: () => api<Account>('/api/v1/automation/whatsapp-account'),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: accountKey })
  const connect = useMutation({
    mutationFn: () =>
      api<Account>('/api/v1/automation/whatsapp-account', {
        method: 'PUT',
        body: JSON.stringify({ phone_number_id: phoneNumberId.trim(), access_token: token.trim() }),
      }),
    onSuccess: async () => {
      setToken('')
      setPhoneNumberId('')
      await refresh()
    },
  })
  const disconnect = useMutation({
    mutationFn: () => api('/api/v1/automation/whatsapp-account', { method: 'DELETE' }),
    onSuccess: refresh,
  })
  const ready = phoneNumberId.trim().length >= 5 && token.trim().length >= 20

  return (
    <section className="border-border mt-6 grid gap-3 rounded-xl border bg-white p-5 md:p-6">
      <h2 className="text-ink flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="size-4" />
        Número de WhatsApp Business
      </h2>
      <p className="text-muted text-xs">
        Cada organización conecta su propio número de WhatsApp Business (Meta). Así cada respuesta llega a la
        organización correcta. Necesitas el <strong>identificador del número</strong> y un{' '}
        <strong>token de acceso permanente</strong> de Meta (no el temporal de 24 horas). Después registra la
        plantilla aprobada en Ajustes → Plantillas.
      </p>
      {account.data?.connected && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            Conectado al número <strong>{account.data.phone_number_id}</strong>
          </p>
          <Button
            variant="danger"
            disabled={disconnect.isPending}
            onClick={() => {
              if (window.confirm('¿Desconectar el número de WhatsApp? Los avisos por WhatsApp dejarán de salir.')) disconnect.mutate()
            }}
          >
            Desconectar
          </Button>
        </div>
      )}
      <form
        className="grid gap-2 md:grid-cols-[1fr_2fr_auto] md:items-end"
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) connect.mutate()
        }}
      >
        <label className="grid gap-1 text-sm font-medium">
          Identificador del número
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="109876543210987"
            value={phoneNumberId}
            onChange={(event) => setPhoneNumberId(event.target.value)}
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          {account.data?.connected ? 'Reemplazar el token' : 'Token de acceso'}
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
          />
        </label>
        <Button type="submit" variant="primary" disabled={!ready || connect.isPending}>
          {account.data?.connected ? 'Reemplazar' : 'Conectar número'}
        </Button>
      </form>
      {connect.isError && <p role="alert" className="text-sm text-red-700">{connect.error.message}</p>}
      {disconnect.isError && <p role="alert" className="text-sm text-red-700">{disconnect.error.message}</p>}
    </section>
  )
}
