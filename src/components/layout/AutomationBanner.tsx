import { useQuery } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { useAutomationRules } from '@/features/automation/AutomationRules'
import type { components } from '@/lib/api-types'

type AutomationSettings = components['schemas']['AutomationSettings']

/**
 * Permanent reminder unless the master switch is on AND at least one rule is
 * active; in that case it lists which rules are running.
 */
export function AutomationBanner() {
  const canManage = useCan('automation:manage')
  const settings = useQuery({
    queryKey: ['automation-settings', null],
    queryFn: () => api<AutomationSettings>('/api/v1/automation/settings'),
    enabled: canManage,
  })
  const rules = useAutomationRules(canManage)
  if (!canManage || !settings.data || !rules.data) return null
  const { automation_enabled, automation_dry_run } = settings.data
  const active = rules.data.data.filter((rule) => rule.enabled)

  const base = 'mb-5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm'
  if (automation_enabled && active.length > 0) {
    return (
      <div
        role="status"
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-950`}
      >
        <span>
          Automatizaciones activas:{' '}
          <strong>{active.map((rule) => rule.label).join(', ')}</strong>
          {automation_dry_run &&
            ' (modo prueba: se planifican pero no se ejecutan)'}
          .
        </span>
      </div>
    )
  }
  return (
    <div
      role="status"
      className={`${base} border-amber-200 bg-amber-50 text-amber-950`}
    >
      <TriangleAlert className="size-4 shrink-0" />
      <span>
        Los avisos automáticos están <strong>apagados</strong>.{' '}
        {!automation_enabled
          ? 'El interruptor general está apagado.'
          : 'No hay ninguna automatización activa.'}{' '}
        Nada se hace solo.
      </span>
    </div>
  )
}
