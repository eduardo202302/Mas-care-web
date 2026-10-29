import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, Settings2, LogOut, HeartPulse, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUiStore } from '@/stores/ui-store'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/cn'
import { queryClient } from '@/lib/query-client'
import { buildMenuTree, menuIcon, type MeMenuItem } from '@/lib/menu'
import { useMe } from '@/lib/permissions'
import { WorkspaceSelector } from './WorkspaceSelector'
import { AutomationBanner } from './AutomationBanner'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white',
    isActive && 'bg-white/12 text-white',
  )

function SidebarLink({ item, nested }: { item: MeMenuItem; nested?: boolean }) {
  const Icon = menuIcon(item.icon)
  return (
    <NavLink to={item.path ?? '/'} className={linkClass}>
      <Icon className={cn(nested ? 'size-4' : 'size-[18px]')} />
      {item.label}
    </NavLink>
  )
}

function SidebarGroup({
  group,
  items,
}: {
  group: MeMenuItem
  items: MeMenuItem[]
}) {
  const { pathname } = useLocation()
  const containsActive = items.some(
    (child) =>
      child.path !== null &&
      (pathname === child.path || pathname.startsWith(`${child.path}/`)),
  )
  const [toggled, setToggled] = useState<boolean | null>(null)
  const open = toggled ?? containsActive
  const Icon = menuIcon(group.icon)
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setToggled(!open)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
      >
        <Icon className="size-[18px]" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn('size-4 transition', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="mt-1 ml-4 grid gap-1 border-l border-white/10 pl-2">
          {items.map((child) => (
            <SidebarLink key={child.id} item={child} nested />
          ))}
        </div>
      )}
    </div>
  )
}

/** Sidebar navigation built from the menu the API grants to the user's role. */
function SidebarNav() {
  const { data: me, isPending } = useMe()
  if (isPending) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Cargando menú…"
        className="grid gap-2"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="skeleton-dark h-9 rounded-lg" />
        ))}
      </div>
    )
  }
  const tree = buildMenuTree(me?.menu ?? [])
  return (
    <nav className="grid gap-1" aria-label="Navegación principal">
      {tree.map((item) =>
        item.path === null ? (
          <SidebarGroup key={item.id} group={item} items={item.children} />
        ) : (
          <SidebarLink key={item.id} item={item} />
        ),
      )}
    </nav>
  )
}

export function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const navigate = useNavigate()
  const signOut = async () => {
    await authClient.signOut()
    // Drop cached /me so the next user never sees this user's menu.
    queryClient.clear()
    navigate('/acceso', { replace: true })
  }
  return (
    <div className="bg-modulos text-ink min-h-screen">
      <aside
        className={cn(
          'bg-petroleo fixed inset-y-0 left-0 z-30 flex w-64 -translate-x-full flex-col text-white transition-transform md:translate-x-0',
          sidebarOpen && 'max-md:translate-x-0',
        )}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <span className="grid size-9 place-items-center rounded-xl bg-white/10">
            <HeartPulse className="text-cuidado size-5" />
          </span>
          <div>
            <div className="font-display text-lg font-bold tracking-tight">
              max care
            </div>
          </div>
        </div>
        <div className="px-4 pt-4">
          <WorkspaceSelector variant="sidebar" />
        </div>
        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-5">
          <SidebarNav />
        </div>
        <div className="mt-auto px-4 pb-5">
          {import.meta.env.DEV && (
            <NavLink
              to="/dev/chips"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55 hover:bg-white/8 hover:text-white"
            >
              <Settings2 className="size-[18px]" />
              Componentes
            </NavLink>
          )}
          <div className="mt-3 grid gap-1 border-t border-white/10 pt-3">
            <NavLink
              to="/perfil"
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              <UserRound className="size-[18px]" />
              Mi perfil
            </NavLink>
            <button
              type="button"
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-white/70 transition hover:bg-white/8 hover:text-white"
              aria-label="Cerrar sesión"
              onClick={signOut}
            >
              <LogOut className="size-[18px]" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
      <div className="min-h-screen md:pl-64">
        <header className="border-border sticky top-0 z-20 flex h-[76px] items-center border-b bg-white/95 px-5 backdrop-blur md:hidden">
          <Button
            variant="ghost"
            className="-ml-2 size-10 px-0"
            aria-label="Abrir menú"
            onClick={toggleSidebar}
          >
            <Menu className="size-5" />
          </Button>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 md:px-8 lg:px-10">
          <AutomationBanner />
          <Outlet />
        </main>
      </div>
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
        />
      )}
    </div>
  )
}
