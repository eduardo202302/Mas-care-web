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
import { CycleTable } from './CycleTable'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const card = (id: string, status: string, closedAt: string | null = null) => ({
  cycle_id: id,
  treatment_id: `t-${id}`,
  version: 1,
  status,
  patient: {
    id: `p-${id}`,
    nombre: `Paciente ${id}`,
    full_name: `Paciente ${id}`,
  },
  medication: {
    id: 'm1',
    nombre: 'Medicamento demo',
    name: 'Medicamento demo',
    presentacion: '10 mg',
    presentation: '10 mg',
  },
  expected_on: '2026-11-01',
  derived_status: 'al_dia',
  days_remaining: 10,
  prescription_flag: false,
  responsible_user_id: null,
  responsible: null,
  branch: {
    id: 'b1',
    nombre: 'Centro',
    name: 'Centro',
    label_color: '#0e7c86',
  },
  stock_level: null,
  stock_reviewed_at: null,
  board_position: null,
  closed_at: closedAt,
  stage_id: null as string | null,
  treatment_custom_values: { dosis: 'Alta' } as Record<string, unknown>,
})

const stage = (id: string, status: string, name: string, position: number) => ({
  id,
  system_status: status,
  name,
  description: null,
  color: '#112233',
  position,
  cycle_count: 0,
})
const pipeline = {
  id: 'p',
  key: 'refill_cycles',
  name: 'Ciclos',
  description: null,
  stages: [
    stage('s1', 'to_notify', 'Por avisar', 0),
    stage('s2', 'to_notify', 'Esperando receta', 1),
    stage('s3', 'notified', 'Avisado', 2),
  ],
}

type Call = { url: string; method: string; body: unknown }

function setup(permissions: string[], batch = true) {
  const calls: Call[] = []
  const me = {
    user: { id: 'u1', name: 'Dueña', email: 'owner@example.test' },
    organization: { id: 'org-1', name: 'Farmacia Demo' },
    role: 'owner',
    roleId: null,
    roleName: null,
    isPlatformOwner: false,
    branches: [{ id: 'b1', name: 'Centro' }],
    permissions,
    menu: [],
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const path = new URL(url).pathname
      const method = init?.method ?? 'GET'
      const body = init?.body ? JSON.parse(String(init.body)) : undefined
      calls.push({ url, method, body })
      let payload: unknown = {}
      if (path === '/api/v1/me') payload = me
      else if (path === '/api/v1/cycles/batch')
        payload = {
          action: body.action,
          requested: body.ids.length,
          applied: body.ids.length,
          skipped: [],
          blocked_out_of_stock: [],
        }
      else if (path === '/api/v1/pipelines/refill-cycles') payload = pipeline
      else if (path === '/api/v1/custom-properties')
        payload = {
          data: [
            {
              id: 'cp1',
              entity: 'treatment',
              key: 'dosis',
              label: 'Dosis especial',
              type: 'short_text',
              required: false,
              options: [],
              groupName: 'General',
              position: 0,
              archivedAt: null,
            },
          ],
        }
      else if (path === '/api/v1/cycles')
        payload = {
          status: null,
          data: [
            { ...card('a', 'to_notify'), stage_id: 's2' },
            card('b', 'notified'),
            card('c', 'delivered', '2026-10-30T00:00:00Z'),
          ],
          total: 3,
          page: 1,
          rows: 15,
        }
      else if (path === '/api/v1/saved-views' && method === 'POST')
        payload = {
          id: 'v1',
          name: body.name,
          entity: body.entity,
          filters: {},
          columns: body.columns ?? [],
          sort: {},
          isDefault: false,
        }
      else if (path === '/api/v1/saved-views') payload = { data: [] }
      else if (path === '/api/v1/users')
        payload = { data: [{ id: 'u1', name: 'Dueña' }] }
      else payload = { data: [] }
      return new Response(JSON.stringify(payload), {
        status: path === '/api/v1/saved-views' && method === 'POST' ? 201 : 200,
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
        <CycleTable
          filters={{}}
          canMove={batch}
          canWrite={batch}
          onMove={() => undefined}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return calls
}

describe('CycleTable', () => {
  it('shows the stage of each cycle (default when none) and the treatment properties', async () => {
    setup(['treatments:read'], false)
    await screen.findByText('Paciente a')
    expect(screen.getByText('Esperando receta')).toBeInTheDocument()
    expect(screen.getAllByText('Avisado').length).toBeGreaterThanOrEqual(2)
    expect(
      screen.getByRole('columnheader', { name: 'Etapa' }),
    ).toBeInTheDocument()
    // Custom property columns are offered but not shown until chosen.
    expect(
      screen.queryByRole('columnheader', { name: 'Dosis especial' }),
    ).not.toBeInTheDocument()
  })

  it('lets only open cycles be selected and applies a batch only after confirmation', async () => {
    const calls = setup(['treatments:read', 'treatments:write', 'cycle:move'])
    const user = userEvent.setup()
    await screen.findByText('Paciente a')
    expect(
      screen.getByRole('checkbox', { name: 'Seleccionar ciclo de Paciente c' }),
    ).toBeDisabled()

    await user.click(
      screen.getByRole('checkbox', { name: 'Seleccionar ciclo de Paciente a' }),
    )
    expect(screen.getByText('1 seleccionados')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Archivar' }))
    expect(calls.some((call) => call.url.includes('/cycles/batch'))).toBe(false)

    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: /Confirmar y aplicar a 1/ }),
    )
    await waitFor(() =>
      expect(
        calls.find((call) => call.url.includes('/cycles/batch'))?.body,
      ).toMatchObject({ action: 'archive', ids: ['a'], confirm: true }),
    )
  })

  it('selects every open cycle with the header checkbox', async () => {
    setup(['treatments:read', 'treatments:write', 'cycle:move'])
    const user = userEvent.setup()
    await screen.findByText('Paciente a')
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Seleccionar todos los ciclos abiertos',
      }),
    )
    expect(screen.getByText('2 seleccionados')).toBeInTheDocument()
  })

  it('hides the checkboxes and the batch bar without batch permissions', async () => {
    const calls = setup(['treatments:read'], false)
    await screen.findByText('Paciente a')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('toolbar', { name: 'Acciones por lote' }),
    ).not.toBeInTheDocument()
    expect(calls.length).toBeGreaterThan(0)
  })

  it('saves hidden columns for the user', async () => {
    const calls = setup(['treatments:read'])
    const user = userEvent.setup()
    await screen.findByText('Paciente a')
    await user.click(screen.getByRole('button', { name: 'Columnas' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getAllByRole('button', { name: 'Ocultar' })[0]!,
    )
    await waitFor(() => {
      const saved = calls.find(
        (call) => call.method === 'POST' && call.url.includes('/saved-views'),
      )
      expect(saved?.body).toMatchObject({
        entity: 'cycles_columns',
        name: 'default',
      })
      expect((saved?.body as { columns: string[] }).columns).not.toContain(
        'branch',
      )
    })
  })
})
