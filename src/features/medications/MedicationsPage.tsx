import { useMemo, useState } from 'react'
import { ImportButton } from '@/components/ImportButton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pill, Plus, Search, ToggleRight } from 'lucide-react'
import { DataTable, RowActions } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { TableToolbarActions } from '@/components/TableToolbarActions'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import { applyColumnSort, useColumnSort } from '@/lib/table-sort'
import type { components, paths } from '@/lib/api-types'
import type { MedicationFormValues } from '@/schemas/medication'
import {
  setPrimaryMedicationAttachment,
  uploadMedicationAttachment,
} from '@/lib/medication-attachments'
import { MedicationForm } from './MedicationForm'
import { MedicationImage } from './MedicationImage'
import { MedicationPatientsDialog } from './MedicationPatientsDialog'
import type { StagedAttachment } from './MedicationAttachments'

type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type MedicationQuery = NonNullable<
  paths['/api/v1/medications']['get']['parameters']['query']
>

const DEFAULT_ARCHIVED = 'false' as 'true' | 'false'
const archivedOptions: { value: 'true' | 'false'; label: string }[] = [
  { value: 'false', label: 'Activos' },
  { value: 'true', label: 'Archivados' },
]

function queryString(query: MedicationQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value))
  return params.toString()
}

export default function MedicationsPage() {
  const canCreate = useCan('medications:write')
  const canUpdate = useCan('medications:write')
  const canArchive = useCan('medications:write')
  const canReadPatients = useCan('patients:read')
  const canReadTreatments = useCan('treatments:read')
  const canViewPatients = canReadPatients && canReadTreatments
  const queryClient = useQueryClient()
  const [patientsOf, setPatientsOf] = useState<
    components['schemas']['Medication'] | null
  >(null)
  const [search, setSearch] = useState('')
  const [archived, setArchived] = useState<'true' | 'false'>(DEFAULT_ARCHIVED)
  const [filterDraft, setFilterDraft] = useState<{
    archived: 'true' | 'false'
  } | null>(null)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [sort, toggleSort] = useColumnSort()
  const [editing, setEditing] = useState<
    components['schemas']['Medication'] | null
  >(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)
  const [archiving, setArchiving] = useState<
    components['schemas']['Medication'] | null
  >(null)

  const filters = useMemo<MedicationQuery>(
    () => ({
      q: search.trim() || undefined,
      archived,
      page,
      rows,
    }),
    [archived, page, rows, search],
  )
  const medications = useQuery({
    queryKey: ['medications', filters],
    queryFn: () =>
      api<MedicationList>(`/api/v1/medications?${queryString(filters)}`),
  })
  const save = useMutation({
    mutationFn: async ({
      values,
      staged,
    }: {
      values: MedicationFormValues
      staged: StagedAttachment[]
    }) => {
      if (editing) {
        const body: components['schemas']['MedicationPatch'] = {
          ...values,
          ...(values.brandName
            ? { brandName: values.brandName }
            : { brandName: null }),
          ...(values.genericName
            ? { genericName: values.genericName }
            : { genericName: null }),
          ...(values.activeIngredient
            ? { activeIngredient: values.activeIngredient }
            : { activeIngredient: null }),
        }
        return api<components['schemas']['Medication']>(
          `/api/v1/medications/${encodeURIComponent(editing.id)}`,
          { method: 'PATCH', body: JSON.stringify(body) },
        )
      }
      const body: components['schemas']['MedicationCreate'] = {
        ...values,
        ...(values.brandName
          ? { brandName: values.brandName }
          : { brandName: null }),
        ...(values.genericName
          ? { genericName: values.genericName }
          : { genericName: null }),
        ...(values.activeIngredient
          ? { activeIngredient: values.activeIngredient }
          : { activeIngredient: null }),
      }
      const created = await api<components['schemas']['Medication']>(
        '/api/v1/medications',
        { method: 'POST', body: JSON.stringify(body) },
      )
      const failed: string[] = []
      let primaryId: string | undefined
      for (const item of staged) {
        try {
          const uploaded = await uploadMedicationAttachment(
            created.id,
            item.file,
          )
          if (item.isPrimary) primaryId = uploaded.id
        } catch {
          failed.push(item.file.name)
        }
      }
      if (primaryId)
        await setPrimaryMedicationAttachment(created.id, primaryId).catch(
          () => undefined,
        )
      if (failed.length) {
        await queryClient.invalidateQueries({ queryKey: ['medications'] })
        setEditing(created)
        throw new Error(
          'El medicamento se creó, pero no se pudieron subir: ' +
            failed.join(', ') +
            '. Vuelve a intentarlo desde Imágenes y Documentos.',
        )
      }
      return created
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['medications'] })
      closeForm()
    },
  })
  const archive = useMutation({
    mutationFn: (id: string) =>
      api<components['schemas']['Medication']>(
        `/api/v1/medications/${encodeURIComponent(id)}/archive`,
        { method: 'POST' },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['medications'] })
      setArchiving(null)
    },
  })
  const restore = useMutation({
    mutationFn: (id: string) =>
      api<components['schemas']['Medication']>(
        `/api/v1/medications/${encodeURIComponent(id)}/restore`,
        { method: 'POST' },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['medications'] }),
  })

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    setViewOnly(false)
  }
  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(item: components['schemas']['Medication']) {
    setEditing(item)
    setViewOnly(false)
    setFormOpen(true)
  }
  /** Doble clic en la fila: mismo formulario, pero bloqueado. */
  function openView(item: components['schemas']['Medication']) {
    setEditing(item)
    setViewOnly(true)
    setFormOpen(true)
  }

  const items = applyColumnSort(
    medications.data?.data ?? [],
    sort,
    (item, index) =>
      index === 0
        ? item.numericId
        : index === 1
          ? item.archivedAt
            ? 1
            : 0
          : index === 2
            ? item.brandName ||
              item.genericName ||
              item.activeIngredient ||
              'Medicamento'
            : index === 3
              ? item.activeIngredient || item.genericName || ''
              : index === 4
                ? item.presentation
                : index === 5
                  ? item.unitsPerPackage
                  : (item.treatmentCount ?? 0),
  )
  const tableRows = items.map((item) => [
    <span key="id" className="text-muted font-mono text-xs">
      {item.numericId}
    </span>,
    <span key="state" className="text-muted">
      {item.archivedAt ? 'Archivado' : 'Activo'}
    </span>,
    <span key="name" className="flex items-center gap-3">
      <MedicationImage
        medicationId={item.id}
        attachmentId={item.primaryImageId}
        className="size-10 shrink-0 rounded-lg"
      />
      <span className="text-petroleo font-semibold">
        {item.brandName ||
          item.genericName ||
          item.activeIngredient ||
          'Medicamento'}
      </span>
    </span>,
    <span key="ingredient" className="text-muted">
      {item.activeIngredient || item.genericName || ''}
    </span>,
    <span key="presentation">{item.presentation}</span>,
    <span key="units">
      {String(item.unitsPerPackage)} {item.doseUnit} por envase
    </span>,
    canViewPatients && (item.treatmentCount ?? 0) > 0 ? (
      <button
        key="treatments"
        type="button"
        title="Ver clientes en tratamiento"
        onClick={() => setPatientsOf(item)}
        className="text-tealmax font-semibold underline-offset-2 hover:underline"
      >
        {item.treatmentCount}
      </button>
    ) : (
      <span key="treatments" className="text-muted">
        {item.treatmentCount ?? 0}
      </span>
    ),
  ])
  const exportHeaders = [
    'ID',
    'Estado',
    'Medicamento',
    'Principio Activo',
    'Presentación',
    'Contenido',
    'Tratamientos',
  ]
  const exportRows = items.map((item) => [
    String(item.numericId),
    item.archivedAt ? 'Archivado' : 'Activo',
    item.brandName ||
      item.genericName ||
      item.activeIngredient ||
      'Medicamento',
    item.activeIngredient || item.genericName || '',
    item.presentation,
    `${String(item.unitsPerPackage)} ${item.doseUnit} por envase`,
    String(item.treatmentCount ?? 0),
  ])
  const filterCount = archived !== DEFAULT_ARCHIVED ? 1 : 0
  const chips: ActiveFilterChip[] = []
  if (archived !== DEFAULT_ARCHIVED)
    chips.push({
      key: 'archived',
      label: 'Estado',
      value: archivedOptions.find((option) => option.value === archived)!.label,
    })
  const rowActions = items.map((item) => {
    const label = item.brandName || item.genericName || item.presentation
    return (
      <RowActions
        key={item.id}
        label={label}
        deleteLabel="Archivar"
        onEdit={canUpdate ? () => openEdit(item) : undefined}
        onDelete={
          canArchive && !item.archivedAt
            ? () => {
                archive.reset()
                setArchiving(item)
              }
            : undefined
        }
        onRestore={
          canArchive && item.archivedAt
            ? () => restore.mutate(item.id)
            : undefined
        }
      />
    )
  })

  return (
    <div className="animate-in flex h-full min-h-0 flex-col">
      <PageHeader
        title="Medicamentos"
        subtitle="Presentaciones y unidades registradas para la organización."
        actions={
          <>
            <div className="flex flex-wrap gap-2">
              <ImportButton entity="medications" />
              {canCreate && (
                <Button variant="primary" onClick={openCreate}>
                  <Plus className="size-4" />
                  Nuevo medicamento
                </Button>
              )}
            </div>
          </>
        }
      />
      <FilterBarRow aria-label="Filtros">
        <label className="relative w-full sm:w-[34rem]">
          <Search className="text-muted pointer-events-none absolute top-3 left-3 size-4" />
          <input
            aria-label="Buscar medicamentos"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Nombre, principio activo o presentación"
            className="border-border focus:border-tealmax h-10 w-full rounded-lg border bg-white pl-9 text-sm outline-none"
          />
        </label>
        <AdvancedFilterButton
          open={filterDraft !== null}
          count={filterCount}
          onClick={() => setFilterDraft({ archived })}
        />
        <TableToolbarActions
          title="Medicamentos"
          headers={exportHeaders}
          rows={exportRows}
          filename="medicamentos"
          exportEntity="medications"
          exportFilters={{ q: search.trim() }}
        />
      </FilterBarRow>
      <ActiveFilterChips
        chips={chips}
        onRemove={() => {
          setArchived(DEFAULT_ARCHIVED)
          setPage(1)
        }}
      />
      {filterDraft && (
        <AdvancedFilterDialog
          open
          description="Combina estos criterios para acotar la lista de medicamentos."
          onClose={() => setFilterDraft(null)}
          onClear={() => {
            setFilterDraft({ archived: DEFAULT_ARCHIVED })
            setArchived(DEFAULT_ARCHIVED)
            setPage(1)
          }}
          clearDisabled={
            !filterCount && filterDraft.archived === DEFAULT_ARCHIVED
          }
          onApply={() => {
            setArchived(filterDraft.archived)
            setPage(1)
            setFilterDraft(null)
          }}
        >
          <FilterField label="Estado" icon={<ToggleRight className="size-4" />}>
            <select
              aria-label="Estado"
              value={filterDraft.archived}
              onChange={(event) =>
                setFilterDraft({
                  archived: event.target.value as 'true' | 'false',
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
        </AdvancedFilterDialog>
      )}
      {medications.isError && (
        <p
          role="alert"
          className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar el catálogo. {medications.error.message}
        </p>
      )}
      <div className="min-h-0 flex-1">
        {medications.isFetching ? (
          <TableSkeleton columns={7} />
        ) : (
          <DataTable
            columns={[
              'ID',
              'Estado',
              'Medicamento',
              'Principio activo',
              'Presentación',
              'Contenido',
              'Tratamientos',
            ]}
            rows={tableRows}
            actions={rowActions}
            sortableColumns={[0, 1, 2, 3, 4, 5, 6]}
            sort={sort}
            onSortChange={toggleSort}
            onRowDoubleClick={(index) => {
              const item = items[index]
              if (item) openView(item)
            }}
            emptyTitle={
              archived === 'true'
                ? 'No hay medicamentos archivados'
                : 'Todavía no hay medicamentos'
            }
            emptyDescription={
              canCreate
                ? 'Agrega medicamentos para construir el catálogo de tu farmacia.'
                : 'Cuando tu organización tenga medicamentos, aparecerán aquí.'
            }
            footer={
              <Pagination
                page={page}
                rows={rows}
                total={medications.data?.total ?? 0}
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
      {patientsOf && (
        <MedicationPatientsDialog
          medication={patientsOf}
          name={
            patientsOf.brandName ||
            patientsOf.genericName ||
            patientsOf.activeIngredient ||
            'Medicamento'
          }
          onClose={() => setPatientsOf(null)}
        />
      )}
      {formOpen && (
        <Dialog
          title={
            viewOnly
              ? 'Ver Medicamento'
              : editing
                ? 'Editar Medicamento'
                : 'Nuevo Medicamento'
          }
          titleAside={editing?.brandName || undefined}
          description="Registra los datos de presentación del producto."
          icon={<Pill className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeForm}
        >
          <MedicationForm
            key={editing?.id ?? 'new'}
            medication={editing ?? undefined}
            onSave={(values, staged) =>
              save.mutateAsync({ values, staged }).then(() => undefined)
            }
            onCancel={closeForm}
            submitting={save.isPending}
            readOnly={viewOnly}
            onEdit={() => setViewOnly(false)}
          />
        </Dialog>
      )}
      {archiving && (
        <ConfirmDialog
          title="Confirmar"
          description={
            <>
              ¿Está seguro que desea archivar el medicamento{' '}
              <strong>
                {archiving.brandName ||
                  archiving.genericName ||
                  archiving.presentation}
              </strong>
              ?
              {archive.isError && (
                <p role="alert" className="mt-3 text-sm text-red-800">
                  {archive.error.message}
                </p>
              )}
            </>
          }
          confirmLabel="Archivar"
          confirming={archive.isPending}
          onConfirm={() => archive.mutate(archiving.id)}
          onClose={() => setArchiving(null)}
        />
      )}
    </div>
  )
}
