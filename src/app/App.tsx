import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import { queryClient } from '@/lib/query-client'
import { ToastProvider } from '@/components/ui/Toast'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Suspense
        fallback={
          <div className="text-muted grid min-h-screen place-items-center text-sm">
            Cargando MAS CARE…
          </div>
        }
      >
          <RouterProvider router={router} />
        </Suspense>
      </ToastProvider>
    </QueryClientProvider>
  )
}
