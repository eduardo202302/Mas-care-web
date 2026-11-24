import { chooseOption } from '@/test/select'
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
  { id: 'role-master', name: 'Master', allBranches: true },
  { id: 'role-cashier', name: 'Cajero', allBranches: false },
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
  await user.type(screen.getByLabelText('Nombre Completo'), 'Ana Operadora')
  await user.type(screen.getByLabelText('Usuario'), 'ana.op')
  await user.type(
    screen.getByLabelText('Correo Electrónico'),
    'Ana@Example.com',
  )
  await user.type(screen.getByLabelText('WhatsApp'), '8095551234')
  await user.type(
    screen.getByLabelText('Contraseña Temporal'),
    'Password-2026!',
  )
}

describe('UserForm', () => {
  it('genera un PIN de Recuperación automáticamente', () => {
    renderForm(vi.fn(async () => undefined))

    expect(
      screen.getByLabelText<HTMLInputElement>('PIN de Recuperación').value,
    ).toMatch(/^\d{6}$/)
  })

  it('lista solo los roles creados, sin los roles integrados', async () => {
    renderForm(vi.fn(async () => undefined))

    await userEvent.setup().click(screen.getByLabelText('Rol'))
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
    await chooseOption(user, screen.getByLabelText('Rol'), 'role-cashier')
    await user.click(screen.getByRole('button', { name: /Sucursales/ }))
    await user.click(await screen.findByRole('option', { name: /Centro/ }))
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Ana Operadora',
        username: 'ana.op',
        email: 'ana@example.com',
        password: 'Password-2026!',
        phone: '(809) 555-1234',
        pin: screen.getByLabelText<HTMLInputElement>('PIN de Recuperación')
          .value,
        roleId: 'role-cashier',
        branchIds: ['branch-1'],
      }),
    )
  })

  it('exige el WhatsApp y lo indica en español', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nombre Completo'), 'Ana Operadora')
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }))

    expect(await screen.findAllByText('Campo requerido.')).not.toHaveLength(0)
    expect(screen.getByLabelText('WhatsApp')).toBeRequired()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('exige elegir un rol', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await fillIdentity(user)
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }))

    expect(await screen.findByText('Selecciona un rol.')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('exige un usuario válido', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nombre Completo'), 'Ana Operadora')
    await user.type(screen.getByLabelText('Usuario'), 'a@b')
    await user.type(
      screen.getByLabelText('Correo Electrónico'),
      'ana@example.com',
    )
    await user.type(
      screen.getByLabelText('Contraseña Temporal'),
      'Password-2026!',
    )
    await chooseOption(user, screen.getByLabelText('Rol'), 'role-master')
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }))

    expect(
      await screen.findByText(/Usa letras, números, espacio, punto, guion/),
    ).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('exige una sucursal para roles sin acceso a todas las sucursales', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await fillIdentity(user)
    await chooseOption(user, screen.getByLabelText('Rol'), 'role-cashier')
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }))

    expect(
      await screen.findByText('Asigna al menos una sucursal.'),
    ).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('permite crear un usuario con un rol de todas las sucursales sin elegir sucursales', async () => {
    const onSave = vi.fn(async (values: UserCreateValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await fillIdentity(user)
    await chooseOption(user, screen.getByLabelText('Rol'), 'role-master')
    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          roleId: 'role-master',
          branchIds: [],
        }),
      ),
    )
  })

  it('en edición deshabilita Guardar hasta que haya cambios', async () => {
    render(
      <UserForm
        mode="edit"
        initialValues={{
          name: 'Ana',
          username: 'ana',
          email: 'ana@example.com',
          phone: '',
          roleId: 'role-master',
          branchIds: ['branch-1'],
        }}
        branches={branches}
        roles={roles}
        onSave={async () => undefined}
        onCancel={() => undefined}
      />,
    )
    const user = userEvent.setup()
    const save = screen.getByRole('button', { name: 'Guardar Cambios' })
    expect(save).toBeDisabled()

    await user.type(screen.getByLabelText('Nombre Completo'), 'x')
    expect(save).toBeEnabled()

    await user.type(screen.getByLabelText('Nombre Completo'), '{Backspace}')
    expect(save).toBeDisabled()
  })
})
