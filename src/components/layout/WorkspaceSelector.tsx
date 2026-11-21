import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Building2, Check, ChevronsUpDown, Search, Store } from 'lucide-react'
import { api } from '@/lib/http'
import { useUiStore } from '@/stores/ui-store'
import { authClient } from '@/lib/auth-client'
import { useMe } from '@/lib/permissions'
import { cn } from '@/lib/cn'

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const LIST_CLASS =
  'grid max-h-[188px] gap-0.5 overflow-y-auto overscroll-contain [scrollbar-width:thin]'

type OrganizationList = {
  data: { id: string; name: string; logo: string | null }[]
  defaultOrganizationId: string | null
}

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
  const organizationsQuery = useQuery({
    queryKey: ['my-organizations'],
    queryFn: () => api<OrganizationList>('/api/v1/me/organizations'),
  })
  const activeOrganizationQuery = authClient.useActiveOrganization()
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const setActiveBranchId = useUiStore((state) => state.setActiveBranchId)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoSelected = useRef(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')

  const navigate = useNavigate()
  const leaving = useRef(false)
  const { data: me, isPending: mePending } = useMe()
  const branches = me?.branches ?? []
  const organizations = organizationsQuery.data?.data ?? []
  const firstBranchId = branches[0]?.id
  const activeOrganizationId = activeOrganizationQuery.data?.id ?? ''
  const defaultOrganizationId =
    organizationsQuery.data?.defaultOrganizationId ?? ''
  // Until a company is explicitly active, show the one the server will use.
  const currentOrganizationId = activeOrganizationId || defaultOrganizationId
  const currentOrganization = organizations.find(
    (organization) => organization.id === currentOrganizationId,
  )
  const canPickAllBranches = Boolean(me?.allBranches) || branches.length > 1
  const showAllBranches = activeBranchId === 'all' && canPickAllBranches
  const currentBranch = branches.find((branch) => branch.id === activeBranchId)
  const selectedValue = showAllBranches
    ? 'branch:all'
    : currentBranch
      ? `branch:${currentBranch.id}`
      : currentOrganizationId
        ? `organization:${currentOrganizationId}`
        : ''

  async function activateOrganization(organizationId: string) {
    try {
      await api<void>('/api/v1/me/active-organization', {
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      })
    } catch {
      return
    }
    await activeOrganizationQuery.refetch()
    setActiveBranchId(null)
    await queryClient.invalidateQueries()
  }

  // Make the default company the active one when the session has none, so the
  // selector never starts on an empty placeholder.
  useEffect(() => {
    if (autoSelected.current) return
    if (organizationsQuery.isPending || activeOrganizationQuery.isPending)
      return
    if (activeOrganizationId || !defaultOrganizationId) return
    autoSelected.current = true
    void activateOrganization(defaultOrganizationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    organizationsQuery.isPending,
    activeOrganizationQuery.isPending,
    activeOrganizationId,
    defaultOrganizationId,
  ])

  // The company the user is in was deactivated: leave it and its branch. Move to
  // another active company, or sign out when none is left (the platform owner
  // stays signed in so they can reactivate companies).
  useEffect(() => {
    if (leaving.current) return
    if (
      organizationsQuery.isPending ||
      activeOrganizationQuery.isPending ||
      mePending ||
      !organizationsQuery.data
    )
      return
    const activeIsInactive =
      Boolean(activeOrganizationId) &&
      !organizations.some(
        (organization) => organization.id === activeOrganizationId,
      )
    const noCompanyLeft = organizations.length === 0 && !me?.isPlatformOwner
    if (!activeIsInactive && !noCompanyLeft) return
    leaving.current = true
    setActiveBranchId(null)
    if (
      defaultOrganizationId &&
      defaultOrganizationId !== activeOrganizationId
    ) {
      void activateOrganization(defaultOrganizationId).finally(() => {
        leaving.current = false
      })
      return
    }
    void (async () => {
      await authClient.signOut().catch(() => undefined)
      queryClient.clear()
      navigate('/acceso', {
        replace: true,
        state: {
          message: 'Tu compañía fue inactivada. Contacta a un administrador.',
        },
      })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    organizationsQuery.isPending,
    organizationsQuery.data,
    activeOrganizationQuery.isPending,
    activeOrganizationId,
    defaultOrganizationId,
    mePending,
  ])

  // Always keep a branch selected: pick the first one when none is active or
  // the stored one belongs to another company. Skipped once the user has
  // explicitly chosen "Todas las sucursales".
  useEffect(() => {
    if (!firstBranchId || currentBranch || showAllBranches) return
    setActiveBranchId(firstBranchId)
  }, [firstBranchId, currentBranch, showAllBranches, setActiveBranchId])

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    searchRef.current?.focus()
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

  const term = normalize(search.trim())
  const matches = (option: Option) =>
    !term || normalize(option.label).includes(term)
  const organizationOptions: Option[] = organizations
    .map((organization) => ({
      value: `organization:${organization.id}`,
      label: organization.name,
      kind: 'organization' as const,
    }))
    .filter(matches)
  const branchOptions: Option[] = (
    branches.length > 0 && currentOrganizationId
      ? [
          ...(canPickAllBranches
            ? [
                {
                  value: 'branch:all',
                  label: 'Todas las sucursales',
                  kind: 'branch' as const,
                },
              ]
            : []),
          ...branches.map((branch) => ({
            value: `branch:${branch.id}`,
            label: branch.name,
            kind: 'branch' as const,
          })),
        ]
      : []
  ).filter(matches)

  const sidebar = variant === 'sidebar'
  const title = currentOrganization?.name ?? 'Selecciona un espacio'
  const subtitle = showAllBranches
    ? 'Todas las sucursales'
    : (currentBranch?.name ?? 'Sin sucursal')

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
            'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors',
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
          <span className="min-w-0 flex-1 truncate" title={option.label}>
            {option.label}
          </span>
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
            : 'border-border bg-modulos h-10 max-w-[200px] px-3 hover:bg-[#c3e9cf]',
          open && (sidebar ? 'bg-white/12' : 'bg-[#c3e9cf]'),
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
        <div className="border-border absolute top-full left-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border bg-white p-1.5 shadow-lg">
          <label className="border-border focus-within:border-tealmax mb-1 flex h-9 items-center gap-2 rounded-lg border px-2.5">
            <Search className="text-muted size-4 shrink-0" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar compañía o sucursal"
              aria-label="Buscar compañía o sucursal"
              className="text-ink placeholder:text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          {organizationOptions.length > 0 && (
            <>
              <p className="text-muted px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                Compañía
              </p>
              <ul role="listbox" aria-label="Compañías" className={LIST_CLASS}>
                {organizationOptions.map((option) =>
                  renderOption(
                    option,
                    option.value === `organization:${currentOrganizationId}`,
                  ),
                )}
              </ul>
            </>
          )}
          {branchOptions.length > 0 && (
            <>
              <p
                className={cn(
                  'text-muted px-2.5 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide uppercase',
                  organizationOptions.length > 0 &&
                    'border-border mt-1 border-t',
                )}
              >
                Sucursales
              </p>
              <ul role="listbox" aria-label="Sucursales" className={LIST_CLASS}>
                {branchOptions.map((option) =>
                  renderOption(option, option.value === selectedValue),
                )}
              </ul>
            </>
          )}
          {organizationOptions.length === 0 && branchOptions.length === 0 && (
            <p className="text-muted px-2.5 py-4 text-center text-sm">
              Sin resultados
            </p>
          )}
        </div>
      )}
    </div>
  )
}
