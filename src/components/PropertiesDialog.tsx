import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'

export type PropertyGroup = {
  name: string
  items: { label: string; value: string | null | undefined }[]
}

/** Searchable list of every field of a record with its current value, split by group. */
export function PropertiesDialog({
  title,
  groups,
  onClose,
}: {
  title: string
  groups: PropertyGroup[]
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const needle = search.trim().toLocaleLowerCase()
  const visible = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !needle ||
          item.label.toLocaleLowerCase().includes(needle) ||
          (item.value ?? '').toLocaleLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Dialog title={title} description="Todos los campos y su valor actual." onClose={onClose} size="lg">
      <input
        type="search"
        aria-label="Buscar propiedad"
        placeholder="Buscar propiedad o valor"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="border-border mb-4 h-10 w-full rounded-lg border bg-white px-3 text-sm"
      />
      <div className="grid max-h-[60vh] gap-5 overflow-y-auto pr-1">
        {visible.length === 0 && (
          <p className="text-muted text-sm">Ninguna propiedad coincide con la búsqueda.</p>
        )}
        {visible.map((group) => (
          <section key={group.name} aria-label={group.name}>
            <h3 className="text-petroleo mb-2 text-sm font-semibold">{group.name}</h3>
            <dl className="grid gap-2 text-sm">
              {group.items.map((item) => (
                <div key={item.label} className="border-border grid grid-cols-[minmax(120px,0.8fr)_1.2fr] gap-3 border-b pb-2 last:border-0">
                  <dt className="text-muted">{item.label}</dt>
                  <dd className="whitespace-pre-wrap">{item.value || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  )
}
