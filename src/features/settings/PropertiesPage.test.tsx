import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import PropertiesPage from './PropertiesPage'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const property = (id: string, label: string, position: number) => ({
  id,
  entity: 'patient',
  key: id,
  label,
  type: 'short_text',
  required: false,
  options: [],
  groupName: 'General',
  position,
  archivedAt: null,
})

it('moves a property up by renumbering positions with PATCH', async () => {
  const patches: { url: string; body: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        patches.push({
          url: String(input),
          body: JSON.parse(String(init.body)),
        })
        return new Response('{}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(
        JSON.stringify({
          data: [property('aa', 'Seguro', 0), property('bb', 'Peso', 1)],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }),
  )
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <PropertiesPage />
    </QueryClientProvider>,
  )
  const user = userEvent.setup()
  expect(
    await screen.findByRole('button', { name: 'Subir Seguro' }),
  ).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Bajar Peso' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Subir Peso' }))
  await waitFor(() => expect(patches).toHaveLength(2))
  expect(
    patches.map((patch) => [patch.url.split('/').pop(), patch.body]),
  ).toEqual([
    ['bb', { position: 0 }],
    ['aa', { position: 1 }],
  ])
})
