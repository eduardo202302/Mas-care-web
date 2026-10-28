import {
  Activity,
  Building2,
  Circle,
  HeartPulse,
  Kanban,
  ListChecks,
  ListTree,
  MessageSquareText,
  PackageSearch,
  Pill,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  TriangleAlert,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { components } from './api-types'

export type MenuItemDto = components['schemas']['MenuItem']
export type MeMenuItem = components['schemas']['Me']['menu'][number]
export type MenuNode<T extends { id: string; parentId: string | null }> = T & {
  children: T[]
}

/** Icons a menu item can use; the catalog stores the key (lucide name). */
export const menuIcons: Record<string, LucideIcon> = {
  activity: Activity,
  'building-2': Building2,
  circle: Circle,
  'heart-pulse': HeartPulse,
  kanban: Kanban,
  'triangle-alert': TriangleAlert,
  packages: PackageSearch,
  'list-checks': ListChecks,
  'list-tree': ListTree,
  'message-square-text': MessageSquareText,
  pill: Pill,
  'settings-2': Settings2,
  'shield-check': ShieldCheck,
  'sliders-horizontal': SlidersHorizontal,
  store: Store,
  'user-round': UserRound,
  users: Users,
}

export function menuIcon(name: string): LucideIcon {
  return menuIcons[name] ?? Circle
}

/**
 * Routes every signed-in user can open regardless of their role.
 *
 * `/panel-global` and `/traspasos` are listed here because the backend menu
 * catalog has no MenuItem row for either yet (confirmed: /api/v1/menu's
 * catalog predates this feature), so RequireRoute would 404 everyone,
 * including owner/admin, once these routes sit behind it. Until a MenuItem
 * ships for them server-side, `/traspasos` enforces its own owner/admin
 * check in TransfersPage (same NotFoundPage RequireRoute would show).
 * `/panel-global` has no role restriction — the API already scopes its
 * rows to the caller's accessible branches.
 *
 * `/informes` and `/informes/:tipo` are listed here for the same reason:
 * the backend menu catalog has no MenuItem row for the reports feature yet,
 * so RequireRoute would 404 everyone, including owner/admin. The reports
 * endpoints themselves still enforce `dashboard:read` (and `export:csv` for
 * CSV export) server-side, so this only affects whether the route renders,
 * not what data it can fetch.
 */
export const alwaysAllowedPaths = [
  '/inicio',
  '/dev/chips',
  '/panel-global',
  '/traspasos',
  '/informes',
]

const byOrder = <T extends { order: number; label: string }>(a: T, b: T) =>
  a.order - b.order || a.label.localeCompare(b.label)

/** Rebuilds the two-level tree from the flat list the API returns. */
export function buildMenuTree<
  T extends {
    id: string
    parentId: string | null
    order: number
    label: string
  },
>(items: readonly T[]): MenuNode<T>[] {
  const ids = new Set(items.map((item) => item.id))
  const childrenOf = (id: string) =>
    items.filter((item) => item.parentId === id).sort(byOrder)
  return items
    .filter((item) => !item.parentId || !ids.has(item.parentId))
    .sort(byOrder)
    .map((item) => ({ ...item, children: childrenOf(item.id) }))
}

function matches(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

/** True when the role's menu grants access to `pathname` (or a parent route). */
export function isPathAllowed(
  pathname: string,
  menu: readonly Pick<MeMenuItem, 'path' | 'canView'>[],
) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (alwaysAllowedPaths.some((path) => matches(clean, path))) return true
  return menu.some(
    (item) => item.canView && item.path !== null && matches(clean, item.path),
  )
}
