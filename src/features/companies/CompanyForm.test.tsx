import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompanyForm } from './CompanyForm'
import type { CompanyFormValues } from '@/schemas/company'
import type { components } from '@/lib/api-types'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function meResponse(): components['schemas']['Me'] {
  return {
    user: { id: 'user-1', name: 'Usuario', email: 'user@example.test' },
    organization: { id: 'org-1', name: 'Farmacia Demo', googleMapsApiKey: null },
    role: 'admin',
    roleId: null,
    roleName: null,
    isPlatformOwner: true,
    branches: [],
    permissions: [],
    menu: [],
  }
}

function renderForm(onSave: (values: CompanyFormValues) => Promise<void>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify(meResponse()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <CompanyForm
        linkToken="company-token"
        onSave={onSave}
        onCancel={() => undefined}
      />
    </QueryClientProvider>,
  )
}

describe('CompanyForm', () => {
  it('genera un PIN y previsualiza los links con el token de la compañía', async () => {
    renderForm(vi.fn(async () => undefined))
    const user = userEvent.setup()
    const pin = screen.getByLabelText<HTMLInputElement>('PIN')

    expect(pin.value).toMatch(/^\d{6}$/)
    await user.type(screen.getByLabelText('Dominio'), 'farmacia.test')

    expect(
      screen.getByLabelText<HTMLInputElement>('Link para registrarse').value,
    ).toBe('https://farmacia.test/registro?empresa=company-token')
    expect(
      screen.getByLabelText<HTMLInputElement>('Link para iniciar sesión').value,
    ).toBe('https://farmacia.test/acceso?empresa=company-token')
  })

  it('envía la información básica, el PIN y el dominio normalizado', async () => {
    const onSave = vi.fn(async (values: CompanyFormValues) => {
      void values
    })
    renderForm(onSave)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Nombre'), 'Farmacia Los Valles')
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'Contacto@Farmacia.com',
    )
    await user.type(screen.getByLabelText('Dominio'), 'https://farmacia.com/')
    await user.selectOptions(screen.getByLabelText('Estado'), 'inactive')
    await user.click(screen.getByRole('button', { name: 'Crear compañía' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Farmacia Los Valles',
        email: 'contacto@farmacia.com',
        logo: '',
        status: 'inactive',
        pin: screen.getByLabelText<HTMLInputElement>('PIN').value,
        domain: 'https://farmacia.com',
        address: '',
        sector: '',
        latitude: '',
        longitude: '',
        phone: '',
        ownerName: '',
        industry: '',
        type: '',
        city: '',
        state: '',
        employeeCount: '',
        description: '',
        linkedinUrl: '',
        googleMapsApiKey: '',
      }),
    )
  })
})
