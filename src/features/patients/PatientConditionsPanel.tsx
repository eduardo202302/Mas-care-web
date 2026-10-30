import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, HeartPulse, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
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

export function PatientConditionsPanel({
  patientId,
  addOpen,
  onCloseAdd,
}: {
  patientId: string
  /** El botón `+` del encabezado de la card controla este estado. */
  addOpen: boolean
  onCloseAdd: () => void
}) {
  const canWrite = useCan('patients:write')
  const queryClient = useQueryClient()
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
        '/api/v1/health-conditions?isActive=true&rows=100',
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
    setHealthConditionId('')
    setStatus('active')
    setDiagnosedOn('')
    setNotes('')
    onCloseAdd()
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
      {links.isLoading ? (
        <p className="text-muted text-sm">Cargando condiciones…</p>
      ) : links.isError ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar las condiciones del paciente.{' '}
          {links.error instanceof Error ? links.error.message : ''}
        </p>
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
                      {Object.entries(conditionStatusLabels).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
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
                  className="text-muted shrink-0 hover:text-red-600"
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
          title="Agregar Condición de Salud"
          description="Registra una condición de salud para este paciente."
          icon={<HeartPulse className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeAdd}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              add.mutate()
            }}
          >
            <ModalSection
              icon={<HeartPulse className="size-4" />}
              title="Condición de Salud"
              tone="mint"
            >
              <div className="grid gap-1.5">
                <label
                  htmlFor="condition-picker"
                  className="text-ink text-sm font-medium"
                >
                  Condición
                </label>
                <select
                  id="condition-picker"
                  required
                  value={healthConditionId}
                  onChange={(event) => setHealthConditionId(event.target.value)}
                  disabled={conditionOptions.isPending}
                  className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {conditionOptions.isPending
                      ? 'Cargando condiciones…'
                      : conditionOptions.isError
                        ? 'No se pudieron cargar las condiciones'
                        : availableConditions.length
                          ? 'Selecciona una condición'
                          : 'No hay condiciones disponibles'}
                  </option>
                  {availableConditions.map((condition) => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
                {conditionOptions.isError && (
                  <p role="alert" className="text-xs text-red-700">
                    No pudimos cargar la lista de condiciones.{' '}
                    {conditionOptions.error instanceof Error
                      ? conditionOptions.error.message
                      : ''}
                  </p>
                )}
                {!conditionOptions.isPending &&
                  !conditionOptions.isError &&
                  !availableConditions.length && (
                    <p className="text-muted text-xs">
                      {items.length
                        ? 'Todas las condiciones activas ya están asociadas a este paciente.'
                        : 'Todavía no hay condiciones activas. Créalas en Condiciones de salud.'}
                    </p>
                  )}
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="condition-status"
                  className="text-ink text-sm font-medium"
                >
                  Estado
                </label>
                <select
                  id="condition-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ConditionStatus)
                  }
                  className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2"
                >
                  {Object.entries(conditionStatusLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </ModalSection>
            <ModalSection
              icon={<CalendarDays className="size-4" />}
              title="Detalles"
              tone="sky"
            >
              <div className="grid gap-1.5">
                <label
                  htmlFor="condition-diagnosed"
                  className="text-ink text-sm font-medium"
                >
                  Fecha de Diagnóstico (Opcional)
                </label>
                <input
                  id="condition-diagnosed"
                  type="date"
                  value={diagnosedOn}
                  onChange={(event) => setDiagnosedOn(event.target.value)}
                  className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2"
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="condition-notes"
                  className="text-ink text-sm font-medium"
                >
                  Notas (Opcional)
                </label>
                <TextAreaField
                  id="condition-notes"
                  className="min-h-8 py-1.5 text-xs"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
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
                {add.isPending ? 'Guardando…' : 'Agregar Condición'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
    </>
  )
}
