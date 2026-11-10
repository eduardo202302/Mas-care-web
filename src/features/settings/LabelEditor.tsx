import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Grid3x3,
  Italic,
  Minus,
  Redo2,
  Trash2,
  Type,
  Underline,
  Undo2,
} from 'lucide-react'
import { cn } from '@/lib/cn'
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
    keys: ['paciente_nombre', 'paciente_documento', 'paciente_edad'],
  },
  {
    title: 'Tratamiento y medicamento',
    keys: [
      'medicamento_nombre',
      'medicamento_presentacion',
      'dosis',
      'via_administracion',
      'frecuencia',
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
  medicamento_nombre: 'Nombre del medicamento',
  medicamento_presentacion: 'Presentación',
  dosis: 'Dosis',
  via_administracion: 'Vía de administración',
  frecuencia: 'Frecuencia',
  duracion: 'Duración',
  cantidad: 'Cantidad',
  instrucciones: 'Instrucciones',
  fecha_inicio: 'Fecha de inicio',
  fecha_fin: 'Fecha de finalización',
  prescriptor: 'Médico / prescriptor',
  codigo_tratamiento: 'Código de tratamiento',
}

const SAMPLES: Record<LabelVariableKey, string> = {
  farmacia_nombre: 'FARMACIA SALUD',
  farmacia_telefono: '809-555-0101',
  farmacia_direccion: 'Calle Principal, Jarabacoa',
  paciente_nombre: 'María Rodríguez',
  paciente_documento: '001-0000000-0',
  paciente_edad: '45 años',
  medicamento_nombre: 'Amoxicilina',
  medicamento_presentacion: 'Tabletas',
  dosis: '1 cápsula',
  via_administracion: 'Vía oral',
  frecuencia: 'Cada 8 horas',
  duracion: '7 días',
  cantidad: '21',
  instrucciones: 'Tomar después de los alimentos',
  fecha_inicio: '07/11/2026',
  fecha_fin: '14/11/2026',
  prescriptor: 'Dr. Juan Pérez',
  codigo_tratamiento: 'TR-000125',
}

const MM_TO_PX = 3.78
let nextLocalId = 1

export type NewElementInput =
  | (Partial<LabelElement> & { type: 'variable'; key: LabelVariableKey })
  | (Partial<LabelElement> & { type: 'text' })
  | (Partial<LabelElement> & { type: 'line' })

function createElement(partial: NewElementInput, x = 6, y = 8): LabelElement {
  const id = nextLocalId++
  const base = {
    id,
    x,
    y,
    w: 90,
    h: 18,
    fontSize: 12,
    bold: false,
    italic: false,
    underline: false,
    align: 'left' as const,
    color: '#243247',
    rotation: 0,
  }
  if (partial.type === 'variable') {
    return { ...base, ...partial, type: 'variable', showLabel: partial.showLabel ?? true }
  }
  if (partial.type === 'text') {
    return { ...base, ...partial, type: 'text', text: partial.text ?? 'Texto fijo' }
  }
  return { ...base, h: 2, ...partial, type: 'line', orientation: partial.orientation ?? 'horizontal' }
}

function elementText(
  element: LabelElement,
  values: Partial<Record<LabelVariableKey, string>>,
): string {
  if (element.type === 'text') return element.text
  if (element.type === 'line') return ''
  const value = values[element.key] ?? SAMPLES[element.key] ?? ''
  if (!element.showLabel) return value
  return `${LABEL_VARIABLE_LABELS[element.key]}: ${value}`
}

function dims(
  widthMm: number,
  heightMm: number,
  orientation: 'landscape' | 'portrait',
): [number, number] {
  let w = widthMm
  let h = heightMm
  if (orientation === 'portrait' && w > h) [w, h] = [h, w]
  if (orientation === 'landscape' && h > w) [w, h] = [h, w]
  return [w, h]
}

type HistoryState = LabelElement[]

/**
 * WYSIWYG label editor. Controlled component: the parent owns
 * widthMm/heightMm/orientation/elements and persists them; this only handles
 * on-canvas interaction (drag, resize via properties, selection, undo/redo).
 */
export function LabelEditor({
  widthMm,
  heightMm,
  orientation,
  elements,
  onChange,
  previewValues,
}: {
  widthMm: number
  heightMm: number
  orientation: 'landscape' | 'portrait'
  elements: LabelElement[]
  onChange: (elements: LabelElement[]) => void
  previewValues?: Partial<Record<LabelVariableKey, string>>
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const paperRef = useRef<HTMLDivElement>(null)
  const undoStack = useRef<HistoryState[]>([])
  const redoStack = useRef<HistoryState[]>([])
  const dragState = useRef<{
    ids: number[]
    startX: number
    startY: number
    origin: Map<number, { x: number; y: number }>
  } | null>(null)

  const pushHistory = useCallback((next: LabelElement[]) => {
    undoStack.current.push(elements)
    if (undoStack.current.length > 50) undoStack.current.shift()
    redoStack.current = []
    onChange(next)
  }, [elements, onChange])

  function undo() {
    const previous = undoStack.current.pop()
    if (!previous) return
    redoStack.current.push(elements)
    onChange(previous)
  }
  function redo() {
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current.push(elements)
    onChange(next)
  }

  const [w, h] = dims(widthMm, heightMm, orientation)
  const paperWidth = w * MM_TO_PX * zoom
  const paperHeight = h * MM_TO_PX * zoom

  function addElement(partial: NewElementInput, x?: number, y?: number) {
    const created = createElement(partial, x, y)
    pushHistory([...elements, created])
    setSelectedIds([created.id])
  }

  function updateElement(id: number, patch: Partial<LabelElement>) {
    onChange(
      elements.map((element) =>
        element.id === id ? ({ ...element, ...patch } as LabelElement) : element,
      ),
    )
  }
  function commitElement(id: number, patch: Partial<LabelElement>) {
    pushHistory(
      elements.map((element) =>
        element.id === id ? ({ ...element, ...patch } as LabelElement) : element,
      ),
    )
  }

  function removeSelected() {
    if (selectedIds.length === 0) return
    pushHistory(elements.filter((element) => !selectedIds.includes(element.id)))
    setSelectedIds([])
  }

  function duplicateSelected() {
    if (selectedIds.length === 0) return
    const copies = elements
      .filter((element) => selectedIds.includes(element.id))
      .map((element) => ({ ...element, id: nextLocalId++, x: Math.min(95, element.x + 2), y: Math.min(95, element.y + 2) }))
    pushHistory([...elements, ...copies])
    setSelectedIds(copies.map((copy) => copy.id))
  }

  function alignSelected(edge: 'left' | 'center' | 'right' | 'top' | 'bottom') {
    if (selectedIds.length === 0) return
    const selected = elements.filter((element) => selectedIds.includes(element.id))
    const target =
      edge === 'left' ? Math.min(...selected.map((element) => element.x))
      : edge === 'right' ? Math.max(...selected.map((element) => element.x + element.w))
      : edge === 'top' ? Math.min(...selected.map((element) => element.y))
      : edge === 'bottom' ? Math.max(...selected.map((element) => element.y))
      : null
    pushHistory(
      elements.map((element) => {
        if (!selectedIds.includes(element.id)) return element
        if (edge === 'left') return { ...element, x: target as number }
        if (edge === 'right') return { ...element, x: (target as number) - element.w }
        if (edge === 'top') return { ...element, y: target as number }
        if (edge === 'bottom') return { ...element, y: (target as number) - element.h / (h * MM_TO_PX / 100) }
        const avgX = selected.reduce((sum, item) => sum + item.x + item.w / 2, 0) / selected.length
        return { ...element, x: avgX - element.w / 2 }
      }),
    )
  }

  function onElementPointerDown(event: ReactPointerEvent<HTMLDivElement>, element: LabelElement) {
    if ((event.target as HTMLElement).dataset.handle) return
    event.preventDefault()
    const additive = event.shiftKey
    const nextSelection = additive
      ? selectedIds.includes(element.id)
        ? selectedIds.filter((id) => id !== element.id)
        : [...selectedIds, element.id]
      : selectedIds.includes(element.id)
        ? selectedIds
        : [element.id]
    setSelectedIds(nextSelection)
    const rect = paperRef.current?.getBoundingClientRect()
    if (!rect) return
    const origin = new Map(
      elements
        .filter((item) => nextSelection.includes(item.id))
        .map((item) => [item.id, { x: item.x, y: item.y }]),
    )
    dragState.current = { ids: nextSelection, startX: event.clientX, startY: event.clientY, origin }
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (moveEvent: PointerEvent) => {
      const drag = dragState.current
      if (!drag || !rect) return
      const dxPct = ((moveEvent.clientX - drag.startX) / rect.width) * 100
      const dyPct = ((moveEvent.clientY - drag.startY) / rect.height) * 100
      onChange(
        elements.map((item) => {
          const start = drag.origin.get(item.id)
          if (!start) return item
          return {
            ...item,
            x: Math.max(0, Math.min(98, start.x + dxPct)),
            y: Math.max(0, Math.min(98, start.y + dyPct)),
          }
        }),
      )
    }
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
      if (dragState.current) pushHistory(elements)
      dragState.current = null
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  function onResizeHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>, element: LabelElement) {
    event.preventDefault()
    event.stopPropagation()
    const rect = paperRef.current?.getBoundingClientRect()
    if (!rect) return
    const startX = event.clientX
    const startY = event.clientY
    const startW = element.w
    const startH = element.h
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const move = (moveEvent: PointerEvent) => {
      const dwPct = ((moveEvent.clientX - startX) / rect.width) * 100
      const dhPx = moveEvent.clientY - startY
      updateElement(element.id, {
        w: Math.max(2, Math.min(100 - element.x, startW + dwPct)),
        h: Math.max(4, startH + dhPx / zoom),
      })
    }
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
      commitElement(element.id, {})
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const active = document.activeElement
      if (active && ['INPUT', 'SELECT', 'TEXTAREA'].includes(active.tagName)) return
      if (selectedIds.length === 0) return
      const step = event.shiftKey ? 1 : 0.2
      let dx = 0
      let dy = 0
      if (event.key === 'ArrowLeft') dx = -step
      else if (event.key === 'ArrowRight') dx = step
      else if (event.key === 'ArrowUp') dy = -step
      else if (event.key === 'ArrowDown') dy = step
      else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length) {
        event.preventDefault()
        removeSelected()
        return
      } else if (event.key === 'd' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        duplicateSelected()
        return
      } else return
      event.preventDefault()
      onChange(
        elements.map((item) =>
          selectedIds.includes(item.id)
            ? { ...item, x: Math.max(0, Math.min(100, item.x + dx)), y: Math.max(0, Math.min(100, item.y + dy)) }
            : item,
        ),
      )
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, elements])

  const selectedElement = useMemo(
    () => (selectedIds.length === 1 ? elements.find((element) => element.id === selectedIds[0]) ?? null : null),
    [elements, selectedIds],
  )

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
      <div className="flex flex-col gap-3">
        <div className="border-border flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2">
          <button
            type="button"
            onClick={undo}
            disabled={undoStack.current.length === 0}
            className="text-muted hover:text-ink disabled:opacity-40"
            title="Deshacer"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={redoStack.current.length === 0}
            className="text-muted hover:text-ink disabled:opacity-40"
            title="Rehacer"
          >
            <Redo2 className="size-4" />
          </button>
          <span className="bg-border mx-1 h-5 w-px" />
          <button
            type="button"
            onClick={duplicateSelected}
            disabled={selectedIds.length === 0}
            className="text-muted hover:text-ink disabled:opacity-40"
            title="Duplicar"
          >
            <Copy className="size-4" />
          </button>
          <button
            type="button"
            onClick={removeSelected}
            disabled={selectedIds.length === 0}
            className="text-muted hover:text-red-600 disabled:opacity-40"
            title="Eliminar"
          >
            <Trash2 className="size-4" />
          </button>
          <span className="bg-border mx-1 h-5 w-px" />
          <button type="button" onClick={() => alignSelected('left')} disabled={selectedIds.length < 2} className="text-muted hover:text-ink disabled:opacity-40" title="Alinear a la izquierda">
            <AlignLeft className="size-4" />
          </button>
          <button type="button" onClick={() => alignSelected('center')} disabled={selectedIds.length < 2} className="text-muted hover:text-ink disabled:opacity-40" title="Centrar">
            <AlignCenter className="size-4" />
          </button>
          <button type="button" onClick={() => alignSelected('right')} disabled={selectedIds.length < 2} className="text-muted hover:text-ink disabled:opacity-40" title="Alinear a la derecha">
            <AlignRight className="size-4" />
          </button>
          <span className="bg-border mx-1 h-5 w-px" />
          <button
            type="button"
            onClick={() => setShowGrid((value) => !value)}
            className={cn('text-muted hover:text-ink', showGrid && 'text-tealmax')}
            title="Cuadrícula"
          >
            <Grid3x3 className="size-4" />
          </button>
          <select
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="border-border ml-auto h-8 rounded-md border bg-white px-2 text-xs"
          >
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
            <option value={1.25}>125%</option>
            <option value={1.5}>150%</option>
          </select>
        </div>

        <div className="bg-surface border-border flex min-h-[420px] items-center justify-center overflow-auto rounded-xl border p-8">
          <div
            ref={paperRef}
            className="relative flex-none border border-slate-300 bg-white shadow-lg"
            style={{
              width: paperWidth,
              height: paperHeight,
              backgroundImage: showGrid
                ? 'linear-gradient(#e9eef055 1px,transparent 1px),linear-gradient(90deg,#e9eef055 1px,transparent 1px)'
                : 'none',
              backgroundSize: `${5 * MM_TO_PX * zoom}px ${5 * MM_TO_PX * zoom}px`,
            }}
            onPointerDown={(event) => {
              if (event.target === paperRef.current) setSelectedIds([])
            }}
          >
            {elements.length === 0 && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-slate-400">
                Arrastra o agrega variables para comenzar a diseñar tu etiqueta
              </p>
            )}
            {elements.map((element) => {
              const selected = selectedIds.includes(element.id)
              return (
                <div
                  key={element.id}
                  onPointerDown={(event) => onElementPointerDown(event, element)}
                  className={cn(
                    'absolute cursor-move touch-none border border-transparent px-1 py-0.5 leading-tight whitespace-pre-wrap select-none',
                    selected && 'border-tealmax border-dashed bg-emerald-50/40 outline outline-white',
                  )}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: `${element.w}%`,
                    minHeight: element.h,
                    fontSize: element.fontSize,
                    fontWeight: element.bold ? 700 : 400,
                    fontStyle: element.italic ? 'italic' : 'normal',
                    textAlign: element.align,
                    color: element.color,
                    textDecoration: element.underline ? 'underline' : 'none',
                    borderBottom: element.type === 'line' ? `1px solid ${element.color}` : undefined,
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                  }}
                >
                  {elementText(element, previewValues ?? {})}
                  {selected && (
                    <div
                      data-handle="resize"
                      onPointerDown={(event) => onResizeHandlePointerDown(event, element)}
                      className="border-tealmax absolute -right-1.5 -bottom-1.5 size-3 cursor-se-resize rounded-sm border bg-white"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <aside className="border-border rounded-lg border bg-white">
        <h4 className="border-border border-b px-3 py-2 text-xs font-semibold text-slate-600 uppercase">
          Propiedades
        </h4>
        <div className="p-3">
          {!selectedElement ? (
            <p className="text-muted text-xs">
              {selectedIds.length > 1
                ? `${selectedIds.length} elementos seleccionados.`
                : 'Selecciona un elemento en la etiqueta para editar sus propiedades.'}
            </p>
          ) : (
            <div className="grid gap-3">
              {selectedElement.type === 'text' && (
                <label className="grid gap-1 text-xs">
                  <span className="font-medium text-slate-600">Texto</span>
                  <input
                    value={selectedElement.text}
                    onChange={(event) => commitElement(selectedElement.id, { text: event.target.value })}
                    className="border-border h-8 rounded-md border px-2"
                  />
                </label>
              )}
              {selectedElement.type === 'variable' && (
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedElement.showLabel}
                    onChange={(event) => commitElement(selectedElement.id, { showLabel: event.target.checked })}
                    className="border-border size-4 rounded"
                  />
                  Mostrar nombre del campo
                </label>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="grid gap-1">
                  <span className="font-medium text-slate-600">X (%)</span>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x * 10) / 10}
                    onChange={(event) => commitElement(selectedElement.id, { x: Number(event.target.value) })}
                    className="border-border h-8 rounded-md border px-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="font-medium text-slate-600">Y (%)</span>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y * 10) / 10}
                    onChange={(event) => commitElement(selectedElement.id, { y: Number(event.target.value) })}
                    className="border-border h-8 rounded-md border px-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="font-medium text-slate-600">Ancho (%)</span>
                  <input
                    type="number"
                    value={selectedElement.w}
                    onChange={(event) => commitElement(selectedElement.id, { w: Number(event.target.value) })}
                    className="border-border h-8 rounded-md border px-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="font-medium text-slate-600">Alto mín. (px)</span>
                  <input
                    type="number"
                    value={selectedElement.h}
                    onChange={(event) => commitElement(selectedElement.id, { h: Number(event.target.value) })}
                    className="border-border h-8 rounded-md border px-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="font-medium text-slate-600">Fuente (px)</span>
                  <input
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(event) => commitElement(selectedElement.id, { fontSize: Number(event.target.value) })}
                    className="border-border h-8 rounded-md border px-2"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="font-medium text-slate-600">Rotación (°)</span>
                  <input
                    type="number"
                    value={selectedElement.rotation}
                    onChange={(event) => commitElement(selectedElement.id, { rotation: Number(event.target.value) })}
                    className="border-border h-8 rounded-md border px-2"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-xs">
                <span className="font-medium text-slate-600">Color</span>
                <input
                  type="color"
                  value={selectedElement.color}
                  onChange={(event) => commitElement(selectedElement.id, { color: event.target.value })}
                  className="h-8 w-full rounded-md"
                />
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => commitElement(selectedElement.id, { bold: !selectedElement.bold })}
                  className={cn('border-border rounded-md border p-1.5', selectedElement.bold && 'bg-tealmax/10 text-tealmax')}
                >
                  <Bold className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => commitElement(selectedElement.id, { italic: !selectedElement.italic })}
                  className={cn('border-border rounded-md border p-1.5', selectedElement.italic && 'bg-tealmax/10 text-tealmax')}
                >
                  <Italic className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => commitElement(selectedElement.id, { underline: !selectedElement.underline })}
                  className={cn('border-border rounded-md border p-1.5', selectedElement.underline && 'bg-tealmax/10 text-tealmax')}
                >
                  <Underline className="size-3.5" />
                </button>
                <span className="bg-border mx-1 h-5 w-px" />
                <button
                  type="button"
                  onClick={() => commitElement(selectedElement.id, { align: 'left' })}
                  className={cn('border-border rounded-md border p-1.5', selectedElement.align === 'left' && 'bg-tealmax/10 text-tealmax')}
                >
                  <AlignLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => commitElement(selectedElement.id, { align: 'center' })}
                  className={cn('border-border rounded-md border p-1.5', selectedElement.align === 'center' && 'bg-tealmax/10 text-tealmax')}
                >
                  <AlignCenter className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => commitElement(selectedElement.id, { align: 'right' })}
                  className={cn('border-border rounded-md border p-1.5', selectedElement.align === 'right' && 'bg-tealmax/10 text-tealmax')}
                >
                  <AlignRight className="size-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={removeSelected}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="size-3.5" />
                Eliminar elemento
              </button>
            </div>
          )}
        </div>

        <h4 className="border-border border-t border-b px-3 py-2 text-xs font-semibold text-slate-600 uppercase">
          Agregar
        </h4>
        <div className="grid gap-1 p-3">
          <button
            type="button"
            onClick={() => addElement({ type: 'text' }, 8, 80)}
            className="border-border flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs hover:border-slate-400"
          >
            <Type className="size-3.5" /> Texto fijo
          </button>
          <button
            type="button"
            onClick={() => addElement({ type: 'line' }, 5, 90)}
            className="border-border flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs hover:border-slate-400"
          >
            <Minus className="size-3.5" /> Línea separadora
          </button>
        </div>
      </aside>
    </div>
  )
}

export function LabelVariablePalette({
  onAdd,
}: {
  onAdd: (key: LabelVariableKey) => void
}) {
  return (
    <div className="grid gap-4">
      {LABEL_VARIABLE_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="text-muted mb-2 text-[11px] font-semibold tracking-wide uppercase">
            {group.title}
          </p>
          <div className="grid gap-1.5">
            {group.keys.map((key) => (
              <button
                key={key}
                type="button"
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', key)}
                onClick={() => onAdd(key)}
                className="border-border flex items-center justify-between rounded-md border bg-white px-2.5 py-1.5 text-left text-xs hover:border-slate-400"
              >
                <span>{LABEL_VARIABLE_LABELS[key]}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export { createElement as createLabelElement, SAMPLES as LABEL_SAMPLES }
