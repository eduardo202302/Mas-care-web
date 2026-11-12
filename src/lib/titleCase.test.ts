import { describe, expect, it } from 'vitest'
import { toTitleCase } from './titleCase'

describe('toTitleCase', () => {
  it('pone mayúscula inicial en cada palabra', () => {
    expect(toTitleCase('guardar etiqueta')).toBe('Guardar Etiqueta')
    expect(toTitleCase('ajuste automático')).toBe('Ajuste Automático')
  })

  it('deja en minúscula de, al, el, la, con, para y un', () => {
    expect(toTitleCase('nombre de farmacia')).toBe('Nombre de Farmacia')
    expect(toTitleCase('toda la organización')).toBe('Toda la Organización')
    expect(toTitleCase('selecciona un paciente para imprimir con sus datos')).toBe(
      'Selecciona un Paciente para Imprimir con Sus Datos',
    )
    expect(toTitleCase('ir al inicio')).toBe('Ir al Inicio')
  })

  it('capitaliza siempre la primera palabra', () => {
    expect(toTitleCase('para qué se usa')).toBe('Para Qué Se Usa')
    expect(toTitleCase('el paciente')).toBe('El Paciente')
  })

  it('respeta paréntesis, barras y unidades ya escritas', () => {
    expect(toTitleCase('programación de dosis (completa)')).toBe(
      'Programación de Dosis (Completa)',
    )
    expect(toTitleCase('médico / prescriptor')).toBe('Médico / Prescriptor')
  })
})
