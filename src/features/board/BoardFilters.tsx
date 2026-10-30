import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  CalendarDays,
  Check,
  Filter,
  Pill,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
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
  'border-border focus:border-tealmax h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm outline-none'

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="bg-modulos text-cuidado pointer-events-none absolute top-1/2 left-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md">
      {children}
    </span>
  )
}

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
  rightActions,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  branchOptions: { id: string; name: string }[]
  branchLocked: boolean
  privileged: boolean
  meId?: string
  rightActions?: ReactNode
}) {
  const [query, setQuery] = useState(filters.q ?? '')
  const [panelOpen, setPanelOpen] = useState(false)
  const [draft, setDraft] = useState<Filters>(filters)
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

  function setDraftField<K extends keyof Filters>(key: K, value: Filters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function openPanel() {
    setDraft(filters)
    setPanelOpen(true)
  }

  function applyDraft() {
    onChange(draft)
    setPanelOpen(false)
  }

  function clearDraft() {
    setDraft({})
    onChange({})
  }

  function removeFilter(key: keyof Filters) {
    onChange({ ...filters, [key]: undefined })
  }

  const activeEntries = (
    Object.keys(filterChipLabel) as (keyof Filters)[]
  ).filter((key) => Boolean(filters[key]))
  const hasFilters = Object.values(filters).some(Boolean)
  const draftHasFilters = Object.values(draft).some(Boolean)
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
    return (
      derivedStatusOptions.find((option) => option.value === value)?.label ??
      value
    )
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
    <section aria-label="Filtros del tablero" className="mb-4">
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
        {meId && (
          <div role="tablist" aria-label="Alcance" className="flex gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={!mine}
              onClick={() => removeFilter('responsible_user_id')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                !mine
                  ? 'bg-surface text-petroleo'
                  : 'text-muted hover:bg-surface hover:text-ink'
              }`}
            >
              Todos los ciclos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mine}
              onClick={() => set('responsible_user_id', meId)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mine
                  ? 'bg-surface text-petroleo'
                  : 'text-muted hover:bg-surface hover:text-ink'
              }`}
            >
              Asignados a mí
            </button>
          </div>
        )}
        <Button
          type="button"
          variant={hasFilters ? 'primary' : 'secondary'}
          aria-haspopup="dialog"
          aria-expanded={panelOpen}
          className="h-10 gap-1.5"
          onClick={openPanel}
        >
          <SlidersHorizontal className="size-3.5" />
          Filtro Avanzado
          {activeEntries.length > 0 ? ` (${activeEntries.length})` : ''}
        </Button>
        {rightActions}
      </div>
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
        <Dialog
          title="Filtro Avanzado"
          description="Combina estos criterios para acotar el tablero."
          icon={<Filter className="size-6" />}
          onClose={() => setPanelOpen(false)}
          size="lg"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Sucursal</span>
              <span className="relative block">
                <FieldIcon>
                  <Building2 className="size-4" />
                </FieldIcon>
                <select
                  aria-label="Sucursal"
                  value={draft.branch_id ?? ''}
                  disabled={branchLocked}
                  onChange={(event) =>
                    setDraftField('branch_id', event.target.value)
                  }
                  className={`${controlClass} pl-11`}
                >
                  {privileged && <option value="">Todas las sucursales</option>}
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Responsable</span>
              <span className="relative block">
                <FieldIcon>
                  <User className="size-4" />
                </FieldIcon>
                <select
                  aria-label="Responsable"
                  value={draft.responsible_user_id ?? ''}
                  onChange={(event) =>
                    setDraftField('responsible_user_id', event.target.value)
                  }
                  className={`${controlClass} pl-11`}
                >
                  <option value="">Todos</option>
                  {(users.data?.data ?? []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Medicamento</span>
              <span className="relative block">
                <FieldIcon>
                  <Pill className="size-4" />
                </FieldIcon>
                <select
                  aria-label="Medicamento"
                  value={draft.medication_id ?? ''}
                  onChange={(event) =>
                    setDraftField('medication_id', event.target.value)
                  }
                  className={`${controlClass} pl-11`}
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
              </span>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">
                Estado derivado
              </span>
              <span className="relative block">
                <FieldIcon>
                  <Tag className="size-4" />
                </FieldIcon>
                <select
                  aria-label="Estado derivado"
                  value={draft.derived_status ?? ''}
                  onChange={(event) => {
                    const value = event.target.value as DerivedStatus | ''
                    setDraftField('derived_status', value || undefined)
                  }}
                  className={`${controlClass} pl-11`}
                >
                  <option value="">Todos</option>
                  {derivedStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Desde</span>
              <span className="relative block">
                <FieldIcon>
                  <CalendarDays className="size-4" />
                </FieldIcon>
                <input
                  aria-label="Fecha prevista desde"
                  type="date"
                  value={draft.expected_from ?? ''}
                  onChange={(event) =>
                    setDraftField('expected_from', event.target.value)
                  }
                  className={`${controlClass} pl-11`}
                />
              </span>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Hasta</span>
              <span className="relative block">
                <FieldIcon>
                  <CalendarDays className="size-4" />
                </FieldIcon>
                <input
                  aria-label="Fecha prevista hasta"
                  type="date"
                  value={draft.expected_to ?? ''}
                  onChange={(event) =>
                    setDraftField('expected_to', event.target.value)
                  }
                  className={`${controlClass} pl-11`}
                />
              </span>
            </label>
          </div>
          <div className="border-border mt-5 flex flex-col-reverse items-stretch justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="gap-1.5 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
              disabled={!hasFilters && !draftHasFilters}
              onClick={clearDraft}
            >
              <Trash2 className="size-3.5" />
              Limpiar filtros
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                onClick={() => setPanelOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="gap-1.5 hover:bg-emerald-700"
                onClick={applyDraft}
              >
                <Check className="size-3.5" />
                Aplicar filtros
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  )
}
