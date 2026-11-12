import { expect, type Page } from '@playwright/test'

// The app has no built-in roles. These specs need users with limited access, so each one
// creates an ordinary role with the permissions below (the owner registered by the spec
// holds Master and can grant any of them) and then assigns it to the user.
export type LimitedRole = 'pharmacist' | 'operator' | 'read_only'

const permissions: Record<LimitedRole, string[]> = {
  pharmacist: [
    'branches:read', 'patients:read', 'patients:write', 'patients:archive',
    'medications:read', 'medications:write', 'treatments:read', 'treatments:write', 'treatments:manage',
    'dashboard:read', 'tasks:read', 'tasks:write', 'templates:read', 'templates:write',
    'audit:read', 'cycle:move', 'cycle:edit-date', 'stock:mark',
    'incident:create', 'incident:move', 'incident:resolve',
    'outbox:view', 'outbox:retry', 'inbound:assign', 'patient:transfer',
    'doctors:read', 'doctors:write', 'specialties:read', 'specialties:write',
    'medical-centers:read', 'medical-centers:write', 'health-conditions:read', 'health-conditions:write',
    'dose:log', 'dose:correct', 'inventory:purchase', 'inventory:adjust',
  ],
  operator: [
    'branches:read', 'patients:read', 'patients:write', 'medications:read',
    'treatments:read', 'treatments:write', 'dashboard:read', 'tasks:read', 'tasks:write', 'templates:read',
    'cycle:move', 'stock:mark', 'incident:create', 'incident:move',
    'inbound:assign',
    'doctors:read', 'specialties:read', 'medical-centers:read', 'health-conditions:read',
    'dose:log', 'inventory:purchase',
  ],
  read_only: [
    'branches:read', 'patients:read', 'medications:read', 'treatments:read',
    'dashboard:read', 'tasks:read', 'templates:read',
    'doctors:read', 'specialties:read', 'medical-centers:read', 'health-conditions:read',
  ],
}

const names: Record<LimitedRole, string> = {
  pharmacist: 'Prueba Farmacéutico',
  operator: 'Prueba Operador',
  read_only: 'Prueba Solo lectura',
}

/** Returns the id of the limited role, creating it on first use. */
export async function ensureLimitedRole(page: Page, api: string, role: LimitedRole): Promise<string> {
  const list = await page.request.get(`${api}/api/v1/roles`)
  expect(list.status()).toBe(200)
  const existing = ((await list.json()) as { data: { id: string; name: string }[] }).data
    .find((candidate) => candidate.name === names[role])
  if (existing) return existing.id
  const created = await page.request.post(`${api}/api/v1/roles`, {
    data: { name: names[role], permissions: permissions[role], allBranches: false, items: [] },
  })
  expect(created.status()).toBe(201)
  return ((await created.json()) as { id: string }).id
}
