import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  filterControlClass,
} from '@/components/ui/AdvancedFilter'
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

/**
 * Detects which preset (if any) the current from/to pair matches, so the
 * preset select reflects state coming from the URL instead of always
 * showing "Rango personalizado" after a reload.
 */
function presetFromFilters(filters: ReportFilters): DateRangePreset {
  if (!filters.from || !filters.to) return 'custom'
  for (const preset of [
    'this-month',
    'last-month',
    'last-3-months',
    'last-12-months',
  ] as const) {
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
  const [rangeError, setRangeError] = useState<string | null>(null)
  const [draft, setDraft] = useState<ReportFilters | null>(null)
  const draftPreset = draft ? presetFromFilters(draft) : 'custom'
  const showComparePrevious = reportSupportsComparePrevious[reportType]

  function apply(next: ReportFilters) {
    const error = validateReportRange(next.from, next.to)
    setRangeError(error)
    if (error) return false
    onChange(next)
    return true
  }

  function setDraftPreset(value: DateRangePreset) {
    if (!draft) return
    if (value === 'custom') return
    setDraft({ ...draft, ...dateRangeForPreset(value) })
  }

  function toggleDraftBranch(branchId: string) {
    if (!draft) return
    const selected = draft.branch_id.includes(branchId)
      ? draft.branch_id.filter((id) => id !== branchId)
      : [...draft.branch_id, branchId]
    setDraft({ ...draft, branch_id: selected })
  }

  const hasFilters =
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    filters.branch_id.length > 0 ||
    Boolean(filters.compare_previous)

  const chips: { key: keyof ReportFilters; label: string; value: string }[] = []
  if (filters.from || filters.to)
    chips.push({
      key: 'from',
      label: 'Periodo',
      value:
        filters.from && filters.to
          ? `${filters.from} → ${filters.to}`
          : (filters.from ?? filters.to ?? ''),
    })
  for (const id of filters.branch_id) {
    const branch = branchOptions.find((item) => item.id === id)
    chips.push({
      key: 'branch_id',
      label: 'Sucursal',
      value: branch?.name ?? id,
    })
  }
  if (filters.compare_previous)
    chips.push({
      key: 'compare_previous',
      label: 'Comparación',
      value: 'Con periodo anterior',
    })

  function removeChip(key: keyof ReportFilters) {
    if (key === 'from') apply({ ...filters, from: undefined, to: undefined })
    else if (key === 'branch_id') apply({ ...filters, branch_id: [] })
    else if (key === 'compare_previous')
      apply({ ...filters, compare_previous: undefined })
  }

  return (
    <>
      <FilterBarRow aria-label="Filtros de informes" className="print:hidden">
        <AdvancedFilterButton
          open={draft !== null}
          count={chips.length}
          onClick={() => {
            setRangeError(validateReportRange(filters.from, filters.to))
            setDraft({ ...filters })
          }}
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => removeChip(key as keyof ReportFilters)}
      />
      {draft && (
        <AdvancedFilterDialog
          open
          description="Ajusta el periodo y las sucursales del informe."
          onClose={() => setDraft(null)}
          onClear={() => {
            const cleared: ReportFilters = { branch_id: [] }
            setDraft(cleared)
            setRangeError(null)
            onChange(cleared)
          }}
          clearDisabled={!hasFilters}
          applyDisabled={Boolean(rangeError)}
          onApply={() => {
            if (apply(draft)) setDraft(null)
          }}
        >
          <FilterField
            label="Periodo"
            icon={<CalendarDays className="size-4" />}
          >
            <select
              aria-label="Periodo"
              value={draftPreset}
              onChange={(event) =>
                setDraftPreset(event.target.value as DateRangePreset)
              }
              className={`${filterControlClass} pl-11`}
            >
              {Object.entries(dateRangePresetLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Desde" icon={<CalendarDays className="size-4" />}>
            <input
              aria-label="Desde"
              type="date"
              value={draft.from ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, from: event.target.value || undefined })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
          <FilterField label="Hasta" icon={<CalendarDays className="size-4" />}>
            <input
              aria-label="Hasta"
              type="date"
              value={draft.to ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, to: event.target.value || undefined })
              }
              className={`${filterControlClass} pl-11`}
            />
          </FilterField>
          {showComparePrevious && (
            <label className="flex items-center gap-2 self-end pb-2">
              <input
                aria-label="Comparar con el periodo anterior"
                type="checkbox"
                checked={draft.compare_previous ?? false}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    compare_previous: event.target.checked || undefined,
                  })
                }
                className="accent-tealmax size-4"
              />
              <span className="text-ink text-sm">
                Comparar con periodo anterior
              </span>
            </label>
          )}
          {rangeError && (
            <p role="alert" className="text-xs text-red-700 sm:col-span-2">
              {rangeError}
            </p>
          )}
          {branchOptions.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-ink mb-1.5 text-sm font-medium">
                {privileged ? 'Sucursales' : 'Tus sucursales'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {branchOptions.map((branch) => {
                  const active = draft.branch_id.includes(branch.id)
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleDraftBranch(branch.id)}
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
            </div>
          )}
        </AdvancedFilterDialog>
      )}
    </>
  )
}

export function useReportFilters(): [
  ReportFilters,
  (next: ReportFilters) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = reportFiltersFromSearch(searchParams)
  function update(next: ReportFilters) {
    setSearchParams(reportFiltersToSearch(next), { replace: true })
  }
  return [filters, update]
}
