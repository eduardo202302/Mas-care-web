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

export function BoardFilters({
  filters,
  onChange,
  branchOptions,
  branchLocked,
  privileged,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  branchOptions: { id: string; name: string }[]
  branchLocked: boolean
  privileged: boolean
}) {
  const [query, setQuery] = useState(filters.q ?? '')
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

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <section
      aria-label="Filtros del tablero"
      className="border-border shadow-card mb-5 rounded-xl border bg-white p-3"
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
            onClick={() => onChange({})}
          >
            <X className="size-3.5" />
            Limpiar
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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
          <span className="text-muted text-[11px] font-medium">Paciente</span>
          <span className="relative">
            <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
            <input
              aria-label="Buscar paciente"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre…"
              className={`${controlClass} pl-9`}
            />
          </span>
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
    </section>
  )
}
