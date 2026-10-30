import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConversationDialog } from './ConversationDialog'
import { PatientAutomationPanel } from './PauseAutomation'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Call = { url: string; method: string; body: unknown }

function stub(responder: (path: string, method: string) => unknown) {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      calls.push({
        url,
        method,
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      })
      return new Response(
        JSON.stringify(responder(new URL(url).pathname, method)),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }),
  )
  return calls
}
const wrap = (node: React.ReactNode) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {node}
    </QueryClientProvider>,
  )

describe('PatientAutomationPanel', () => {
  it('pauses with an optional reason, after explaining that queued notices are cancelled', async () => {
    const calls = stub(() => ({ cancelled_messages: 1 }))
    const user = userEvent.setup()
    wrap(
      <PatientAutomationPanel
        patientId="p1"
        paused={false}
        reason={null}
        canEdit
      />,
    )
    expect(screen.getByText('Activos para este paciente.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pausar Avisos' }))
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText(/Los avisos que estaban en cola se cancelan/),
    ).toBeInTheDocument()
    expect(calls).toHaveLength(0)
    await user.type(within(dialog).getByLabelText(/Motivo/), 'Pidió esperar')
    await user.click(
      within(dialog).getByRole('button', { name: 'Pausar Avisos' }),
    )
    await waitFor(() => {
      const patch = calls.find((call) => call.method === 'PATCH')
      expect(patch?.url).toContain('/api/v1/patients/p1/automation')
      expect(patch?.body).toEqual({ paused: true, reason: 'Pidió esperar' })
    })
  })

  it('resumes straight away, and shows the reason of a pause', async () => {
    const calls = stub(() => ({ cancelled_messages: 0 }))
    const user = userEvent.setup()
    wrap(
      <PatientAutomationPanel
        patientId="p1"
        paused
        reason="Pidió esperar"
        canEdit
      />,
    )
    expect(screen.getByText('Pausados para este paciente.')).toBeInTheDocument()
    expect(screen.getByText('Motivo: Pidió esperar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reanudar Avisos' }))
    await waitFor(() =>
      expect(calls.find((call) => call.method === 'PATCH')?.body).toEqual({
        paused: false,
      }),
    )
  })

  it('shows the state but no actions to users who cannot edit', () => {
    stub(() => ({}))
    wrap(
      <PatientAutomationPanel
        patientId="p1"
        paused={false}
        reason={null}
        canEdit={false}
      />,
    )
    expect(screen.getByText('Activos para este paciente.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('ConversationDialog', () => {
  it('shows notices with their delivery state and the patient replies, with the channel', async () => {
    stub((path) =>
      path.endsWith('/messages')
        ? {
            data: [
              {
                kind: 'reply',
                id: 'r1',
                at: '2026-10-28T15:00:00.000Z',
                channel: 'telegram',
                text: 'Paso mañana',
                button: null,
              },
              {
                kind: 'reply',
                id: 'r2',
                at: '2026-10-28T14:30:00.000Z',
                channel: 'whatsapp',
                text: null,
                button: 'confirm',
              },
              {
                kind: 'notice',
                id: 'n1',
                at: '2026-10-28T14:00:00.000Z',
                channel: 'whatsapp',
                status: 'read',
                attempt: 1,
                template: 'Aviso inicial',
                error: null,
              },
            ],
            next_before: null,
          }
        : {},
    )
    wrap(<ConversationDialog patientId="p1" onClose={() => undefined} />)
    expect(await screen.findByText('Paso mañana')).toBeInTheDocument()
    expect(screen.getByText('Pulsó «Confirmar»')).toBeInTheDocument()
    expect(screen.getByText(/Primer Aviso · Aviso inicial/)).toBeInTheDocument()
    expect(screen.getByText('Leído')).toBeInTheDocument()
    expect(screen.getByText(/Paciente · Telegram/)).toBeInTheDocument()
    expect(screen.getByText(/Farmacia · WhatsApp/)).toBeInTheDocument()
  })

  it('says so when there is nothing yet and offers older messages when there are more', async () => {
    stub(() => ({ data: [], next_before: null }))
    wrap(<ConversationDialog patientId="p1" onClose={() => undefined} />)
    expect(
      await screen.findByText(/Todavía no hay avisos ni respuestas/),
    ).toBeInTheDocument()
    cleanup()
    const calls = stub(() => ({
      data: [
        {
          kind: 'reply',
          id: 'r1',
          at: '2026-10-28T15:00:00.000Z',
          channel: 'whatsapp',
          text: 'Hola',
          button: null,
        },
      ],
      next_before: '2026-10-28T15:00:00.000Z',
    }))
    const user = userEvent.setup()
    wrap(<ConversationDialog patientId="p1" onClose={() => undefined} />)
    await user.click(
      await screen.findByRole('button', { name: 'Ver Mensajes Anteriores' }),
    )
    await waitFor(() =>
      expect(calls.some((call) => call.url.includes('before=2026-10-28'))).toBe(
        true,
      ),
    )
  })
})
