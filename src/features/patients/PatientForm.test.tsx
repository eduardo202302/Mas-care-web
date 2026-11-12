import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
    for (const [label, value] of [
      ['Documento', '00112345673'],
      ['WhatsApp', '8095551234'],
      ['Correo Electrónico', 'demo@correo.com'],
      ['Dirección', 'Calle 1'],
      ['Región', 'Distrito'],
      ['Ciudad', 'Santo Domingo'],
      ['Sector', 'Centro'],
      ['Latitud', '14.6349'],
      ['Longitud', '-90.5069'],
    ] as const)
      await user.type(screen.getByLabelText(label), value)
    fireEvent.change(screen.getByLabelText('Fecha de Nacimiento'), {
      target: { value: '1990-01-01' },
    })
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

describe('PatientForm (alta)', () => {
  it('exige todos los campos de Datos salvo las notas de cuidado', async () => {
    const onSave = vi.fn()
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
    await user.click(screen.getByRole('button', { name: 'Crear Paciente' }))
    expect((await screen.findAllByText('Campo requerido.')).length).toBe(11)
    expect(onSave).not.toHaveBeenCalled()
  })
})
