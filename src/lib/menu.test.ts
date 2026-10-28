import { describe, expect, it } from 'vitest'
import { buildMenuTree, isPathAllowed, type MeMenuItem } from './menu'

const item = (overrides: Partial<MeMenuItem> & { id: string }): MeMenuItem => ({
  key: overrides.id,
  label: overrides.id,
  path: null,
  icon: 'circle',
  order: 0,
  parentId: null,
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  ...overrides,
})

const menu: MeMenuItem[] = [
  item({ id: 'pacientes', label: 'Pacientes', path: '/pacientes', order: 40 }),
  item({ id: 'inicio', label: 'Inicio', path: '/inicio', order: 10 }),
  item({ id: 'ajustes', label: 'Ajustes', order: 60 }),
  item({
    id: 'usuarios',
    label: 'Usuarios',
    path: '/ajustes/usuarios',
    order: 62,
    parentId: 'ajustes',
  }),
  item({
    id: 'sucursales',
    label: 'Sucursales',
    path: '/ajustes/sucursales',
    order: 61,
    parentId: 'ajustes',
  }),
]

describe('buildMenuTree', () => {
  it('ordena los ítems y agrupa los submenús bajo su padre', () => {
    const tree = buildMenuTree(menu)
    expect(tree.map((node) => node.id)).toEqual([
      'inicio',
      'pacientes',
      'ajustes',
    ])
    expect(tree[2]?.children.map((child) => child.id)).toEqual([
      'sucursales',
      'usuarios',
    ])
  })

  it('trata como raíz un ítem cuyo padre no está en la lista', () => {
    const tree = buildMenuTree([item({ id: 'x', parentId: 'missing' })])
    expect(tree.map((node) => node.id)).toEqual(['x'])
  })
})

describe('isPathAllowed', () => {
  it('permite las rutas del menú y sus subrutas', () => {
    expect(isPathAllowed('/pacientes', menu)).toBe(true)
    expect(isPathAllowed('/pacientes/importar', menu)).toBe(true)
    expect(isPathAllowed('/pacientes/abc123', menu)).toBe(true)
    expect(isPathAllowed('/ajustes/usuarios/', menu)).toBe(true)
  })

  it('rechaza rutas que el rol no tiene', () => {
    expect(isPathAllowed('/tareas', menu)).toBe(false)
    expect(isPathAllowed('/ajustes/roles', menu)).toBe(false)
    expect(isPathAllowed('/pacientes-otros', menu)).toBe(false)
  })

  it('no abre rutas de grupos ni de ítems sin permiso de ver', () => {
    expect(isPathAllowed('/ajustes', menu)).toBe(false)
    expect(
      isPathAllowed('/tareas', [
        item({ id: 'tareas', path: '/tareas', canView: false }),
      ]),
    ).toBe(false)
  })

  it('siempre permite el inicio', () => {
    expect(isPathAllowed('/inicio', [])).toBe(true)
  })
})
