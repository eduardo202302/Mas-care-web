import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/http'

export type DoseUnit = { id: string; name: string }

export const DOSE_UNITS_KEY = ['dose-units'] as const

export function useDoseUnits() {
  return useQuery({
    queryKey: DOSE_UNITS_KEY,
    queryFn: () => api<{ data: DoseUnit[] }>('/api/v1/dose-units'),
    select: (result) => result.data,
    staleTime: 60_000,
  })
}
