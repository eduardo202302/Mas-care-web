import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import { boardColumnLabels, boardColumns, type BoardColumnKey } from '@/lib/board'
import { usePipeline } from '@/lib/pipeline'
import { formatDate } from '@/lib/treatments'

type Eligible = {
  id: string
  patient: { id: string; name: string }
  medication: string
  quantity_per_cycle: string
  coverage_end_on: string | null
  responsible: { id: string; name: string } | null
}

const stageOptions = boardColumns.filter((key) => key !== 'closed')

const cycleTypeOptions = [
  { value: 'regular', label: 'Regular' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'special', label: 'Especial' },
] as const

const cyclePriorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
] as const

/**
 * Cycles are always born from an existing treatment. Only active treatments
 * without an open cycle are offered, and the new cycle lands in the chosen stage.
 */
export function NewCycleDialog({
  initialStatus,
  onClose,
}: {
  initialStatus?: BoardColumnKey
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { data: pipeline } = usePipeline()
  const [status, setStatus] = useState<BoardColumnKey>(initialStatus ?? 'to_notify')
  const [search, setSearch] = useState('')
  const [treatmentId, setTreatmentId] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const [type, setType] = useState('')
  const [priority, setPriority] = useState('')
  const blurTimer = useRef<number>()

  const eligible = useQuery({
    queryKey: ['eligible-treatments', search],
    queryFn: () =>
      api<{ data: Eligible[] }>(
        `/api/v1/cycles/eligible-treatments${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`,
      ),
  })
  const options = eligible.data?.data ?? []
  const selected = options.find((option) => option.id === treatmentId)
  const stageName = (key: BoardColumnKey) =>
    pipeline?.stages.find((s) => s.system_status === key)?.name ?? boardColumnLabels[key]

  function selectTreatment(option: Eligible) {
    window.clearTimeout(blurTimer.current)
    setTreatmentId(option.id)
    setSearch(option.patient.name)
    setListOpen(false)
  }

  function clearTreatment() {
    setTreatmentId('')
    setSearch('')
  }

  const resetForm = () => {
    clearTreatment()
    setType('')
    setPriority('')
  }

  const create = useMutation({
    mutationFn: (variables: { again: boolean }) =>
      api('/api/v1/cycles', {
        method: 'POST',
        body: JSON.stringify({
          treatment_id: treatmentId,
          status,
          type: type || undefined,
          priority: priority || undefined,
        }),
      }).then(() => variables),
    onSuccess: async (variables) => {
      await queryClient.invalidateQueries({ queryKey: ['board'] })
      await queryClient.invalidateQueries({ queryKey: ['cycles'] })
      await queryClient.invalidateQueries({ queryKey: ['eligible-treatments'] })
      if (variables.again) {
        resetForm()
      } else {
        onClose()
      }
    },
  })

  return (
    <Dialog
      title="Nuevo ciclo"
      description="El ciclo se creará a partir de un tratamiento existente sin un ciclo abierto."
      onClose={onClose}
      size="lg"
    >
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-medium">
            Embudo
            <input
              readOnly
              value={pipeline?.name ?? '—'}
              className="border-border bg-surface h-10 rounded-lg border px-3 text-sm text-slate-500"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Etapa
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BoardColumnKey)}
              className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
            >
              {stageOptions.map((key) => (
                <option key={key} value={key}>
                  {stageName(key)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="relative">
          <label className="grid gap-1 text-sm font-medium">
            Paciente
            <input
              aria-label="Buscar paciente"
              placeholder="Escribe el nombre del paciente…"
              value={search}
              onChange={(event) => {
                setTreatmentId('')
                setSearch(event.target.value)
                setListOpen(true)
              }}
              onFocus={() => setListOpen(true)}
              onBlur={() => {
                blurTimer.current = window.setTimeout(() => setListOpen(false), 150)
              }}
              autoComplete="off"
              className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
            />
          </label>
          {listOpen && (
            <ul
              role="listbox"
              aria-label="Tratamientos elegibles"
              className="border-border absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-white py-1 shadow-lg"
            >
              {options.length === 0 ? (
                <li className="text-muted px-3 py-2 text-sm">
                  {eligible.isFetching
                    ? 'Buscando…'
                    : 'No hay tratamientos activos sin un ciclo abierto.'}
                </li>
              ) : (
                options.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectTreatment(option)}
                      className="hover:bg-surface flex w-full flex-col items-start px-3 py-2 text-left text-sm"
                    >
                      <span className="font-medium">{option.patient.name}</span>
                      <span className="text-muted text-xs">{option.medication}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {selected && (
          <div className="grid grid-cols-3 gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Cantidad
              <input
                readOnly
                value={selected.quantity_per_cycle}
                className="border-border bg-surface h-10 rounded-lg border px-3 text-sm text-slate-500"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Fecha de cierre
              <input
                readOnly
                value={formatDate(selected.coverage_end_on)}
                className="border-border bg-surface h-10 rounded-lg border px-3 text-sm text-slate-500"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Propietario
              <input
                readOnly
                value={selected.responsible?.name ?? '—'}
                className="border-border bg-surface h-10 rounded-lg border px-3 text-sm text-slate-500"
              />
            </label>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-medium">
            Tipo de ciclo
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="">Sin definir</option>
              {cycleTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Prioridad
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="">Sin definir</option>
              {cyclePriorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            {create.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!treatmentId || create.isPending}
            onClick={() => create.mutate({ again: true })}
          >
            Crear y agregar otro
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!treatmentId || create.isPending}
            onClick={() => create.mutate({ again: false })}
          >
            Crear
          </Button>
        </FormActions>
      </div>
    </Dialog>
  )
}
