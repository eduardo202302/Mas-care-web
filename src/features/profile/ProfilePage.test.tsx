import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from './ProfilePage'

const changePassword = vi.hoisted(() => vi.fn())
const sendVerificationEmail = vi.hoisted(() => vi.fn())
vi.mock('@/lib/auth-client', () => ({ authClient: { changePassword, sendVerificationEmail } }))

afterEach(() => {
  cleanup()
  changePassword.mockReset()
  vi.unstubAllGlobals()
})

function setup(profile: object) {
  const me = {
    user: { id: 'u1', name: 'Ana Pérez', email: 'ana@example.test' },
    organization: { id: 'org', name: 'Farmacia Demo' },
    role: 'pharmacist', roleId: null, roleName: 'Farmacéutico', isPlatformOwner: false, branches: [], permissions: ['patients:read'], menu: [],
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(String(input)).pathname
      const payload = path === '/api/v1/me' ? me : profile
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }),
  )
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ProfilePage />
    </QueryClientProvider>,
  )
}

const baseProfile = { id: 'u1', name: 'Ana Pérez', username: 'ana', email: 'ana@example.test', phone: '8095550000', role: 'pharmacist', roleName: 'Farmacéutico', branches: [{ id: 'b1', name: 'Centro' }] }

describe('ProfilePage', () => {
  it('shows the user data and keeps the PIN hidden until asked', async () => {
    setup({ ...baseProfile, pin: '123456', pinUpdatedAt: '2026-10-28T12:00:00.000Z' })
    const user = userEvent.setup()
    expect(await screen.findByText('Farmacia Demo')).toBeInTheDocument()
    expect(await screen.findByText('Centro')).toBeInTheDocument()
    expect(await screen.findByText('8095550000')).toBeInTheDocument()
    const pin = await screen.findByLabelText('PIN de recuperación')
    expect(pin).toHaveTextContent('••••••')
    expect(screen.queryByText('123456')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mostrar' }))
    expect(pin).toHaveTextContent('123456')
    await user.click(screen.getByRole('button', { name: 'Ocultar' }))
    expect(pin).toHaveTextContent('••••••')
  })

  it('offers to resend the verification link only while the email is unverified', async () => {
    sendVerificationEmail.mockResolvedValue({ data: {}, error: null })
    setup({ ...baseProfile, emailVerified: false, pin: null })
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Enviar enlace de verificación' }))
    await waitFor(() => expect(sendVerificationEmail).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@example.test' })))
    expect(await screen.findByRole('button', { name: 'Enlace enviado' })).toBeDisabled()
  })

  it('hides the verification notice for verified emails', async () => {
    setup({ ...baseProfile, emailVerified: true, pin: null })
    await screen.findByText('8095550000')
    expect(screen.queryByText(/aún no está verificado/)).not.toBeInTheDocument()
  })

  it('says so when there is no PIN yet', async () => {
    setup({ ...baseProfile, pin: null })
    expect(await screen.findByText(/Todavía no tienes PIN/)).toBeInTheDocument()
  })

  it('changes the password only with a matching new password of at least 8 characters, signing out other devices', async () => {
    changePassword.mockResolvedValue({ data: {}, error: null })
    setup({ ...baseProfile, pin: '123456' })
    const user = userEvent.setup()
    const submit = await screen.findByRole('button', { name: 'Cambiar contraseña' })
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText(/Contraseña actual/), 'vieja-clave-1')
    await user.type(screen.getByLabelText(/^Nueva contraseña/), 'corta')
    expect(submit).toBeDisabled()
    expect(screen.getByText(/al menos 8 caracteres/)).toBeInTheDocument()
    await user.clear(screen.getByLabelText(/^Nueva contraseña/))
    await user.type(screen.getByLabelText(/^Nueva contraseña/), 'clave-nueva-segura')
    await user.type(screen.getByLabelText(/^Repite/), 'otra-distinta')
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(submit).toBeDisabled()
    await user.clear(screen.getByLabelText(/^Repite/))
    await user.type(screen.getByLabelText(/^Repite/), 'clave-nueva-segura')
    await user.click(submit)
    await waitFor(() => expect(changePassword).toHaveBeenCalledWith({ currentPassword: 'vieja-clave-1', newPassword: 'clave-nueva-segura', revokeOtherSessions: true }))
    expect(await screen.findByText('Contraseña cambiada.')).toBeInTheDocument()
  })

  it('shows a clear error when the current password is wrong', async () => {
    changePassword.mockResolvedValue({ data: null, error: { message: 'Invalid password' } })
    setup({ ...baseProfile, pin: null })
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/Contraseña actual/), 'mal')
    await user.type(screen.getByLabelText(/^Nueva contraseña/), 'clave-nueva-segura')
    await user.type(screen.getByLabelText(/^Repite/), 'clave-nueva-segura')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Revisa la contraseña actual/)
    expect(screen.queryByText('Contraseña cambiada.')).not.toBeInTheDocument()
  })
})
