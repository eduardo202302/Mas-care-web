import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type DateRange = { from?: string; to?: string }

export type Preset = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth'

export const PRESETS: { key: Preset; label: string }[] = [
  { key: 'yesterday', label: 'Ayer' },
  { key: 'today', label: 'Hoy' },
  { key: 'last7', label: '7 días' },
  { key: 'thisMonth', label: 'Este mes' },
  { key: 'lastMonth', label: 'Mes anterior' },
]

const pad = (value: number) => String(value).padStart(2, '0')

/** Fecha local como YYYY-MM-DD (sin pasar por UTC, que cambiaría el día de noche). */
function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Rango de cada atajo, calculado sobre el calendario local de `now`. */
export function presetRange(preset: Preset, now: Date = new Date()): DateRange {
  const day = (offset: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
  switch (preset) {
    case 'today':
      return { from: toDateInput(day(0)), to: toDateInput(day(0)) }
    case 'yesterday':
      // Todo lo anterior a hoy: sin fecha de inicio, hasta ayer.
      return { to: toDateInput(day(-1)) }
    case 'last7':
      return { from: toDateInput(day(-6)), to: toDateInput(day(0)) }
    case 'thisMonth':
      return {
        from: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: toDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      }
    case 'lastMonth':
      return {
        from: toDateInput(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: toDateInput(new Date(now.getFullYear(), now.getMonth(), 0)),
      }
  }
}

const dateInputClass =
  'border-border text-ink focus:border-tealmax h-8 rounded-lg border bg-white px-2 text-xs outline-none'

/**
 * Filtro rápido por fecha: Hoy, Ayer (todo hasta ayer, sin tocar hoy), 7 días,
 * Este mes, Mes anterior y un rango Personalizado. El rango vive en el padre
 * (`value`), así que el atajo
 * activo se deduce de él; volver a pulsar el activo quita el filtro.
 */
export function DateRangeFilter({
  value,
  onChange,
  label = 'Filtrar por fecha',
  chipLabel = 'Fecha',
  counts,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
  label?: string
  /** Prefijo de los chips del rango activo, que salen debajo del filtro ("Venta desde: …"). */
  chipLabel?: string
  /** Cuántos registros caen en cada atajo; si falta uno o es cero, no se muestra su conteo. */
  counts?: Partial<Record<Preset, number>>
}) {
  const [customOpen, setCustomOpen] = useState(false)
  const hasRange = Boolean(value.from || value.to)
  const activePreset = PRESETS.find((preset) => {
    const range = presetRange(preset.key)
    return range.from === value.from && range.to === value.to
  })?.key
  // "Personalizado" está activo si se abrió o si hay un rango que no es ningún atajo.
  const customActive = !activePreset && (customOpen || hasRange)

  const pill = (active: boolean) =>
    cn(
      'h-8 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition',
      active
        ? 'bg-tealmax text-white shadow-sm'
        : 'text-muted hover:bg-modulos hover:text-ink',
    )

  const chipClass =
    'border-border text-ink bg-modulos flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium hover:bg-[#c3e9cf]'

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label={label}
        className="border-border inline-flex flex-wrap items-center gap-1 rounded-xl border bg-white p-1 shadow-sm"
      >
        {PRESETS.map((preset) => {
          const count = counts?.[preset.key] ?? 0
          return (
            <button
              key={preset.key}
              type="button"
              aria-pressed={activePreset === preset.key}
              className={pill(activePreset === preset.key)}
              onClick={() => {
                setCustomOpen(false)
                onChange(
                  activePreset === preset.key ? {} : presetRange(preset.key),
                )
              }}
            >
              {preset.label}
              {count > 0 && (
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                    activePreset === preset.key
                      ? 'bg-white/25 text-white'
                      : 'bg-modulos text-petroleo',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
        <button
          type="button"
          aria-pressed={customActive}
          className={pill(customActive)}
          onClick={() => {
            if (customActive) {
              setCustomOpen(false)
              onChange({})
            } else setCustomOpen(true)
          }}
        >
          Personalizado
        </button>
      </div>
      {customActive && (
        <div className="text-muted flex items-center gap-1.5 text-xs">
          <input
            type="date"
            aria-label="Desde"
            className={dateInputClass}
            value={value.from ?? ''}
            max={value.to || undefined}
            onChange={(event) =>
              onChange({ ...value, from: event.target.value || undefined })
            }
          />
          <span aria-hidden="true">–</span>
          <input
            type="date"
            aria-label="Hasta"
            className={dateInputClass}
            value={value.to ?? ''}
            min={value.from || undefined}
            onChange={(event) =>
              onChange({ ...value, to: event.target.value || undefined })
            }
          />
        </div>
      )}
      {hasRange && (
        // Absolutos: los chips salen bajo el filtro sin sumar altura al encabezado.
        <div className="absolute top-full left-0 z-10 mt-1 flex w-max flex-wrap items-center gap-1.5">
          {value.from && (
            <button
              type="button"
              className={chipClass}
              onClick={() => onChange({ ...value, from: undefined })}
            >
              {chipLabel} desde: {value.from}
              <X className="size-3" />
            </button>
          )}
          {value.to && (
            <button
              type="button"
              className={chipClass}
              onClick={() => onChange({ ...value, to: undefined })}
            >
              {chipLabel} hasta: {value.to}
              <X className="size-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
