import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import { NotFoundPage } from '@/app/NotFoundPage'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { useMe } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
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
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
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
    queryKey: ['transfers', filters, page, rows],
    queryFn: () =>
      api<GlobalTransferList>(
        `/api/v1/transfers?${pageQuery({
          branch_id: filters.branch_id,
          from: filters.from,
          to: filters.to,
          page,
          rows,
        })}`,
      ),
    enabled: privileged,
  })

  function updateFilters(next: typeof filters) {
    setPage(1)
    setSearchParams(transferFiltersToSearch(next))
  }

  const items = applyColumnSort(
    transfers.data?.data ?? [],
    sort,
    (row, index) =>
      index === 0
        ? row.occurred_at
        : index === 1
          ? row.patient.full_name
          : index === 2
            ? row.from_branch.name
            : index === 3
              ? row.to_branch.name
              : index === 4
                ? row.reason
                : row.created_by.name,
  )

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
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Traspasos"
        subtitle="Historial de traslados de pacientes entre sucursales."
      />

      <section
        aria-label="Filtros de traspasos"
        className="border-border shadow-card mb-5 grid shrink-0 gap-3 rounded-xl border bg-white p-3 sm:grid-cols-3"
      >
        <label className="grid gap-1.5">
          <span className="text-muted text-xs font-semibold tracking-wide uppercase">
            Sucursal
          </span>
          <select
            value={filters.branch_id ?? ''}
            onChange={(event) =>
              updateFilters({
                ...filters,
                branch_id: event.target.value || undefined,
              })
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
              updateFilters({
                ...filters,
                from: event.target.value || undefined,
              })
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
          className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <span>
            No pudimos cargar los traspasos. {transfers.error.message}
          </span>
          <Button
            type="button"
            className="h-8"
            onClick={() => transfers.refetch()}
          >
            Reintentar
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1">
        {transfers.isLoading ? (
          <TableSkeleton columns={6} />
        ) : (
          <DataTable
            columns={[
              'Fecha',
              'Paciente',
              'De',
              'A',
              'Motivo',
              'Registrado por',
            ]}
            rows={items.map((row) => [
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
            sortableColumns={[0, 1, 2, 3, 4, 5]}
            sort={sort}
            onSortChange={toggleSort}
            emptyTitle="Sin traspasos"
            emptyDescription="Cuando se traslade un paciente entre sucursales, aparecerá aquí."
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={transfers.data?.total ?? 0}
                onChange={setPage}
                onRowsChange={(next) => {
                  setRows(next)
                  setPage(1)
                }}
                disabled={transfers.isFetching}
              />
            }
          />
        )}
      </div>
    </div>
  )
}
