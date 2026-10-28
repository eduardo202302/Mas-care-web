import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Check, ChevronsUpDown, Store } from 'lucide-react'
import { api } from '@/lib/http'
import { useUiStore } from '@/stores/ui-store'
import type { paths } from '@/lib/api-types'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/cn'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

type Option = {
  value: string
  label: string
  kind: 'organization' | 'branch'
}

export function WorkspaceSelector({
  variant = 'header',
}: {
  variant?: 'header' | 'sidebar'
}) {
  const queryClient = useQueryClient()
  const organizationsQuery = authClient.useListOrganizations()
  const activeOrganizationQuery = authClient.useActiveOrganization()
  const { data } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const setActiveBranchId = useUiStore((state) => state.setActiveBranchId)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoSelected = useRef(false)

  const branches = data?.data ?? []
  const organizations = organizationsQuery.data ?? []
  const firstBranchId = branches[0]?.id
  const activeOrganizationId = activeOrganizationQuery.data?.id ?? ''
  // Until a company is explicitly active, show the first one as selected.
  const currentOrganizationId =
    activeOrganizationId || organizations[0]?.id || ''
  const currentOrganization = organizations.find(
    (organization) => organization.id === currentOrganizationId,
  )
  const showAllBranches = activeBranchId === 'all'
  const currentBranch = branches.find((branch) => branch.id === activeBranchId)
  const selectedValue = showAllBranches
    ? 'branch:all'
    : currentBranch
      ? `branch:${currentBranch.id}`
      : currentOrganizationId
        ? `organization:${currentOrganizationId}`
        : ''

  async function activateOrganization(organizationId: string) {
    const result = await authClient.organization.setActive({ organizationId })
    if (!result.error) {
      setActiveBranchId(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branches'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
      ])
    }
    return result
  }

  // Make the first company the active one when the session has none, so the
  // selector never starts on an empty placeholder.
  useEffect(() => {
    if (autoSelected.current) return
    if (organizationsQuery.isPending || activeOrganizationQuery.isPending)
      return
    if (activeOrganizationId || organizations.length === 0) return
    autoSelected.current = true
    void activateOrganization(organizations[0]!.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    organizationsQuery.isPending,
    activeOrganizationQuery.isPending,
    activeOrganizationId,
    organizations.length,
  ])

  // Always keep a branch selected: pick the first one when none is active or
  // the stored one belongs to another company. Skipped once the user has
  // explicitly chosen "Todas las sucursales".
  useEffect(() => {
    if (!firstBranchId || currentBranch || showAllBranches) return
    setActiveBranchId(firstBranchId)
  }, [firstBranchId, currentBranch, showAllBranches, setActiveBranchId])

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

  async function selectWorkspace(value: string) {
    setOpen(false)
    if (value === selectedValue) return
    if (value === 'branch:all') {
      setActiveBranchId('all')
      return
    }
    if (value.startsWith('branch:')) {
      setActiveBranchId(value.slice('branch:'.length))
      return
    }
    if (value.startsWith('organization:')) {
      const organizationId = value.slice('organization:'.length)
      if (organizationId === activeOrganizationId) return
      await activateOrganization(organizationId)
    }
  }

  const organizationOptions: Option[] = organizations.map((organization) => ({
    value: `organization:${organization.id}`,
    label: organization.name,
    kind: 'organization',
  }))
  const branchOptions: Option[] =
    branches.length > 0 && currentOrganizationId
      ? [
          {
            value: 'branch:all',
            label: 'Todas las sucursales',
            kind: 'branch' as const,
          },
          ...branches.map((branch) => ({
            value: `branch:${branch.id}`,
            label: branch.name,
            kind: 'branch' as const,
          })),
        ]
      : []

  const sidebar = variant === 'sidebar'
  const title = currentOrganization?.name ?? 'Selecciona un espacio'
  const subtitle = showAllBranches
    ? 'Todas las sucursales'
    : currentBranch?.name ?? 'Sin sucursal'

  function renderOption(option: Option, selected: boolean) {
    const Icon = option.kind === 'organization' ? Building2 : Store
    return (
      <li key={`${option.kind}:${option.value}`} role="presentation">
        <button
          type="button"
          role="option"
          aria-selected={selected}
          onClick={() => void selectWorkspace(option.value)}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
            selected
              ? 'bg-tealmax/10 text-petroleo font-semibold'
              : 'text-ink hover:bg-surface',
          )}
        >
          <Icon
            className={cn(
              'size-4 shrink-0',
              selected ? 'text-tealmax' : 'text-muted',
            )}
          />
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
          {selected && <Check className="text-tealmax size-4 shrink-0" />}
        </button>
      </li>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Compañía o sucursal activa"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border text-left transition-colors',
          sidebar
            ? 'border-white/15 bg-white/8 px-3 py-2.5 hover:bg-white/12'
            : 'border-border hover:bg-surface h-10 max-w-[200px] bg-white px-3',
          open && (sidebar ? 'bg-white/12' : 'bg-surface'),
        )}
      >
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg',
            sidebar ? 'text-cuidado bg-white/12' : 'bg-tealmax/10 text-tealmax',
          )}
        >
          {currentOrganization?.logo ? (
            <img
              src={currentOrganization.logo}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <Building2 className="size-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm font-semibold',
              sidebar ? 'text-white' : 'text-petroleo',
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              'block truncate text-xs',
              sidebar ? 'text-white/55' : 'text-muted',
            )}
          >
            {subtitle}
          </span>
        </span>
        <ChevronsUpDown
          className={cn(
            'size-4 shrink-0',
            sidebar ? 'text-white/50' : 'text-muted',
          )}
        />
      </button>

      {open && (
        <div className="border-border absolute right-0 left-0 z-50 mt-2 min-w-56 rounded-xl border bg-white p-1.5 shadow-lg">
          <p className="text-muted px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide uppercase">
            Compañía
          </p>
          <ul role="listbox" aria-label="Compañías" className="grid gap-0.5">
            {organizationOptions.map((option) =>
              renderOption(
                option,
                option.value === `organization:${currentOrganizationId}`,
              ),
            )}
          </ul>
          {branchOptions.length > 0 && (
            <>
              <p className="text-muted border-border mt-1 border-t px-2.5 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                Sucursales
              </p>
              <ul
                role="listbox"
                aria-label="Sucursales"
                className="grid gap-0.5"
              >
                {branchOptions.map((option) =>
                  renderOption(option, option.value === selectedValue),
                )}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
