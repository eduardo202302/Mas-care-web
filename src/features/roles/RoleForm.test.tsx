import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MenuItemDto } from '@/lib/menu'
import { RoleForm, type RoleSavePayload } from './RoleForm'

afterEach(() => {
  cleanup()
})

const catalog: MenuItemDto[] = [
  {
    id: 'menu_pacientes',
    numericId: '1',
    key: 'pacientes',
    label: 'Pacientes',
    path: '/pacientes',
    icon: 'users',
    order: 1,
    isActive: true,
    permission: null,
    parentId: null,
  },
]

describe('RoleForm', () => {
  it('no muestra la sección de permisos, solo pantallas', () => {
    render(<RoleForm catalog={catalog} onSave={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByText('Permisos')).toBeNull()
    expect(screen.getByText('Pantallas Permitidas')).toBeTruthy()
  })

  it('no deja crear un rol sin pantallas', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<RoleForm catalog={catalog} onSave={onSave} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/Nombre/), 'Cajero')
    await user.click(screen.getByRole('button', { name: 'Crear Rol' }))
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /al menos una pantalla/i,
    )
    expect(onSave).not.toHaveBeenCalled()
  })

  it('guarda cuando hay una pantalla seleccionada', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<RoleForm catalog={catalog} onSave={onSave} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/Nombre/), 'Cajero')
    await user.click(screen.getByLabelText('Ver Pacientes'))
    await user.click(screen.getByRole('button', { name: 'Crear Rol' }))
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    expect((onSave.mock.calls[0]?.[0] as RoleSavePayload).items).toEqual([
      expect.objectContaining({ menuItemId: 'menu_pacientes', canView: true }),
    ])
    expect(
      (onSave.mock.calls[0]?.[0] as RoleSavePayload).values,
    ).not.toHaveProperty('permissions')
  })

  describe('edición sin cambios', () => {
    const role = {
      id: 'r1',
      numericId: '1',
      key: 'cajero',
      name: 'Cajero',
      description: null,
      permissions: [],
      allBranches: false,
      isSystem: false,
      isActive: true,
      memberCount: 0,
      items: [
        {
          menuItemId: 'menu_pacientes',
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        },
      ],
    }

    it('deshabilita Guardar hasta que hay cambios y al revertirlos', async () => {
      const user = userEvent.setup()
      render(
        <RoleForm
          role={role}
          catalog={catalog}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      const save = screen.getByRole('button', { name: 'Guardar Cambios' })
      expect((save as HTMLButtonElement).disabled).toBe(true)
      await user.type(screen.getByLabelText(/Nombre/), 'x')
      expect((save as HTMLButtonElement).disabled).toBe(false)
      await user.type(screen.getByLabelText(/Nombre/), '{Backspace}')
      expect((save as HTMLButtonElement).disabled).toBe(true)
    })

    it('cuenta el cambio de pantallas como modificación', async () => {
      const user = userEvent.setup()
      render(
        <RoleForm
          role={role}
          catalog={catalog}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      const save = screen.getByRole('button', { name: 'Guardar Cambios' })
      await user.click(screen.getByLabelText('Ver Pacientes'))
      expect((save as HTMLButtonElement).disabled).toBe(false)
      await user.click(screen.getByLabelText('Ver Pacientes'))
      expect((save as HTMLButtonElement).disabled).toBe(true)
    })
  })
})
