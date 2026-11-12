import type { CSSProperties } from 'react'
import type { LabelElement, LabelVariableKey } from '@/lib/operations'

export type LabelVariableGroup = {
  title: string
  keys: LabelVariableKey[]
}

export const LABEL_VARIABLE_GROUPS: LabelVariableGroup[] = [
  {
    title: 'Farmacia',
    keys: ['farmacia_nombre', 'farmacia_telefono', 'farmacia_direccion'],
  },
  {
    title: 'Paciente',
    keys: [
      'paciente_nombre',
      'paciente_documento',
      'paciente_edad',
      'paciente_telefono',
    ],
  },
  {
    title: 'Medicamento',
    keys: [
      'medicamento_nombre',
      'medicamento_presentacion',
      'dosis',
      'via_administracion',
    ],
  },
  {
    title: 'Programación de Dosis',
    keys: [
      'programacion_dosis',
      'dosis_cantidad',
      'dosis_unidad',
      'frecuencia',
      'horario',
    ],
  },
  {
    title: 'Tratamiento',
    keys: [
      'tratamiento_nombre',
      'duracion',
      'cantidad',
      'instrucciones',
      'fecha_inicio',
      'fecha_fin',
      'prescriptor',
      'codigo_tratamiento',
    ],
  },
]

export const LABEL_VARIABLE_LABELS: Record<LabelVariableKey, string> = {
  farmacia_nombre: 'Nombre de farmacia',
  farmacia_telefono: 'Teléfono',
  farmacia_direccion: 'Dirección',
  paciente_nombre: 'Nombre del paciente',
  paciente_documento: 'Cédula / identificación',
  paciente_edad: 'Edad',
  paciente_telefono: 'Teléfono del paciente',
  tratamiento_nombre: 'Nombre del tratamiento',
  medicamento_nombre: 'Nombre del medicamento',
  medicamento_presentacion: 'Presentación',
  dosis: 'Dosis',
  programacion_dosis: 'Programación de Dosis (completa)',
  dosis_cantidad: 'Cantidad',
  dosis_unidad: 'Unidad',
  via_administracion: 'Vía de administración',
  frecuencia: 'Frecuencia',
  horario: 'Toma',
  duracion: 'Duración',
  cantidad: 'Unidades por envase',
  instrucciones: 'Instrucciones',
  fecha_inicio: 'Fecha de inicio',
  fecha_fin: 'Fecha de finalización',
  prescriptor: 'Médico / prescriptor',
  codigo_tratamiento: 'Código de tratamiento',
}

export const isLabelVariableKey = (value: string): value is LabelVariableKey =>
  value in LABEL_VARIABLE_LABELS

/** Tamaños cuadrados que se ofrecen al diseñar una etiqueta (lado en pulgadas). */
export const LABEL_SIZES = [3, 4, 5] as const
export const DEFAULT_LABEL_SIZE = 3

export type LabelSizeChoice = `${(typeof LABEL_SIZES)[number]}` | 'custom'

export function labelSizeChoice(
  widthIn: number,
  heightIn: number,
): LabelSizeChoice {
  const match = LABEL_SIZES.find(
    (size) => Math.abs(size - widthIn) < 0.01 && Math.abs(size - heightIn) < 0.01,
  )
  return match ? (`${match}` as LabelSizeChoice) : 'custom'
}

export const formatInches = (value: number) =>
  `${Number(value.toFixed(2))}`

/** Ancho y alto finales en pulgadas, respetando la orientación (en cuadrados no cambia nada). */
export function labelDims(
  widthIn: number,
  heightIn: number,
  orientation: 'landscape' | 'portrait',
): [number, number] {
  let w = widthIn
  let h = heightIn
  if (orientation === 'portrait' && w > h) [w, h] = [h, w]
  if (orientation === 'landscape' && h > w) [w, h] = [h, w]
  return [w, h]
}

export type LabelValues = Partial<Record<LabelVariableKey, string>>

export type LabelDesign = {
  widthIn: number
  heightIn: number
  orientation: 'landscape' | 'portrait'
  elements: LabelElement[]
}

/**
 * Estilo de un elemento de la etiqueta. Posición y ancho son % del papel; la
 * fuente y el alto mínimo son px CSS (1/96 in), así que el mismo estilo sirve
 * para el editor (con `zoom`) y para la impresión física (zoom 1).
 */
export function labelElementStyle(
  element: LabelElement,
  zoom = 1,
): CSSProperties {
  return {
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.w}%`,
    minHeight: element.h * zoom,
    padding: `${2 * zoom}px ${4 * zoom}px`,
    fontSize: element.fontSize * zoom,
    fontWeight: element.bold ? 700 : 400,
    fontStyle: element.italic ? 'italic' : 'normal',
    textAlign: element.align,
    color: element.color,
    textDecoration: element.underline ? 'underline' : 'none',
    borderBottom:
      element.type === 'line'
        ? `${Math.max(1, zoom)}px solid ${element.color}`
        : undefined,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
  }
}

export const EMPTY_VALUE_TEXT = 'Sin Información'

/**
 * Texto de un elemento. `values === null` significa que aún no hay paciente
 * elegido: las variables se muestran como marcadores, nunca con datos de ejemplo.
 * Una variable sin dato queda en blanco al imprimir y con aviso en el editor.
 */
export function labelElementText(
  element: LabelElement,
  values: LabelValues | null,
  mode: 'editor' | 'print',
): { text: string; missing: boolean } {
  if (element.type === 'text') return { text: element.text, missing: false }
  if (element.type === 'line') return { text: '', missing: false }
  const label = LABEL_VARIABLE_LABELS[element.key]
  if (values === null) {
    return {
      text: element.showLabel ? `${label}: [${label}]` : `[${label}]`,
      missing: false,
    }
  }
  const value = values[element.key]?.trim() ?? ''
  const missing = value === ''
  const shown = missing && mode === 'editor' ? EMPTY_VALUE_TEXT : value
  return {
    text: element.showLabel ? `${label}: ${shown}` : shown,
    missing,
  }
}

/** Los elementos nuevos se crean pensando en una etiqueta de 3 in y escalan con el ancho real. */
const BASE_LABEL_WIDTH_IN = 3

export const nextElementId = (elements: LabelElement[]) =>
  elements.reduce((max, element) => Math.max(max, element.id), 0) + 1

export type NewElementInput =
  | (Partial<LabelElement> & { type: 'variable'; key: LabelVariableKey })
  | (Partial<LabelElement> & { type: 'text' })
  | (Partial<LabelElement> & { type: 'line' })

export function createElement(
  partial: NewElementInput,
  options: {
    x?: number
    y?: number
    elements: LabelElement[]
    widthIn: number
  },
): LabelElement {
  const { x = 6, y = 8, elements, widthIn } = options
  const scale = widthIn / BASE_LABEL_WIDTH_IN
  const base = {
    id: nextElementId(elements),
    x,
    y,
    w: 90,
    h: Math.round(18 * scale),
    fontSize: Math.round(12 * scale * 10) / 10,
    bold: false,
    italic: false,
    underline: false,
    align: 'left' as const,
    color: '#243247',
    rotation: 0,
  }
  if (partial.type === 'variable') {
    // El bloque de Programación de Dosis ya trae sus propios nombres de campo y ocupa 4 líneas.
    const isBlock = partial.key === 'programacion_dosis'
    return {
      ...base,
      ...(isBlock ? { h: base.h * 4 } : {}),
      ...partial,
      type: 'variable',
      showLabel: partial.showLabel ?? !isBlock,
    }
  }
  if (partial.type === 'text') {
    return { ...base, ...partial, type: 'text', text: partial.text ?? 'Texto fijo' }
  }
  return { ...base, h: 4, ...partial, type: 'line', orientation: partial.orientation ?? 'horizontal' }
}
