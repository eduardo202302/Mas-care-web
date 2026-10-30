import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, HeartPulse, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { ApiError, api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components, paths } from '@/lib/api-types'

type ConditionStatus = components['schemas']['PatientConditionLink']['status']
type ConditionLink = components['schemas']['PatientConditionLink'] & {
  condition: { id: string; name: string }
}
type ConditionLinkList = { data: ConditionLink[] }
type HealthConditionList =
  paths['/api/v1/health-conditions']['get']['responses'][200]['content']['application/json']

export const conditionStatusLabels: Record<ConditionStatus, string> = {
  active: 'Activa',
  controlled: 'Controlada',
  resolved: 'Resuelta',
}

export function PatientConditionsPanel({ patientId }: { patientId: string }) {
  const canWrite = useCan('patients:write')
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [healthConditionId, setHealthConditionId] = useState('')
  const [status, setStatus] = useState<ConditionStatus>('active')
  const [diagnosedOn, setDiagnosedOn] = useState('')
  const [notes, setNotes] = useState('')

  const links = useQuery({
    queryKey: ['patients', patientId, 'conditions'],
    queryFn: () =>
      api<ConditionLinkList>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions`,
      ),
    enabled: Boolean(patientId),
  })
  const conditionOptions = useQuery({
    queryKey: ['health-conditions', 'picker'],
    queryFn: () =>
      api<HealthConditionList>(
        '/api/v1/health-conditions?isActive=true&rows=200',
      ),
    enabled: addOpen,
  })

  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ['patients', patientId, 'conditions'],
    })
  }
  const add = useMutation({
    mutationFn: () =>
      api<ConditionLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions`,
        {
          method: 'POST',
          body: JSON.stringify({
            healthConditionId,
            status,
            diagnosedOn: diagnosedOn || null,
            notes: notes.trim() || null,
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      closeAdd()
    },
  })
  const setConditionStatus = useMutation({
    mutationFn: ({
      conditionId,
      nextStatus,
    }: {
      conditionId: string
      nextStatus: ConditionStatus
    }) =>
      api<ConditionLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions/${encodeURIComponent(conditionId)}`,
        { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) },
      ),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (conditionId: string) =>
      api<ConditionLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions/${encodeURIComponent(conditionId)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: false }) },
      ),
    onSuccess: invalidate,
  })

  function closeAdd() {
    setAddOpen(false)
    setHealthConditionId('')
    setStatus('active')
    setDiagnosedOn('')
    setNotes('')
  }

  const items = links.data?.data ?? []
  const linkedConditionIds = new Set(
    items.map((link) => link.healthConditionId),
  )
  const availableConditions = (conditionOptions.data?.data ?? []).filter(
    (condition) => !linkedConditionIds.has(condition.id),
  )

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        {canWrite && (
          <Button
            className="h-8 px-2 text-xs"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5" />
            Agregar condición
          </Button>
        )}
      </div>
      {links.isLoading ? (
        <p className="text-muted text-sm">Cargando condiciones…</p>
      ) : items.length ? (
        <ul className="grid gap-3">
          {items.map((link) => (
            <li
              key={link.id}
              className="border-border flex items-start justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-ink text-sm font-semibold">
                  {link.condition.name}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {canWrite ? (
                    <select
                      aria-label={`Estado de ${link.condition.name}`}
                      value={link.status}
                      onChange={(event) =>
                        setConditionStatus.mutate({
                          conditionId: link.healthConditionId,
                          nextStatus: event.target.value as ConditionStatus,
                        })
                      }
                      className="border-border h-7 rounded-md border bg-white px-1.5 text-xs"
                    >
                      {Object.entries(conditionStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted text-xs">
                      {conditionStatusLabels[link.status]}
                    </span>
                  )}
                  {link.diagnosedOn && (
                    <span className="text-muted text-xs">
                      Diagnosticada {link.diagnosedOn.slice(0, 10)}
                    </span>
                  )}
                </div>
                {link.notes && (
                  <p className="text-muted mt-1 text-xs whitespace-pre-wrap">
                    {link.notes}
                  </p>
                )}
              </div>
              {canWrite && (
                <button
                  type="button"
                  title="Quitar"
                  onClick={() => remove.mutate(link.healthConditionId)}
                  className="text-muted hover:text-red-600 shrink-0"
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm">Sin condiciones registradas.</p>
      )}
      {addOpen && (
        <Dialog
          title="Agregar condición de salud"
          description="Registra una condición de salud para este paciente."
          onClose={closeAdd}
        >
          <form
            className="mt-5 grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              add.mutate()
            }}
          >
            <ModalSection icon={<HeartPulse className="size-4" />} title="Condición de salud" tone="mint">
              <div className="grid gap-1.5">
                <label htmlFor="condition-picker" className="text-ink text-sm font-medium">
                  Condición
                </label>
                <select
                  id="condition-picker"
                  required
                  value={healthConditionId}
                  onChange={(event) => setHealthConditionId(event.target.value)}
                  className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
                >
                  <option value="">Selecciona una condición</option>
                  {availableConditions.map((condition) => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="condition-status" className="text-ink text-sm font-medium">
                  Estado
                </label>
                <select
                  id="condition-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ConditionStatus)
                  }
                  className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
                >
                  {Object.entries(conditionStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </ModalSection>
            <ModalSection icon={<CalendarDays className="size-4" />} title="Detalles" tone="sky">
              <div className="grid gap-1.5">
                <label htmlFor="condition-diagnosed" className="text-ink text-sm font-medium">
                  Fecha de diagnóstico (opcional)
                </label>
                <input
                  id="condition-diagnosed"
                  type="date"
                  value={diagnosedOn}
                  onChange={(event) => setDiagnosedOn(event.target.value)}
                  className="border-border h-10 rounded-lg border px-3 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="condition-notes" className="text-ink text-sm font-medium">
                  Notas (opcional)
                </label>
                <textarea
                  id="condition-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 rounded-lg border bg-white px-3 py-2 text-sm transition outline-none focus:ring-2"
                />
              </div>
            </ModalSection>
            {add.isError && (
              <p role="alert" className="text-sm text-red-700">
                {add.error instanceof ApiError
                  ? add.error.message
                  : 'No pudimos registrar la condición.'}
              </p>
            )}
            <FormActions>
              <Button type="button" onClick={closeAdd}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={add.isPending || !healthConditionId}
              >
                {add.isPending ? 'Guardando…' : 'Agregar condición'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
    </>
  )
}
