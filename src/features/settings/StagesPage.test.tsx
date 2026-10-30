import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import StagesPage from './StagesPage'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const stage = (
  id: string,
  status: string,
  name: string,
  position: number,
  cycle_count = 0,
) => ({
  id,
  system_status: status,
  name,
  description: null,
  color: '#112233',
  position,
  cycle_count,
})
const pipeline = {
  id: 'p',
  key: 'refill_cycles',
  name: 'Ciclos',
  description: null,
  stages: [
    stage('s1', 'to_notify', 'Por avisar', 0, 3),
    stage('s2', 'notified', 'Avisado', 1),
    stage('s3', 'confirmed', 'Confirmado', 2),
    stage('s4', 'prepared', 'Preparado', 3),
    stage('s5', 'closed', 'Cerrado', 4),
  ],
}

it('adds a stage under a column, deletes only what is safe, and sends new stages without id', async () => {
  const puts: { stages: Record<string, unknown>[] }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push(JSON.parse(String(init.body)))
      return new Response(JSON.stringify(pipeline), {
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
      <StagesPage />
    </QueryClientProvider>,
  )
  const user = userEvent.setup()
  // Every column has a single stage, and Por avisar holds cycles: nothing can be deleted yet.
  expect(
    await screen.findByRole('button', { name: 'Borrar Por avisar' }),
  ).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Borrar Avisado' })).toBeDisabled()

  await user.selectOptions(
    screen.getByLabelText('Columna de la nueva etapa'),
    'confirmed',
  )
  await user.click(screen.getByRole('button', { name: 'Añadir etapa' }))
  const save = screen.getByRole('button', { name: 'Guardar cambios' })
  expect(save).toBeDisabled()
  await user.type(
    screen.getByLabelText('Nombre de la etapa 6'),
    'Esperando receta',
  )
  // The column now has two stages, so the original one can be deleted.
  expect(
    screen.getByRole('button', { name: 'Borrar Confirmado' }),
  ).toBeEnabled()
  await user.click(save)
  await waitFor(() => expect(puts).toHaveLength(1))
  expect(puts[0]!.stages[5]).toMatchObject({
    system_status: 'confirmed',
    name: 'Esperando receta',
  })
  expect(puts[0]!.stages[5]).not.toHaveProperty('id')
  expect(puts[0]!.stages[0]).toHaveProperty('id', 's1')
})
