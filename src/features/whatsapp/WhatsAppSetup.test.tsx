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
import { TemplateFormDialog } from '@/features/settings/TemplateFormDialog'
import { TemplateTestSendDialog } from '@/features/settings/TemplateTestSendDialog'
import { WhatsAppAccountCard } from './WhatsAppAccountCard'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Call = {
  url: string
  method: string
  body: Record<string, unknown> | undefined
}

function stub(
  responder: (
    path: string,
    method: string,
  ) => { status?: number; body: unknown },
) {
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
      const result = responder(new URL(url).pathname, method)
      return new Response(
        result.status === 204 ? null : JSON.stringify(result.body),
        {
          status: result.status ?? 200,
          headers: { 'Content-Type': 'application/json' },
        },
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

describe('WhatsAppAccountCard', () => {
  it('connects the number with its token and never shows the saved token', async () => {
    let connected = false
    const calls = stub((path, method) => {
      if (path === '/api/v1/automation/whatsapp-account' && method === 'PUT') {
        connected = true
        return { body: { connected: true, phone_number_id: '109876543210987' } }
      }
      return {
        body: {
          connected,
          phone_number_id: connected ? '109876543210987' : null,
        },
      }
    })
    const user = userEvent.setup()
    wrap(<WhatsAppAccountCard />)
    const connect = await screen.findByRole('button', {
      name: 'Conectar número',
    })
    expect(connect).toBeDisabled()
    await user.type(
      screen.getByLabelText('Identificador del número'),
      '109876543210987',
    )
    await user.type(
      screen.getByLabelText('Token de acceso'),
      'EAAG-token-permanente-de-meta-1234',
    )
    await user.click(connect)
    await waitFor(() => {
      const put = calls.find((call) => call.method === 'PUT')
      expect(put?.body).toEqual({
        phone_number_id: '109876543210987',
        access_token: 'EAAG-token-permanente-de-meta-1234',
      })
    })
    expect(
      await screen.findByText('109876543210987', { selector: 'strong' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByDisplayValue('EAAG-token-permanente-de-meta-1234'),
    ).not.toBeInTheDocument()
  })

  it('disconnects only after confirming', async () => {
    const calls = stub((_path, method) =>
      method === 'DELETE'
        ? { status: 204, body: null }
        : { body: { connected: true, phone_number_id: '555555' } },
    )
    const user = userEvent.setup()
    wrap(<WhatsAppAccountCard />)
    vi.stubGlobal(
      'confirm',
      vi.fn(() => false),
    )
    await user.click(await screen.findByRole('button', { name: 'Desconectar' }))
    expect(calls.some((call) => call.method === 'DELETE')).toBe(false)
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    )
    await user.click(screen.getByRole('button', { name: 'Desconectar' }))
    await waitFor(() =>
      expect(calls.some((call) => call.method === 'DELETE')).toBe(true),
    )
  })
})

describe('TemplateTestSendDialog', () => {
  it('sends the test to the typed number and says so', async () => {
    const calls = stub(() => ({ body: { sent: true } }))
    const user = userEvent.setup()
    wrap(
      <TemplateTestSendDialog
        templateId="t1"
        templateName="Aviso"
        onClose={() => undefined}
      />,
    )
    const send = screen.getByRole('button', { name: 'Enviar prueba' })
    expect(send).toBeDisabled()
    await user.type(screen.getByLabelText('Teléfono de prueba'), '809 555 0123')
    await user.click(send)
    await waitFor(() => {
      const post = calls.find((call) => call.method === 'POST')
      expect(post?.url).toContain('/api/v1/message-templates/t1/test-send')
      expect(post?.body).toEqual({ phone: '809 555 0123' })
    })
    expect(
      await screen.findByText(/Enviado\. Revisa ese teléfono/),
    ).toBeInTheDocument()
  })
})

describe('TemplateFormDialog: WhatsApp and Telegram fields', () => {
  const save = async (
    setup: (
      user: ReturnType<typeof userEvent.setup>,
      dialog: ReturnType<typeof within>,
    ) => Promise<void>,
  ) => {
    const calls = stub((path) =>
      path === '/api/v1/branches'
        ? { body: { data: [] } }
        : { body: { id: 't1' } },
    )
    const user = userEvent.setup()
    wrap(
      <TemplateFormDialog
        onClose={() => undefined}
        onSaved={() => undefined}
      />,
    )
    const dialog = within(await screen.findByRole('dialog'))
    await user.type(
      dialog.getByLabelText(/^Nombre de la Plantilla/),
      'Aviso inicial',
    )
    await user.type(dialog.getByLabelText(/^Mensaje/), 'Hola {{paciente}}')
    await setup(user, dialog)
    await user.click(dialog.getByRole('button', { name: /Crear|Guardar/ }))
    return calls
  }

  it('sends the Meta data of an approved WhatsApp template', async () => {
    const calls = await save(async (user, dialog) => {
      await user.type(
        dialog.getByLabelText(/^Nombre Registrado en Meta/),
        'aviso_reposicion',
      )
      await user.selectOptions(
        dialog.getByLabelText(/^Estado en Meta/),
        'approved',
      )
      await user.selectOptions(dialog.getByLabelText(/^Categoría/), 'utility')
      await user.selectOptions(
        dialog.getByLabelText(/^Aviso Automático al que Corresponde/),
        '2',
      )
    })
    await waitFor(() => {
      const post = calls.find(
        (call) =>
          call.method === 'POST' &&
          call.url.endsWith('/api/v1/message-templates'),
      )
      expect(post?.body).toMatchObject({
        channel: 'whatsapp',
        wa_template_name: 'aviso_reposicion',
        wa_status: 'approved',
        wa_category: 'utility',
        wa_language: 'es',
        attempt_number: 2,
      })
    })
  })

  it('blocks saving an approved template without the name registered in Meta', async () => {
    const calls = await save(async (user, dialog) => {
      await user.selectOptions(
        dialog.getByLabelText(/^Estado en Meta/),
        'approved',
      )
    })
    expect(
      screen.getByText(
        'Una plantilla aprobada necesita el nombre registrado en Meta.',
      ),
    ).toBeInTheDocument()
    expect(
      calls.some(
        (call) =>
          call.method === 'POST' && call.url.endsWith('/message-templates'),
      ),
    ).toBe(false)
  })

  it('shows no Meta fields for Telegram and sends no Meta data', async () => {
    const calls = await save(async (user, dialog) => {
      await user.selectOptions(dialog.getByLabelText(/^Canal/), 'telegram')
      expect(
        dialog.queryByLabelText(/^Nombre Registrado en Meta/),
      ).not.toBeInTheDocument()
    })
    await waitFor(() => {
      const post = calls.find(
        (call) =>
          call.method === 'POST' &&
          call.url.endsWith('/api/v1/message-templates'),
      )
      expect(post?.body).toMatchObject({
        channel: 'telegram',
        attempt_number: 1,
      })
      expect(post?.body).not.toHaveProperty('wa_status')
    })
  })
})
