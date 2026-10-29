import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import JobsPage from './JobsPage'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('shows each job with its state, run and failure counts', async () => {
  const base = { last_started_at: null, last_error: null, last_failure_at: null }
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ data: [
    { ...base, name: 'planificar-avisos', runs: 10, failures: 0, last_finished_at: '2026-10-28T12:00:00.000Z', last_status: 'ok', late: false },
    { ...base, name: 'enviar-aviso', runs: 5, failures: 2, last_finished_at: '2026-10-28T12:00:00.000Z', last_status: 'failed', last_error: 'TypeError', last_failure_at: '2026-10-28T12:00:00.000Z', late: false },
    { ...base, name: 'procesar-entrantes', runs: 0, failures: 0, last_finished_at: null, last_status: null, late: true },
  ] }), { status: 200, headers: { 'Content-Type': 'application/json' } })))
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><JobsPage /></QueryClientProvider>)
  expect(await screen.findByText('planificar-avisos')).toBeInTheDocument()
  expect(screen.getByText('Al día')).toBeInTheDocument()
  expect(screen.getByText('Falló la última vez')).toBeInTheDocument()
  expect(screen.getByText(/TypeError/)).toBeInTheDocument()
  expect(screen.getByText('Atrasado')).toBeInTheDocument()
})
