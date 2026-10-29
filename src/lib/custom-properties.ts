import { useQuery } from '@tanstack/react-query'
import { api } from './http'
import type { PropertyEntity, PropertyType } from './custom-properties-core'

export * from './custom-properties-core'

export type CustomProperty = {
  id: string
  entity: PropertyEntity
  key: string
  label: string
  type: PropertyType
  required: boolean
  options: string[]
  groupName: string
  position: number
  archivedAt: string | null
}

export const typeLabels: Record<PropertyType, string> = {
  short_text: 'Texto corto',
  long_text: 'Texto largo',
  number: 'Número',
  date: 'Fecha',
  datetime: 'Fecha y hora',
  checkbox: 'Casilla',
  select: 'Desplegable',
  multiselect: 'Selección múltiple',
}

export const customPropertiesKey = (entity: PropertyEntity, archived = false) => [
  'custom-properties',
  entity,
  archived,
]

export function useCustomProperties(entity: PropertyEntity, includeArchived = false) {
  return useQuery({
    queryKey: customPropertiesKey(entity, includeArchived),
    queryFn: () =>
      api<{ data: CustomProperty[] }>(
        `/api/v1/custom-properties?entity=${entity}${includeArchived ? '&includeArchived=true' : ''}`,
      ),
    staleTime: 60_000,
  })
}

/** Readable value for the record view and the properties dialog. */
export function formatCustomValue(def: CustomProperty, value: unknown): string {
  if (value === undefined || value === null || value === '') return ''
  if (def.type === 'checkbox') return value === true ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (def.type === 'datetime' && typeof value === 'string')
    return new Date(value).toLocaleString('es')
  return String(value)
}
