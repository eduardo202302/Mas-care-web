import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BranchesPage from './BranchesPage'
import type { components } from '@/lib/api-types'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('permisos de sucursales', () => {
  it('oculta crear y editar para un usuario read_only', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const path = String(input)
        const me = {
          user: {
            id: 'user-1',
            name: 'Solo lectura',
            email: 'read@example.test',
          },
          organization: { id: 'org-1', name: 'Farmacia Demo' },
          role: 'read_only',
          roleId: null,
          roleName: null,
          isPlatformOwner: false,
          branches: [],
          permissions: ['branches:read'],
          menu: [],
        } satisfies components['schemas']['Me']
        const branch = {
          id: 'branch-1',
          organizationId: 'org-1',
          name: 'Centro',
          labelColor: '#0e7c86',
          phone: null,
          address: null,
          archivedAt: null,
          createdAt: '2026-10-23T00:00:00.000Z',
        } satisfies components['schemas']['Branch']
        const body = path.includes('/me') ? me : { data: [branch] }
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <BranchesPage />
      </QueryClientProvider>,
    )

    await waitFor(() => expect(screen.getByText('Centro')).toBeInTheDocument())
    expect(
      screen.queryByRole('button', { name: 'Nueva sucursal' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Editar Centro' }),
    ).not.toBeInTheDocument()
  })
})
