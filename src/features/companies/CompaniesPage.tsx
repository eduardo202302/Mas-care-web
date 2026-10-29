import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, ExternalLink, Pencil, Plus, Search } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { CompanyFormValues } from '@/schemas/company'
import type { components, paths } from '@/lib/api-types'
import { CompanyForm } from './CompanyForm'
import { CopyLinkButton, LinkField } from './CopyLink'

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

function CompanyDetail({
  company,
  onEdit,
}: {
  company: Company
  onEdit: () => void
}) {
  return (
    <div className="mt-1">
      <div className="bg-surface flex items-center gap-4 rounded-xl p-4">
        <span className="bg-tealmax/10 text-petroleo grid size-14 shrink-0 place-items-center overflow-hidden rounded-full">
          {company.logo ? (
            <img src={company.logo} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-6" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-petroleo truncate text-lg font-semibold">
              {company.name}
            </h3>
            {statusBadge(company.status)}
          </div>
          <p className="text-muted truncate text-sm">{company.email}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-muted text-xs">PIN</dt>
          <dd className="text-petroleo mt-1 font-mono text-lg font-semibold tracking-[0.3em]">
            {company.pin}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs">Dominio</dt>
          <dd className="mt-1 truncate text-sm">
            <a
              href={company.domain}
              target="_blank"
              rel="noreferrer"
              className="text-petroleo inline-flex items-center gap-1 hover:underline"
            >
              {company.domain}
              <ExternalLink className="size-3.5" />
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs">Creada</dt>
          <dd className="text-ink mt-1 text-sm">
            {new Date(company.createdAt).toLocaleDateString('es')}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs">Actualizada</dt>
          <dd className="text-ink mt-1 text-sm">
            {new Date(company.updatedAt).toLocaleDateString('es')}
          </dd>
        </div>
      </dl>

      <div className="border-border mt-5 grid gap-4 border-t pt-5">
        <h3 className="text-ink text-sm font-semibold">Links de acceso</h3>
        <LinkField
          label="Link para registrarse"
          value={company.registrationLink}
        />
        <LinkField label="Link para iniciar sesión" value={company.loginLink} />
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="button" onClick={onEdit}>
          <Pencil className="size-4" />
          Editar compañía
        </Button>
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const canManage = useCan('companies:write')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [selected, setSelected] = useState<Company | null>(null)
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
      setSelected(company)
    },
  })

  const updateCompany = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CompanyFormValues }) =>
      api<Company>(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      }),
    onSuccess: async (company) => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      closeForm()
      setSelected(company)
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
    setSelected(null)
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(company: Company) {
    setSelected(null)
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

  const sortedCompanies = applyColumnSort(companies.data?.data ?? [], sort, (company, index) =>
    index === 0
      ? company.name
      : index === 1
        ? company.status
        : index === 2
          ? company.pin
          : index === 3
            ? company.domain
            : company.registrationLink,
  )
  const tableRows = sortedCompanies.map((company) => [
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
    statusBadge(company.status),
    <span
      key="pin"
      className="text-petroleo font-mono text-sm font-semibold tracking-[0.25em]"
    >
      {company.pin}
    </span>,
    <a
      key="domain"
      href={company.domain}
      target="_blank"
      rel="noreferrer"
      className="text-muted hover:text-petroleo inline-flex max-w-[220px] items-center gap-1 truncate hover:underline"
    >
      <span className="truncate">{company.domain}</span>
      <ExternalLink className="size-3.5 shrink-0" />
    </a>,
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
      <div className="mb-7 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium">Plataforma</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Compañías
          </h1>
          <p className="text-muted mt-2 text-sm">
            Empresas registradas y sus enlaces de registro y acceso.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={openCreate}>
            <Plus className="size-4" />
            Nueva compañía
          </Button>
        )}
      </div>

      <section className="border-border mb-4 shrink-0 rounded-xl border bg-white p-4">
        <label className="relative block max-w-lg">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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
      </section>

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
        <TableSkeleton columns={5} avatar />
      ) : (
        <DataTable
          columns={['Compañía', 'Estado', 'PIN', 'Dominio', 'Links']}
          rows={tableRows}
          actions={rowActions}
          sortableColumns={[0, 1, 2, 3]}
          sort={sort}
          onSortChange={toggleSort}
          onRowDoubleClick={(index) => {
            const company = sortedCompanies[index]
            if (company) setSelected(company)
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

      {selected && (
        <Dialog
          title="Ficha de compañía"
          description="Información, PIN y enlaces de acceso."
          size="lg"
          onClose={() => setSelected(null)}
        >
          <CompanyDetail company={selected} onEdit={() => openEdit(selected)} />
        </Dialog>
      )}

      {formOpen && (
        <Dialog
          title={editing ? 'Editar compañía' : 'Nueva compañía'}
          description="Completa la información y revisa los enlaces generados."
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
