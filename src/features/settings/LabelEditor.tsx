import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Barcode,
  Bold,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Cake,
  Clock,
  CirclePlus,
  Copy,
  Droplets,
  FileText,
  FlaskConical,
  Grid3x3,
  Hash,
  IdCard,
  Italic,
  MapPin,
  Minus,
  Package,
  Phone,
  Pill,
  Redo2,
  Repeat,
  Route,
  Scale,
  Settings,
  Smartphone,
  Stethoscope,
  Store,
  Tag,
  Timer,
  Trash2,
  Type,
  Underline,
  Undo2,
  User,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { toTitleCase } from '@/lib/titleCase'
import type { LabelElement, LabelVariableKey } from '@/lib/operations'
import {
  EMPTY_VALUE_TEXT,
  LABEL_VARIABLE_GROUPS,
  LABEL_VARIABLE_LABELS,
  createElement,
  isLabelVariableKey,
  labelDims,
  labelElementStyle,
  labelElementText,
  nextElementId,
  type LabelValues,
  type NewElementInput,
} from './labelConfig'

/** 1 pulgada = 96 px CSS: el editor dibuja el papel con las mismas unidades que la impresión. */
const IN_TO_PX = 96
const ZOOM_AUTO = ''

type HistoryState = LabelElement[]

const VARIABLE_ICONS: Record<LabelVariableKey, LucideIcon> = {
  farmacia_nombre: Store,
  farmacia_telefono: Phone,
  farmacia_direccion: MapPin,
  paciente_nombre: User,
  paciente_documento: IdCard,
  paciente_edad: Cake,
  paciente_telefono: Smartphone,
  tratamiento_nombre: Tag,
  medicamento_nombre: Pill,
  medicamento_presentacion: FlaskConical,
  dosis: Droplets,
  programacion_dosis: CalendarClock,
  dosis_cantidad: Hash,
  dosis_unidad: Scale,
  via_administracion: Route,
  frecuencia: Repeat,
  horario: Clock,
  duracion: Timer,
  cantidad: Package,
  instrucciones: FileText,
  fecha_inicio: CalendarDays,
  fecha_fin: CalendarCheck,
  prescriptor: Stethoscope,
  codigo_tratamiento: Barcode,
}

/**
 * WYSIWYG label editor. Controlled component: the parent owns
 * widthIn/heightIn/orientation/elements and persists them; this only handles
 * on-canvas interaction (drag, resize via properties, selection, undo/redo).
 * `previewValues` is null until a patient is chosen: variables then show as
 * placeholders instead of invented sample data.
 */
export function LabelEditor({
  widthIn,
  heightIn,
  orientation,
  elements,
  onChange,
  previewValues,
}: {
  widthIn: number
  heightIn: number
  orientation: 'landscape' | 'portrait'
  elements: LabelElement[]
  onChange: (elements: LabelElement[]) => void
  previewValues: LabelValues | null
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showGrid, setShowGrid] = useState(true)
  const [zoomChoice, setZoomChoice] = useState<string>('1')
  const paperRef = useRef<HTMLDivElement>(null)
  const undoStack = useRef<HistoryState[]>([])
  const redoStack = useRef<HistoryState[]>([])
  const dragState = useRef<{
    ids: number[]
    startX: number
    startY: number
    origin: Map<number, { x: number; y: number }>
  } | null>(null)

  const pushHistory = useCallback(
    (next: LabelElement[]) => {
      undoStack.current.push(elements)
      if (undoStack.current.length > 50) undoStack.current.shift()
      redoStack.current = []
      onChange(next)
    },
    [elements, onChange],
  )

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

  const [w, h] = labelDims(widthIn, heightIn, orientation)
  // Auto: acerca las etiquetas chicas para poder trabajar cómodamente.
  const zoom =
    zoomChoice === ZOOM_AUTO
      ? w <= 3
        ? 1.75
        : w <= 4
          ? 1.4
          : 1.1
      : Number(zoomChoice)
  const paperWidth = w * IN_TO_PX * zoom
  const paperHeight = h * IN_TO_PX * zoom

  function addElement(partial: NewElementInput, x?: number, y?: number) {
    const created = createElement(partial, {
      ...(x === undefined ? {} : { x }),
      ...(y === undefined ? {} : { y }),
      elements,
      widthIn: w,
    })
    pushHistory([...elements, created])
    setSelectedIds([created.id])
  }

  /** Cuánto del alto del papel ocupa un elemento, en %, para mantenerlo dentro de la etiqueta. */
  const heightPct = (element: LabelElement) =>
    ((element.h * zoom) / paperHeight) * 100
  const clampX = (element: LabelElement, value: number) =>
    Math.max(0, Math.min(100 - element.w, value))
  const clampY = (element: LabelElement, value: number) =>
    Math.max(0, Math.min(Math.max(0, 100 - heightPct(element)), value))

  function onPaperDrop(event: ReactDragEvent<HTMLDivElement>) {
    const key = event.dataTransfer.getData('text/plain')
    if (!isLabelVariableKey(key)) return
    event.preventDefault()
    const rect = paperRef.current?.getBoundingClientRect()
    if (!rect) return
    const probe = createElement(
      { type: 'variable', key },
      { elements, widthIn: w },
    )
    const x = clampX(probe, ((event.clientX - rect.left) / rect.width) * 100)
    const y = clampY(probe, ((event.clientY - rect.top) / rect.height) * 100)
    addElement({ type: 'variable', key }, x, y)
  }

  function updateElement(id: number, patch: Partial<LabelElement>) {
    onChange(
      elements.map((element) =>
        element.id === id
          ? ({ ...element, ...patch } as LabelElement)
          : element,
      ),
    )
  }
  function commitElement(id: number, patch: Partial<LabelElement>) {
    pushHistory(
      elements.map((element) =>
        element.id === id
          ? ({ ...element, ...patch } as LabelElement)
          : element,
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
      .map((element, index) => ({
        ...element,
        id: nextElementId(elements) + index,
        x: clampX(element, element.x + 2),
        y: clampY(element, element.y + 2),
      }))
    pushHistory([...elements, ...copies])
    setSelectedIds(copies.map((copy) => copy.id))
  }

  function alignSelected(edge: 'left' | 'center' | 'right' | 'top' | 'bottom') {
    if (selectedIds.length === 0) return
    const selected = elements.filter((element) =>
      selectedIds.includes(element.id),
    )
    const target =
      edge === 'left'
        ? Math.min(...selected.map((element) => element.x))
        : edge === 'right'
          ? Math.max(...selected.map((element) => element.x + element.w))
          : edge === 'top'
            ? Math.min(...selected.map((element) => element.y))
            : edge === 'bottom'
              ? Math.max(
                  ...selected.map((element) => element.y + heightPct(element)),
                )
              : null
    pushHistory(
      elements.map((element) => {
        if (!selectedIds.includes(element.id)) return element
        if (edge === 'left') return { ...element, x: target as number }
        if (edge === 'right')
          return { ...element, x: (target as number) - element.w }
        if (edge === 'top') return { ...element, y: target as number }
        if (edge === 'bottom')
          return {
            ...element,
            y: clampY(element, (target as number) - heightPct(element)),
          }
        const avgX =
          selected.reduce((sum, item) => sum + item.x + item.w / 2, 0) /
          selected.length
        return { ...element, x: avgX - element.w / 2 }
      }),
    )
  }

  function onElementPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    element: LabelElement,
  ) {
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
    dragState.current = {
      ids: nextSelection,
      startX: event.clientX,
      startY: event.clientY,
      origin,
    }
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const initial = elements
    let moved: LabelElement[] | null = null
    const move = (moveEvent: PointerEvent) => {
      const drag = dragState.current
      if (!drag || !rect) return
      const dxPct = ((moveEvent.clientX - drag.startX) / rect.width) * 100
      const dyPct = ((moveEvent.clientY - drag.startY) / rect.height) * 100
      // Se limita el desplazamiento del grupo completo para que ningún elemento
      // salga de la etiqueta y todos conserven su posición relativa.
      let minDx = -Infinity
      let maxDx = Infinity
      let minDy = -Infinity
      let maxDy = Infinity
      for (const item of initial) {
        const start = drag.origin.get(item.id)
        if (!start) continue
        minDx = Math.max(minDx, -start.x)
        maxDx = Math.min(maxDx, 100 - item.w - start.x)
        minDy = Math.max(minDy, -start.y)
        maxDy = Math.min(maxDy, 100 - heightPct(item) - start.y)
      }
      const dx = Math.max(minDx, Math.min(Math.max(minDx, maxDx), dxPct))
      const dy = Math.max(minDy, Math.min(Math.max(minDy, maxDy), dyPct))
      moved = initial.map((item) => {
        const start = drag.origin.get(item.id)
        if (!start) return item
        return { ...item, x: start.x + dx, y: start.y + dy }
      })
      onChange(moved)
    }
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
      if (moved) {
        undoStack.current.push(initial)
        if (undoStack.current.length > 50) undoStack.current.shift()
        redoStack.current = []
      }
      dragState.current = null
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  function onResizeHandlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    element: LabelElement,
  ) {
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
    const initial = elements
    let resized = false
    const move = (moveEvent: PointerEvent) => {
      const dwPct = ((moveEvent.clientX - startX) / rect.width) * 100
      const dhPx = moveEvent.clientY - startY
      resized = true
      updateElement(element.id, {
        w: Math.max(2, Math.min(100 - element.x, startW + dwPct)),
        h: Math.max(
          4,
          Math.min(
            startH + dhPx / zoom,
            ((100 - element.y) / 100) * (paperHeight / zoom),
          ),
        ),
      })
    }
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
      if (resized) {
        undoStack.current.push(initial)
        if (undoStack.current.length > 50) undoStack.current.shift()
        redoStack.current = []
      }
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const active = document.activeElement
      if (active && ['INPUT', 'SELECT', 'TEXTAREA'].includes(active.tagName))
        return
      if (selectedIds.length === 0) return
      const step = event.shiftKey ? 1 : 0.2
      let dx = 0
      let dy = 0
      if (event.key === 'ArrowLeft') dx = -step
      else if (event.key === 'ArrowRight') dx = step
      else if (event.key === 'ArrowUp') dy = -step
      else if (event.key === 'ArrowDown') dy = step
      else if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedIds.length
      ) {
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
            ? {
                ...item,
                x: clampX(item, item.x + dx),
                y: clampY(item, item.y + dy),
              }
            : item,
        ),
      )
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, elements])

  const selectedElement = useMemo(
    () =>
      selectedIds.length === 1
        ? (elements.find((element) => element.id === selectedIds[0]) ?? null)
        : null,
    [elements, selectedIds],
  )

  return (
    <div className="grid gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-900/5 bg-[#F3FAF6] p-3 shadow-sm lg:min-h-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
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
            <span className="bg-border h-5 w-px" />
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
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
            <button
              type="button"
              onClick={() => alignSelected('left')}
              disabled={selectedIds.length < 2}
              className="text-muted hover:text-ink disabled:opacity-40"
              title="Alinear A la Izquierda"
            >
              <AlignLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => alignSelected('center')}
              disabled={selectedIds.length < 2}
              className="text-muted hover:text-ink disabled:opacity-40"
              title="Centrar"
            >
              <AlignCenter className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => alignSelected('right')}
              disabled={selectedIds.length < 2}
              className="text-muted hover:text-ink disabled:opacity-40"
              title="Alinear A la Derecha"
            >
              <AlignRight className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowGrid((value) => !value)}
            className={cn(
              'text-muted hover:text-ink rounded-xl bg-white p-2.5 shadow-sm',
              showGrid &&
                'bg-[#D3F0DE] text-emerald-800 hover:text-emerald-800',
            )}
            title="Cuadrícula"
          >
            <Grid3x3 className="size-4" />
          </button>
          <select
            value={zoomChoice}
            onChange={(event) => setZoomChoice(event.target.value)}
            aria-label="Zoom"
            className="text-ink ml-auto h-10 rounded-xl border-0 bg-white px-3 text-base shadow-sm outline-none"
          >
            <option value={ZOOM_AUTO}>Ajuste Automático</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.5">150%</option>
            <option value="2">200%</option>
          </select>
        </div>

        <div className="flex min-h-[360px] flex-1 overflow-auto p-2">
          <div
            className="m-auto grid flex-none"
            style={{
              gridTemplateColumns: `40px ${paperWidth}px`,
              gridTemplateRows: `28px ${paperHeight}px`,
            }}
          >
            <div />
            <Ruler axis="x" lengthIn={w} zoom={zoom} />
            <Ruler axis="y" lengthIn={h} zoom={zoom} />
            <div
              ref={paperRef}
              className="relative border border-slate-200 bg-white shadow-lg"
              style={{
                width: paperWidth,
                height: paperHeight,
                backgroundImage: showGrid
                  ? 'linear-gradient(#e9eef055 1px,transparent 1px),linear-gradient(90deg,#e9eef055 1px,transparent 1px)'
                  : 'none',
                backgroundSize: `${(IN_TO_PX / 8) * zoom}px ${(IN_TO_PX / 8) * zoom}px`,
              }}
              onPointerDown={(event) => {
                if (event.target === paperRef.current) setSelectedIds([])
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={onPaperDrop}
            >
              {elements.length === 0 && (
                <p className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-slate-400">
                  Arrastra O Agrega Variables para Comenzar A Diseñar Tu
                  Etiqueta
                </p>
              )}
              {elements.map((element) => {
                const selected = selectedIds.includes(element.id)
                const { text, missing } = labelElementText(
                  element,
                  previewValues,
                  'editor',
                )
                return (
                  <div
                    key={element.id}
                    onPointerDown={(event) =>
                      onElementPointerDown(event, element)
                    }
                    className={cn(
                      'absolute cursor-move touch-none border border-transparent leading-tight whitespace-pre-wrap select-none',
                      selected &&
                        'border-tealmax border-dashed bg-emerald-50/40 outline outline-white',
                      missing && 'opacity-60',
                    )}
                    title={missing ? EMPTY_VALUE_TEXT : undefined}
                    style={labelElementStyle(element, zoom)}
                  >
                    {text}
                    {selected && (
                      <div
                        data-handle="resize"
                        onPointerDown={(event) =>
                          onResizeHandlePointerDown(event, element)
                        }
                        className="border-tealmax absolute -right-1.5 -bottom-1.5 size-3 cursor-se-resize rounded-sm border bg-white"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-emerald-900/5 bg-white shadow-sm lg:sticky lg:top-0 lg:max-h-[calc(100dvh-18rem)] lg:min-h-0 lg:self-start lg:overflow-y-auto">
        <h4 className="text-ink sticky top-0 z-10 flex items-center gap-2 rounded-t-2xl border-b border-emerald-900/10 bg-white px-4 pt-4 pb-3 text-base font-bold uppercase">
          <Settings className="size-4 text-emerald-800" />
          Propiedades
        </h4>
        <div className="px-4 pt-3 pb-4">
          {!selectedElement ? (
            <p className="text-muted text-base">
              {selectedIds.length > 1
                ? `${selectedIds.length} elementos seleccionados.`
                : 'Selecciona un elemento en la etiqueta para editar sus propiedades.'}
            </p>
          ) : (
            <div className="grid gap-3">
              {selectedElement.type === 'text' && (
                <label className="grid min-w-0 gap-1.5 text-xs">
                  <span className="font-medium text-slate-600">Texto</span>
                  <input
                    value={selectedElement.text}
                    onChange={(event) =>
                      commitElement(selectedElement.id, {
                        text: event.target.value,
                      })
                    }
                    className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm outline-none focus:ring-2"
                  />
                </label>
              )}
              {selectedElement.type === 'variable' && (
                <>
                  <label className="grid min-w-0 gap-1.5 text-xs">
                    <span className="font-medium text-slate-600">
                      Etiqueta (Label)
                    </span>
                    <input
                      value={selectedElement.label ?? ''}
                      onChange={(event) =>
                        commitElement(selectedElement.id, {
                          label: event.target.value,
                        })
                      }
                      maxLength={60}
                      placeholder={LABEL_VARIABLE_LABELS[selectedElement.key]}
                      className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm outline-none focus:ring-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedElement.showLabel}
                      onChange={(event) =>
                        commitElement(selectedElement.id, {
                          showLabel: event.target.checked,
                        })
                      }
                      className="border-border size-4 rounded"
                    />
                    Mostrar Nombre Del Campo
                  </label>
                </>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                <label className="grid min-w-0 gap-1.5">
                  <span className="font-medium text-slate-600">X (%)</span>
                  <NumberField
                    value={Math.round(selectedElement.x * 10) / 10}
                    onCommit={(v) =>
                      commitElement(selectedElement.id, {
                        x: clampX(selectedElement, v),
                      })
                    }
                    allowZero
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="font-medium text-slate-600">Y (%)</span>
                  <NumberField
                    value={Math.round(selectedElement.y * 10) / 10}
                    onCommit={(v) =>
                      commitElement(selectedElement.id, {
                        y: clampY(selectedElement, v),
                      })
                    }
                    allowZero
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="font-medium text-slate-600">Ancho (%)</span>
                  <NumberField
                    value={selectedElement.w}
                    onCommit={(v) =>
                      commitElement(selectedElement.id, {
                        w: Math.max(1, Math.min(100 - selectedElement.x, v)),
                      })
                    }
                    min={1}
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="font-medium text-slate-600">
                    Alto Mín. (px)
                  </span>
                  <NumberField
                    value={selectedElement.h}
                    onCommit={(v) =>
                      commitElement(selectedElement.id, { h: v })
                    }
                    min={4}
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="font-medium text-slate-600">
                    Fuente (px)
                  </span>
                  <NumberField
                    value={selectedElement.fontSize}
                    onCommit={(v) =>
                      commitElement(selectedElement.id, {
                        fontSize: Math.min(72, v),
                      })
                    }
                    min={6}
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="font-medium text-slate-600">
                    Rotación (°)
                  </span>
                  <NumberField
                    value={selectedElement.rotation}
                    onCommit={(v) =>
                      commitElement(selectedElement.id, {
                        rotation: Math.max(-180, Math.min(180, v)),
                      })
                    }
                    allowZero
                    allowNegative
                  />
                </label>
              </div>
              <label className="grid min-w-0 gap-1.5 text-xs">
                <span className="font-medium text-slate-600">Color</span>
                <input
                  type="color"
                  value={selectedElement.color}
                  onChange={(event) =>
                    commitElement(selectedElement.id, {
                      color: event.target.value,
                    })
                  }
                  className="h-8 w-full rounded-md"
                />
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    commitElement(selectedElement.id, {
                      bold: !selectedElement.bold,
                    })
                  }
                  className={cn(
                    'border-border rounded-md border p-1.5',
                    selectedElement.bold && 'bg-tealmax/10 text-tealmax',
                  )}
                >
                  <Bold className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commitElement(selectedElement.id, {
                      italic: !selectedElement.italic,
                    })
                  }
                  className={cn(
                    'border-border rounded-md border p-1.5',
                    selectedElement.italic && 'bg-tealmax/10 text-tealmax',
                  )}
                >
                  <Italic className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commitElement(selectedElement.id, {
                      underline: !selectedElement.underline,
                    })
                  }
                  className={cn(
                    'border-border rounded-md border p-1.5',
                    selectedElement.underline && 'bg-tealmax/10 text-tealmax',
                  )}
                >
                  <Underline className="size-3.5" />
                </button>
                <span className="bg-border mx-1 h-5 w-px" />
                <button
                  type="button"
                  onClick={() =>
                    commitElement(selectedElement.id, { align: 'left' })
                  }
                  className={cn(
                    'border-border rounded-md border p-1.5',
                    selectedElement.align === 'left' &&
                      'bg-tealmax/10 text-tealmax',
                  )}
                >
                  <AlignLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commitElement(selectedElement.id, { align: 'center' })
                  }
                  className={cn(
                    'border-border rounded-md border p-1.5',
                    selectedElement.align === 'center' &&
                      'bg-tealmax/10 text-tealmax',
                  )}
                >
                  <AlignCenter className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commitElement(selectedElement.id, { align: 'right' })
                  }
                  className={cn(
                    'border-border rounded-md border p-1.5',
                    selectedElement.align === 'right' &&
                      'bg-tealmax/10 text-tealmax',
                  )}
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
                Eliminar Elemento
              </button>
            </div>
          )}
        </div>

        <h4 className="text-ink mt-1 flex items-center gap-2 border-t border-emerald-900/10 px-4 pt-4 pb-2 text-base font-bold uppercase">
          <CirclePlus className="size-4 text-emerald-800" />
          Agregar
        </h4>
        <div className="grid gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={() => addElement({ type: 'text' }, 8, 80)}
            className="border-border flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-base shadow-sm hover:border-slate-400"
          >
            <Type className="size-3.5" /> Texto Fijo
          </button>
          <button
            type="button"
            onClick={() => addElement({ type: 'line' }, 5, 90)}
            className="border-border flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-base shadow-sm hover:border-slate-400"
          >
            <Minus className="size-3.5" /> Línea Separadora
          </button>
        </div>
      </aside>
    </div>
  )
}

const RULER_FORMAT = new Intl.NumberFormat('es', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** Regla en pulgadas: marca menor cada 0,1 in y mayor con número cada 0,5 in. */
function Ruler({
  axis,
  lengthIn,
  zoom,
}: {
  axis: 'x' | 'y'
  lengthIn: number
  zoom: number
}) {
  const pxPerIn = IN_TO_PX * zoom
  const minor = pxPerIn / 10
  const horizontal = axis === 'x'
  const tick = '#94a3b8'
  const labels = Array.from(
    { length: Math.floor(lengthIn / 0.5) + 1 },
    (_, index) => index * 0.5,
  )
  const dir = horizontal ? 'to right' : 'to bottom'
  const line = `linear-gradient(${dir}, ${tick} 1px, transparent 1px)`
  return (
    <div
      aria-hidden
      className={cn(
        'relative text-sm font-medium text-slate-600 select-none',
        horizontal ? 'border-b border-slate-300' : 'border-r border-slate-300',
      )}
      style={{
        backgroundImage: `${line}, ${line}`,
        backgroundRepeat: horizontal
          ? 'repeat-x, repeat-x'
          : 'repeat-y, repeat-y',
        backgroundPosition: horizontal
          ? 'left bottom, left bottom'
          : 'right top, right top',
        backgroundSize: horizontal
          ? `${minor}px 5px, ${pxPerIn / 2}px 10px`
          : `5px ${minor}px, 10px ${pxPerIn / 2}px`,
      }}
    >
      {labels.map((value) => (
        <span
          key={value}
          className="absolute leading-none"
          style={
            horizontal
              ? { left: value * pxPerIn, top: 1, transform: 'translateX(-50%)' }
              : {
                  top: value * pxPerIn,
                  right: 12,
                  transform: 'translateY(-50%)',
                }
          }
        >
          {RULER_FORMAT.format(value)}
        </span>
      ))}
    </div>
  )
}

const numberFieldClass =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm outline-none focus:ring-2'

const displayNumber = (value: number) =>
  value === 0 ? '' : String(Math.round(value * 10) / 10)

/**
 * Campo numérico que muestra vacío el cero, no antepone ceros al escribir y
 * solo admite dígitos (y un decimal). Los campos con `min` no aceptan 0: se
 * quedan vacíos mientras se escribe y vuelven al último valor válido al salir.
 */
function NumberField({
  value,
  onCommit,
  allowZero = false,
  allowNegative = false,
  min,
}: {
  value: number
  onCommit: (value: number) => void
  allowZero?: boolean
  allowNegative?: boolean
  min?: number
}) {
  const [text, setText] = useState(displayNumber(value))
  const focused = useRef(false)

  useEffect(() => {
    if (!focused.current) setText(displayNumber(value))
  }, [value])

  function onChange(raw: string) {
    let next = raw.replace(',', '.')
    const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/
    if (!pattern.test(next)) return
    next = next.replace(/^(-?)0+(?=\d)/, '$1')
    if (next === '0') next = ''
    setText(next)
    const parsed = Number(next)
    if (
      next === '' ||
      next === '-' ||
      next === '.' ||
      next === '-.' ||
      parsed === 0
    ) {
      if (allowZero && value !== 0) onCommit(0)
      return
    }
    if (!Number.isNaN(parsed)) onCommit(parsed)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onFocus={() => {
        focused.current = true
      }}
      onChange={(event) => onChange(event.target.value)}
      onBlur={() => {
        focused.current = false
        if (min !== undefined && value !== 0 && value < min) onCommit(min)
        else setText(displayNumber(value))
      }}
      className={numberFieldClass}
    />
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
          <p className="mb-2 rounded-md bg-[#C2EDCC] px-2.5 py-1.5 text-sm font-bold tracking-wide text-emerald-900 uppercase">
            {group.title}
          </p>
          <div className="grid gap-1.5">
            {group.keys.map((key) => {
              const Icon = VARIABLE_ICONS[key]
              return (
                <button
                  key={key}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData('text/plain', key)
                  }
                  onClick={() => onAdd(key)}
                  className="flex items-center gap-2 rounded-md border border-emerald-200 bg-[#F4F9FA] px-2.5 py-2 text-left text-base shadow-sm hover:border-emerald-400"
                >
                  <Icon className="text-muted size-4 shrink-0" />
                  <span className="min-w-0 break-words">
                    {toTitleCase(LABEL_VARIABLE_LABELS[key])}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
