import { useQuery } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import { useUiStore } from '@/stores/ui-store'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

export function BranchFilter({ className }: { className?: string }) {
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const setActiveBranchId = useUiStore((state) => state.setActiveBranchId)
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })

  return (
    <label className={className}>
      <span className="sr-only">Filtrar por sucursal</span>
      <span className="border-border text-ink flex h-10 items-center gap-2 rounded-lg border bg-white pr-2 pl-3">
        <Building2 className="text-muted size-4 shrink-0" />
        <select
          aria-label="Filtrar por sucursal"
          value={activeBranchId ?? 'all'}
          onChange={(event) =>
            setActiveBranchId(
              event.target.value === 'all' ? 'all' : event.target.value,
            )
          }
          className="h-full min-w-40 bg-transparent text-sm outline-none"
        >
          <option value="all">Todas las sucursales</option>
          {(branches.data?.data ?? []).map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}
