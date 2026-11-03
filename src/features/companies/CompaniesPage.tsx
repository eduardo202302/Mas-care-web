import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Search } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { FilterBarRow } from '@/components/ui/AdvancedFilter'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { CompanyFormValues } from '@/schemas/company'
import type { components, paths } from '@/lib/api-types'
import { CompanyForm } from './CompanyForm'
import { CopyLinkButton } from './CopyLink'

type Company = components['schemas']['Company']
type CompanyList =
  paths['/api/v1/companies']['get']['responses'][200]['content']['application/json']
type CompanyQuery = NonNullable<
  paths['/api/v1/companies']['get']['parameters']['query']
>

function queryString(query: CompanyQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return params.toString()
}

function statusBadge(status: Company['status']) {
  return status === 'active' ? (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      Activa
    </span>
  ) : (
    <span className="bg-surface text-muted inline-flex rounded-full px-2.5 py-1 text-xs font-semibold">
      Inactiva
    </span>
  )
}

export default function CompaniesPage() {
  const canManage = useCan('companies:write')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [editing, setEditing] = useState<Company | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [sort, toggleSort] = useColumnSort()

  const filters = useMemo<CompanyQuery>(
    () => ({ q: search.trim() || undefined, page, rows }),
    [page, rows, search],
  )

  const companies = useQuery({
    queryKey: ['companies', filters],
    queryFn: () =>
      api<CompanyList>(`/api/v1/companies?${queryString(filters)}`),
  })

  const createCompany = useMutation({
    mutationFn: (values: CompanyFormValues) =>
      api<Company>('/api/v1/companies', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: async (company) => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      closeForm()
      navigate(`/companias/${encodeURIComponent(company.id)}`)
    },
  })

  const updateCompany = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CompanyFormValues }) =>
      api<Company>(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      closeForm()
    },
  })

  const updateLogo = useMutation({
    mutationFn: ({ id, logo }: { id: string; logo: string | null }) =>
      api<Company>(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ logo }),
      }),
    onSuccess: async (company) => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      setEditing((current) =>
        current?.id === company.id
          ? { ...current, logo: company.logo }
          : current,
      )
    },
  })

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(company: Company) {
    setEditing(company)
    setFormOpen(true)
  }

  async function submit(values: CompanyFormValues) {
    if (editing) {
      await updateCompany.mutateAsync({ id: editing.id, values })
    } else {
      await createCompany.mutateAsync(values)
    }
  }

  const sortedCompanies = applyColumnSort(
    companies.data?.data ?? [],
    sort,
    (company, index) =>
      index === 0
        ? company.numericId
        : index === 1
          ? company.status
          : index === 2
            ? company.name
            : index === 3
              ? (company.phone ?? '')
              : index === 4
                ? (company.city ?? '')
                : company.registrationLink,
  )
  const tableRows = sortedCompanies.map((company) => [
    <span key="id" className="text-muted font-mono text-xs">
      {company.numericId}
    </span>,
    statusBadge(company.status),
    <span
      key="company"
      className="text-petroleo inline-flex items-center gap-2 text-left font-semibold"
    >
      <span className="bg-tealmax/10 grid size-8 shrink-0 place-items-center overflow-hidden rounded-full">
        {company.logo ? (
          <img src={company.logo} alt="" className="size-full object-cover" />
        ) : (
          <Building2 className="size-4" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate">{company.name}</span>
        <span className="text-muted block truncate text-xs font-normal">
          {company.email}
        </span>
      </span>
    </span>,
    <span key="phone" className="text-ink text-sm">
      {company.phone || <span className="text-muted">—</span>}
    </span>,
    <span key="city" className="text-ink text-sm">
      {company.city || <span className="text-muted">—</span>}
    </span>,
    <div key="links" className="flex flex-wrap gap-1">
      <CopyLinkButton value={company.registrationLink} label="Registro" />
      <CopyLinkButton value={company.loginLink} label="Login" />
    </div>,
  ])
  const rowActions = sortedCompanies.map((company) => (
    <RowActions
      key={company.id}
      label={company.name}
      onEdit={canManage ? () => openEdit(company) : undefined}
    />
  ))

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Compañías"
        subtitle="Empresas registradas y sus enlaces de registro y acceso."
        actions={
          <>
            {canManage && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Nueva compañía
              </Button>
            )}
          </>
        }
      />

      <FilterBarRow aria-label="Filtros">
        <label className="relative min-w-[220px] flex-1">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar compañías"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar por nombre, correo, dominio o PIN"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm outline-none"
          />
        </label>
      </FilterBarRow>

      {companies.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar las compañías. {companies.error.message}
        </p>
      )}

      <div className="min-h-0 flex-1">
        {companies.isFetching ? (
          <TableSkeleton columns={6} avatar />
        ) : (
          <DataTable
            columns={[
              'ID',
              'Estado',
              'Compañía',
              'Teléfono',
              'Ciudad',
              'Links',
            ]}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3, 4]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const company = sortedCompanies[index]
              if (company) navigate(`/companias/${encodeURIComponent(company.id)}`)
            }}
            emptyTitle="Todavía no hay compañías"
            emptyDescription={
              search.trim()
                ? 'Prueba con otro nombre, correo, dominio o PIN.'
                : 'Crea la primera compañía para generar sus enlaces.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={companies.data?.total ?? 0}
                onChange={setPage}
                onRowsChange={(next) => {
                  setRows(next)
                  setPage(1)
                }}
              />
            }
          />
        )}
      </div>

      {formOpen && (
        <Dialog
          title={editing ? 'Editar compañía' : 'Nueva compañía'}
          description="Completa la información y revisa los enlaces generados."
          icon={<Building2 className="size-6" />}
          size="lg"
          onClose={closeForm}
        >
          <CompanyForm
            key={editing?.id ?? 'new'}
            mode={editing ? 'edit' : 'create'}
            initialValues={
              editing
                ? {
                    name: editing.name,
                    email: editing.email,
                    logo: editing.logo ?? '',
                    status: editing.status,
                    pin: editing.pin,
                    domain: editing.domain,
                    phone: editing.phone ?? '',
                    ownerName: editing.ownerName ?? '',
                    industry: editing.industry ?? '',
                    type: editing.type ?? '',
                    city: editing.city ?? '',
                    state: editing.state ?? '',
                    address: editing.address ?? '',
                    sector: editing.sector ?? '',
                    latitude: editing.latitude ?? '',
                    longitude: editing.longitude ?? '',
                    employeeCount: editing.employeeCount?.toString() ?? '',
                    description: editing.description ?? '',
                    linkedinUrl: editing.linkedinUrl ?? '',
                    googleMapsApiKey: editing.googleMapsApiKey ?? '',
                  }
                : undefined
            }
            linkToken={editing?.linkToken}
            onLogoChange={
              editing
                ? async (logo) => {
                    await updateLogo.mutateAsync({ id: editing.id, logo })
                  }
                : undefined
            }
            onSave={submit}
            onCancel={closeForm}
            submitting={createCompany.isPending || updateCompany.isPending}
          />
        </Dialog>
      )}
    </div>
  )
}
