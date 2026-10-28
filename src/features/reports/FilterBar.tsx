import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMe } from '@/lib/permissions'
import {
  dateRangeForPreset,
  dateRangePresetLabels,
  reportFiltersFromSearch,
  reportFiltersToSearch,
  reportSupportsComparePrevious,
  validateReportRange,
  type DateRangePreset,
  type ReportFilters,
  type ReportType,
} from '@/lib/reports'

const controlClass =
  'border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none'

/**
 * Detects which preset (if any) the current from/to pair matches, so the
 * preset select reflects state coming from the URL instead of always
 * showing "Rango personalizado" after a reload.
 */
function presetFromFilters(filters: ReportFilters): DateRangePreset {
  if (!filters.from || !filters.to) return 'custom'
  for (const preset of ['this-month', 'last-month', 'last-3-months', 'last-12-months'] as const) {
    const range = dateRangeForPreset(preset)
    if (range.from === filters.from && range.to === filters.to) return preset
  }
  return 'custom'
}

/**
 * Shared filter bar for every report page. from/to/branch_id/group_by/
 * compare_previous all live in the URL (useSearchParams), never in local
 * state or Zustand — a reload or a shared link must reproduce the exact
 * same query. Branch options come straight from `useMe().branches`, the
 * same accessible-branches list BoardPage/TransfersPage already use; a
 * non-owner/admin user never sees a branch outside that list.
 */
export function ReportFilterBar({
  reportType,
  filters,
  onChange,
}: {
  reportType: ReportType
  filters: ReportFilters
  onChange: (next: ReportFilters) => void
}) {
  const { data: me } = useMe()
  const privileged = me?.role === 'owner' || me?.role === 'admin'
  const branchOptions = me?.branches ?? []
  const [rangeError, setRangeError] = useState<string | null>(
    validateReportRange(filters.from, filters.to),
  )
  const preset = presetFromFilters(filters)
  const showComparePrevious = reportSupportsComparePrevious[reportType]

  function apply(next: ReportFilters) {
    const error = validateReportRange(next.from, next.to)
    setRangeError(error)
    if (error) return
    onChange(next)
  }

  function setPreset(value: DateRangePreset) {
    if (value === 'custom') {
      onChange({ ...filters })
      return
    }
    apply({ ...filters, ...dateRangeForPreset(value) })
  }

  function toggleBranch(branchId: string) {
    const selected = filters.branch_id.includes(branchId)
      ? filters.branch_id.filter((id) => id !== branchId)
      : [...filters.branch_id, branchId]
    apply({ ...filters, branch_id: selected })
  }

  const hasFilters =
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    filters.branch_id.length > 0 ||
    Boolean(filters.compare_previous)

  return (
    <section
      aria-label="Filtros de informes"
      className="border-border shadow-card mb-5 rounded-xl border bg-white p-3 print:hidden"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <SlidersHorizontal className="size-3.5" />
          Filtros
        </p>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => onChange({ branch_id: [] })}
          >
            <X className="size-3.5" />
            Limpiar
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">Periodo</span>
          <select
            aria-label="Periodo"
            value={preset}
            onChange={(event) => setPreset(event.target.value as DateRangePreset)}
            className={controlClass}
          >
            {Object.entries(dateRangePresetLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">Desde</span>
          <input
            aria-label="Desde"
            type="date"
            value={filters.from ?? ''}
            onChange={(event) => apply({ ...filters, from: event.target.value || undefined })}
            className={controlClass}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">Hasta</span>
          <input
            aria-label="Hasta"
            type="date"
            value={filters.to ?? ''}
            onChange={(event) => apply({ ...filters, to: event.target.value || undefined })}
            className={controlClass}
          />
        </label>
        {showComparePrevious && (
          <label className="flex items-end gap-2 pb-2">
            <input
              aria-label="Comparar con el periodo anterior"
              type="checkbox"
              checked={filters.compare_previous ?? false}
              onChange={(event) =>
                apply({ ...filters, compare_previous: event.target.checked || undefined })
              }
              className="size-4 accent-tealmax"
            />
            <span className="text-ink text-sm">Comparar con periodo anterior</span>
          </label>
        )}
      </div>
      {rangeError && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {rangeError}
        </p>
      )}
      {branchOptions.length > 0 && (
        <fieldset className="mt-3">
          <legend className="text-muted mb-1.5 text-[11px] font-medium">
            {privileged ? 'Sucursales' : 'Tus sucursales'}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {branchOptions.map((branch) => {
              const active = filters.branch_id.includes(branch.id)
              return (
                <button
                  key={branch.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleBranch(branch.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? 'border-tealmax bg-tealmax/10 text-petroleo'
                      : 'border-border text-muted hover:text-ink bg-white'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ backgroundColor: branch.labelColor }}
                  />
                  {branch.name}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
    </section>
  )
}

export function useReportFilters(): [ReportFilters, (next: ReportFilters) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = reportFiltersFromSearch(searchParams)
  function update(next: ReportFilters) {
    setSearchParams(reportFiltersToSearch(next), { replace: true })
  }
  return [filters, update]
}
