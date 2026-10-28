import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { RouteError } from './RouteError'

describe('RouteError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => vi.restoreAllMocks())

  it('explica el error y ofrece recargar cuando falla un módulo dinámico', () => {
    const Boom = (): never => {
      throw new Error(
        'Failed to fetch dynamically imported module: http://localhost:5173/src/features/settings/ThresholdsPage.tsx',
      )
    }
    const router = createMemoryRouter(
      [
        {
          errorElement: <RouteError />,
          children: [{ path: '/', element: <Boom /> }],
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { name: 'No pudimos cargar esta sección' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Recargar página/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Volver al inicio/i }),
    ).toHaveAttribute('href', '/inicio')
  })

  it('muestra un mensaje claro cuando la ruta no existe', () => {
    const router = createMemoryRouter(
      [
        {
          errorElement: <RouteError />,
          children: [{ path: '/existe', element: <p>Contenido</p> }],
        },
      ],
      { initialEntries: ['/ruta-inexistente'] },
    )

    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { name: 'No encontramos esta página' }),
    ).toBeInTheDocument()
  })
})
