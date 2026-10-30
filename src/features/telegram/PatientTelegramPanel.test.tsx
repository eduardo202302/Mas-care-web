import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PatientTelegramPanel } from './PatientTelegramPanel'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Call = { url: string; method: string }

function setup(
  status: { bot_connected: boolean; linked: boolean; linked_at: string | null },
  canEdit = true,
) {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      calls.push({ url, method })
      const payload =
        method === 'POST'
          ? {
              url: 'https://t.me/farmacia_bot?start=abc123',
              expires_at: '2026-11-05T00:00:00.000Z',
            }
          : status
      return new Response(JSON.stringify(payload), {
        status: method === 'POST' ? 201 : 200,
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
      <PatientTelegramPanel patientId="p1" canEdit={canEdit} />
    </QueryClientProvider>,
  )
  return calls
}

describe('PatientTelegramPanel', () => {
  it('explains where to connect the bot when the organization has none', async () => {
    setup({ bot_connected: false, linked: false, linked_at: null })
    expect(
      await screen.findByText(/no tiene un bot de Telegram conectado/),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Generar enlace/ }),
    ).not.toBeInTheDocument()
  })

  it('creates the single-use link on demand and shows it once', async () => {
    const calls = setup({ bot_connected: true, linked: false, linked_at: null })
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', {
        name: 'Generar enlace de vinculación',
      }),
    )
    const field = await screen.findByLabelText('Enlace de Telegram')
    expect(field).toHaveValue('https://t.me/farmacia_bot?start=abc123')
    expect(calls.filter((call) => call.method === 'POST')).toHaveLength(1)
    expect(calls.find((call) => call.method === 'POST')!.url).toContain(
      '/api/v1/patients/p1/telegram-link',
    )
  })

  it('shows a linked patient and lets staff unlink only after confirming', async () => {
    const calls = setup({
      bot_connected: true,
      linked: true,
      linked_at: '2026-10-28T12:00:00.000Z',
    })
    const user = userEvent.setup()
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    )
    expect(await screen.findByText(/Vinculado/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Desvincular' }))
    expect(calls.some((call) => call.method === 'DELETE')).toBe(false)
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    await user.click(screen.getByRole('button', { name: 'Desvincular' }))
    await waitFor(() =>
      expect(calls.some((call) => call.method === 'DELETE')).toBe(true),
    )
  })

  it('hides the actions from users who cannot edit patients', async () => {
    setup({ bot_connected: true, linked: false, linked_at: null }, false)
    expect(await screen.findByText(/Sin vincular/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Generar enlace/ }),
    ).not.toBeInTheDocument()
  })
})
