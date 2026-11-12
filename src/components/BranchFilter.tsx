import { useEffect, useRef, useState } from 'react'
import { Building2, Check, ChevronDown, Store } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useMe } from '@/lib/permissions'
import { useUiStore } from '@/stores/ui-store'

const ALL = 'all'

/** Selector de sucursal: solo lista las sucursales a las que el usuario tiene acceso. */
export function BranchFilter({ className }: { className?: string }) {
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const setActiveBranchId = useUiStore((state) => state.setActiveBranchId)
  const { data: me } = useMe()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const branches = me?.branches ?? []
  const canSeeAll = branches.length > 1
  const current = branches.find((branch) => branch.id === activeBranchId)
  const showAll = activeBranchId === ALL && canSeeAll
  const label = showAll
    ? 'Todas las sucursales'
    : (current?.name ?? (canSeeAll ? 'Todas las sucursales' : 'Sin sucursal'))
  const selectedValue = showAll || (!current && canSeeAll) ? ALL : current?.id

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const options = [
    ...(canSeeAll ? [{ id: ALL, name: 'Todas las sucursales' }] : []),
    ...branches.map(({ id, name }) => ({ id, name })),
  ]

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filtrar por sucursal"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'border-border text-ink flex h-10 min-w-48 items-center gap-2 rounded-lg border bg-white pr-2 pl-3 text-sm transition-colors hover:bg-[#c3e9cf]',
          open && 'bg-[#c3e9cf]',
        )}
      >
        <Building2 className="text-muted size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={cn(
            'text-muted size-4 shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Sucursales"
          className="border-border app-scroll absolute top-full right-0 z-50 mt-2 grid max-h-72 min-w-full gap-0.5 overflow-y-auto rounded-xl border bg-white p-1.5 shadow-lg"
        >
          {options.map((option) => {
            const selected = option.id === selectedValue
            return (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setActiveBranchId(option.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm whitespace-nowrap transition-colors',
                    selected
                      ? 'bg-tealmax/10 text-petroleo border-tealmax border font-semibold'
                      : 'text-ink hover:bg-surface border border-transparent',
                  )}
                >
                  <Store
                    className={cn(
                      'size-4 shrink-0',
                      selected ? 'text-tealmax' : 'text-muted',
                    )}
                  />
                  <span className="min-w-0 flex-1">{option.name}</span>
                  {selected && (
                    <Check className="text-tealmax size-4 shrink-0" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
