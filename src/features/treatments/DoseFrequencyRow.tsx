import {
  DAY_PRESETS,
  HOUR_PRESETS,
  MONTH_DAYS,
  WEEKDAY_SHORT_LABELS,
  partsToTime,
  timeToParts,
  type DoseFrequencyFormValue,
} from '@/lib/treatments'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Plus, X } from 'lucide-react'

const selectClass =
  'border-border text-ink h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-tealmax focus:ring-2 focus:ring-tealmax/15 appearance-none'

const timePartClass =
  'border-border text-ink h-10 rounded-lg border bg-white px-1.5 text-sm outline-none transition focus:border-tealmax focus:ring-2 focus:ring-tealmax/15 appearance-none'

const MINUTES = Array.from({ length: 60 }, (_, minute) => minute)

/** Hora/minuto/AM-PM en 3 selects, en vez de `<input type="time">`: ese control nativo muestra 24h en varios navegadores según el locale del sistema, y aquí se necesita AM/PM siempre visible. */
function TimePicker12h({
  value,
  onChange,
  label,
  required,
}: {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}) {
  const parts = timeToParts(value)
  const update = (patch: Partial<typeof parts>) =>
    onChange(partsToTime({ ...parts, ...patch }))
  return (
    <div className="grid gap-1.5">
      {label && (
        <span
          className={`text-ink text-sm font-medium ${required ? "after:ml-0.5 after:text-red-600 after:content-['*']" : ''}`}
        >
          {label}
        </span>
      )}
      <div className="flex items-center gap-1">
        <select
          aria-label="Hora"
          value={parts.hour12}
          onChange={(event) => update({ hour12: Number(event.target.value) })}
          className={`${timePartClass} w-14`}
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <span className="text-muted">:</span>
        <select
          aria-label="Minutos"
          value={parts.minute}
          onChange={(event) => update({ minute: Number(event.target.value) })}
          className={`${timePartClass} w-16`}
        >
          {MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, '0')}
            </option>
          ))}
        </select>
        <select
          aria-label="AM o PM"
          value={parts.period}
          onChange={(event) =>
            update({ period: event.target.value as 'AM' | 'PM' })
          }
          className={`${timePartClass} w-16`}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  )
}

/** `hours:8`, `days:30`, `hours:custom`, `days:custom` or `weekday` - one value encodes the whole "Frecuencia" field, matching how the reference sheet shows one short phrase per row ("8hora", "30 dias", "jueves"). */
function encode(value: DoseFrequencyFormValue): string {
  if (value.frequencyMode === 'weekday') return 'weekday'
  if (value.frequencyMode === 'monthday') return 'monthday'
  if (value.frequencyMode === 'days')
    return `days:${value.daysPreset === 'custom' ? 'custom' : value.daysPreset}`
  return `hours:${value.hoursPreset === 'custom' ? 'custom' : value.hoursPreset}`
}

function decode(
  code: string,
  current: DoseFrequencyFormValue,
  requireTomaTime: boolean,
): DoseFrequencyFormValue {
  if (code === 'weekday') return { ...current, frequencyMode: 'weekday' }
  if (code === 'monthday') return { ...current, frequencyMode: 'monthday' }
  const [kind, preset] = code.split(':') as ['hours' | 'days', string]
  if (kind === 'days')
    return { ...current, frequencyMode: 'days', daysPreset: preset }
  // Intervalo de horas: fuera del modal de Nuevo Tratamiento, "Toma" es
  // "Según inicio" - se reparte desde medianoche, sin pedir una hora. En
  // Nuevo Tratamiento (requireTomaTime) se conserva la hora que el usuario
  // ya haya elegido en "Toma".
  return {
    ...current,
    frequencyMode: 'hours',
    hoursPreset: preset,
    ...(requireTomaTime ? null : { startTime: '00:00' }),
  }
}

/**
 * Campos de "Cantidad | Unidad | Frecuencia | Toma" en pares de 2
 * por línea (como el resto del formulario), usados tanto al crear el primer
 * horario de un tratamiento como al cambiar la dosis de uno existente - mismo
 * componente, mismos campos.
 */
export function DoseFrequencyRow({
  quantity,
  onQuantityChange,
  unit,
  value,
  onChange,
  requireTomaTime = false,
}: {
  quantity: number | string
  onQuantityChange: (value: string) => void
  unit: string
  value: DoseFrequencyFormValue
  onChange: (value: DoseFrequencyFormValue) => void
  /** Modal de Nuevo Tratamiento: "Toma" siempre pide una hora concreta, incluso en intervalo de horas. */
  requireTomaTime?: boolean
}) {
  const code = encode(value)
  const needsCustomHours = code === 'hours:custom'
  const needsCustomDays = code === 'days:custom'
  const customDaysCount = Math.floor(Number(value.customDays))
  // Fuera de Nuevo Tratamiento, un intervalo de horas siempre es "Según
  // inicio" (sin pedir hora); en Nuevo Tratamiento (requireTomaTime) sí se pide.
  const showToma = requireTomaTime || value.frequencyMode !== 'hours'
  const isMultiTime =
    value.frequencyMode === 'weekday' || value.frequencyMode === 'monthday'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <TextField
        label={requireTomaTime ? 'Dosis Indicada' : 'Cantidad'}
        type="number"
        inputMode="decimal"
        min="0.001"
        step="any"
        required
        value={quantity}
        onChange={(event) => onQuantityChange(event.target.value)}
      />
      {requireTomaTime ? (
        <div className="grid gap-1.5">
          <label
            htmlFor="dose-unit-input"
            className="text-ink text-sm font-medium"
          >
            Unidad
          </label>
          <input
            id="dose-unit-input"
            disabled
            readOnly
            value={unit || 'unidad'}
            className="h-10 w-[70%] rounded-lg border border-emerald-300 bg-emerald-100 px-3 text-sm text-emerald-700 outline-none"
          />
        </div>
      ) : (
        <TextField label="Unidad" value={unit || 'unidad'} disabled readOnly />
      )}
      <div className="grid content-start gap-1.5">
        <label
          htmlFor="dose-frequency-select"
          className="text-ink text-sm font-medium"
        >
          Frecuencia
        </label>
        <select
          id="dose-frequency-select"
          value={code}
          onChange={(event) =>
            onChange(decode(event.target.value, value, requireTomaTime))
          }
          className={selectClass}
        >
          <optgroup label="Intervalo de Horas">
            {HOUR_PRESETS.map((preset) => (
              <option key={preset} value={`hours:${preset}`}>
                Cada {preset} Horas
              </option>
            ))}
            <option value="hours:custom">Horas Personalizado…</option>
          </optgroup>
          <optgroup label="Intervalo de Días">
            {DAY_PRESETS.map((preset) => (
              <option key={preset} value={`days:${preset}`}>
                Cada {preset} Días
              </option>
            ))}
            <option value="days:custom">Días Personalizado…</option>
          </optgroup>
          <option value="weekday">Día(s) de la Semana…</option>
          <option value="monthday">Día(s) del Mes…</option>
        </select>
      </div>

      {needsCustomHours && (
        <TextField
          label="Horas personalizadas"
          type="number"
          min="1"
          step="1"
          required
          value={value.customHours}
          onChange={(event) =>
            onChange({ ...value, customHours: event.target.value })
          }
        />
      )}
      {needsCustomDays && (
        <div className="grid content-start gap-1.5">
          <TextField
            label="Días Personalizados"
            type="number"
            min="1"
            step="1"
            required
            className="w-[70%]"
            value={value.customDays}
            onChange={(event) =>
              onChange({ ...value, customDays: event.target.value })
            }
          />
          {customDaysCount > 0 && (
            <p className="text-muted text-xs">
              Cada {customDaysCount} {customDaysCount === 1 ? 'día' : 'días'}
            </p>
          )}
        </div>
      )}

      {!showToma ? (
        <div className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">Toma</span>
          <p className="text-muted mt-2.5 text-xs">Según inicio</p>
        </div>
      ) : isMultiTime ? null : (
        <TimePicker12h
          label="Toma"
          required
          value={value.startTime}
          onChange={(nextTime) => onChange({ ...value, startTime: nextTime })}
        />
      )}

      {value.frequencyMode === 'monthday' && (
        <div className="grid gap-1.5 sm:col-span-2">
          <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
            Días del mes
          </span>
          <div className="grid max-w-xs grid-cols-7 gap-1.5">
            {MONTH_DAYS.map((day) => {
              const checked = value.monthdays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={checked}
                  onClick={() =>
                    onChange({
                      ...value,
                      monthdays: checked
                        ? value.monthdays.filter((item) => item !== day)
                        : [...value.monthdays, day].sort((a, b) => a - b),
                    })
                  }
                  className={`h-8 rounded-lg border text-xs font-medium transition ${
                    checked
                      ? 'border-tealmax bg-tealmax/10 text-tealmax'
                      : 'border-border text-muted hover:text-ink'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          {value.monthdays.some((day) => day > 28) && (
            <p className="text-muted text-xs">
              En los meses que no tienen ese día, la toma cae en el último día
              del mes.
            </p>
          )}
        </div>
      )}

      {value.frequencyMode === 'weekday' && (
        <div className="grid gap-1.5 sm:col-span-2">
          <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
            Días de la semana
          </span>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_SHORT_LABELS.map((label, dayIndex) => {
              const checked = value.weekdays.includes(dayIndex)
              return (
                <button
                  key={dayIndex}
                  type="button"
                  aria-pressed={checked}
                  onClick={() =>
                    onChange({
                      ...value,
                      weekdays: checked
                        ? value.weekdays.filter((day) => day !== dayIndex)
                        : [...value.weekdays, dayIndex].sort((a, b) => a - b),
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    checked
                      ? 'border-tealmax bg-tealmax/10 text-tealmax'
                      : 'border-border text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isMultiTime && (
        <div className="grid gap-1.5 sm:col-span-2">
          <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
            Toma
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {value.weekdayTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-1">
                <TimePicker12h
                  value={time}
                  onChange={(nextTime) =>
                    onChange({
                      ...value,
                      weekdayTimes: value.weekdayTimes.map((item, i) =>
                        i === index ? nextTime : item,
                      ),
                    })
                  }
                />
                {value.weekdayTimes.length > 1 && (
                  <button
                    type="button"
                    aria-label="Quitar horario"
                    className="text-muted hover:text-red-700"
                    onClick={() =>
                      onChange({
                        ...value,
                        weekdayTimes: value.weekdayTimes.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-fit px-2 text-xs"
            onClick={() =>
              onChange({ ...value, weekdayTimes: [...value.weekdayTimes, ''] })
            }
          >
            <Plus className="size-3.5" />
            Añadir hora
          </Button>
        </div>
      )}
    </div>
  )
}
