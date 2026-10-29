import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './http'
import type { BoardFilters } from './board'

/** Filters that only exist in the table view (the board never sends them). */
export type TableFilters = {
  created_from?: string
  created_to?: string
  activity_from?: string
  activity_to?: string
  coverage_from?: string
  coverage_to?: string
  patient_ids?: string[]
  medication_ids?: string[]
  branch_ids?: string[]
  responsible_ids?: string[]
  treatment_ids?: string[]
  stage_id?: string
  cp_key?: string
  cp_value?: string
  match: 'and' | 'or'
}

export const emptyTableFilters: TableFilters = { match: 'and' }

export type SortPart = { field: string; dir: 'asc' | 'desc' }

export const sortFields: { value: string; label: string }[] = [
  { value: 'derived_status', label: 'Estado derivado' },
  { value: 'expected_on', label: 'Fecha prevista' },
  { value: 'coverage_end_on', label: 'Fin de cobertura' },
  { value: 'created_at', label: 'Fecha de creación' },
  { value: 'status', label: 'Estado del ciclo' },
  { value: 'patient', label: 'Paciente' },
  { value: 'medication', label: 'Medicamento' },
]

export const dateFilterKeys = [
  ['created_from', 'created_to', 'Creación'],
  ['activity_from', 'activity_to', 'Actividad'],
  ['expected_from', 'expected_to', 'Fecha prevista'],
  ['coverage_from', 'coverage_to', 'Fin de cobertura'],
] as const

export function tableFiltersToSearch(filters: TableFilters, sort: SortPart[], params: URLSearchParams) {
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'match') continue
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','))
    } else if (value) params.set(key, String(value))
  }
  const hasSets = [filters.patient_ids, filters.medication_ids, filters.branch_ids, filters.responsible_ids, filters.treatment_ids].some(
    (set) => set?.length,
  )
  if (hasSets) params.set('match', filters.match)
  if (sort.length) params.set('sort', sort.map((part) => `${part.field}:${part.dir}`).join(','))
  return params
}

export type ColumnDef = { key: string; label: string }

export const cycleColumns: ColumnDef[] = [
  { key: 'branch', label: 'Sucursal' },
  { key: 'patient', label: 'Paciente' },
  { key: 'medication', label: 'Medicamento' },
  { key: 'status', label: 'Estado del ciclo' },
  { key: 'stage', label: 'Etapa' },
  { key: 'expected_on', label: 'Fecha prevista' },
  { key: 'derived', label: 'Estado derivado' },
  { key: 'days', label: 'Días' },
  { key: 'responsible', label: 'Responsable' },
  { key: 'next_action', label: 'Próxima acción' },
  { key: 'stock', label: 'Existencias' },
]

export type SavedView = {
  id: string
  name: string
  entity: string
  filters: { board?: BoardFilters; table?: TableFilters } & Record<string, unknown>
  columns: string[]
  sort: { parts?: SortPart[] } & Record<string, unknown>
  isDefault: boolean
}

export const savedViewsKey = (entity: string) => ['saved-views', entity]

export function useSavedViews(entity: string) {
  return useQuery({
    queryKey: savedViewsKey(entity),
    queryFn: () => api<{ data: SavedView[] }>(`/api/v1/saved-views?entity=${entity}`),
  })
}

export function useSaveView(entity: string) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: savedViewsKey(entity) })
  return {
    create: useMutation({
      mutationFn: (body: Partial<SavedView> & { name: string }) =>
        api<SavedView>('/api/v1/saved-views', { method: 'POST', body: JSON.stringify({ entity, ...body }) }),
      onSuccess: invalidate,
    }),
    patch: useMutation({
      mutationFn: ({ id, ...body }: Partial<SavedView> & { id: string }) =>
        api<SavedView>(`/api/v1/saved-views/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api(`/api/v1/saved-views/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
  }
}

/**
 * Visible columns and their order, stored per user on the server as a
 * `<entity>_columns` saved view named "default".
 */
/** `defaults`: columns shown until the user chooses; `all` may offer more (e.g. custom properties). */
export function useColumnPrefs(entity: string, all: ColumnDef[], defaults: string[] = all.map((column) => column.key)) {
  const columnsEntity = `${entity}_columns`
  const views = useSavedViews(columnsEntity)
  const { create, patch } = useSaveView(columnsEntity)
  const stored = views.data?.data.find((view) => view.name === 'default')
  const known = new Set(all.map((column) => column.key))
  const visible = stored?.columns.filter((key) => known.has(key))
  const keys = visible?.length ? visible : defaults
  const save = (next: string[]) =>
    stored ? patch.mutate({ id: stored.id, columns: next }) : create.mutate({ name: 'default', columns: next })
  return { keys, save, saving: create.isPending || patch.isPending }
}
