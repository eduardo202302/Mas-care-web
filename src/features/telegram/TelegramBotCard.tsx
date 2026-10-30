import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/http'

type Account = { connected: boolean; bot_username: string | null }
const accountKey = ['telegram-account']

/**
 * Connects the organization own Telegram bot. The token comes from @BotFather
 * and is stored encrypted by the API; it is never shown again after saving.
 */
export function TelegramBotCard() {
  const queryClient = useQueryClient()
  const [token, setToken] = useState('')
  const account = useQuery({
    queryKey: accountKey,
    queryFn: () => api<Account>('/api/v1/automation/telegram-account'),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: accountKey })
  const connect = useMutation({
    mutationFn: () =>
      api<Account>('/api/v1/automation/telegram-account', {
        method: 'PUT',
        body: JSON.stringify({ bot_token: token.trim() }),
      }),
    onSuccess: async () => {
      setToken('')
      await refresh()
    },
  })
  const disconnect = useMutation({
    mutationFn: () =>
      api('/api/v1/automation/telegram-account', { method: 'DELETE' }),
    onSuccess: refresh,
  })

  return (
    <section className="border-border mt-6 grid gap-3 rounded-xl border bg-white p-5 md:p-6">
      <h2 className="text-ink flex items-center gap-2 text-sm font-semibold">
        <Send className="size-4" />
        Bot de Telegram
      </h2>
      <p className="text-muted text-xs">
        Los pacientes que prefieran Telegram reciben los avisos por tu propio
        bot. Créalo con @BotFather, pega aquí su token y luego genera, en la
        ficha de cada paciente, el enlace que el paciente abre para vincular su
        chat. Cambiar de bot desvincula a todos los pacientes.
      </p>
      {account.data?.connected ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            Conectado como <strong>@{account.data.bot_username}</strong>
          </p>
          <Button
            variant="danger"
            disabled={disconnect.isPending}
            onClick={() => {
              if (
                window.confirm(
                  '¿Desconectar el bot? Todos los pacientes tendrán que volver a vincular su Telegram.',
                )
              )
                disconnect.mutate()
            }}
          >
            Desconectar
          </Button>
        </div>
      ) : null}
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (token.trim()) connect.mutate()
        }}
      >
        <label className="grid min-w-72 flex-1 gap-1 text-sm font-medium">
          {account.data?.connected ? 'Reemplazar el token' : 'Token del bot'}
          <input
            type="password"
            autoComplete="off"
            placeholder="123456:ABC-DEF..."
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
          />
        </label>
        <Button
          type="submit"
          variant="primary"
          disabled={!token.trim() || connect.isPending}
        >
          {account.data?.connected ? 'Reemplazar' : 'Conectar bot'}
        </Button>
      </form>
      {connect.isError && (
        <p role="alert" className="text-sm text-red-700">
          {connect.error.message}
        </p>
      )}
      {disconnect.isError && (
        <p role="alert" className="text-sm text-red-700">
          {disconnect.error.message}
        </p>
      )}
    </section>
  )
}
