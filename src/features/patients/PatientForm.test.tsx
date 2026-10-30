import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PatientForm } from './PatientForm'
import { api } from '@/lib/http'
import type { PatientFormValues } from '@/schemas/patient'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('PatientForm', () => {
  it('pinta los errores por campo devueltos por la API con 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Datos inválidos',
                fields: {
                  fullName: 'Ya existe una ficha con ese nombre.',
                  primaryBranchId: 'La sucursal no está activa.',
                },
              },
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          ),
      ),
    )
    const onSave = async (values: PatientFormValues) => {
      await api<unknown>('/api/v1/patients', {
        method: 'POST',
        body: JSON.stringify(values),
      })
    }
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <PatientForm
          branches={[{ id: 'branch-1', name: 'Centro' }]}
          onSave={onSave}
          onCancel={() => undefined}
        />
      </QueryClientProvider>,
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Nombre Completo'), 'Paciente Demo')
    await user.click(screen.getByRole('button', { name: 'Crear Paciente' }))
    expect(
      await screen.findByText('Ya existe una ficha con ese nombre.'),
    ).toBeInTheDocument()
    expect(screen.getByText('La sucursal no está activa.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre Completo')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
