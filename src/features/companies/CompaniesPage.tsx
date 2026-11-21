import { StatusBadge } from '@/components/ui/StatusBadge'
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, AtSign, Building2, MapPin, Phone, Plus } from 'lucide-react'
import { SearchField } from '@/components/ui/SearchField'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import { Button } from '@/components/ui/Button'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  filterControlClass,
  type ActiveFilterChip,
} from '@/components/ui/AdvancedFilter'
import { PageHeader } from '@/components/ui/PageHeader'
import { Dialog } from '@/components/ui/Dialog'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  StatusDraftProvider,
  useStatusDraft,
} from '@/components/ui/StatusDraft'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { editTitle } from '@/lib/editTitle'
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

type CompanyStatusFilter = '' | 'active' | 'inactive'
const statusOptions: { value: CompanyStatusFilter; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
]
type CompanyFilters = {
  status: CompanyStatusFilter
  name: string
  email: string
  phone: string
  city: string
}

const emptyFilters: CompanyFilters = {
  status: '',
  name: '',
  email: '',
  phone: '',
  city: '',
}

type CompanyTextKey = 'name' | 'email' | 'phone' | 'city'

function uniqueSorted(
  values: (string | null | undefined)[],
  ...selected: string[]
) {
  const set = new Set(values.filter((value): value is string => !!value))
  for (const value of selected) if (value) set.add(value)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

const textFilters: {
  key: CompanyTextKey
  label: string
  icon: ReactNode
}[] = [
  { key: 'name', label: 'Compañía', icon: <Building2 className="size-4" /> },
  { key: 'email', label: 'Correo', icon: <AtSign className="size-4" /> },
  { key: 'phone', label: 'WhatsApp', icon: <Phone className="size-4" /> },
  { key: 'city', label: 'Ciudad', icon: <MapPin className="size-4" /> },
]

const columnHeaders = [
  'ID',
  'Estado',
  'Compañía',
  'WhatsApp',
  'Ciudad',
  'Links',
]

function statusBadge(status: Company['status']) {
  return <StatusBadge active={status === 'active'} feminine />
}

export default function CompaniesPage() {
  const canManage = useCan('companies:write')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  // El servidor no filtra por estado: se aplica sobre la página cargada.
  const [applied, setApplied] = useState<CompanyFilters>(emptyFilters)
  const [filterDraft, setFilterDraft] = useState<CompanyFilters | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [editing, setEditing] = useState<Company | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const statusDraft = useStatusDraft(
    editing ? editing.status === 'active' : true,
  )
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
      await queryClient.invalidateQueries({ queryKey: ['my-organizations'] })
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
    },
  })

  const toggleStatus = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<Company>(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: active ? 'active' : 'inactive' }),
      }),
    onSuccess: async (company) => {
      // Mantiene el interruptor del formulario abierto en sincronía.
      setEditing((current) =>
        current?.id === company.id
          ? { ...current, status: company.status }
          : current,
      )
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      await queryClient.invalidateQueries({ queryKey: ['my-organizations'] })
    },
  })

  function closeForm() {
    statusDraft.reset()
    setFormOpen(false)
    setEditing(null)
  }

  function openCreate() {
    statusDraft.reset()
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(company: Company) {
    statusDraft.reset()
    setEditing(company)
    setFormOpen(true)
  }

  async function submit(values: CompanyFormValues) {
    if (editing) {
      await updateCompany.mutateAsync({ id: editing.id, values })
      if (statusDraft.changed) {
        try {
          await toggleStatus.mutateAsync({
            id: editing.id,
            active: statusDraft.value,
          })
        } catch (error) {
          // El error se muestra en el formulario.
          toggleStatus.reset()
          throw error
        }
      }
      closeForm()
    } else {
      await createCompany.mutateAsync(values)
    }
  }

  const loadedCompanies = companies.data?.data ?? []
  const textOptions = Object.fromEntries(
    textFilters.map(({ key }) => [
      key,
      uniqueSorted(
        loadedCompanies.map((company) => company[key]),
        applied[key],
        filterDraft?.[key] ?? '',
      ),
    ]),
  ) as Record<CompanyTextKey, string[]>
  const visibleCompanies = loadedCompanies.filter(
    (company) =>
      (!applied.status ||
        (applied.status === 'active') === (company.status === 'active')) &&
      textFilters.every(
        ({ key }) => !applied[key] || (company[key] ?? '') === applied[key],
      ),
  )
  const sortedCompanies = applyColumnSort(
    visibleCompanies,
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
      {company.phone || ''}
    </span>,
    <span key="city" className="text-ink text-sm">
      {company.city || ''}
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

  const exportRows = sortedCompanies.map((company) => [
    String(company.numericId),
    company.status === 'active' ? 'Activa' : 'Inactiva',
    company.name,
    company.phone || '',
    company.city || '',
    `Registro: ${company.registrationLink} | Login: ${company.loginLink}`,
  ])
  const chips: ActiveFilterChip[] = [
    ...(applied.status
      ? [
          {
            key: 'status',
            label: 'Estado',
            value: statusOptions.find(
              (option) => option.value === applied.status,
            )!.label,
          },
        ]
      : []),
    ...(applied.name
      ? [{ key: 'name', label: 'Compañía', value: applied.name }]
      : []),
    ...(applied.email
      ? [{ key: 'email', label: 'Correo', value: applied.email }]
      : []),
    ...(applied.phone
      ? [{ key: 'phone', label: 'WhatsApp', value: applied.phone }]
      : []),
    ...(applied.city
      ? [{ key: 'city', label: 'Ciudad', value: applied.city }]
      : []),
  ]
  const filterCount = chips.length

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
                Crear Compañía
              </Button>
            )}
          </>
        }
      />

      <FilterBarRow aria-label="Filtros">
        <SearchField
          wrapperClassName="w-full sm:w-[34rem]"
          aria-label="Buscar compañías"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Buscar por nombre, correo, dominio o PIN"
        />
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft(applied)}
        />
        <TableToolbarActions
          title="Compañías"
          headers={columnHeaders}
          rows={exportRows}
          filename="companias"
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          setApplied((current) => ({ ...current, [key]: '' }))
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de compañías."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft(emptyFilters)
            setApplied(emptyFilters)
            setPage(1)
          }}
          clearDisabled={
            !filterCount &&
            JSON.stringify(filterDraft) === JSON.stringify(emptyFilters)
          }
          onApply={() => {
            setApplied(filterDraft)
            setPage(1)
            setFilterDraft(null)
          }}
        >
          <FilterField
            label="Estado de la Compañía"
            icon={<Activity className="size-4" />}
          >
            <select
              aria-label="Estado de la compañía"
              value={filterDraft.status}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  status: event.target.value as CompanyStatusFilter,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
          {textFilters.map(({ key, label, icon }) => (
            <FilterField key={key} label={label} icon={icon}>
              <select
                aria-label={label}
                value={filterDraft[key]}
                onChange={(event) =>
                  setFilterDraft({ ...filterDraft, [key]: event.target.value })
                }
                className={`${filterControlClass} pl-11`}
              >
                <option value="">{key === 'city' ? 'Todas' : 'Todos'}</option>
                {textOptions[key].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </FilterField>
          ))}
        </AdvancedFilterDialog>
      )}

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
            columns={columnHeaders}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3, 4]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const company = sortedCompanies[index]
              if (company)
                navigate(`/companias/${encodeURIComponent(company.id)}`)
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
        <StatusDraftProvider changed={statusDraft.changed}>
          <Dialog
            title={
              editing ? editTitle('compañía', editing.name) : 'Crear Compañía'
            }
            description="Completa la información y revisa los enlaces generados."
            icon={<Building2 className="size-6" />}
            size="lg"
            onClose={closeForm}
            headerAction={
              editing && canManage ? (
                <StatusToggle
                  active={statusDraft.value}
                  pending={updateCompany.isPending || toggleStatus.isPending}
                  onChange={statusDraft.set}
                />
              ) : undefined
            }
          >
            <CompanyForm
              key={`${editing?.id ?? 'new'}:${editing?.status ?? ''}`}
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
              onSave={submit}
              onCancel={closeForm}
              submitting={
                createCompany.isPending ||
                updateCompany.isPending ||
                toggleStatus.isPending
              }
            />
          </Dialog>
        </StatusDraftProvider>
      )}
    </div>
  )
}
