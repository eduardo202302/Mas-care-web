import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, MessageSquareText, Send } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import type { MessageChannel, MessageTemplate } from '@/lib/operations'

// Fields the API accepts for WhatsApp templates; the generated type predates them.
type WaFields = {
  waTemplateName?: string | null
  waLanguage?: string
  waStatus?: 'draft' | 'pending' | 'approved' | 'rejected'
  waCategory?: 'utility' | 'marketing' | 'authentication' | null
  attemptNumber?: number
}

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

const variables = [
  { token: '{{paciente}}', hint: 'Nombre del paciente' },
  { token: '{{medicamento}}', hint: 'Medicamento del tratamiento' },
  { token: '{{fecha}}', hint: 'Fecha de cobertura' },
  { token: '{{farmacia}}', hint: 'Sucursal' },
]

/** Mismo control que el resto de la app: ancho completo y anillo de foco. */
const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'

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
  const wa = (template ?? {}) as WaFields
  const [waName, setWaName] = useState(wa.waTemplateName ?? '')
  const [waLanguage, setWaLanguage] = useState(wa.waLanguage ?? 'es')
  const [waStatus, setWaStatus] = useState<NonNullable<WaFields['waStatus']>>(
    wa.waStatus ?? 'draft',
  )
  const [waCategory, setWaCategory] = useState<string>(wa.waCategory ?? '')
  const [attemptNumber, setAttemptNumber] = useState(wa.attemptNumber ?? 1)
  const waInvalid =
    channel === 'whatsapp' && waStatus === 'approved' && !waName.trim()

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
        // The notice number applies to automatic messages on both channels; Meta data only to WhatsApp.
        ...(channel !== 'call' ? { attempt_number: attemptNumber } : {}),
        ...(channel === 'whatsapp'
          ? {
              wa_template_name: waName.trim() || null,
              wa_language: waLanguage.trim() || 'es',
              wa_status: waStatus,
              wa_category: waCategory || null,
            }
          : {}),
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
      ? 'Texto base para el aviso manual por WhatsApp. El aviso automático usa la plantilla aprobada por Meta que registres abajo.'
      : channel === 'telegram'
        ? 'Texto plano que recibe el paciente por Telegram, con los botones Confirmar y Necesito hablar. No necesita aprobación.'
        : 'Se usará como guion para la llamada.'

  return (
    <Dialog
      title={template ? 'Editar Plantilla' : 'Nueva Plantilla'}
      icon={<MessageSquareText className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
      size="lg"
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim() || !body.trim() || waInvalid || save.isPending)
            return
          save.mutate()
        }}
      >
        <ModalSection
          icon={<MessageSquareText className="size-4" />}
          title="Mensaje"
          tone="mint"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Canal</span>
              <select
                value={channel}
                onChange={(event) =>
                  setChannel(event.target.value as MessageChannel)
                }
                className={control}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="call">Llamada</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Sucursal</span>
              <select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                className={control}
              >
                <option value="">Toda la Organización</option>
                {(branches.data?.data ?? []).map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <TextField
            label="Nombre de la Plantilla"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
            placeholder="Recordatorio de reposición"
          />

          <div className="grid gap-1.5">
            <label
              htmlFor="template-body"
              className="text-ink text-sm font-medium"
            >
              Mensaje
            </label>
            <TextAreaField
              id="template-body"
              ref={bodyRef}
              className="min-h-8 py-1.5 text-xs"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={5000}
              required
              placeholder="Hola {{paciente}}, tu medicamento {{medicamento}} está listo…"
            />
            <span className="text-muted text-xs">{channelHint}</span>
          </div>

          <div>
            <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
              Variables Disponibles
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
        </ModalSection>

        <ModalSection
          icon={<Send className="size-4" />}
          title="Envío Automático"
          tone="sky"
        >
          {channel !== 'call' && (
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">
                Aviso Automático al que Corresponde
              </span>
              <select
                value={attemptNumber}
                onChange={(event) =>
                  setAttemptNumber(Number(event.target.value))
                }
                className={control}
              >
                <option value={1}>Primer Aviso</option>
                <option value={2}>Primer Recordatorio</option>
                <option value={3}>Último Recordatorio</option>
              </select>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="border-border text-tealmax size-4 rounded"
            />
            <span className="text-ink">Plantilla Activa</span>
          </label>
        </ModalSection>

        {channel === 'whatsapp' && (
          <ModalSection
            icon={<BadgeCheck className="size-4" />}
            title="Plantilla de WhatsApp en Meta"
            tone="amber"
          >
            <p className="text-muted text-xs">
              Solo las plantillas <strong>aprobadas</strong> se envían de forma
              automática. Los valores viajan como {'{{1}}'} paciente (solo el
              nombre de pila), {'{{2}}'} farmacia, {'{{3}}'} fecha; si la
              plantilla usa el medicamento será {'{{3}}'} y la fecha {'{{4}}'}.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-ink text-sm font-medium">
                  Nombre Registrado en Meta
                </span>
                <input
                  value={waName}
                  onChange={(event) => setWaName(event.target.value)}
                  maxLength={512}
                  placeholder="aviso_reposicion"
                  className={control}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-ink text-sm font-medium">
                  Estado en Meta
                </span>
                <select
                  value={waStatus}
                  onChange={(event) =>
                    setWaStatus(event.target.value as typeof waStatus)
                  }
                  className={control}
                >
                  <option value="draft">Borrador</option>
                  <option value="pending">Pendiente de Aprobación</option>
                  <option value="approved">Aprobada</option>
                  <option value="rejected">Rechazada</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-ink text-sm font-medium">Idioma</span>
                <input
                  value={waLanguage}
                  onChange={(event) => setWaLanguage(event.target.value)}
                  maxLength={5}
                  placeholder="es"
                  className={control}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-ink text-sm font-medium">Categoría</span>
                <select
                  value={waCategory}
                  onChange={(event) => setWaCategory(event.target.value)}
                  className={control}
                >
                  <option value="">Sin Indicar</option>
                  <option value="utility">Utilidad</option>
                  <option value="marketing">Marketing</option>
                  <option value="authentication">Autenticación</option>
                </select>
              </label>
            </div>
            {waInvalid && (
              <p role="alert" className="text-xs text-red-700">
                Una plantilla aprobada necesita el nombre registrado en Meta.
              </p>
            )}
          </ModalSection>
        )}

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
            {save.isPending ? 'Guardando…' : 'Guardar Plantilla'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
