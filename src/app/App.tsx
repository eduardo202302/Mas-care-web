import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import { queryClient } from '@/lib/query-client'
import { ToastProvider } from '@/components/ui/Toast'
import { installRequiredHints } from '@/lib/required-hints'

export function App() {
  useEffect(() => installRequiredHints(), [])
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
