import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useMe } from '@/lib/permissions'
import type { MeMenuItem } from '@/lib/menu'
import { RequireRoute } from './RequireRoute'

vi.mock('@/lib/permissions', () => ({ useMe: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

const pacientes: MeMenuItem = {
  id: 'pacientes',
  key: 'pacientes',
  label: 'Pacientes',
  path: '/pacientes',
  icon: 'users',
  order: 40,
  parentId: null,
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
}

function mockMe(state: {
  menu?: MeMenuItem[]
  pending?: boolean
  error?: boolean
}) {
  vi.mocked(useMe).mockReturnValue({
    data: state.menu ? { menu: state.menu } : undefined,
    isPending: state.pending ?? false,
    isError: state.error ?? false,
  } as unknown as ReturnType<typeof useMe>)
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RequireRoute />}>
          <Route path="/pacientes" element={<p>Pantalla de pacientes</p>} />
          <Route path="/tareas" element={<p>Pantalla de tareas</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireRoute', () => {
  it('muestra la pantalla cuando el rol la incluye en su menú', () => {
    mockMe({ menu: [pacientes] })
    renderAt('/pacientes')
    expect(screen.getByText('Pantalla de pacientes')).toBeInTheDocument()
  })

  it('muestra el 404 cuando el rol no incluye la pantalla', () => {
    mockMe({ menu: [pacientes] })
    renderAt('/tareas')
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de tareas')).not.toBeInTheDocument()
  })

  it('ofrece volver al inicio desde el 404', () => {
    mockMe({ menu: [pacientes] })
    renderAt('/tareas')
    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute(
      'href',
      '/inicio',
    )
  })

  it('espera a conocer el menú antes de decidir', () => {
    mockMe({ pending: true })
    renderAt('/tareas')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('404')).not.toBeInTheDocument()
  })

  it('no bloquea la pantalla si el contexto no se puede cargar', () => {
    mockMe({ error: true })
    renderAt('/tareas')
    expect(screen.getByText('Pantalla de tareas')).toBeInTheDocument()
  })
})
