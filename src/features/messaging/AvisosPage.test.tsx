import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AvisosPage from './AvisosPage'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Call = { url: string; method: string; body: unknown }

const row = (id: string, status: string, extra: object = {}) => ({
  id,
  status,
  channel: 'whatsapp',
  attempt_number: 1,
  attempts: 0,
  last_error: null,
  scheduled_for: '2026-10-28T14:00:00.000Z',
  sent_at: null,
  created_at: '2026-10-28T14:00:00.000Z',
  patient: { id: `p-${id}`, name: `Paciente ${id}` },
  template: { id: 't1', name: 'Aviso' },
  ...extra,
})

function setup(permissions: string[]) {
  const calls: Call[] = []
  const me = {
    user: { id: 'u1', name: 'Dueña', email: 'o@example.test' },
    organization: { id: 'org', name: 'Farmacia' },
    role: 'owner',
    roleId: null,
    roleName: null,
    isPlatformOwner: false,
    branches: [],
    permissions,
    menu: [],
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const path = new URL(url).pathname
      const method = init?.method ?? 'GET'
      calls.push({
        url,
        method,
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      })
      let payload: unknown = {}
      if (path === '/api/v1/me') payload = me
      else if (path === '/api/v1/outbox')
        payload = {
          data: [
            row('a', 'pending'),
            row('b', 'failed', { last_error: 'tg_403', channel: 'telegram' }),
            row('c', 'sent', { sent_at: '2026-10-28T14:05:00.000Z' }),
          ],
          next_cursor: null,
        }
      else if (path === '/api/v1/inbound/unassigned')
        payload = {
          data: [
            {
              id: 'r1',
              channel: 'whatsapp',
              from_phone: '18095550000',
              text: 'Hola, soy el hijo',
              button: null,
              received_at: '2026-10-28T15:00:00.000Z',
            },
          ],
        }
      else if (path === '/api/v1/patients')
        payload = {
          data: [{ id: 'pat1', fullName: 'Ana Pérez', documentId: '123' }],
        }
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>
        <AvisosPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return calls
}

describe('AvisosPage', () => {
  it('lists the queue with readable states and explains error codes', async () => {
    setup(['outbox:view', 'outbox:retry', 'inbound:assign'])
    expect(await screen.findByText('Paciente a')).toBeInTheDocument()
    // The same words are also options of the filter, so look inside the table.
    const table = within(screen.getByRole('table'))
    expect(table.getByText('Pendiente')).toBeInTheDocument()
    expect(table.getByText('Fallido')).toBeInTheDocument()
    expect(
      table.getByText('El paciente bloqueó el bot de Telegram'),
    ).toBeInTheDocument()
    expect(table.getByText('Telegram')).toBeInTheDocument()
  })

  it('offers cancel for pending, retry for failed and nothing for sent, calling the API', async () => {
    const calls = setup(['outbox:view', 'outbox:retry'])
    const user = userEvent.setup()
    await screen.findByText('Paciente a')
    expect(
      screen.queryByRole('button', { name: 'Cancelar el aviso de Paciente c' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Reintentar el aviso de Paciente c',
      }),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Cancelar el aviso de Paciente a' }),
    )
    await waitFor(() =>
      expect(
        calls.some(
          (call) =>
            call.method === 'POST' &&
            call.url.endsWith('/api/v1/outbox/a/cancel'),
        ),
      ).toBe(true),
    )
    await user.click(
      screen.getByRole('button', { name: 'Reintentar el aviso de Paciente b' }),
    )
    await waitFor(() =>
      expect(
        calls.some(
          (call) =>
            call.method === 'POST' &&
            call.url.endsWith('/api/v1/outbox/b/retry'),
        ),
      ).toBe(true),
    )
  })

  it('hides the actions and the unassigned tab without the permissions', async () => {
    setup(['outbox:view'])
    await screen.findByText('Paciente a')
    expect(
      screen.queryByRole('button', { name: /Cancelar el aviso/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: 'Respuestas sin asignar' }),
    ).not.toBeInTheDocument()
  })

  it('sends the status filter to the API', async () => {
    const calls = setup(['outbox:view'])
    const user = userEvent.setup()
    await screen.findByText('Paciente a')
    // El filtro vive ahora en el diálogo "Filtro Avanzado" (mismo diseño que el tablero).
    await user.click(screen.getByRole('button', { name: /filtro avanzado/i }))
    const dialog = await screen.findByRole('dialog')
    await user.selectOptions(
      within(dialog).getByLabelText('Filtrar por estado'),
      'failed',
    )
    await user.click(
      within(dialog).getByRole('button', { name: /aplicar filtros/i }),
    )
    await waitFor(() =>
      expect(calls.some((call) => call.url.includes('status=failed'))).toBe(
        true,
      ),
    )
  })

  it('assigns an unmatched reply to a chosen patient', async () => {
    const calls = setup(['outbox:view', 'inbound:assign'])
    const user = userEvent.setup()
    await screen.findByText('Paciente a')
    await user.click(
      await screen.findByRole('tab', { name: 'Respuestas sin asignar' }),
    )
    expect(await screen.findByText('Hola, soy el hijo')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Asignar a un paciente' }),
    )
    const dialog = await screen.findByRole('dialog')
    const assign = within(dialog).getByRole('button', { name: 'Asignar' })
    expect(assign).toBeDisabled()
    await user.type(within(dialog).getByLabelText('Buscar paciente'), 'Ana')
    await user.click(
      await within(dialog).findByRole('option', { name: /Ana Pérez/ }),
    )
    await user.click(assign)
    await waitFor(() => {
      const post = calls.find(
        (call) =>
          call.method === 'POST' &&
          call.url.endsWith('/api/v1/inbound/r1/assign'),
      )
      expect(post?.body).toEqual({ patient_id: 'pat1' })
    })
  })
})
