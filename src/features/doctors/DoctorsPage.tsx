import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  Phone,
  Plus,
  Stethoscope,
  ToggleRight,
  UserRound,
} from 'lucide-react'
import { SearchField } from '@/components/ui/SearchField'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { TableToolbarActions } from '@/components/TableToolbarActions'
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
import { PageHeader } from '@/components/ui/PageHeader'
import { MoreBubble } from '@/components/ui/MoreBubble'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { editTitle } from '@/lib/editTitle'
import { api, ApiError } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { formatPhone } from '@/lib/phone'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { components, paths } from '@/lib/api-types'
import type { DoctorFormValues } from '@/schemas/doctor'
import { DoctorForm } from './DoctorForm'
import { syncDoctorMedicalCenters, syncDoctorSpecialties } from './doctorLinks'

type DoctorWithLinks = components['schemas']['Doctor'] & {
  specialties?: { specialty: components['schemas']['MedicalSpecialty'] }[]
  medicalCenters?: (components['schemas']['DoctorMedicalCenterLink'] & {
    medicalCenter: components['schemas']['MedicalCenter']
  })[]
}
type DoctorList =
  paths['/api/v1/doctors']['get']['responses'][200]['content']['application/json']
type ActiveFilter = 'true' | 'false' | 'all'
type DoctorQuery = Omit<
  NonNullable<paths['/api/v1/doctors']['get']['parameters']['query']>,
  'isActive'
> & { isActive?: ActiveFilter }

const DEFAULT_ACTIVE = 'true' as ActiveFilter
const activeOptions: { value: ActiveFilter; label: string }[] = [
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
  { value: 'all', label: 'Todos' },
]

type DoctorFilters = {
  isActive: ActiveFilter
  name: string
  license: string
  phone: string
  specialty: string
}

const emptyFilters: DoctorFilters = {
  isActive: DEFAULT_ACTIVE,
  name: '',
  license: '',
  phone: '',
  specialty: '',
}

function uniqueSorted(
  values: (string | null | undefined)[],
  ...selected: string[]
) {
  const set = new Set(values.filter((value): value is string => !!value))
  for (const value of selected) if (value) set.add(value)
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

/** Nombres de las clínicas activas del médico. */
function clinicNames(item: DoctorWithLinks) {
  return (
    item.medicalCenters
      ?.filter((link) => link.isActive)
      .map((link) => link.medicalCenter.name) ?? []
  )
}

const textFilters: {
  key: 'name' | 'license' | 'phone' | 'specialty'
  label: string
  icon: ReactNode
}[] = [
  { key: 'name', label: 'Médico', icon: <UserRound className="size-4" /> },
  {
    key: 'license',
    label: 'Colegiatura',
    icon: <BadgeCheck className="size-4" />,
  },
  { key: 'phone', label: 'Teléfono', icon: <Phone className="size-4" /> },
  {
    key: 'specialty',
    label: 'Especialidades',
    icon: <Stethoscope className="size-4" />,
  },
]

function queryString(query: DoctorQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

export default function DoctorsPage() {
  const canWrite = useCan('doctors:write')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  // El servidor solo filtra por estado: el resto se aplica sobre la página cargada.
  const [applied, setApplied] = useState<DoctorFilters>(emptyFilters)
  const [filterDraft, setFilterDraft] = useState<DoctorFilters | null>(null)
  const isActive = applied.isActive
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<DoctorWithLinks | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [purging, setPurging] = useState<DoctorWithLinks | null>(null)
  const statusDraft = useStatusDraft(editing?.isActive ?? true)

  const filters = useMemo<DoctorQuery>(
    () => ({ q: search.trim() || undefined, isActive, page, rows }),
    [isActive, page, rows, search],
  )
  const doctors = useQuery({
    queryKey: ['doctors', filters],
    queryFn: () => api<DoctorList>(`/api/v1/doctors?${queryString(filters)}`),
  })
  const save = useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        licenseNumber: values.licenseNumber || null,
        phone: values.phone || null,
        email: values.email || null,
        notes: values.notes || null,
      }
      const doctor = editing
        ? await api<components['schemas']['Doctor']>(
            `/api/v1/doctors/${encodeURIComponent(editing.id)}`,
            { method: 'PATCH', body: JSON.stringify(body) },
          )
        : await api<components['schemas']['Doctor']>('/api/v1/doctors', {
            method: 'POST',
            body: JSON.stringify(body),
          })
      const doctorId = editing?.id ?? doctor.id
      await syncDoctorSpecialties(
        doctorId,
        editing?.specialties?.map((link) => link.specialty.id) ?? [],
        values.specialtyIds,
      )
      await syncDoctorMedicalCenters(
        doctorId,
        editing?.medicalCenters
          ?.filter((link) => link.isActive)
          .map((link) => link.medicalCenterId) ?? [],
        values.medicalCenterIds,
      )
      if (editing && statusDraft.changed)
        await toggleActive.mutateAsync({
          id: editing.id,
          active: statusDraft.value,
        })
      return doctor
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      closeForm()
    },
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api<components['schemas']['Doctor']>(
        `/api/v1/doctors/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: active }) },
      ),
    onSuccess: (updated) => {
      setEditing((current) =>
        current && current.id === updated.id
          ? { ...current, isActive: updated.isActive }
          : current,
      )
      return queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
  const purge = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/doctors/${encodeURIComponent(id)}/permanent`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      setPurging(null)
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
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
  function openEdit(item: DoctorWithLinks) {
    statusDraft.reset()
    setEditing(item)
    setFormOpen(true)
  }

  const loaded = (doctors.data?.data ?? []) as DoctorWithLinks[]
  const specialtyNames = (item: DoctorWithLinks) =>
    item.specialties?.map((link) => link.specialty.name) ?? []
  const phoneText = (item: DoctorWithLinks) =>
    item.phone ? formatPhone(item.phone) : ''
  const textOptions = {
    name: uniqueSorted(
      loaded.map((item) => `${item.firstName} ${item.lastName}`),
      applied.name,
      filterDraft?.name ?? '',
    ),
    license: uniqueSorted(
      loaded.map((item) => item.licenseNumber),
      applied.license,
      filterDraft?.license ?? '',
    ),
    phone: uniqueSorted(
      loaded.map(phoneText),
      applied.phone,
      filterDraft?.phone ?? '',
    ),
    specialty: uniqueSorted(
      loaded.flatMap(specialtyNames),
      applied.specialty,
      filterDraft?.specialty ?? '',
    ),
  }
  const items = applyColumnSort(
    loaded.filter(
      (item) =>
        (!applied.name ||
          `${item.firstName} ${item.lastName}` === applied.name) &&
        (!applied.license || item.licenseNumber === applied.license) &&
        (!applied.phone || phoneText(item) === applied.phone) &&
        (!applied.specialty ||
          specialtyNames(item).includes(applied.specialty)),
    ),
    sort,
    (item, index) =>
      index === 0
        ? item.numericId
        : index === 1
          ? item.isActive
            ? 1
            : 0
          : index === 2
            ? `${item.firstName} ${item.lastName}`
            : index === 3
              ? (item.licenseNumber ?? '')
              : (item.phone ?? ''),
  )
  const tableRows = items.map((item) => [
    <span key="id" className="text-muted font-mono text-xs">
      {item.numericId}
    </span>,
    <StatusBadge key="state" active={item.isActive} />,
    <span key="name" className="text-petroleo font-semibold">
      {item.firstName} {item.lastName}
    </span>,
    <span key="license" className="text-muted">
      {item.licenseNumber || ''}
    </span>,
    <span key="phone" className="text-muted">
      {item.phone ? formatPhone(item.phone) : ''}
    </span>,
    <div key="specialties" className="flex items-center gap-1">
      {specialtyNames(item)[0] && (
        <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs">
          {specialtyNames(item)[0]}
        </span>
      )}
      <MoreBubble
        label="Otras especialidades"
        items={specialtyNames(item).slice(1)}
      />
    </div>,
    <span key="clinic" className="text-muted inline-flex items-center gap-1">
      {clinicNames(item)[0]}
      <MoreBubble label="Otras clínicas" items={clinicNames(item).slice(1)} />
    </span>,
  ])
  const exportHeaders = [
    'ID',
    'Estado',
    'Médico',
    'Colegiatura',
    'Teléfono',
    'Especialidades',
    'Clínica',
  ]
  const exportRows = items.map((item) => [
    String(item.numericId),
    item.isActive ? 'Activo' : 'Inactivo',
    `${item.firstName} ${item.lastName}`,
    item.licenseNumber || '',
    item.phone ? formatPhone(item.phone) : '',
    item.specialties?.map((link) => link.specialty.name).join(', ') || '',
    clinicNames(item).join(', '),
  ])
  const chips: ActiveFilterChip[] = []
  if (applied.isActive !== DEFAULT_ACTIVE)
    chips.push({
      key: 'isActive',
      label: 'Estado',
      value: activeOptions.find((option) => option.value === applied.isActive)!
        .label,
    })
  for (const { key, label } of textFilters)
    if (applied[key]) chips.push({ key, label, value: applied[key] })
  const filterCount = chips.length
  const rowActions = items.map((item) => (
    <RowActions
      key={item.id}
      label={`${item.firstName} ${item.lastName}`}
      onEdit={canWrite ? () => openEdit(item) : undefined}
      onPurge={
        canWrite
          ? () => {
              purge.reset()
              setPurging(item)
            }
          : undefined
      }
    />
  ))

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Médicos"
        subtitle="Doctores y sus especialidades y centros médicos."
        actions={
          <>
            {canWrite && (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="size-4" />
                Crear Médico
              </Button>
            )}
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <SearchField
          wrapperClassName="w-full sm:w-[34rem]"
          aria-label="Buscar Médicos"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Nombre o colegiatura"
        />
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft(applied)}
        />
        <TableToolbarActions
          title="Médicos"
          headers={exportHeaders}
          rows={exportRows}
          filename="medicos"
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={(key) => {
          setApplied((current) => ({
            ...current,
            [key]: emptyFilters[key as keyof DoctorFilters],
          }))
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de médicos."
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
          <FilterField label="Estado" icon={<ToggleRight className="size-4" />}>
            <Select
              aria-label="Estado"
              value={filterDraft.isActive}
              onChange={(event) =>
                setFilterDraft({
                  ...filterDraft,
                  isActive: event.target.value as ActiveFilter,
                })
              }
              className={`${filterControlClass} pl-11`}
            >
              {activeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FilterField>
          {textFilters.map(({ key, label, icon }) => (
            <FilterField key={key} label={label} icon={icon}>
              <Select
                aria-label={label}
                value={filterDraft[key]}
                onChange={(event) =>
                  setFilterDraft({ ...filterDraft, [key]: event.target.value })
                }
                className={`${filterControlClass} pl-11`}
              >
                <option value="">
                  {key === 'specialty' ? 'Todas' : 'Todos'}
                </option>
                {textOptions[key].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </FilterField>
          ))}
        </AdvancedFilterDialog>
      )}
      {doctors.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el catálogo. {doctors.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {doctors.isFetching ? (
          <TableSkeleton columns={7} />
        ) : (
          <DataTable
            columns={[
              'ID',
              'Estado',
              'Médico',
              'Colegiatura',
              'Teléfono',
              'Especialidades',
              'Clínica',
            ]}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3, 4]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item) navigate(`/medicos/${encodeURIComponent(item.id)}`)
            }}
            emptyTitle={
              isActive === 'false'
                ? 'No hay médicos inactivos'
                : 'Todavía no hay médicos'
            }
            emptyDescription={
              canWrite
                ? 'Agrega médicos para asociarlos a los pacientes.'
                : 'Cuando tu organización tenga médicos registrados, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={doctors.data?.total ?? 0}
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
              editing
                ? editTitle(
                    'médico',
                    `${editing.firstName} ${editing.lastName}`,
                  )
                : 'Crear Médico'
            }
            icon={<Stethoscope className="size-5" />}
            compactHeader
            description="Datos de contacto y colegiatura del Médico."
            bodyClassName="pt-2"
            onClose={closeForm}
            size="lg"
            headerAction={
              editing && canWrite ? (
                <StatusToggle
                  active={statusDraft.value}
                  pending={save.isPending}
                  onChange={statusDraft.set}
                />
              ) : undefined
            }
          >
            <DoctorForm
              key={editing?.id ?? 'new'}
              doctor={editing ?? undefined}
              onSave={(values) =>
                save.mutateAsync(values).then(() => undefined)
              }
              onCancel={closeForm}
              submitting={save.isPending}
            />
          </Dialog>
        </StatusDraftProvider>
      )}
      {purging && (
        <PurgeDialog
          name={`${purging.firstName} ${purging.lastName}`}
          confirming={purge.isPending}
          error={
            purge.isError
              ? purge.error instanceof ApiError
                ? purge.error.message
                : 'No pudimos borrar el médico.'
              : undefined
          }
          onConfirm={() => purge.mutate(purging.id)}
          onClose={() => setPurging(null)}
        />
      )}
    </div>
  )
}
