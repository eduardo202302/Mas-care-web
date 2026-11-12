import { formatCustomValue, type CustomProperty } from '@/lib/custom-properties'
import { isOpenCycle, type BoardCard } from '@/lib/board'

/** Filtros por columna de la tabla de ciclos: el servidor no los admite, se aplican sobre la página cargada. */
export type CycleColumnFilters = {
  status: string
  stage: string
  daysMin: string
  daysMax: string
  nextAction: '' | 'notify' | 'deliver' | 'none'
  stock: '' | 'in_stock' | 'low' | 'out_of_stock' | 'none'
  custom: Record<string, string>
}

export const emptyCycleColumnFilters: CycleColumnFilters = {
  status: '',
  stage: '',
  daysMin: '',
  daysMax: '',
  nextAction: '',
  stock: '',
  custom: {},
}

export const nextActionLabels = {
  notify: 'Avisar',
  deliver: 'Marcar entregado',
  none: 'Sin acción',
} as const

const norm = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function cycleColumnFilterCount(filters: CycleColumnFilters) {
  return (
    [
      filters.status,
      filters.stage,
      filters.daysMin,
      filters.daysMax,
      filters.nextAction,
      filters.stock,
    ].filter(Boolean).length +
    Object.values(filters.custom).filter(Boolean).length
  )
}

export function matchesCycleColumnFilters(
  card: BoardCard,
  filters: CycleColumnFilters,
  stageIdOf: (card: BoardCard) => string | undefined,
  properties: CustomProperty[],
) {
  const nextAction =
    card.status === 'to_notify'
      ? 'notify'
      : isOpenCycle(card)
        ? 'deliver'
        : 'none'
  const values =
    (card as { treatment_custom_values?: Record<string, unknown> })
      .treatment_custom_values ?? {}
  return (
    (!filters.status || card.status === filters.status) &&
    (!filters.stage || stageIdOf(card) === filters.stage) &&
    (!filters.daysMin ||
      (card.days_remaining !== null &&
        card.days_remaining >= Number(filters.daysMin))) &&
    (!filters.daysMax ||
      (card.days_remaining !== null &&
        card.days_remaining <= Number(filters.daysMax))) &&
    (!filters.nextAction || nextAction === filters.nextAction) &&
    (!filters.stock || (card.stock_level ?? 'none') === filters.stock) &&
    Object.entries(filters.custom).every(([key, value]) => {
      const needle = norm(value.trim())
      if (!needle) return true
      const property = properties.find((item) => item.key === key)
      return (
        !property ||
        norm(formatCustomValue(property, values[key])).includes(needle)
      )
    })
  )
}
