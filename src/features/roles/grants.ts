import type { RoleGrant } from '@/schemas/role'

export type GrantMap = Record<string, RoleGrant>

const fullAccess: RoleGrant = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
}

/** Shows or hides a screen for the role; a visible screen gets full access. */
export function setVisible(
  grants: GrantMap,
  id: string,
  visible: boolean,
): GrantMap {
  const next = { ...grants }
  if (visible) next[id] = { ...fullAccess }
  else delete next[id]
  return next
}
