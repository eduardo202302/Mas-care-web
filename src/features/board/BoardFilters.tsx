import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import {
  derivedStatusOptions,
  type BoardFilters as Filters,
  type DerivedStatus,
} from '@/lib/board'

type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']
type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']

const controlClass =
  'border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none'

const filterChipLabel: Partial<Record<keyof Filters, string>> = {
  branch_id: 'Sucursal',
  responsible_user_id: 'Responsable',
  medication_id: 'Medicamento',
  derived_status: 'Estado',
  expected_from: 'Desde',
  expected_to: 'Hasta',
}

export function BoardFilters({
  filters,
  onChange,
  branchOptions,
  branchLocked,
  privileged,
  meId,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  branchOptions: { id: string; name: string }[]
  branchLocked: boolean
  privileged: boolean
  meId?: string
}) {
  const [query, setQuery] = useState(filters.q ?? '')
  const [panelOpen, setPanelOpen] = useState(false)
  const users = useQuery({
    queryKey: ['users', 'board-filter'],
    queryFn: () => api<UserList>('/api/v1/users?limit=100'),
  })
  const medications = useQuery({
    queryKey: ['medications', 'board-filter'],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&limit=100'),
  })

  useEffect(() => {
    setQuery(filters.q ?? '')
  }, [filters.q])

  useEffect(() => {
    const current = filters.q ?? ''
    if (query === current) return
    const timer = window.setTimeout(() => {
      onChange({ ...filters, q: query.trim() || undefined })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [filters, onChange, query])

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value || undefined })
  }

  function removeFilter(key: keyof Filters) {
    onChange({ ...filters, [key]: undefined })
  }

  const activeEntries = (Object.keys(filterChipLabel) as (keyof Filters)[]).filter(
    (key) => Boolean(filters[key]),
  )
  const hasFilters = Object.values(filters).some(Boolean)
  const mine = Boolean(meId) && filters.responsible_user_id === meId

  function userLabel(id: string) {
    return users.data?.data.find((user) => user.id === id)?.name ?? id
  }
  function medicationLabel(id: string) {
    const medication = medications.data?.data.find((item) => item.id === id)
    return (
      medication?.brandName ||
      medication?.genericName ||
      medication?.activeIngredient ||
      id
    )
  }
  function branchLabel(id: string) {
    return branchOptions.find((branch) => branch.id === id)?.name ?? id
  }
  function derivedLabel(value: string) {
    return derivedStatusOptions.find((option) => option.value === value)?.label ?? value
  }
  function chipValue(key: keyof Filters): string {
    const value = filters[key]
    if (!value) return ''
    if (key === 'branch_id') return branchLabel(value)
    if (key === 'responsible_user_id') return userLabel(value)
    if (key === 'medication_id') return medicationLabel(value)
    if (key === 'derived_status') return derivedLabel(value)
    return value
  }

  return (
    <section
      aria-label="Filtros del tablero"
      className="border-border shadow-card mb-5 rounded-xl border bg-white p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="relative min-w-[220px] flex-1">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar paciente"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar paciente…"
            className={`${controlClass} pl-9`}
          />
        </span>
        <Button
          type="button"
          variant={panelOpen || hasFilters ? 'primary' : 'secondary'}
          className="h-10 gap-1.5"
          onClick={() => setPanelOpen((open) => !open)}
        >
          <SlidersHorizontal className="size-3.5" />
          Filtro{activeEntries.length > 0 ? ` (${activeEntries.length})` : ''}
        </Button>
        {hasFilters && (
          <Button type="button" variant="ghost" className="h-10 px-2 text-xs" onClick={() => onChange({})}>
            <X className="size-3.5" />
            Borrar todo
          </Button>
        )}
      </div>
      {meId && (
        <div role="tablist" aria-label="Alcance" className="mt-3 flex gap-1.5">
          <button
            type="button"
            role="tab"
            aria-selected={!mine}
            onClick={() => removeFilter('responsible_user_id')}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              !mine
                ? 'border-border bg-white text-petroleo shadow-sm'
                : 'border-transparent bg-surface text-muted hover:text-ink'
            }`}
          >
            Todos los ciclos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mine}
            onClick={() => set('responsible_user_id', meId)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
              mine
                ? 'border-border bg-white text-petroleo shadow-sm'
                : 'border-transparent bg-surface text-muted hover:text-ink'
            }`}
          >
            Asignados a mí
          </button>
        </div>
      )}
      {activeEntries.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {activeEntries.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => removeFilter(key)}
              className="border-border text-ink hover:bg-surface flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-medium"
            >
              {filterChipLabel[key]}: {chipValue(key)}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}
      {panelOpen && (
      <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">Sucursal</span>
          <select
            aria-label="Sucursal"
            value={filters.branch_id ?? ''}
            disabled={branchLocked}
            onChange={(event) => set('branch_id', event.target.value)}
            className={controlClass}
          >
            {privileged && <option value="">Todas las sucursales</option>}
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">
            Responsable
          </span>
          <select
            aria-label="Responsable"
            value={filters.responsible_user_id ?? ''}
            onChange={(event) =>
              set('responsible_user_id', event.target.value)
            }
            className={controlClass}
          >
            <option value="">Todos</option>
            {(users.data?.data ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">
            Medicamento
          </span>
          <select
            aria-label="Medicamento"
            value={filters.medication_id ?? ''}
            onChange={(event) => set('medication_id', event.target.value)}
            className={controlClass}
          >
            <option value="">Todos</option>
            {(medications.data?.data ?? []).map((medication) => (
              <option key={medication.id} value={medication.id}>
                {medication.brandName ||
                  medication.genericName ||
                  medication.activeIngredient ||
                  'Medicamento'}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">
            Estado derivado
          </span>
          <select
            aria-label="Estado derivado"
            value={filters.derived_status ?? ''}
            onChange={(event) => {
              const value = event.target.value as DerivedStatus | ''
              set('derived_status', value || undefined)
            }}
            className={controlClass}
          >
            <option value="">Todos</option>
            {derivedStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">Desde</span>
          <input
            aria-label="Fecha prevista desde"
            type="date"
            value={filters.expected_from ?? ''}
            onChange={(event) => set('expected_from', event.target.value)}
            className={controlClass}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">Hasta</span>
          <input
            aria-label="Fecha prevista hasta"
            type="date"
            value={filters.expected_to ?? ''}
            onChange={(event) => set('expected_to', event.target.value)}
            className={controlClass}
          />
        </label>
      </div>
      )}
    </section>
  )
}
