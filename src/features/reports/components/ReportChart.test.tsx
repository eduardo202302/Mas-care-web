import { describe, expect, it } from 'vitest'
import { chartSeriesPalette, seriesColor } from './ReportChart'

// --coral (#ff8a5b, "avisar") and --expired-text (#8e1b1b, "vencido") are
// reserved brand colors elsewhere in the app. A report chart series must
// never use either, so a reader never mistakes "this branch's bar" for a
// warning/overdue indicator. This inspects the color values the chart
// components would actually receive as props, instead of pixel-testing the
// rendered SVG.
const RESERVED_CORAL = '#ff8a5b'
const RESERVED_EXPIRED_TEXT = '#8e1b1b'

describe('chartSeriesPalette', () => {
  it('nunca incluye los colores reservados de "avisar" o "vencido"', () => {
    for (const color of chartSeriesPalette) {
      expect(color.toLowerCase()).not.toBe(RESERVED_CORAL)
      expect(color.toLowerCase()).not.toBe(RESERVED_EXPIRED_TEXT)
    }
  })
})

describe('seriesColor', () => {
  it('devuelve un color de la paleta cuando no hay label_color', () => {
    const color = seriesColor(0)
    expect(chartSeriesPalette).toContain(color)
  })

  it('prioriza un label_color real (p. ej. el color de una sucursal) sobre la paleta', () => {
    expect(seriesColor(0, '#123456')).toBe('#123456')
  })

  it('cicla la paleta por índice en vez de desbordar', () => {
    const color = seriesColor(chartSeriesPalette.length)
    expect(color).toBe(chartSeriesPalette[0])
  })
})
