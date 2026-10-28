import { useQuery } from '@tanstack/react-query'
import { api } from './http'
import type { components } from './api-types'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<components['schemas']['Me']>('/api/v1/me'),
    retry: false,
  })
}

export function useCan(permission: string) {
  const { data } = useMe()
  return data?.permissions.includes(permission) ?? false
}
