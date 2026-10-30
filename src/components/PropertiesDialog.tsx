import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
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
  const total = visible.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <Dialog
      title={title}
      description="Todos los campos y su valor actual."
      icon={<SlidersHorizontal className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
      size="lg"
    >
      <label className="relative mb-3 block">
        <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
        <input
          type="search"
          aria-label="Buscar propiedad"
          placeholder="Buscar propiedad o valor"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none focus:ring-2"
        />
      </label>

      <div className="grid max-h-[55vh] gap-3 overflow-y-auto pr-1">
        {visible.length === 0 && (
          <p className="text-muted text-sm">
            Ninguna propiedad coincide con la búsqueda.
          </p>
        )}
        {visible.map((group) => (
          <section
            key={group.name}
            aria-label={group.name}
            className="border-border overflow-hidden rounded-xl border"
          >
            <header className="bg-modulos flex items-center gap-2 px-4 py-2.5">
              <h3 className="text-petroleo flex-1 text-sm font-semibold">
                {group.name}
              </h3>
              <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-semibold">
                {group.items.length}
              </span>
            </header>
            <dl className="bg-surface grid gap-0 p-0">
              {group.items.map((item) => (
                <div
                  key={item.label}
                  className="border-border grid grid-cols-[minmax(110px,0.7fr)_1.3fr] gap-3 border-b px-4 py-2 text-sm last:border-0"
                >
                  <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                    {item.label}
                  </dt>
                  <dd className="text-ink whitespace-pre-wrap">
                    {item.value || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="text-muted mt-3 text-xs">
        {total} {total === 1 ? 'campo' : 'campos'} mostrados
      </p>
    </Dialog>
  )
}
