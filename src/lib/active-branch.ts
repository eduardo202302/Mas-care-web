import { useEffect } from 'react'
import { useMe } from '@/lib/permissions'
import { useUiStore } from '@/stores/ui-store'

/**
 * Branch the user is working in (chosen in the workspace selector). Lists
 * must only ask for this branch's data. `ready` turns true once the branch is
 * known to belong to the current organization, or once we know the
 * organization has no branches, so queries never fire first for "all
 * branches" or for a branch left over from another company.
 *
 * Branches come from `/me`, which the route guard already loads, so lists
 * start as soon as it answers instead of waiting on a second request.
 */
export function useActiveBranch() {
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const setActiveBranchId = useUiStore((state) => state.setActiveBranchId)
  const { data: me } = useMe()
  const list = me?.branches
  const showAll = activeBranchId === 'all'
  const current = list?.find((branch) => branch.id === activeBranchId)
  const firstBranchId = list?.[0]?.id

  // Same rule as the workspace selector, so screens settle on a branch even
  // when rendered on their own. Skipped once the user has chosen "Todas".
  useEffect(() => {
    if (showAll) return
    if (firstBranchId && !current) setActiveBranchId(firstBranchId)
  }, [showAll, firstBranchId, current, setActiveBranchId])

  return {
    branchId: showAll ? undefined : current?.id,
    ready:
      showAll ||
      Boolean(current) ||
      (list !== undefined && list.length === 0),
  }
}
