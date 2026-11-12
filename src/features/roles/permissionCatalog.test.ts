import { describe, expect, it } from 'vitest'
import { allPermissionActions, permissionGroups } from './permissionCatalog'

describe('permissionCatalog', () => {
  it('lists every permission once', () => {
    expect(new Set(allPermissionActions).size).toBe(allPermissionActions.length)
  })

  it('has the 47 permissions the API understands', () => {
    expect(allPermissionActions).toHaveLength(47)
  })

  it('gives each permission a label and each group a title', () => {
    for (const group of permissionGroups) {
      expect(group.title).not.toBe('')
      for (const permission of group.permissions)
        expect(permission.label).not.toBe('')
    }
  })
})
