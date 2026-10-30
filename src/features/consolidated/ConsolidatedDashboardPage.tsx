import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Building2, RefreshCw } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/http'
import { useMe } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/stores/ui-store'
import type { components } from '@/lib/api-types'

type ConsolidatedResponse =
  components['schemas']['DashboardConsolidatedResponse']
type BranchRow = components['schemas']['DashboardConsolidatedBranchRow']

const counterKeys = [
  'today_refills',
  'due_soon',
  'overdue',
  'pending_pickups',
  'prescriptions_to_renew',
  'no_response',
  'open_incidents',
  'failed_messages',
] as const

const counterLabels: Record<(typeof counterKeys)[number], string> = {
  today_refills: 'Hoy',
  due_soon: 'Vence pronto',
  overdue: 'Vencidos',
  pending_pickups: 'Retiros',
  prescriptions_to_renew: 'Recetas',
  no_response: 'Sin respuesta',
  open_incidents: 'Incidencias',
  failed_messages: 'Mensajes fallidos',
}

function todayInputValue(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Counts that have a real destination to link to:
 * - today_refills / due_soon / pending_pickups / prescriptions_to_renew / no_response
 *   all live on the daily panel (/inicio), but that page reads its active
 *   branch from the UI store, not from the URL, and it does not accept a
 *   `card` deep link at all (selection is local state). We can only
 *   preselect the branch (via the store) before navigating there — we
 *   cannot jump straight to a specific card.
 * - overdue also has no card-level deep link for the same reason.
 * - open_incidents maps to /incidencias?branch_id=, which IncidentsPage
 *   really reads from the URL (incidentFiltersFromSearch).
 * - failed_messages has no destination screen in this frontend yet, so it
 *   renders as plain text, never a link.
 */
function CounterCell({
  value,
  counterKey,
  branchId,
}: {
  value: number
  counterKey: (typeof counterKeys)[number]
  branchId: string | null
}) {
  const setActiveBranchId = useUiStore((state) => state.setActiveBranchId)
  const isOverdue = counterKey === 'overdue'
  const className = cn(
    'tabular-nums font-semibold',
    isOverdue && value > 0 && 'text-expired-text',
  )

  if (counterKey === 'open_incidents') {
    return (
      <Link
        to={
          branchId
            ? `/incidencias?branch_id=${encodeURIComponent(branchId)}`
            : '/incidencias'
        }
        className={cn(className, 'hover:underline')}
      >
        {value}
      </Link>
    )
  }
  if (counterKey === 'failed_messages') {
    // No destination screen exists for this count yet; text only.
    return <span className={className}>{value}</span>
  }
  if (branchId) {
    // /inicio reads its branch from the UI store, not from a URL param, so
    // we set the store before navigating instead of linking with a query
    // string the page would ignore.
    return (
      <Link
        to="/inicio"
        onClick={() => setActiveBranchId(branchId)}
        className={cn(className, 'hover:underline')}
      >
        {value}
      </Link>
    )
  }
  // TOTAL row: no single branch to preselect, so it stays as plain text.
  return <span className={className}>{value}</span>
}

function StockAgeCell({ days }: { days: number | null }) {
  if (days === null)
    return <span className="text-muted text-sm">Sin datos</span>
  return (
    <span
      className={cn(
        'text-sm font-medium',
        days > 7 ? 'text-amber-700' : 'text-ink',
      )}
    >
      {days} {days === 1 ? 'día' : 'días'}
    </span>
  )
}

function BranchRowCells({
  row,
  isTotal,
}: {
  row:
    | BranchRow
    | (components['schemas']['DashboardConsolidatedTotal'] & {
        stock_check_age_days?: null
      })
  isTotal: boolean
}) {
  const branchId = isTotal ? null : (row as BranchRow).branch_id
  return (
    <>
      {counterKeys.map((key) => (
        <td key={key} className="px-4 py-3 text-right">
          <CounterCell value={row[key]} counterKey={key} branchId={branchId} />
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        {isTotal ? (
          <span className="text-muted text-sm">—</span>
        ) : (
          <StockAgeCell days={(row as BranchRow).stock_check_age_days} />
        )}
      </td>
    </>
  )
}

export default function ConsolidatedDashboardPage() {
  const { data: me } = useMe()
  // The endpoint itself has no branch filter — it always returns one row per
  // branch the caller can access (confirmed in its description: "one row
  // per accessible branch"). There is no "all branches" request to make;
  // `privileged` only decides the caption telling the viewer whether that
  // set is the whole organization or just their assigned branches, the same
  // role check BoardPage/IncidentsPage/StockPage use for privileged-only UI.
  const privileged = me?.role === 'owner' || me?.role === 'admin'
  const [date, setDate] = useState(todayInputValue())

  const consolidated = useQuery({
    queryKey: ['dashboard', 'consolidated', date],
    queryFn: () =>
      api<ConsolidatedResponse>(
        `/api/v1/dashboard/consolidated?date=${encodeURIComponent(date)}`,
      ),
  })

  const branches = consolidated.data?.branches ?? []

  return (
    <div className="animate-in">
      <PageHeader
        title="Panel global"
        subtitle="Vista consolidada de todas las sucursales para el día seleccionado."
        actions={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <label className="grid gap-1">
                <span className="sr-only">Fecha</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
                />
              </label>
              <Button
                type="button"
                aria-label="Actualizar panel global"
                className="size-10 px-0"
                onClick={() => consolidated.refetch()}
                disabled={consolidated.isFetching}
              >
                <RefreshCw
                  className={cn(
                    'size-4',
                    consolidated.isFetching && 'animate-spin',
                  )}
                />
              </Button>
            </div>
          </>
        }
      />

      {!privileged && (
        <p className="text-muted mb-4 flex items-center gap-2 text-xs">
          <Building2 className="size-3.5" />
          Mostrando únicamente las sucursales a las que tienes acceso.
        </p>
      )}

      {consolidated.isError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <span>
            No pudimos cargar el panel global. {consolidated.error.message}
          </span>
          <Button
            type="button"
            className="h-8"
            onClick={() => consolidated.refetch()}
          >
            Reintentar
          </Button>
        </div>
      )}

      {consolidated.isLoading ? (
        <TableSkeleton columns={9} />
      ) : branches.length === 0 ? (
        <EmptyState
          title="Sin sucursales"
          description="Cuando tu organización tenga sucursales con actividad, aparecerán aquí."
        />
      ) : (
        <div className="border-border overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-surface text-muted text-xs tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Sucursal</th>
                  {counterKeys.map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3.5 text-right font-semibold whitespace-nowrap"
                    >
                      {counterLabels[key]}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                    Antigüedad stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {branches.map((branch) => (
                  <tr key={branch.branch_id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-sm font-medium">
                        <span
                          aria-hidden="true"
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: branch.label_color }}
                        />
                        {branch.name}
                      </span>
                    </td>
                    <BranchRowCells row={branch} isTotal={false} />
                  </tr>
                ))}
                {consolidated.data && (
                  <tr className="bg-surface font-semibold">
                    <td className="px-4 py-3">TOTAL</td>
                    <BranchRowCells
                      row={{
                        ...consolidated.data.total,
                        stock_check_age_days: null,
                      }}
                      isTotal
                    />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
