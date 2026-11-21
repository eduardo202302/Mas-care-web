import { StatusBadge } from '@/components/ui/StatusBadge'
import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  Building2,
  Compass,
  MapPin,
  MessageCircle,
  Plus,
  UserRound,
} from 'lucide-react'
import { SearchField } from '@/components/ui/SearchField'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { TruncatedText } from '@/components/ui/MoreBubble'
import { Dialog } from '@/components/ui/Dialog'
import { PurgeDialog } from '@/components/ui/PurgeDialog'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  StatusDraftProvider,
  useStatusDraft,
} from '@/components/ui/StatusDraft'
import {
  ActiveFilterChips,
  AdvancedFilterButton,
  AdvancedFilterDialog,
  FilterBarRow,
  FilterField,
  filterControlClass,
  type ActiveFilterChip,
} from '@/components/ui/AdvancedFilter'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { BranchTag } from '@/components/BranchTag'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { editTitle } from '@/lib/editTitle'
import { api, ApiError } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { formatPhone } from '@/lib/phone'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { BranchFormValues } from '@/schemas/branch'
import { BranchForm } from './BranchForm'
import type { components, paths } from '@/lib/api-types'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

type BranchAddressDetails = components['schemas']['Branch']['addressDetails']

function addressText(details: BranchAddressDetails, key: string): string {
  const value = (details as Record<string, unknown> | null)?.[key]
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function addressValues(details: BranchAddressDetails) {
  return {
    address: addressText(details, 'address'),
    state: addressText(details, 'region'),
    city: addressText(details, 'city'),
    sector: addressText(details, 'sector'),
    postalCode: addressText(details, 'postalCode'),
    latitude: addressText(details, 'latitude'),
    longitude: addressText(details, 'longitude'),
  }
}

type ArchivedFilter = 'true' | 'false' | 'all'
const archivedOptions: { value: ArchivedFilter; label: string }[] = [
  { value: 'false', label: 'Activas' },
  { value: 'true', label: 'Inactivas' },
  { value: 'all', label: 'Todas' },
]

type BranchFilters = {
  archived: ArchivedFilter
  name: string
  address: string
  sector: string
  manager: string
  whatsapp: string
}

const emptyFilters: BranchFilters = {
  archived: 'false',
  name: '',
  address: '',
  sector: '',
  manager: '',
  whatsapp: '',
}

type BranchTextKey = 'name' | 'address' | 'sector' | 'manager' | 'whatsapp'

function branchTextValue(
  branch: components['schemas']['Branch'],
  key: BranchTextKey,
): string {
  if (key === 'name') return branch.name
  if (key === 'address') return addressText(branch.addressDetails, 'address')
  if (key === 'sector') return addressText(branch.addressDetails, 'sector')
  if (key === 'manager') return branch.managerName ?? ''
  return branch.managerPhone ? formatPhone(branch.managerPhone) : ''
}

function uniqueSorted(values: string[], ...selected: string[]) {
  const set = new Set(values.filter(Boolean))
  for (const value of selected) if (value) set.add(value)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

const textFilters: {
  key: BranchTextKey
  label: string
  icon: ReactNode
}[] = [
  { key: 'name', label: 'Sucursal', icon: <Building2 className="size-4" /> },
  { key: 'address', label: 'Dirección', icon: <MapPin className="size-4" /> },
  { key: 'sector', label: 'Sector', icon: <Compass className="size-4" /> },
  {
    key: 'manager',
    label: 'Nombre del Encargado',
    icon: <UserRound className="size-4" />,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: <MessageCircle className="size-4" />,
  },
]

const addressFields = new Set([
  'address',
  'city',
  'state',
  'postalCode',
  'sector',
  'latitude',
  'longitude',
])

function toAddressDetails(values: BranchFormValues) {
  const details: Record<string, string | number> = {}
  if (values.address) details.address = values.address
  if (values.state) details.region = values.state
  if (values.city) details.city = values.city
  if (values.sector) details.sector = values.sector
  if (values.postalCode) details.postalCode = values.postalCode
  if (values.latitude) details.latitude = Number(values.latitude)
  if (values.longitude) details.longitude = Number(values.longitude)
  return details
}

export default function BranchesPage() {
  const canCreate = useCan('branches:write')
  const canUpdate = useCan('branches:write')
  const canDelete = useCan('branches:write')
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<
    components['schemas']['Branch'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)
  const [purging, setPurging] = useState<
    components['schemas']['Branch'] | null
  >(null)
  const statusDraft = useStatusDraft(!editing?.archivedAt)
  const [search, setSearch] = useState('')
  // El servidor solo filtra por archivadas: el resto se aplica sobre la página cargada.
  const [applied, setApplied] = useState<BranchFilters>(emptyFilters)
  const [filterDraft, setFilterDraft] = useState<BranchFilters | null>(null)
  const archived = applied.archived
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  // Distinct key from the full lookup list ['branches'] used by selectors.
  const branches = useQuery({
    queryKey: ['branches', 'table', archived, page, rows],
    queryFn: () =>
      api<BranchList>(
        `/api/v1/branches?${pageQuery({ archived, page, rows, scope: 'organization' })}`,
      ),
  })
  // The workspace selector reads branches from /me, so it must refresh too.
  const refreshBranches = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['branches'] }),
      queryClient.invalidateQueries({ queryKey: ['me'] }),
    ])
  const save = useMutation({
    mutationFn: async (values: BranchFormValues) => {
      // The address fields travel inside addressDetails, not at the top level.
      const rest = Object.fromEntries(
        Object.entries(values).filter(([key]) => !addressFields.has(key)),
      ) as Omit<
        BranchFormValues,
        | 'address'
        | 'city'
        | 'state'
        | 'postalCode'
        | 'sector'
        | 'latitude'
        | 'longitude'
      >
      const payload = { ...rest, addressDetails: toAddressDetails(values) }
      if (editing) {
        const body: components['schemas']['BranchPatch'] = payload
        const updated = await api<components['schemas']['Branch']>(
          `/api/v1/branches/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
        // El estado se aplica después de guardar; un 409 al archivar llega al formulario.
        if (statusDraft.changed)
          await toggleActive.mutateAsync({
            id: editing.id,
            active: statusDraft.value,
          })
        return updated
      }
      const body: components['schemas']['BranchInput'] = payload
      return api<components['schemas']['Branch']>('/api/v1/branches', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async () => {
      await refreshBranches()
      closeForm()
    },
  })
  /** Interruptor del formulario de edición: archiva o restaura y refleja el estado en la sucursal abierta. */
  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (active) {
        const restored = await api<components['schemas']['Branch']>(
          `/api/v1/branches/${encodeURIComponent(id)}/restore`,
          { method: 'POST' },
        )
        return restored.archivedAt
      }
      await api(`/api/v1/branches/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      return new Date().toISOString()
    },
    onSuccess: (archivedAt, { id }) => {
      setEditing((current) =>
        current && current.id === id
          ? ({ ...current, archivedAt } as typeof current)
          : current,
      )
      return refreshBranches()
    },
  })
  const purge = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/branches/${encodeURIComponent(id)}/permanent`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      setPurging(null)
      await refreshBranches()
    },
  })
  function closeForm() {
    statusDraft.reset()
    setFormOpen(false)
    setEditing(null)
    setViewOnly(false)
  }
  function openCreate() {
    statusDraft.reset()
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(branch: components['schemas']['Branch']) {
    statusDraft.reset()
    setEditing(branch)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(branch: components['schemas']['Branch']) {
    statusDraft.reset()
    setEditing(branch)
    setViewOnly(true)
    setFormOpen(true)
  }
  async function submit(values: BranchFormValues) {
    await save.mutateAsync(values)
  }
  const needle = search.trim().toLocaleLowerCase('es')
  const loadedBranches = branches.data?.data ?? []
  const textOptions = Object.fromEntries(
    textFilters.map(({ key }) => [
      key,
      uniqueSorted(
        loadedBranches.map((branch) => branchTextValue(branch, key)),
        applied[key],
        filterDraft?.[key] ?? '',
      ),
    ]),
  ) as Record<BranchTextKey, string[]>
  const visibleBranches = loadedBranches.filter(
    (branch) =>
      (!needle ||
        [
          branch.name,
          addressText(branch.addressDetails, 'address'),
          addressText(branch.addressDetails, 'sector'),
          branch.managerName ?? '',
          branch.managerPhone ?? '',
        ].some((value) => value.toLocaleLowerCase('es').includes(needle))) &&
      textFilters.every(
        ({ key }) =>
          !applied[key] || branchTextValue(branch, key) === applied[key],
      ),
  )
  const data = applyColumnSort(visibleBranches, sort, (branch, index) =>
    index === 0
      ? branch.numericId
      : index === 1
        ? branch.archivedAt
          ? 1
          : 0
        : index === 2
          ? branch.name
          : index === 3
            ? addressText(branch.addressDetails, 'address')
            : index === 4
              ? addressText(branch.addressDetails, 'sector')
              : index === 5
                ? (branch.managerName ?? '')
                : (branch.managerPhone ?? ''),
  )
  const tableRows = data.map((branch) => {
    const name = branch.name
    const color = branch.labelColor
    return [
      <span key="id" className="text-muted font-mono text-xs">
        {branch.numericId}
      </span>,
      <StatusBadge key="state" active={!branch.archivedAt} />,
      <BranchTag key="branch" name={name} labelColor={color} />,
      <span
        key="location"
        className="text-muted inline-flex items-center gap-1.5"
      >
        <MapPin className="size-3.5 shrink-0" />
        {addressText(branch.addressDetails, 'address') ? (
          <TruncatedText
            text={addressText(branch.addressDetails, 'address')}
            max={21}
            label="Dirección completa"
          />
        ) : (
          'Sin dirección'
        )}
      </span>,
      <span key="sector" className="text-muted">
        {addressText(branch.addressDetails, 'sector') || 'Sin sector'}
      </span>,
      <span key="manager" className="text-muted">
        {branch.managerName ?? 'Sin encargado'}
      </span>,
      <span key="whatsapp" className="text-muted">
        {branch.managerPhone ? formatPhone(branch.managerPhone) : ''}
      </span>,
    ]
  })
  const tableActions = data.map((branch) => (
    <RowActions
      key={branch.id}
      label={branch.name}
      onEdit={canUpdate ? () => openEdit(branch) : undefined}
      onPurge={
        canDelete
          ? () => {
              purge.reset()
              setPurging(branch)
            }
          : undefined
      }
    />
  ))

  const columnHeaders = [
    'ID',
    'Estado',
    'Sucursal',
    'Dirección',
    'Sector',
    'Nombre del Encargado',
    'WhatsApp',
  ]
  const exportRows = data.map((branch) => [
    String(branch.numericId),
    branch.archivedAt ? 'Inactivo' : 'Activo',
    branch.name,
    addressText(branch.addressDetails, 'address') || 'Sin dirección',
    addressText(branch.addressDetails, 'sector') || 'Sin sector',
    branch.managerName ?? 'Sin encargado',
    branch.managerPhone ? formatPhone(branch.managerPhone) : '',
  ])
  const chips: ActiveFilterChip[] = [
    ...(applied.archived !== 'false'
      ? [
          {
            key: 'archived',
            label: 'Estado',
            value: archivedOptions.find(
              (option) => option.value === applied.archived,
            )!.label,
          },
        ]
      : []),
    ...(applied.name
      ? [{ key: 'name', label: 'Sucursal', value: applied.name }]
      : []),
    ...(applied.address
      ? [{ key: 'address', label: 'Dirección', value: applied.address }]
      : []),
    ...(applied.sector
      ? [{ key: 'sector', label: 'Sector', value: applied.sector }]
      : []),
    ...(applied.manager
      ? [{ key: 'manager', label: 'Encargado', value: applied.manager }]
      : []),
    ...(applied.whatsapp
      ? [{ key: 'whatsapp', label: 'WhatsApp', value: applied.whatsapp }]
      : []),
  ]
  const filterCount = chips.length

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Sucursales"
        subtitle="Organiza los puntos de atención de tu farmacia."
        actions={
          <>
            {canCreate && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Crear Sucursal
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <SearchField
          wrapperClassName="w-full sm:w-[34rem]"
          aria-label="Buscar sucursales"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nombre, dirección, sector o encargado"
        />
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft(applied)}
        />
        <TableToolbarActions
          title="Sucursales"
          headers={columnHeaders}
          rows={exportRows}
          filename="sucursales"
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          setApplied((current) => ({
            ...current,
            [key]: emptyFilters[key as keyof BranchFilters],
          }))
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de sucursales."
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
            label="Estado de la Sucursal"
            icon={<Activity className="size-4" />}
          >
            <select
              aria-label="Estado de la sucursal"
              value={filterDraft.archived}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  archived: event.target.value as ArchivedFilter,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {archivedOptions.map((option) => (
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
                <option value="">
                  {key === 'address' ? 'Todas' : 'Todos'}
                </option>
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
      {branches.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar las sucursales. {branches.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {branches.isFetching ? (
          <TableSkeleton columns={7} />
        ) : (
          <DataTable
            columns={columnHeaders}
            rows={tableRows}
            actions={tableActions}
            sortableColumns={[0, 1, 2, 3, 4, 5, 6]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const branch = data[index]
              if (branch) openView(branch)
            }}
            emptyTitle={
              archived === 'true'
                ? 'No hay sucursales inactivas'
                : 'Todavía no hay sucursales'
            }
            emptyDescription={
              canCreate
                ? 'Crea la primera sucursal para empezar a organizar tu operación.'
                : 'Cuando tu organización tenga sucursales, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={branches.data?.total ?? 0}
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
              viewOnly
                ? 'Ver Sucursal'
                : editing
                  ? editTitle('sucursal', editing?.name)
                  : 'Crear Sucursal'
            }
            description="Completa los datos de este punto de atención."
            icon={<Building2 className="size-5" />}
            compactHeader
            bodyClassName="pt-3"
            onClose={closeForm}
            headerAction={
              editing && canUpdate ? (
                <StatusToggle
                  active={statusDraft.value}
                  pending={save.isPending}
                  onChange={statusDraft.set}
                />
              ) : undefined
            }
          >
            <BranchForm
              key={editing?.id ?? 'new'}
              initialValues={
                editing
                  ? {
                      name: editing.name,
                      labelColor: editing.labelColor,
                      ...addressValues(editing.addressDetails),
                      description: editing.description ?? '',
                      managerName: editing.managerName ?? '',
                      managerPhone: editing.managerPhone ?? '',
                      managerEmail: editing.managerEmail ?? '',
                    }
                  : undefined
              }
              onSave={submit}
              onCancel={closeForm}
              submitting={save.isPending}
              readOnly={viewOnly}
              onEdit={() => setViewOnly(false)}
            />
          </Dialog>
        </StatusDraftProvider>
      )}
      {purging && (
        <PurgeDialog
          name={purging.name}
          confirming={purge.isPending}
          error={
            purge.isError
              ? purge.error instanceof ApiError
                ? purge.error.message
                : 'No pudimos borrar la sucursal.'
              : undefined
          }
          onConfirm={() => purge.mutate(purging.id)}
          onClose={() => setPurging(null)}
        />
      )}
    </div>
  )
}
