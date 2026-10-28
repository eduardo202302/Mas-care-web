import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { RequireAuth } from './RequireAuth'

vi.mock('@/lib/auth-client', () => ({
  authClient: { useSession: vi.fn() },
}))

afterEach(() => vi.resetAllMocks())

describe('RequireAuth', () => {
  it('envía a acceso cuando Better Auth no encuentra una sesión', () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as ReturnType<typeof authClient.useSession>)

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/inicio']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path="/inicio" element={<p>Inicio privado</p>} />
            </Route>
            <Route path="/acceso" element={<p>Pantalla de acceso</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Pantalla de acceso')).toBeInTheDocument()
    expect(screen.queryByText('Inicio privado')).not.toBeInTheDocument()
  })
})
