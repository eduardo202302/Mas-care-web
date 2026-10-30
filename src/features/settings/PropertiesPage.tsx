import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Layers, SlidersHorizontal, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { api, ApiError } from '@/lib/http'
import {
  propertyTypes,
  typeLabels,
  typeNeedsOptions,
  useCustomProperties,
  type CustomProperty,
} from '@/lib/custom-properties'
import type { PropertyEntity, PropertyType } from '@/lib/custom-properties-core'

type Draft = {
  id?: string
  entity: PropertyEntity
  key: string
  label: string
  type: PropertyType
  required: boolean
  optionsText: string
  groupName: string
}

const slug = (label: string) =>
  label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^[^a-z]+/, '')
    .slice(0, 40)

/** Mismo control que el resto de la app: ancho completo y anillo de foco. */
const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'
const entityLabels: Record<PropertyEntity, string> = {
  patient: 'Pacientes',
  treatment: 'Tratamientos y ciclos',
}

function PropertyDialog({
  draft,
  onClose,
  onSaved,
}: {
  draft: Draft
  onClose: () => void
  onSaved: () => void
}) {
  const [value, setValue] = useState(draft)
  const [keyTouched, setKeyTouched] = useState(Boolean(draft.id))
  const editing = Boolean(draft.id)
  const options = value.optionsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const save = useMutation({
    mutationFn: () => {
      const body = {
        label: value.label.trim(),
        required: value.required,
        groupName: value.groupName.trim() || 'General',
        ...(typeNeedsOptions(value.type) ? { options } : {}),
      }
      return editing
        ? api(`/api/v1/custom-properties/${draft.id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          })
        : api('/api/v1/custom-properties', {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              entity: value.entity,
              key: value.key,
              type: value.type,
            }),
          })
    },
    onSuccess: onSaved,
  })
  const fieldError = (name: string) =>
    save.error instanceof ApiError
      ? (save.error.fields as Record<string, string> | undefined)?.[name]
      : undefined

  return (
    <Dialog
      title={editing ? 'Editar Propiedad' : 'Nueva Propiedad'}
      description={
        editing
          ? 'La clave y el tipo no cambian para no invalidar los datos guardados.'
          : undefined
      }
      icon={<SlidersHorizontal className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate()
        }}
      >
        <ModalSection
          icon={<Tag className="size-4" />}
          title="Definición"
          tone="mint"
        >
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Etiqueta</span>
            <input
              className={control}
              value={value.label}
              maxLength={80}
              onChange={(e) =>
                setValue({
                  ...value,
                  label: e.target.value,
                  ...(keyTouched ? {} : { key: slug(e.target.value) }),
                })
              }
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Clave Única</span>
            <input
              className={control}
              value={value.key}
              disabled={editing}
              maxLength={40}
              onChange={(e) => {
                setKeyTouched(true)
                setValue({ ...value, key: e.target.value })
              }}
            />
            {fieldError('key') && (
              <span className="text-xs text-red-700">{fieldError('key')}</span>
            )}
          </label>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Tipo</span>
            <select
              className={control}
              value={value.type}
              disabled={editing}
              onChange={(e) =>
                setValue({ ...value, type: e.target.value as PropertyType })
              }
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {typeLabels[type]}
                </option>
              ))}
            </select>
          </label>
        </ModalSection>

        <ModalSection
          icon={<Layers className="size-4" />}
          title="Presentación"
          tone="amber"
        >
          {typeNeedsOptions(value.type) && (
            <div className="grid gap-1.5">
              <label
                htmlFor="property-options"
                className="text-ink text-sm font-medium"
              >
                Opciones (Una por Línea)
              </label>
              <TextAreaField
                id="property-options"
                className="min-h-8 py-1.5 text-xs"
                value={value.optionsText}
                onChange={(e) =>
                  setValue({ ...value, optionsText: e.target.value })
                }
              />
              {fieldError('options') && (
                <span className="text-xs text-red-700">
                  {fieldError('options')}
                </span>
              )}
            </div>
          )}
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">
              Grupo Donde se Muestra
            </span>
            <input
              className={control}
              value={value.groupName}
              maxLength={60}
              onChange={(e) =>
                setValue({ ...value, groupName: e.target.value })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={value.required}
              onChange={(e) =>
                setValue({ ...value, required: e.target.checked })
              }
            />
            <span className="text-ink">Obligatoria</span>
          </label>
        </ModalSection>

        {save.isError && (
          <p role="alert" className="text-sm text-red-700">
            {save.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={save.isPending || !value.label.trim() || !value.key}
          >
            {editing ? 'Guardar Cambios' : 'Crear Propiedad'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

/** Create, edit, archive and delete the custom properties of patients and treatments. */
export default function PropertiesPage() {
  const queryClient = useQueryClient()
  const [entity, setEntity] = useState<PropertyEntity>('patient')
  const [draft, setDraft] = useState<Draft | null>(null)
  const properties = useCustomProperties(entity, true)
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['custom-properties'] })
  const act = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string
      action: 'archive' | 'restore' | 'delete'
    }) =>
      action === 'delete'
        ? api(`/api/v1/custom-properties/${id}`, { method: 'DELETE' })
        : api(`/api/v1/custom-properties/${id}/${action}`, { method: 'POST' }),
    onSuccess: refresh,
  })
  const rows = properties.data?.data ?? []
  // Positions are renumbered 0..n-1 in the new order, so ties and gaps left by deletions disappear.
  const move = useMutation({
    mutationFn: async ({ index, by }: { index: number; by: -1 | 1 }) => {
      const order = [...rows]
      const [item] = order.splice(index, 1)
      order.splice(index + by, 0, item!)
      for (const [position, property] of order.entries()) {
        if (property.position !== position)
          await api(`/api/v1/custom-properties/${property.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ position }),
          })
      }
    },
    onSettled: refresh,
  })
  const edit = (property: CustomProperty) =>
    setDraft({
      id: property.id,
      entity: property.entity,
      key: property.key,
      label: property.label,
      type: property.type,
      required: property.required,
      optionsText: property.options.join('\n'),
      groupName: property.groupName,
    })

  return (
    <div className="animate-in max-w-4xl">
      <PageHeader
        title="Propiedades personalizadas"
        subtitle="Campos propios de tu organización. Aparecen en la ficha, en el formulario y como filtro de las tablas."
        actions={
          <>
            <Button
              variant="primary"
              onClick={() =>
                setDraft({
                  entity,
                  key: '',
                  label: '',
                  type: 'short_text',
                  required: false,
                  optionsText: '',
                  groupName: 'General',
                })
              }
            >
              Nueva Propiedad
            </Button>
          </>
        }
      />
      <div
        className="bg-surface mb-4 inline-flex rounded-lg p-1"
        role="tablist"
      >
        {(Object.keys(entityLabels) as PropertyEntity[]).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={entity === item}
            onClick={() => setEntity(item)}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${entity === item ? 'text-petroleo bg-white shadow-sm' : 'text-muted'}`}
          >
            {entityLabels[item]}
          </button>
        ))}
      </div>
      {act.isError && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {act.error.message}
        </p>
      )}
      {move.isError && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          No pudimos cambiar el orden. {move.error.message}
        </p>
      )}
      {rows.length === 0 ? (
        <p className="text-muted border-border rounded-xl border bg-white p-6 text-sm">
          Todavía no hay propiedades para {entityLabels[entity].toLowerCase()}.
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-muted text-[11px] tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3">Etiqueta</th>
                <th className="px-4 py-3">Clave</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {rows.map((property, index) => (
                <tr key={property.id}>
                  <td className="px-4 py-3 font-medium">
                    {property.label}
                    {property.required ? ' *' : ''}
                  </td>
                  <td className="text-muted px-4 py-3 font-mono text-xs">
                    {property.key}
                  </td>
                  <td className="px-4 py-3">{typeLabels[property.type]}</td>
                  <td className="px-4 py-3">{property.groupName}</td>
                  <td className="px-4 py-3">
                    {property.archivedAt ? 'Archivada' : 'Activa'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        className="h-8 px-2 text-xs"
                        aria-label={`Subir ${property.label}`}
                        disabled={index === 0 || move.isPending}
                        onClick={() => move.mutate({ index, by: -1 })}
                      >
                        ↑
                      </Button>
                      <Button
                        className="h-8 px-2 text-xs"
                        aria-label={`Bajar ${property.label}`}
                        disabled={index === rows.length - 1 || move.isPending}
                        onClick={() => move.mutate({ index, by: 1 })}
                      >
                        ↓
                      </Button>
                      <Button
                        className="h-8 px-2 text-xs"
                        aria-label={`Editar ${property.label}`}
                        onClick={() => edit(property)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="h-8 px-2 text-xs"
                        aria-label={`${property.archivedAt ? 'Restaurar' : 'Archivar'} ${property.label}`}
                        onClick={() =>
                          act.mutate({
                            id: property.id,
                            action: property.archivedAt ? 'restore' : 'archive',
                          })
                        }
                      >
                        {property.archivedAt ? 'Restaurar' : 'Archivar'}
                      </Button>
                      <Button
                        variant="danger"
                        className="h-8 px-2 text-xs"
                        aria-label={`Borrar ${property.label}`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Borrar «${property.label}»? Se eliminarán también los valores guardados en todos los registros. Para conservarlos, archívala.`,
                            )
                          )
                            act.mutate({ id: property.id, action: 'delete' })
                        }}
                      >
                        Borrar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {draft && (
        <PropertyDialog
          key={draft.id ?? 'new'}
          draft={draft}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null)
            void refresh()
          }}
        />
      )}
    </div>
  )
}
