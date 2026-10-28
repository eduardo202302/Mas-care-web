import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BranchForm } from './BranchForm'
import { api } from '@/lib/http'
import type { BranchFormValues } from '@/schemas/branch'

afterEach(() => vi.unstubAllGlobals())

describe('BranchForm', () => {
  it('muestra los errores por campo que devuelve la API con 400', async () => {
    const user = userEvent.setup()
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
                  name: 'El nombre ya está en uso.',
                  labelColor: 'Este color no está permitido.',
                },
              },
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          ),
      ),
    )
    const onSave = async (values: BranchFormValues) => {
      await api<unknown>('/api/v1/branches', {
        method: 'POST',
        body: JSON.stringify(values),
      })
    }
    render(<BranchForm onSave={onSave} onCancel={() => undefined} />)
    await user.type(screen.getByLabelText('Nombre de sucursal'), 'Centro')
    await user.click(screen.getByRole('button', { name: 'Crear sucursal' }))
    expect(
      await screen.findByText('El nombre ya está en uso.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Este color no está permitido.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre de sucursal')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByLabelText('Color de etiqueta')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
