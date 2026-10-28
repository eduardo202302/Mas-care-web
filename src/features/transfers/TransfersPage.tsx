import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import { NotFoundPage } from '@/app/NotFoundPage'
import { EmptyState } from '@/components/EmptyState'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { useMe } from '@/lib/permissions'
import type { paths } from '@/lib/api-types'
import {
  transferFiltersFromSearch,
  transferFiltersToSearch,
  type GlobalTransferList,
} from '@/lib/transfers'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

const controlClass =
  'border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none'

export default function TransfersPage() {
  const { data: me, isPending: mePending } = useMe()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const filters = useMemo(
    () => transferFiltersFromSearch(searchParams),
    [searchParams],
  )
  const privileged = me?.role === 'owner' || me?.role === 'admin'

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
    enabled: privileged,
  })

  const transfers = useQuery({
    queryKey: ['transfers', filters, page],
    queryFn: () =>
      api<GlobalTransferList>(
        `/api/v1/transfers?${pageQuery({
          branch_id: filters.branch_id,
          from: filters.from,
          to: filters.to,
          page,
          rows: PAGE_ROWS,
        })}`,
      ),
    enabled: privileged,
  })

  function updateFilters(next: typeof filters) {
    setPage(1)
    setSearchParams(transferFiltersToSearch(next))
  }

  const rows = transfers.data?.data ?? []

  if (mePending) {
    return (
      <div className="grid gap-4" aria-busy="true">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }
  // Same 404 RequireRoute shows for a role whose menu excludes the path, so
  // this screen never reveals its existence to non-privileged roles.
  if (!privileged) return <NotFoundPage />

  return (
    <div className="animate-in">
      <div className="mb-7">
        <p className="text-tealmax mb-2 text-sm font-medium">Operación</p>
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
          Traspasos
        </h1>
        <p className="text-muted mt-2 max-w-2xl text-sm">
          Historial de traslados de pacientes entre sucursales.
        </p>
      </div>

      <section
        aria-label="Filtros de traspasos"
        className="border-border shadow-card mb-5 grid gap-3 rounded-xl border bg-white p-3 sm:grid-cols-3"
      >
        <label className="grid gap-1.5">
          <span className="text-muted text-xs font-semibold tracking-wide uppercase">
            Sucursal
          </span>
          <select
            value={filters.branch_id ?? ''}
            onChange={(event) =>
              updateFilters({ ...filters, branch_id: event.target.value || undefined })
            }
            className={controlClass}
          >
            <option value="">Todas las sucursales</option>
            {(branches.data?.data ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-muted text-xs font-semibold tracking-wide uppercase">
            Desde
          </span>
          <input
            type="date"
            value={filters.from ?? ''}
            onChange={(event) =>
              updateFilters({ ...filters, from: event.target.value || undefined })
            }
            className={controlClass}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-muted text-xs font-semibold tracking-wide uppercase">
            Hasta
          </span>
          <input
            type="date"
            value={filters.to ?? ''}
            onChange={(event) =>
              updateFilters({ ...filters, to: event.target.value || undefined })
            }
            className={controlClass}
          />
        </label>
        {(filters.branch_id || filters.from || filters.to) && (
          <div className="sm:col-span-3">
            <Button
              type="button"
              className="h-9"
              onClick={() => updateFilters({})}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </section>

      {transfers.isError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <span>No pudimos cargar los traspasos. {transfers.error.message}</span>
          <Button type="button" className="h-8" onClick={() => transfers.refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {transfers.isLoading ? (
        <TableSkeleton columns={6} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Sin traspasos"
          description="Cuando se traslade un paciente entre sucursales, aparecerá aquí."
        />
      ) : (
        <DataTable
          columns={['Fecha', 'Paciente', 'De', 'A', 'Motivo', 'Registrado por']}
          rows={rows.map((row) => [
            <span key="date">
              {new Date(row.occurred_at).toLocaleString('es')}
            </span>,
            <span key="patient">{row.patient.full_name}</span>,
            <span key="from">{row.from_branch.name}</span>,
            <span key="to" className="inline-flex items-center gap-1.5">
              <ArrowRightLeft className="text-tealmax size-3.5" />
              {row.to_branch.name}
            </span>,
            <span key="reason" className="text-muted line-clamp-2">
              {row.reason}
            </span>,
            <span key="by">{row.created_by.name}</span>,
          ])}
          emptyTitle="Sin traspasos"
          emptyDescription="Cuando se traslade un paciente entre sucursales, aparecerá aquí."
        />
      )}
      {!transfers.isLoading && (
        <Pagination
          page={page}
          rows={PAGE_ROWS}
          total={transfers.data?.total ?? 0}
          onChange={setPage}
          disabled={transfers.isFetching}
        />
      )}
    </div>
  )
}
