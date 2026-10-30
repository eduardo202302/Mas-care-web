import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Columns3, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { CustomPropertyFilter } from '@/components/CustomFields'
import { usePipeline } from '@/lib/pipeline'
import { useMe } from '@/lib/permissions'
import type { BoardFilters } from '@/lib/board'
import {
  cycleColumns,
  type ColumnDef,
  dateFilterKeys,
  savedViewsKey,
  sortFields,
  useSaveView,
  useSavedViews,
  type SavedView,
  type SortPart,
  type TableFilters,
} from '@/lib/cycle-table'

const control = 'border-border h-9 rounded-lg border bg-white px-2 text-sm'

type Named = { id: string; name: string }

function useNamed(path: string, key: string) {
  return useQuery({
    queryKey: [key, 'table-filter'],
    queryFn: () => api<{ data: Named[] }>(path),
  })
}

function CheckList({
  label,
  options,
  value = [],
  onChange,
}: {
  label: string
  options: Named[]
  value?: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <details className="border-border rounded-lg border bg-white">
      <summary className="cursor-pointer px-3 py-2 text-sm">
        {label}
        {value.length > 0 && ` (${value.length})`}
      </summary>
      <div className="grid max-h-48 gap-1 overflow-y-auto px-3 pb-2">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(option.id)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, option.id]
                    : value.filter((id) => id !== option.id),
                )
              }
            />
            {option.name}
          </label>
        ))}
      </div>
    </details>
  )
}

/** Date ranges and association filters (patient, medication, branch, responsible, treatment) with and/or. */
export function TableFilterPanel({
  board,
  table,
  onBoard,
  onTable,
}: {
  board: BoardFilters
  table: TableFilters
  onBoard: (next: BoardFilters) => void
  onTable: (next: TableFilters) => void
}) {
  const { data: me } = useMe()
  const users = useQuery({
    queryKey: ['users', 'table-filter'],
    queryFn: () =>
      api<{ data: { id: string; name: string }[] }>('/api/v1/users?limit=100'),
  })
  const medications = useQuery({
    queryKey: ['medications', 'table-filter'],
    queryFn: () =>
      api<{
        data: {
          id: string
          genericName: string | null
          brandName: string | null
          presentation: string
        }[]
      }>('/api/v1/medications?archived=false&limit=100'),
  })
  const [patientSearch, setPatientSearch] = useState('')
  const patients = useQuery({
    queryKey: ['patients', 'table-filter', patientSearch],
    queryFn: () =>
      api<{ data: { id: string; fullName: string }[] }>(
        `/api/v1/patients?q=${encodeURIComponent(patientSearch)}&limit=8`,
      ),
    enabled: patientSearch.trim().length >= 2,
  })
  const board_ = board as Record<string, string | undefined>
  const { data: pipeline } = usePipeline()
  const table_ = table as Record<string, unknown>
  const setDate = (key: string, value: string) => {
    if (key.startsWith('expected'))
      onBoard({ ...board, [key]: value || undefined })
    else onTable({ ...table, [key]: value || undefined })
  }
  const dateValue = (key: string) =>
    (key.startsWith('expected')
      ? board_[key]
      : (table_[key] as string | undefined)) ?? ''
  const hasSets = [
    table.patient_ids,
    table.medication_ids,
    table.branch_ids,
    table.responsible_ids,
    table.treatment_ids,
  ].some((set) => set?.length)

  return (
    <section
      aria-label="Filtros avanzados"
      className="border-border mb-3 grid gap-3 rounded-xl border bg-white p-3"
    >
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {dateFilterKeys.map(([from, to, label]) => (
          <fieldset key={label} className="grid gap-1">
            <legend className="text-muted text-xs font-semibold">
              {label}
            </legend>
            <div className="flex gap-1">
              <input
                type="date"
                aria-label={`${label} desde`}
                className={control}
                value={dateValue(from)}
                onChange={(e) => setDate(from, e.target.value)}
              />
              <input
                type="date"
                aria-label={`${label} hasta`}
                className={control}
                value={dateValue(to)}
                onChange={(e) => setDate(to, e.target.value)}
              />
            </div>
          </fieldset>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <CheckList
          label="Sucursal"
          options={me?.branches ?? []}
          value={table.branch_ids}
          onChange={(next) => onTable({ ...table, branch_ids: next })}
        />
        <CheckList
          label="Medicamento"
          options={(medications.data?.data ?? []).map((m) => ({
            id: m.id,
            name: `${m.genericName ?? m.brandName ?? m.presentation} ${m.presentation}`,
          }))}
          value={table.medication_ids}
          onChange={(next) => onTable({ ...table, medication_ids: next })}
        />
        <CheckList
          label="Responsable"
          options={users.data?.data ?? []}
          value={table.responsible_ids}
          onChange={(next) => onTable({ ...table, responsible_ids: next })}
        />
        <div className="relative">
          <input
            aria-label="Buscar paciente para filtrar"
            placeholder="Paciente: escribe para buscar"
            className={`${control} w-full`}
            value={patientSearch}
            onChange={(event) => setPatientSearch(event.target.value)}
          />
          {patientSearch.trim().length >= 2 &&
            (patients.data?.data.length ?? 0) > 0 && (
              <ul className="border-border absolute z-20 mt-1 w-full rounded-lg border bg-white p-1 shadow-lg">
                {patients.data!.data.map((patient) => (
                  <li key={patient.id}>
                    <button
                      type="button"
                      className="hover:bg-surface w-full rounded-md px-2 py-1.5 text-left text-sm"
                      onClick={() => {
                        onTable({
                          ...table,
                          patient_ids: [
                            ...new Set([
                              ...(table.patient_ids ?? []),
                              patient.id,
                            ]),
                          ],
                        })
                        setPatientSearch('')
                      }}
                    >
                      {patient.fullName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
      {pipeline && (
        <label className="grid max-w-md gap-1 text-xs font-semibold">
          <span className="text-muted">Etapa</span>
          <select
            aria-label="Filtrar por etapa"
            className={control}
            value={table.stage_id ?? ''}
            onChange={(e) =>
              onTable({ ...table, stage_id: e.target.value || undefined })
            }
          >
            <option value="">Todas</option>
            {pipeline.stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="max-w-md">
        <CustomPropertyFilter
          entity="treatment"
          propertyKey={table.cp_key}
          value={table.cp_value}
          onChange={(next) => onTable({ ...table, ...next })}
        />
      </div>
      {table.patient_ids?.length || table.treatment_ids?.length ? (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {table.patient_ids?.map((id) => (
            <Chip
              key={id}
              onRemove={() =>
                onTable({
                  ...table,
                  patient_ids: table.patient_ids?.filter((x) => x !== id),
                })
              }
            >
              Paciente {id.slice(-4)}
            </Chip>
          ))}
          {table.treatment_ids?.map((id) => (
            <Chip
              key={id}
              onRemove={() =>
                onTable({
                  ...table,
                  treatment_ids: table.treatment_ids?.filter((x) => x !== id),
                })
              }
            >
              Tratamiento {id.slice(-4)}
            </Chip>
          ))}
        </div>
      ) : null}
      {hasSets && (
        <label className="flex items-center gap-2 text-sm">
          Combinar asociaciones con
          <select
            aria-label="Combinar con"
            className={control}
            value={table.match}
            onChange={(e) =>
              onTable({ ...table, match: e.target.value as 'and' | 'or' })
            }
          >
            <option value="and">Y (todas)</option>
            <option value="or">O (cualquiera)</option>
          </select>
        </label>
      )}
    </section>
  )
}

function Chip({
  children,
  onRemove,
}: {
  children: ReactNode
  onRemove: () => void
}) {
  return (
    <span className="border-border inline-flex items-center gap-1 rounded-full border bg-slate-50 px-2 py-0.5">
      {children}
      <button type="button" aria-label="Quitar filtro" onClick={onRemove}>
        <X className="size-3" />
      </button>
    </span>
  )
}

/** Up to 3 sort levels, e.g. derived status then expected date. */
export function SortEditor({
  sort,
  onChange,
  fields = sortFields,
}: {
  sort: SortPart[]
  onChange: (next: SortPart[]) => void
  fields?: { value: string; label: string }[]
}) {
  const set = (index: number, part: SortPart) =>
    onChange(sort.map((p, i) => (i === index ? part : p)))
  return (
    <div
      className="flex flex-wrap items-center gap-2 text-sm"
      aria-label="Orden"
    >
      <span className="text-muted text-xs font-semibold">Ordenar por</span>
      {sort.map((part, index) => (
        <span key={index} className="flex items-center gap-1">
          <select
            aria-label={`Campo de orden ${index + 1}`}
            className={control}
            value={part.field}
            onChange={(e) => set(index, { ...part, field: e.target.value })}
          >
            {fields.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            className="size-9 px-0"
            aria-label={`Dirección ${index + 1}: ${part.dir === 'asc' ? 'ascendente' : 'descendente'}`}
            onClick={() =>
              set(index, { ...part, dir: part.dir === 'asc' ? 'desc' : 'asc' })
            }
          >
            {part.dir === 'asc' ? (
              <ArrowUp className="size-4" />
            ) : (
              <ArrowDown className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            className="size-9 px-0"
            aria-label={`Quitar orden ${index + 1}`}
            onClick={() => onChange(sort.filter((_, i) => i !== index))}
          >
            <X className="size-4" />
          </Button>
        </span>
      ))}
      {sort.length < 3 && (
        <Button
          type="button"
          className="h-9"
          onClick={() =>
            onChange([
              ...sort,
              {
                field: fields[Math.min(sort.length, fields.length - 1)]!.value,
                dir: 'asc',
              },
            ])
          }
        >
          + Nivel de orden
        </Button>
      )}
    </div>
  )
}

/** Show/hide and reorder columns; saved per user by the caller. */
export function ColumnPicker({
  keys,
  onChange,
  saving,
  all = cycleColumns,
}: {
  keys: string[]
  onChange: (next: string[]) => void
  saving: boolean
  all?: ColumnDef[]
}) {
  const [open, setOpen] = useState(false)
  const hidden = all.filter((column) => !keys.includes(column.key))
  const label = (key: string) =>
    all.find((column) => column.key === key)?.label ?? key
  const move = (index: number, by: -1 | 1) => {
    const next = [...keys]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item!)
    onChange(next)
  }
  return (
    <>
      <Button type="button" className="h-9" onClick={() => setOpen(true)}>
        <Columns3 className="size-4" />
        Columnas
      </Button>
      {open && (
        <Dialog
          title="Columnas de la tabla"
          description="Se guardan para tu usuario."
          onClose={() => setOpen(false)}
        >
          <ul className="grid gap-1">
            {keys.map((key, index) => (
              <li key={key} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{label(key)}</span>
                <Button
                  type="button"
                  className="size-8 px-0"
                  aria-label={`Subir ${label(key)}`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  className="size-8 px-0"
                  aria-label={`Bajar ${label(key)}`}
                  disabled={index === keys.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  className="h-8"
                  disabled={keys.length === 1}
                  onClick={() => onChange(keys.filter((k) => k !== key))}
                >
                  Ocultar
                </Button>
              </li>
            ))}
            {hidden.map((column) => (
              <li
                key={column.key}
                className="text-muted flex items-center gap-2 text-sm"
              >
                <span className="flex-1">{column.label} (oculta)</span>
                <Button
                  type="button"
                  className="h-8"
                  onClick={() => onChange([...keys, column.key])}
                >
                  Mostrar
                </Button>
              </li>
            ))}
          </ul>
          {saving && <p className="text-muted mt-2 text-xs">Guardando…</p>}
        </Dialog>
      )}
    </>
  )
}

/** Same save / list / apply / delete flow Patients already has, for the board table. */
export function SavedViewsBar({
  current,
  onApply,
}: {
  current: () => Pick<SavedView, 'filters' | 'columns' | 'sort'>
  onApply: (view: SavedView) => void
}) {
  const views = useSavedViews('cycles')
  const { create, remove } = useSaveView('cycles')
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const list = views.data?.data ?? []

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-sm">
        <span className="text-muted text-xs font-semibold">Vistas</span>
        <select
          aria-label="Vistas"
          className={control}
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value)
            const view = list.find((item) => item.id === event.target.value)
            if (view) onApply(view)
          }}
        >
          <option value="">Sin vista</option>
          {list.map((view) => (
            <option key={view.id} value={view.id}>
              {view.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" className="h-9" onClick={() => setSaving(true)}>
        Guardar vista actual
      </Button>
      <Button
        type="button"
        className="h-9"
        disabled={!selected}
        aria-label="Borrar vista seleccionada"
        onClick={() =>
          remove.mutate(selected, { onSuccess: () => setSelected('') })
        }
      >
        Borrar vista
      </Button>
      {saving && (
        <Dialog
          title="Guardar vista"
          description="Guarda filtros, orden y columnas actuales."
          onClose={() => setSaving(false)}
        >
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              create.mutate(
                { name: name.trim(), ...current() },
                {
                  onSuccess: (view) => {
                    setSelected(view.id)
                    setSaving(false)
                    setName('')
                  },
                },
              )
            }}
          >
            <label className="grid gap-1 text-sm font-medium">
              Nombre de la vista
              <input
                className={control}
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {create.isError && (
              <p role="alert" className="text-sm text-red-700">
                {create.error.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setSaving(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!name.trim() || create.isPending}
              >
                Guardar vista
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  )
}

type BatchAction =
  'assign_responsible' | 'change_stage' | 'create_tasks' | 'archive'
const actionLabels: Record<BatchAction, string> = {
  assign_responsible: 'Asignar responsable',
  change_stage: 'Cambiar etapa',
  create_tasks: 'Crear tareas',
  archive: 'Archivar',
}

/** Batch actions over the checked rows. Nothing runs until the confirmation dialog is accepted. */
export function BatchBar({
  ids,
  onDone,
}: {
  ids: string[]
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [action, setAction] = useState<BatchAction | null>(null)
  const [user, setUser] = useState('')
  const [stage, setStage] = useState('notified')
  const [title, setTitle] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<string[]>([])
  const users = useNamed('/api/v1/users?limit=100', 'users')
  const run = useMutation({
    mutationFn: (force: boolean = false) => {
      const body: Record<string, unknown> = {
        action,
        ids: force ? blocked : ids,
        confirm: true,
      }
      if (force) body.confirm_out_of_stock = true
      if (action === 'assign_responsible')
        body.responsible_user_id = user || null
      if (action === 'change_stage') body.to_status = stage
      if (action === 'create_tasks') body.title = title.trim()
      return api<{
        applied: number
        skipped: string[]
        blocked_out_of_stock?: string[]
      }>('/api/v1/cycles/batch', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: async (data) => {
      setBlocked(data.blocked_out_of_stock ?? [])
      setResult(
        `${data.applied} ciclos actualizados${data.blocked_out_of_stock?.length ? `, ${data.blocked_out_of_stock.length} sin mover por falta de existencias` : ''}${data.skipped.length ? `, ${data.skipped.length} omitidos (cerrados o fuera de tu alcance)` : ''}.`,
      )
      await queryClient.invalidateQueries({ queryKey: ['cycles'] })
      await queryClient.invalidateQueries({ queryKey: ['board'] })
      await queryClient.invalidateQueries({ queryKey: savedViewsKey('cycles') })
      onDone()
    },
  })
  if (ids.length === 0 && !result) return null
  const close = () => {
    setAction(null)
    setResult(null)
    setBlocked([])
    run.reset()
  }
  const needsTitle = action === 'create_tasks' && !title.trim()

  return (
    <div
      className="border-border mb-3 flex flex-wrap items-center gap-2 rounded-xl border bg-slate-50 p-3"
      role="toolbar"
      aria-label="Acciones por lote"
    >
      <span className="text-sm font-semibold">{ids.length} seleccionados</span>
      {(Object.keys(actionLabels) as BatchAction[]).map((key) => (
        <Button
          key={key}
          type="button"
          className="h-9"
          disabled={ids.length === 0}
          onClick={() => setAction(key)}
        >
          {actionLabels[key]}
        </Button>
      ))}
      {action && (
        <Dialog
          title={`${actionLabels[action]} (${ids.length})`}
          description="Revisa antes de aplicar. Los ciclos cerrados se omiten."
          onClose={close}
        >
          <div className="grid gap-3">
            {action === 'assign_responsible' && (
              <select
                aria-label="Responsable"
                className={control}
                value={user}
                onChange={(e) => setUser(e.target.value)}
              >
                <option value="">Sin responsable</option>
                {users.data?.data.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            {action === 'change_stage' && (
              <select
                aria-label="Etapa destino"
                className={control}
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                <option value="to_notify">Por avisar</option>
                <option value="notified">Avisado</option>
                <option value="confirmed">Confirmado</option>
                <option value="prepared">Preparado</option>
              </select>
            )}
            {action === 'create_tasks' && (
              <input
                aria-label="Título de la tarea"
                placeholder="Título de la tarea"
                className={control}
                value={title}
                maxLength={160}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}
            {action === 'archive' && (
              <p className="text-sm">
                Los ciclos pasarán a cancelados y saldrán del tablero abierto.
              </p>
            )}
            {run.isError && (
              <p role="alert" className="text-sm text-red-700">
                {run.error.message}
              </p>
            )}
            {result && (
              <p role="status" className="text-sm">
                {result}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={close}>
                {result ? 'Cerrar' : 'Cancelar'}
              </Button>
              {result && blocked.length > 0 && (
                <Button
                  type="button"
                  variant="danger"
                  disabled={run.isPending}
                  onClick={() => run.mutate(true)}
                >
                  Mover igualmente {blocked.length} sin existencias
                </Button>
              )}
              {!result && (
                <Button
                  type="button"
                  variant={action === 'archive' ? 'danger' : 'primary'}
                  disabled={run.isPending || needsTitle}
                  onClick={() => run.mutate(false)}
                >
                  Confirmar y aplicar a {ids.length}
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
