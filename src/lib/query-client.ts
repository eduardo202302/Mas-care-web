import { QueryClient } from '@tanstack/react-query'

// No retries: a failed request shows its error right away instead of keeping
// the module on a loading skeleton while it retries with backoff.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
