import { Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { isPathAllowed } from '@/lib/menu'
import { useMe } from '@/lib/permissions'
import { NotFoundPage } from './NotFoundPage'

/**
 * Blocks routes the user's role does not include in its menu by showing a 404
 * in place. This only shapes the UI; the API enforces permissions on its own.
 */
export function RequireRoute() {
  const { data: me, isPending, isError } = useMe()
  const location = useLocation()

  if (isPending) {
    return (
      <div role="status" aria-busy="true" aria-label="Cargando…">
        <Skeleton className="h-9 w-64" />
      </div>
    )
  }
  // If the context cannot be loaded the pages show their own errors.
  if (isError || !me) return <Outlet />

  if (!isPathAllowed(location.pathname, me.menu)) return <NotFoundPage />
  return <Outlet />
}
