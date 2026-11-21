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

/** Branches the user can assign records to: all of them, or only those they belong to. */
export function useAccessibleBranches<T extends { id: string }>(
  branches: T[],
): T[] {
  const { data: me } = useMe()
  if (!me || me.allBranches) return branches
  const memberIds = new Set(me.branches.map(({ id }) => id))
  return branches.filter((branch) => memberIds.has(branch.id))
}
