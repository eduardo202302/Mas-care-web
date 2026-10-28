import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExportButton } from './ExportButton'
import type { components } from '@/lib/api-types'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function meResponse(permissions: string[]): components['schemas']['Me'] {
  return {
    user: { id: 'user-1', name: 'Usuario', email: 'user@example.test' },
    organization: { id: 'org-1', name: 'Farmacia Demo' },
    role: 'read_only',
    roleId: null,
    roleName: null,
    isPlatformOwner: false,
    branches: [],
    permissions,
    menu: [],
  }
}

function renderWithMe(permissions: string[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify(meResponse(permissions)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ExportButton type="adherence" filters={{ branch_id: [] }} />
    </QueryClientProvider>,
  )
}

describe('ExportButton', () => {
  it('no renderiza nada en el DOM cuando el usuario no tiene export:csv', async () => {
    renderWithMe(['dashboard:read'])
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /exportar csv/i })).not.toBeInTheDocument()
    })
    // Not just visually hidden — the control must be absent from the DOM entirely.
    expect(document.querySelector('button')).not.toBeInTheDocument()
  })

  it('muestra el botón de exportar cuando el usuario tiene export:csv', async () => {
    renderWithMe(['dashboard:read', 'export:csv'])
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument()
    })
  })
})
