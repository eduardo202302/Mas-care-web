import { describe, expect, it } from 'vitest'
import { setVisible } from './grants'

describe('setVisible', () => {
  it('mostrar una pantalla le da acceso completo', () => {
    expect(setVisible({}, 'a', true)).toEqual({
      a: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    })
  })

  it('ocultar una pantalla la quita del mapa', () => {
    const start = setVisible(setVisible({}, 'a', true), 'b', true)
    expect(Object.keys(setVisible(start, 'a', false))).toEqual(['b'])
  })

  it('no modifica el mapa original', () => {
    const start = {}
    setVisible(start, 'a', true)
    expect(start).toEqual({})
  })
})
