import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UserForm } from './UserForm'
import type { UserCreateValues } from '@/schemas/user'

afterEach(() => {
  cleanup()
})

const branches = [{ id: 'branch-1', name: 'Centro' }]
const roles = [
  { id: 'role-master', name: 'Master', baseRole: 'admin' },
  { id: 'role-cashier', name: 'Cajero', baseRole: 'operator' },
]

function renderForm(onSave: (values: UserCreateValues) => Promise<void>) {
  render(
    <UserForm
      branches={branches}
      roles={roles}
      onSave={onSave}
      onCancel={() => undefined}
    />,
  )
}

async function fillIdentity(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Ana Operadora')
  await user.type(screen.getByLabelText('Usuario'), 'ana.op')
  await user.type(
    screen.getByLabelText('Correo electrónico'),
    'Ana@Example.com',
  )
  await user.type(
    screen.getByLabelText('Contraseña temporal'),
    'Password-2026!',
  )
}

describe('UserForm', () => {
  it('genera un PIN de recuperación automáticamente', () => {
    renderForm(vi.fn(async () => undefined))

    expect(
      screen.getByLabelText<HTMLInputElement>('PIN de recuperación').value,
    ).toMatch(/^\d{6}$/)
  })

  it('lista solo los roles creados, sin los roles integrados', () => {
    renderForm(vi.fn(async () => undefined))

    const options = screen
      .getAllByRole('option')
      .map((option) => option.textContent)
    expect(options).toEqual(['Selecciona un rol', 'Master', 'Cajero'])
    expect(screen.queryByLabelText('Rol personalizado')).not.toBeInTheDocument()
  })

  it('envía nombre, usuario, correo normalizado, rol y sucursales', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await fillIdentity(user)
    await user.selectOptions(screen.getByLabelText('Rol'), 'role-cashier')
    await user.click(screen.getByLabelText('Centro'))
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Ana Operadora',
        username: 'ana.op',
        email: 'ana@example.com',
        password: 'Password-2026!',
        phone: '',
        pin: screen.getByLabelText<HTMLInputElement>('PIN de recuperación')
          .value,
        role: 'operator',
        roleId: 'role-cashier',
        branchIds: ['branch-1'],
      }),
    )
  })

  it('exige elegir un rol', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await fillIdentity(user)
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(await screen.findByText('Selecciona un rol.')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('exige un usuario válido', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Operadora')
    await user.type(screen.getByLabelText('Usuario'), 'a b')
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@example.com',
    )
    await user.type(
      screen.getByLabelText('Contraseña temporal'),
      'Password-2026!',
    )
    await user.selectOptions(screen.getByLabelText('Rol'), 'role-master')
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(
      await screen.findByText(/Usa letras, números, punto, guion/),
    ).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('exige una sucursal para roles que no son administradores', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await fillIdentity(user)
    await user.selectOptions(screen.getByLabelText('Rol'), 'role-cashier')
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

    expect(
      await screen.findByText('Asigna al menos una sucursal.'),
    ).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('permite crear un usuario con rol administrador sin sucursales', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await fillIdentity(user)
    await user.selectOptions(screen.getByLabelText('Rol'), 'role-master')
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'admin',
          roleId: 'role-master',
          branchIds: [],
        }),
      ),
    )
  })
})
