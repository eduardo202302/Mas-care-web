import { useQuery } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components } from '@/lib/api-types'

type AutomationSettings = components['schemas']['AutomationSettings']

/** Permanent reminder while automation is off or still in test mode. */
export function AutomationBanner() {
  const canManage = useCan('automation:manage')
  const settings = useQuery({
    queryKey: ['automation-settings', null],
    queryFn: () => api<AutomationSettings>('/api/v1/automation/settings'),
    enabled: canManage,
  })
  if (!canManage || !settings.data) return null
  const { automation_enabled, automation_dry_run } = settings.data
  if (automation_enabled && !automation_dry_run) return null

  return (
    <div
      role="status"
      className="mb-5 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <TriangleAlert className="size-4 shrink-0" />
      {!automation_enabled ? (
        <span>
          Los avisos automáticos están <strong>apagados</strong>. Nada se
          envía solo.
        </span>
      ) : (
        <span>
          Los avisos automáticos están en <strong>modo prueba</strong>: se
          planifican pero no se envían.
        </span>
      )}
    </div>
  )
}
