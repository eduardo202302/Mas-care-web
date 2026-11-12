import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRightLeft,
  Building2,
  CalendarDays,
  FileText,
  Hash,
  Search,
  UserRound,
} from 'lucide-react'
import { NotFoundPage } from '@/app/NotFoundPage'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  FilterSelect,
  filterControlClass,
  type ActiveFilterChip,
} from '@/components/ui/AdvancedFilter'
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

const transferColumns = [
  'ID',
  'Fecha',
  'Paciente',
  'De',
  'A',
  'Motivo',
  'Registrado por',
]

type ExtraFilters = {
  id: string
  patient: string
  fromBranch: string
  toBranch: string
  reason: string
  createdBy: string
}
type TransferDraft = ReturnType<typeof transferFiltersFromSearch> & ExtraFilters

const emptyExtra: ExtraFilters = {
  id: '',
  patient: '',
  fromBranch: '',
  toBranch: '',
  reason: '',
  createdBy: '',
}
const extraLabels: Record<keyof ExtraFilters, string> = {
  id: 'ID',
  patient: 'Paciente',
  fromBranch: 'De',
  toBranch: 'A',
  reason: 'Motivo',
  createdBy: 'Registrado por',
}

const norm = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const contains = (value: string, needle: string) =>
  !needle.trim() || norm(value).includes(norm(needle.trim()))

export default function TransfersPage() {
  const { data: me, isPending: mePending } = useMe()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [search, setSearch] = useState('')
  // El servidor solo filtra por sucursal y fechas: el resto se aplica sobre la página cargada.
  const [extra, setExtra] = useState<ExtraFilters>(emptyExtra)
  const [filterDraft, setFilterDraft] = useState<TransferDraft | null>(null)
  const filters = useMemo(
    () => transferFiltersFromSearch(searchParams),
    [searchParams],
  )
  const privileged = me?.allBranches === true

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

  // La API no tiene `q`: la búsqueda se aplica a las filas cargadas.
  const needle = search.trim().toLowerCase()
  const loadedTransfers = transfers.data?.data ?? []
  const branchNameOptions = (side: 'from_branch' | 'to_branch') =>
    Array.from(
      new Set([
        ...(branches.data?.data ?? []).map((branch) => branch.name),
        ...loadedTransfers.map((row) => row[side].name),
        ...(extra[side === 'from_branch' ? 'fromBranch' : 'toBranch']
          ? [extra[side === 'from_branch' ? 'fromBranch' : 'toBranch']]
          : []),
      ]),
    ).sort((a, b) => a.localeCompare(b, 'es'))
  const matchesExtra = (row: (typeof loadedTransfers)[number]) =>
    contains(String(row.numeric_id), extra.id) &&
    contains(row.patient.full_name, extra.patient) &&
    (!extra.fromBranch || row.from_branch.name === extra.fromBranch) &&
    (!extra.toBranch || row.to_branch.name === extra.toBranch) &&
    contains(row.reason, extra.reason) &&
    contains(row.created_by.name, extra.createdBy)
  const visibleTransfers = loadedTransfers
    .filter(matchesExtra)
    .filter(
      (row) =>
        !needle ||
        [
          row.numeric_id,
          row.patient.full_name,
          row.from_branch.name,
          row.to_branch.name,
          row.reason,
          row.created_by.name,
        ]
          .join(' ')
          .toLowerCase()
          .includes(needle),
    )
  const items = applyColumnSort(visibleTransfers, sort, (row, index) =>
    index === 0
      ? row.numeric_id
      : index === 1
        ? row.occurred_at
        : index === 2
          ? row.patient.full_name
          : index === 3
            ? row.from_branch.name
            : index === 4
              ? row.to_branch.name
              : index === 5
                ? row.reason
                : row.created_by.name,
  )

  const extraKeys = Object.keys(emptyExtra) as (keyof ExtraFilters)[]
  const filterCount =
    Object.values(filters).filter(Boolean).length +
    extraKeys.filter((key) => extra[key]).length
  const draftCount = filterDraft
    ? Object.values(filterDraft).filter(Boolean).length
    : 0
  const chips: ActiveFilterChip[] = []
  if (filters.branch_id)
    chips.push({
      key: 'branch_id',
      label: 'Sucursal',
      value:
        (branches.data?.data ?? []).find((b) => b.id === filters.branch_id)
          ?.name ?? filters.branch_id,
    })
  if (filters.from)
    chips.push({ key: 'from', label: 'Desde', value: filters.from })
  if (filters.to) chips.push({ key: 'to', label: 'Hasta', value: filters.to })
  for (const key of extraKeys)
    if (extra[key])
      chips.push({ key, label: extraLabels[key], value: extra[key] })

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

      <FilterBarRow aria-label="Filtros de traspasos">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar traspasos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Paciente, sucursal, motivo o responsable"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft({ ...filters, ...extra })}
        />
        <TableToolbarActions
          title="Traspasos"
          filename="traspasos"
          branchScoped
          headers={transferColumns}
          rows={items.map((row) => [
            `#${row.numeric_id}`,
            new Date(row.occurred_at).toLocaleString('es'),
            row.patient.full_name,
            row.from_branch.name,
            row.to_branch.name,
            row.reason,
            row.created_by.name,
          ])}
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          if (key in emptyExtra) {
            setExtra((current) => ({ ...current, [key]: '' }))
            setPage(1)
          } else updateFilters({ ...filters, [key]: undefined })
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar el historial de traspasos."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft({ ...emptyExtra })
            setExtra(emptyExtra)
            updateFilters({})
          }}
          clearDisabled={!filterCount && !draftCount}
          onApply={() => {
            const { branch_id, from, to, ...draftExtra } = filterDraft
            setExtra(draftExtra)
            updateFilters({ branch_id, from, to })
            setFilterDraft(null)
          }}
        >
          <FilterField label="Sucursal" icon={<Building2 className="size-4" />}>
            <select
              aria-label="Sucursal"
              value={filterDraft.branch_id ?? ''}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  branch_id: event.target.value || undefined,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas las Sucursales</option>
              {(branches.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="ID" icon={<Hash className="size-4" />}>
            <FilterSelect
              label="ID del traspaso"
              value={filterDraft.id}
              options={loadedTransfers.map((row) => String(row.numeric_id))}
              onChange={(value) =>
                setFilterDraft({ ...filterDraft, id: value })
              }
            />
          </FilterField>
          <FilterField label="Paciente" icon={<UserRound className="size-4" />}>
            <FilterSelect
              label="Paciente"
              value={filterDraft.patient}
              options={loadedTransfers.map((row) => row.patient.full_name)}
              onChange={(value) =>
                setFilterDraft({ ...filterDraft, patient: value })
              }
            />
          </FilterField>
          <FilterField label="De" icon={<Building2 className="size-4" />}>
            <select
              aria-label="Sucursal de origen"
              value={filterDraft.fromBranch}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  fromBranch: event.target.value,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {branchNameOptions('from_branch').map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="A" icon={<ArrowRightLeft className="size-4" />}>
            <select
              aria-label="Sucursal de destino"
              value={filterDraft.toBranch}
              onChange={(event) =>
                setFilterDraft({ ...filterDraft, toBranch: event.target.value })
              }
              className={`${filterControlClass} pl-11`}
            >
              <option value="">Todas</option>
              {branchNameOptions('to_branch').map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Motivo" icon={<FileText className="size-4" />}>
            <FilterSelect
              label="Motivo"
              value={filterDraft.reason}
              options={loadedTransfers.map((row) => row.reason)}
              onChange={(value) =>
                setFilterDraft({ ...filterDraft, reason: value })
              }
            />
          </FilterField>
          <FilterField
            label="Registrado por"
            icon={<UserRound className="size-4" />}
          >
            <FilterSelect
              label="Registrado por"
              value={filterDraft.createdBy}
              options={loadedTransfers.map((row) => row.created_by.name)}
              onChange={(value) =>
                setFilterDraft({ ...filterDraft, createdBy: value })
              }
            />
          </FilterField>
          <FilterField label="Desde" icon={<CalendarDays className="size-4" />}>
            <input
              type="date"
              aria-label="Desde"
              value={filterDraft.from ?? ''}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  from: event.target.value || undefined,
                })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
          <FilterField label="Hasta" icon={<CalendarDays className="size-4" />}>
            <input
              type="date"
              aria-label="Hasta"
              value={filterDraft.to ?? ''}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  to: event.target.value || undefined,
                })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
        </AdvancedFilterDialog>
      )}

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
          <TableSkeleton columns={7} />
        ) : (
          <DataTable
            columns={transferColumns}
            rows={items.map((row) => [
              <span key="id" className="text-muted font-mono text-xs">
                #{row.numeric_id}
              </span>,
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
            sortableColumns={[0, 1, 2, 3, 4, 5, 6]}
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
