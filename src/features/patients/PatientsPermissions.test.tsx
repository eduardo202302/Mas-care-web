import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PatientsPage from './PatientsPage'
import PatientDetailPage from './PatientDetailPage'
import MedicationsPage from '@/features/medications/MedicationsPage'
import type { components } from '@/lib/api-types'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function mockReadOnlyApi() {
  const me = {
    user: {
      id: 'user-read-only',
      name: 'Solo lectura',
      email: 'read@example.test',
    },
    organization: { id: 'org-1', name: 'Farmacia Demo' },
    role: 'read_only',
    roleId: null,
    roleName: null,
    isPlatformOwner: false,
    branches: [],
    permissions: ['patients:read', 'medications:read'],
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
  const patient = {
    id: 'patient-1',
    numericId: '1',
    organizationId: 'org-1',
    primaryBranchId: branch.id,
    fullName: 'Paciente de lectura',
    documentId: null,
    birthDate: null,
    phone: '70000000',
    phoneHasWhatsapp: false,
    email: null,
    address: null,
    zone: null,
    preferredChannel: 'call',
    reminderConsent: false,
    reminderConsentAt: null,
    careNotes: null,
    responsibleUserId: null,
    createdBy: me.user.id,
    createdAt: '2026-10-23T00:00:00.000Z',
    archivedAt: null,
  } satisfies components['schemas']['Patient']
  const medication = {
    id: 'medication-1',
    organizationId: 'org-1',
    brandName: 'Marca demo',
    genericName: 'Genérico demo',
    activeIngredient: 'Ingrediente',
    presentation: 'Caja de tabletas',
    doseUnit: 'tableta',
    unitsPerPackage: 30,
    archivedAt: null,
  } satisfies components['schemas']['Medication']
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input)
      let body: unknown = {}
      if (new URL(path).pathname === '/api/v1/me') body = me
      else if (path.includes('/api/v1/branches')) body = { data: [branch] }
      else if (path.includes('/api/v1/saved-views')) body = { data: [] }
      else if (path.includes('/api/v1/patients/patient-1/caregivers'))
        body = { data: [] }
      else if (path.includes('/api/v1/patients/patient-1/activities'))
        body = { data: [], nextCursor: null }
      else if (path.includes('/api/v1/patients/patient-1')) body = patient
      else if (path.includes('/api/v1/patients'))
        body = { data: [patient], nextCursor: null }
      else if (path.includes('/api/v1/medications'))
        body = { data: [medication], nextCursor: null }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }),
  )
}

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('permisos de lectura', () => {
  it('oculta crear y editar pacientes', async () => {
    mockReadOnlyApi()
    renderWithQuery(
      <MemoryRouter>
        <PatientsPage />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByText('Paciente de lectura')).toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('button', { name: 'Nuevo paciente' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
    cleanup()
    renderWithQuery(
      <MemoryRouter initialEntries={['/pacientes/patient-1']}>
        <Routes>
          <Route path="/pacientes/:id" element={<PatientDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByText('Paciente de lectura')).toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Nota' }),
    ).not.toBeInTheDocument()
  })

  it('oculta crear y editar medicamentos', async () => {
    mockReadOnlyApi()
    renderWithQuery(<MedicationsPage />)
    await waitFor(() =>
      expect(screen.getByText('Marca demo')).toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('button', { name: 'Nuevo medicamento' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Editar Marca demo' }),
    ).not.toBeInTheDocument()
  })
})
