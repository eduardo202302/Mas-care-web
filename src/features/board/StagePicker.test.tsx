import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import type { BoardCard } from '@/lib/board'
import { StagePicker } from './StagePicker'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const stage = (id: string, status: string, name: string, position: number) => ({ id, system_status: status, name, description: null, color: '#112233', position, cycle_count: 0 })
const stages = [stage('a', 'confirmed', 'Confirmado', 0), stage('b', 'confirmed', 'Esperando receta', 1), stage('c', 'prepared', 'Preparado', 2)]

function setup(card: object, canMove = true) {
  const calls: { url: string; method: string; body: unknown }[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : undefined })
    const body = url.includes('/pipelines/') ? { id: 'p', key: 'k', name: 'P', description: null, stages } : {}
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }))
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><StagePicker card={card as BoardCard} canMove={canMove} /></QueryClientProvider>)
  return calls
}

it('shows the cycle stage (default when none) and files it in another stage of the same column', async () => {
  const calls = setup({ cycle_id: 'c1', status: 'confirmed', stage_id: null })
  const select = await screen.findByLabelText('Etapa del ciclo')
  expect(select).toHaveValue('a')
  await userEvent.setup().selectOptions(select, 'b')
  await waitFor(() => expect(calls.find((call) => call.method === 'PATCH')?.body).toEqual({ stage_id: 'b' }))
  expect(calls.find((call) => call.method === 'PATCH')?.url).toContain('/api/v1/cycles/c1/stage')
})

it('renders nothing when the column has a single stage, and is read-only without permission', async () => {
  setup({ cycle_id: 'c2', status: 'prepared', stage_id: null })
  await waitFor(() => expect(screen.queryByLabelText('Etapa del ciclo')).not.toBeInTheDocument())
  cleanup()
  setup({ cycle_id: 'c3', status: 'confirmed', stage_id: 'b' }, false)
  expect(await screen.findByLabelText('Etapa del ciclo')).toBeDisabled()
})
