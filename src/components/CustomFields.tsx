import type { ReactNode } from 'react'
import { formatCustomValue, useCustomProperties, type CustomProperty } from '@/lib/custom-properties'
import type { PropertyEntity } from '@/lib/custom-properties-core'

const control = 'border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none'

function toLocalInput(value: unknown) {
  if (typeof value !== 'string' || !value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function Field({
  def,
  value,
  onChange,
}: {
  def: CustomProperty
  value: unknown
  onChange: (next: unknown) => void
}) {
  const id = `cp-${def.key}`
  switch (def.type) {
    case 'long_text':
      return <textarea id={id} rows={3} className="border-border focus:border-tealmax rounded-lg border px-3 py-2 text-sm outline-none" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'number':
      return <input id={id} type="number" step="any" className={control} value={typeof value === 'number' ? value : ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
    case 'date':
      return <input id={id} type="date" className={control} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} />
    case 'datetime':
      return <input id={id} type="datetime-local" className={control} value={toLocalInput(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
    case 'checkbox':
      return <input id={id} type="checkbox" className="size-5" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
    case 'select':
      return (
        <select id={id} className={control} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">Sin valor</option>
          {def.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      )
    case 'multiselect': {
      const selected = Array.isArray(value) ? (value as string[]) : []
      return (
        <div id={id} className="flex flex-wrap gap-3">
          {def.options.map((option) => (
            <label key={option} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={(e) => onChange(e.target.checked ? [...selected, option] : selected.filter((item) => item !== option))}
              />
              {option}
            </label>
          ))}
        </div>
      )
    }
    default:
      return <input id={id} type="text" maxLength={200} className={control} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
  }
}

/** Inputs for the organization's custom properties, grouped by `groupName`. Renders nothing without definitions. */
export function CustomFields({
  entity,
  values,
  errors = {},
  onChange,
}: {
  entity: PropertyEntity
  values: Record<string, unknown>
  errors?: Record<string, string>
  onChange: (next: Record<string, unknown>) => void
}) {
  const { data } = useCustomProperties(entity)
  const defs = data?.data ?? []
  if (defs.length === 0) return null
  const groups = [...new Set(defs.map((def) => def.groupName))]

  return (
    <div className="grid gap-4">
      {groups.map((group): ReactNode => (
        <fieldset key={group} className="border-border grid gap-3 rounded-xl border p-4">
          <legend className="text-petroleo px-1 text-sm font-semibold">{group}</legend>
          {defs.filter((def) => def.groupName === group).map((def) => (
            <div key={def.key} className="grid gap-1">
              <label htmlFor={`cp-${def.key}`} className="text-ink text-sm font-medium">
                {def.label}
                {def.required && ' *'}
              </label>
              <Field def={def} value={values[def.key]} onChange={(next) => onChange({ ...values, [def.key]: next })} />
              {errors[def.key] && <p role="alert" className="text-xs text-red-700">{errors[def.key]}</p>}
            </div>
          ))}
        </fieldset>
      ))}
    </div>
  )
}

/** Property groups in the shape the properties dialog expects (one group per property group). */
export function customPropertyGroups(
  defs: CustomProperty[],
  values: Record<string, unknown>,
): { name: string; items: { label: string; value: string }[] }[] {
  return [...new Set(defs.map((def) => def.groupName))].map((name) => ({
    name,
    items: defs
      .filter((def) => def.groupName === name)
      .map((def) => ({ label: def.label, value: formatCustomValue(def, values[def.key]) })),
  }))
}

/** Read-only values for the record view, one block per property group. */
export function CustomValuesView({
  entity,
  values,
}: {
  entity: PropertyEntity
  values: Record<string, unknown>
}) {
  const { data } = useCustomProperties(entity)
  const groups = customPropertyGroups(data?.data ?? [], values)
  if (groups.length === 0) return null
  return (
    <>
      {groups.map((group) => (
        <section key={group.name} className="border-border rounded-xl border bg-white p-5">
          <h2 className="text-petroleo mb-4 font-semibold">{group.name}</h2>
          <dl className="grid gap-3 text-sm">
            {group.items.map((item) => (
              <div key={item.label}>
                <dt className="text-muted">{item.label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">{item.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </>
  )
}

/** One custom-property filter for a table: pick a property, then a value suited to its type. */
export function CustomPropertyFilter({
  entity,
  propertyKey,
  value,
  onChange,
}: {
  entity: PropertyEntity
  propertyKey?: string
  value?: string
  onChange: (next: { cp_key?: string; cp_value?: string }) => void
}) {
  const { data } = useCustomProperties(entity)
  const defs = data?.data ?? []
  if (defs.length === 0) return null
  const def = defs.find((item) => item.key === propertyKey)
  const box = 'border-border h-9 rounded-lg border bg-white px-2 text-sm'
  const set = (next: string) => onChange({ cp_key: propertyKey, cp_value: next || undefined })

  return (
    <fieldset className="grid gap-1">
      <legend className="text-muted text-xs font-semibold">Propiedad personalizada</legend>
      <div className="flex gap-1">
        <select
          aria-label="Propiedad personalizada"
          className={box}
          value={propertyKey ?? ''}
          onChange={(e) => onChange({ cp_key: e.target.value || undefined, cp_value: undefined })}
        >
          <option value="">Sin filtro</option>
          {defs.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
        {def &&
          (def.type === 'select' || def.type === 'multiselect' ? (
            <select aria-label="Valor de la propiedad" className={box} value={value ?? ''} onChange={(e) => set(e.target.value)}>
              <option value="">Elige un valor</option>
              {def.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : def.type === 'checkbox' ? (
            <select aria-label="Valor de la propiedad" className={box} value={value ?? ''} onChange={(e) => set(e.target.value)}>
              <option value="">Elige un valor</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              aria-label="Valor de la propiedad"
              className={box}
              type={def.type === 'number' ? 'number' : def.type === 'date' ? 'date' : 'text'}
              value={value ?? ''}
              onChange={(e) => set(e.target.value)}
            />
          ))}
      </div>
    </fieldset>
  )
}
