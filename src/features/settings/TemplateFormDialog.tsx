import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import type { MessageChannel, MessageTemplate } from '@/lib/operations'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

const variables = [
  { token: '{{paciente}}', hint: 'Nombre del paciente' },
  { token: '{{medicamento}}', hint: 'Medicamento del tratamiento' },
  { token: '{{fecha}}', hint: 'Fecha de cobertura' },
  { token: '{{farmacia}}', hint: 'Sucursal' },
]

export function TemplateFormDialog({
  template,
  onClose,
  onSaved,
}: {
  template?: MessageTemplate
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const queryClient = useQueryClient()
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [channel, setChannel] = useState<MessageChannel>(
    template?.channel ?? 'whatsapp',
  )
  const [name, setName] = useState(template?.name ?? '')
  const [body, setBody] = useState(template?.body ?? '')
  const [branchId, setBranchId] = useState(template?.branchId ?? '')
  const [isActive, setIsActive] = useState(template?.isActive ?? true)

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        channel,
        kind: template?.kind ?? 'refill_notice',
        name: name.trim(),
        body: body.trim(),
        branch_id: branchId || null,
        is_active: isActive,
      }
      return template
        ? api<MessageTemplate>(
            `/api/v1/message-templates/${encodeURIComponent(template.id)}`,
            { method: 'PATCH', body: JSON.stringify(payload) },
          )
        : api<MessageTemplate>('/api/v1/message-templates', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['templates'] })
      onSaved(template ? 'Plantilla actualizada.' : 'Plantilla creada.')
      onClose()
    },
  })

  function insertVariable(token: string) {
    const element = bodyRef.current
    const start = element?.selectionStart ?? body.length
    const end = element?.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${token}${body.slice(end)}`
    setBody(next)
    window.requestAnimationFrame(() => {
      const current = bodyRef.current
      if (!current) return
      const position = start + token.length
      current.focus()
      current.setSelectionRange(position, position)
    })
  }

  const channelHint =
    channel === 'whatsapp'
      ? 'Se usará como texto base y se abrirá en WhatsApp.'
      : 'Se usará como guion para la llamada.'

  return (
    <Dialog
      title={template ? 'Editar plantilla' : 'Nueva plantilla'}
      description="Personaliza los mensajes de reposición de tu organización."
      onClose={onClose}
      size="lg"
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim() || !body.trim() || save.isPending) return
          save.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Canal</span>
            <select
              value={channel}
              onChange={(event) =>
                setChannel(event.target.value as MessageChannel)
              }
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Llamada</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Sucursal</span>
            <select
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            >
              <option value="">Toda la organización</option>
              {(branches.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TextField
          label="Nombre de la plantilla"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          required
          placeholder="Recordatorio de reposición"
        />

        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">Mensaje</span>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={5000}
            rows={6}
            required
            placeholder="Hola {{paciente}}, tu medicamento {{medicamento}} está listo…"
            className="border-border focus:border-tealmax rounded-lg border bg-white px-3 py-2 text-sm leading-6 outline-none"
          />
          <span className="text-muted text-xs">{channelHint}</span>
        </label>

        <div>
          <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
            Variables disponibles
          </p>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <button
                key={variable.token}
                type="button"
                onClick={() => insertVariable(variable.token)}
                title={variable.hint}
                className="border-border text-ink hover:border-tealmax hover:text-tealmax rounded-full border bg-white px-3 py-1 font-mono text-xs transition"
              >
                {variable.token}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="border-border text-tealmax size-4 rounded"
          />
          <span className="text-ink">Plantilla activa</span>
        </label>

        {save.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos guardar la plantilla. {save.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || !body.trim() || save.isPending}
          >
            {save.isPending ? 'Guardando…' : 'Guardar plantilla'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
