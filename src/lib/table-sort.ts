import { useState } from 'react'

/** A single active column sort; picking a new column always replaces it. */
export type ColumnSort = { index: number; dir: 'asc' | 'desc' } | null

function toggle(current: ColumnSort, index: number): ColumnSort {
  if (current?.index === index) {
    return { index, dir: current.dir === 'asc' ? 'desc' : 'asc' }
  }
  return { index, dir: 'asc' }
}

/** Tracks which single column is sorted and in which direction; clicking another column drops the previous one. */
export function useColumnSort(initial: ColumnSort = null) {
  const [sort, setSort] = useState<ColumnSort>(initial)
  return [sort, (index: number) => setSort((current) => toggle(current, index))] as const
}

/** Locale-aware comparator for the scalar value backing a sorted column. */
export function compareValues(a: unknown, b: unknown) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''), 'es', { numeric: true, sensitivity: 'base' })
}

/** Sorts a copy of `items` by `sort`, using `valueOf` to read the compared field from each item. */
export function applyColumnSort<T>(items: T[], sort: ColumnSort, valueOf: (item: T, index: number) => unknown): T[] {
  if (!sort) return items
  const { index, dir } = sort
  return items
    .map((item) => ({ item, value: valueOf(item, index) }))
    .sort((a, b) => (dir === 'asc' ? 1 : -1) * compareValues(a.value, b.value))
    .map(({ item }) => item)
}
