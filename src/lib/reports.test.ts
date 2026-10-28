import { describe, expect, it } from 'vitest'
import {
  dateRangeForPreset,
  reportFiltersFromSearch,
  reportFiltersToQuery,
  reportFiltersToSearch,
  reportQueryString,
  validateReportRange,
  type ReportFilters,
} from './reports'

describe('reportFiltersFromSearch / reportFiltersToSearch', () => {
  it('serializa branch_id como CSV y lo vuelve a separar al leer', () => {
    const filters: ReportFilters = {
      from: '2026-01-01',
      to: '2026-01-31',
      branch_id: ['a', 'b', 'c'],
      compare_previous: true,
    }
    const params = reportFiltersToSearch(filters)
    expect(params.get('branch_id')).toBe('a,b,c')
    expect(params.get('from')).toBe('2026-01-01')
    expect(params.get('to')).toBe('2026-01-31')
    expect(params.get('compare_previous')).toBe('1')

    const roundTripped = reportFiltersFromSearch(params)
    expect(roundTripped.branch_id).toEqual(['a', 'b', 'c'])
    expect(roundTripped.from).toBe('2026-01-01')
    expect(roundTripped.to).toBe('2026-01-31')
    expect(roundTripped.compare_previous).toBe(true)
  })

  it('omite branch_id de la URL cuando no hay sucursales seleccionadas', () => {
    const params = reportFiltersToSearch({ branch_id: [] })
    expect(params.has('branch_id')).toBe(false)
  })

  it('ignora un group_by desconocido en la URL', () => {
    const params = new URLSearchParams('group_by=not-a-real-value')
    expect(reportFiltersFromSearch(params).group_by).toBeUndefined()
  })

  it('reportFiltersToQuery une branch_id en una sola cadena separada por comas', () => {
    const query = reportFiltersToQuery({ branch_id: ['x', 'y'] })
    expect(query?.branch_id).toBe('x,y')
  })

  it('reportQueryString omite valores vacíos y acepta parámetros extra', () => {
    const qs = reportQueryString({ branch_id: [] }, { page: 2, rows: 15 })
    expect(qs).toBe('page=2&rows=15')
  })
})

describe('validateReportRange', () => {
  it('acepta un rango de exactamente 24 meses', () => {
    expect(validateReportRange('2024-01-01', '2026-01-01')).toBeNull()
  })

  it('rechaza un rango mayor a 24 meses', () => {
    expect(validateReportRange('2023-01-01', '2026-01-02')).not.toBeNull()
  })

  it('rechaza "desde" posterior a "hasta"', () => {
    expect(validateReportRange('2026-02-01', '2026-01-01')).not.toBeNull()
  })

  it('no valida cuando falta una de las dos fechas', () => {
    expect(validateReportRange(undefined, '2026-01-01')).toBeNull()
    expect(validateReportRange('2026-01-01', undefined)).toBeNull()
  })
})

describe('dateRangeForPreset', () => {
  it('calcula "este mes" dentro del mismo mes del today dado', () => {
    const today = new Date(Date.UTC(2026, 9, 28)) // 2026-10-28
    const range = dateRangeForPreset('this-month', today)
    expect(range).toEqual({ from: '2026-10-01', to: '2026-10-31' })
  })

  it('calcula "mes pasado" cruzando el límite de año', () => {
    const today = new Date(Date.UTC(2026, 0, 15)) // 2026-01-15
    const range = dateRangeForPreset('last-month', today)
    expect(range).toEqual({ from: '2025-12-01', to: '2025-12-31' })
  })

  it('calcula "últimos 12 meses" dentro del límite de 24 meses validado', () => {
    const today = new Date(Date.UTC(2026, 9, 28))
    const range = dateRangeForPreset('last-12-months', today)
    expect(validateReportRange(range.from, range.to)).toBeNull()
  })
})
