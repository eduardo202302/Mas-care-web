import { describe, expect, it } from 'vitest'
import type { LabelElement } from '@/lib/operations'
import {
  createElement,
  labelDims,
  labelElementStyle,
  labelElementText,
  labelSizeChoice,
} from './labelConfig'

const variable = (
  overrides: Partial<Extract<LabelElement, { type: 'variable' }>> = {},
): LabelElement => ({
  id: 1,
  type: 'variable',
  key: 'paciente_nombre',
  showLabel: true,
  x: 10,
  y: 10,
  w: 80,
  h: 18,
  fontSize: 12,
  bold: false,
  italic: false,
  underline: false,
  align: 'left',
  color: '#243247',
  rotation: 0,
  ...overrides,
})

describe('labelSizeChoice', () => {
  it('reconoce los tamaños cuadrados en pulgadas', () => {
    expect(labelSizeChoice(3, 3)).toBe('3')
    expect(labelSizeChoice(4, 4)).toBe('4')
    expect(labelSizeChoice(5, 5)).toBe('5')
  })

  it('marca como personalizado un tamaño heredado (100 x 60 mm convertidos)', () => {
    expect(labelSizeChoice(3.94, 2.36)).toBe('custom')
  })
})

describe('labelDims', () => {
  it('no cambia nada en etiquetas cuadradas', () => {
    expect(labelDims(4, 4, 'portrait')).toEqual([4, 4])
    expect(labelDims(4, 4, 'landscape')).toEqual([4, 4])
  })

  it('respeta la orientación en etiquetas rectangulares', () => {
    expect(labelDims(3.94, 2.36, 'portrait')).toEqual([2.36, 3.94])
    expect(labelDims(2.36, 3.94, 'landscape')).toEqual([3.94, 2.36])
  })
})

describe('labelElementText', () => {
  it('muestra marcadores, no datos de ejemplo, mientras no hay paciente', () => {
    expect(labelElementText(variable(), null, 'editor').text).toBe(
      'Nombre del paciente: [Nombre del paciente]',
    )
  })

  it('usa el valor real del paciente', () => {
    const { text, missing } = labelElementText(
      variable(),
      { paciente_nombre: 'María Rodríguez' },
      'print',
    )
    expect(text).toBe('Nombre del paciente: María Rodríguez')
    expect(missing).toBe(false)
  })

  it('avisa en el editor y deja en blanco al imprimir una variable sin información', () => {
    const values = { paciente_nombre: '  ' }
    expect(labelElementText(variable({ showLabel: false }), values, 'editor')).toEqual({
      text: 'Sin Información',
      missing: true,
    })
    expect(labelElementText(variable({ showLabel: false }), values, 'print')).toEqual({
      text: '',
      missing: true,
    })
  })

  it('no guarda valores del paciente en el elemento (solo la clave de la variable)', () => {
    const element = variable()
    expect(JSON.stringify(element)).not.toContain('María')
    expect(element).toHaveProperty('key', 'paciente_nombre')
  })
})

describe('createElement', () => {
  it('asigna ids que no chocan con los de una plantilla ya guardada', () => {
    const existing = [variable({ id: 1 }), variable({ id: 7 })]
    const created = createElement(
      { type: 'text' },
      { elements: existing, widthIn: 3 },
    )
    expect(created.id).toBe(8)
  })

  it('escala fuente y alto con el ancho de la etiqueta', () => {
    const small = createElement({ type: 'text' }, { elements: [], widthIn: 3 })
    const large = createElement({ type: 'text' }, { elements: [], widthIn: 5 })
    expect(small.fontSize).toBe(12)
    expect(large.fontSize).toBeCloseTo(20, 0)
    expect(large.h).toBeGreaterThan(small.h)
  })

  it('crea el bloque de Programación de Dosis sin prefijo y con alto para 4 líneas', () => {
    const single = createElement(
      { type: 'variable', key: 'frecuencia' },
      { elements: [], widthIn: 3 },
    )
    const block = createElement(
      { type: 'variable', key: 'programacion_dosis' },
      { elements: [], widthIn: 3 },
    )
    expect(single).toMatchObject({ showLabel: true })
    expect(block).toMatchObject({ showLabel: false })
    expect(block.h).toBe(single.h * 4)
  })

  it('crea líneas con un alto que el servidor acepta (mínimo 4)', () => {
    const line = createElement({ type: 'line' }, { elements: [], widthIn: 3 })
    expect(line.h).toBeGreaterThanOrEqual(4)
  })
})

describe('labelElementStyle', () => {
  it('posiciona con % del papel y escala tipografía con el zoom', () => {
    const style = labelElementStyle(variable({ x: 12.5, y: 40, w: 60 }), 2)
    expect(style.left).toBe('12.5%')
    expect(style.top).toBe('40%')
    expect(style.width).toBe('60%')
    expect(style.fontSize).toBe(24)
  })
})
