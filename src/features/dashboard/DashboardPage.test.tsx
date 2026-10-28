import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DashboardPage from './DashboardPage'

const row = {
  treatment_id: 'treatment-1',
  patient: {
    id: 'patient-1',
    full_name: 'Ana Pérez',
    phone: '3001234567',
    phone_has_whatsapp: true,
    preferred_channel: 'whatsapp',
    reminder_consent: true,
  },
  medication: { id: 'medication-1', name: 'Losartán' },
  branch: { id: 'branch-1', name: 'Centro' },
  coverage_end_on: '2026-10-26',
  prescription_expires_on: null,
  last_delivery_on: null,
  days_remaining: 0,
  derived_status: 'vence_pronto',
  prescription_flag: false,
  contact: {
    phone: '3001234567',
    phone_has_whatsapp: true,
    preferred_channel: 'whatsapp',
    reminder_consent: true,
  },
}

const counts = {
  today_refills: 3,
  due_soon: 2,
  overdue: 1,
  pending_pickups: 0,
  prescriptions_to_renew: 4,
  no_response: 5,
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('DashboardPage', () => {
  it('muestra los seis indicadores y la lista de la categoría seleccionada', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const path = String(input)
        let body: unknown
        if (path.includes('/api/v1/me')) {
          body = {
            permissions: ['dashboard:read', 'treatments:write'],
            branches: [{ id: 'branch-1', name: 'Centro' }],
          }
        } else if (path.includes('/api/v1/branches')) {
          body = { data: [{ id: 'branch-1', name: 'Centro' }] }
        } else if (path.includes('/api/v1/dashboard/list')) {
          body = { card: 'today_refills', branch_id: null, data: [row] }
        } else if (path.includes('/api/v1/dashboard')) {
          body = {
            branch_id: null,
            generated_at: '2026-10-26T12:00:00.000Z',
            counts,
            lists: {
              today_refills: [row],
              due_soon: [],
              overdue: [],
              pending_pickups: [],
              prescriptions_to_renew: [],
              no_response: [],
            },
          }
        } else {
          body = { data: [] }
        }
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <DashboardPage />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(
      screen.getAllByRole('button', { name: /Hoy/ }).length,
    ).toBeGreaterThan(0)
    await waitFor(() => {
      const card = screen.getByText('Hoy').closest('button')
      expect(within(card!).getByText('3')).toBeInTheDocument()
    })
    const overdueCard = screen.getByText('Vencidos').closest('button')
    expect(within(overdueCard!).getByText('1')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0),
    )
    expect(screen.getAllByText(/Losartán/).length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: 'Avisar' }).length,
    ).toBeGreaterThan(0)
  })
})
