import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton'
import { authClient } from '@/lib/auth-client'

export function RequireAuth() {
  const { data: session, isPending } = authClient.useSession()
  const location = useLocation()

  if (isPending) {
    return <AppShellSkeleton />
  }

  if (!session) {
    return <Navigate to="/acceso" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
