import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'

export type AutomationRule = {
  key: string
  label: string
  description: string
  enabled: boolean
  params: { followUpDays?: number; days?: number }
}

export const rulesQueryKey = ['automation-rules']

export function useAutomationRules(enabled = true) {
  return useQuery({
    queryKey: rulesQueryKey,
    queryFn: () => api<{ data: AutomationRule[] }>('/api/v1/automation/rules'),
    enabled,
  })
}

const paramField: Record<string, { name: 'followUpDays' | 'days'; label: string }> = {
  treatment_created: { name: 'followUpDays', label: 'Días hasta el seguimiento' },
  cycle_no_response: { name: 'days', label: 'Días sin respuesta' },
}

/** One switch per rule. The master switch above still has to be on for any of them to run. */
export function AutomationRules() {
  const queryClient = useQueryClient()
  const rules = useAutomationRules()
  const save = useMutation({
    mutationFn: ({ key, body }: { key: string; body: object }) =>
      api(`/api/v1/automation/rules/${key}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rulesQueryKey }),
  })

  return (
    <section className="border-border grid gap-3 rounded-xl border bg-white p-5 md:p-6">
      <h2 className="text-ink text-sm font-semibold">
        Reglas de automatización
      </h2>
      <p className="text-muted text-xs">
        Ninguna regla envía mensajes a pacientes: crean tareas, incidencias y
        registros en el historial. Sin consentimiento de recordatorios vigente,
        solo se crea una tarea de llamada.
      </p>
      {save.isError && (
        <p role="alert" className="text-sm text-red-700">
          {save.error.message}
        </p>
      )}
      {rules.data?.data.map((rule) => {
        const extra = paramField[rule.key]
        return (
          <div key={rule.key} className="border-border grid gap-2 rounded-lg border p-4">
            <label className="flex items-start justify-between gap-4">
              <span>
                <span className="text-ink block text-sm font-medium">
                  {rule.label}
                </span>
                <span className="text-muted mt-0.5 block text-xs">
                  {rule.description}
                </span>
              </span>
              <input
                type="checkbox"
                aria-label={`Activar ${rule.label}`}
                checked={rule.enabled}
                disabled={save.isPending}
                onChange={(event) =>
                  save.mutate({
                    key: rule.key,
                    body: { enabled: event.target.checked },
                  })
                }
                className="mt-1 size-5"
              />
            </label>
            {extra && (
              <label className="flex items-center gap-2 text-xs">
                {extra.label}
                <input
                  type="number"
                  min={1}
                  defaultValue={rule.params[extra.name]}
                  onBlur={(event) => {
                    const value = Number(event.target.value)
                    if (value > 0 && value !== rule.params[extra.name])
                      save.mutate({
                        key: rule.key,
                        body: { params: { [extra.name]: value } },
                      })
                  }}
                  className="border-border h-8 w-20 rounded-lg border px-2"
                />
              </label>
            )}
          </div>
        )
      })}
    </section>
  )
}

/** Manual enrollment of a patient (and optionally a treatment/cycle) in an active rule. */
export function EnrollAutomationButton({
  patientId,
  treatmentId,
  cycleId,
}: {
  patientId: string
  treatmentId?: string
  cycleId?: string
}) {
  const canManage = useCan('automation:manage')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const rules = useAutomationRules(canManage && open)
  const enroll = useMutation({
    mutationFn: (key: string) =>
      api<{ outcome: string }>(`/api/v1/automation/rules/${key}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ patientId, treatmentId, cycleId }),
      }),
    onSuccess: ({ outcome }) =>
      setMessage(
        outcome === 'done'
          ? 'Inscrito: la acción quedó en el historial.'
          : `Sin cambios (${outcome}).`,
      ),
  })
  if (!canManage) return null
  const active = rules.data?.data.filter((rule) => rule.enabled) ?? []

  return (
    <>
      <Button onClick={() => setOpen(true)}>Inscribir en automatización</Button>
      {open && (
        <Dialog
          title="Inscribir en automatización"
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-3">
            {active.length === 0 && (
              <p className="text-muted text-sm">
                No hay automatizaciones activas. Actívalas en Ajustes.
              </p>
            )}
            {active.map((rule) => (
              <Button
                key={rule.key}
                disabled={enroll.isPending}
                onClick={() => enroll.mutate(rule.key)}
              >
                {rule.label}
              </Button>
            ))}
            {message && (
              <p role="status" className="text-sm">
                {message}
              </p>
            )}
            {enroll.isError && (
              <p role="alert" className="text-sm text-red-700">
                {enroll.error.message}
              </p>
            )}
          </div>
        </Dialog>
      )}
    </>
  )
}
