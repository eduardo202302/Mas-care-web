import { Select } from '@/components/ui/Select'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, HeartPulse, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { HealthConditionForm } from '@/features/health-conditions/HealthConditionForm'
import type { HealthConditionFormValues } from '@/schemas/healthCondition'
import { ApiError, api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import {
  PrincipalBadge,
  RelationActions,
  RelationList,
  RelationRow,
} from './RelationParts'
import { useConditionPicker, type PickerCondition } from './relationQueries'
import type { components } from '@/lib/api-types'

export type ConditionStatus =
  components['schemas']['PatientConditionLink']['status']
type ConditionLink = components['schemas']['PatientConditionLink'] & {
  condition: { id: string; name: string }
}
type ConditionLinkList = { data: ConditionLink[] }

export const conditionStatusLabels: Record<ConditionStatus, string> = {
  active: 'Activa',
  controlled: 'Controlada',
  resolved: 'Resuelta',
}

/** Contenido de una fila de condición (compartido por el panel real y el de alta). */
export function ConditionRowContent({
  name,
  isPrimary,
  status,
  diagnosedOn,
  notes,
  onStatusChange,
}: {
  name: string
  isPrimary: boolean
  status: ConditionStatus
  diagnosedOn?: string | null
  notes?: string | null
  /** Si se omite, el estado se muestra como texto (sin permiso de escritura). */
  onStatusChange?: (status: ConditionStatus) => void
}) {
  return (
    <>
      <p className="text-ink text-sm font-semibold">
        {name}
        {isPrimary && <PrincipalBadge />}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {onStatusChange ? (
          <Select
            aria-label={`Estado de ${name}`}
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as ConditionStatus)
            }
            className="border-border h-7 rounded-md border bg-white px-1.5 text-xs"
          >
            {Object.entries(conditionStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        ) : (
          <span className="text-muted text-xs">
            {conditionStatusLabels[status]}
          </span>
        )}
        {diagnosedOn && (
          <span className="text-muted text-xs">
            Diagnosticada {diagnosedOn.slice(0, 10)}
          </span>
        )}
      </div>
      {notes && (
        <p className="text-muted mt-1 text-xs whitespace-pre-wrap">{notes}</p>
      )}
    </>
  )
}

/**
 * Diálogo "Agregar Condición de Salud". No conoce al paciente ni la API de
 * vínculos: entrega la selección por `onSubmit` (el panel real la envía al
 * servidor; el de alta la guarda en memoria). Se monta solo mientras está
 * abierto.
 */
export function AddConditionDialog({
  excludeIds,
  primaryName,
  hasLinks,
  submitting = false,
  error,
  onSubmit,
  onClose,
}: {
  /** Condiciones ya asociadas: no se ofrecen en el selector. */
  excludeIds: Set<string>
  /** Nombre de la condición principal actual, si la hay. */
  primaryName: string | null
  hasLinks: boolean
  submitting?: boolean
  error?: string | null
  onSubmit: (
    condition: PickerCondition,
    values: {
      status: ConditionStatus
      diagnosedOn: string
      notes: string
      isPrimary: boolean
    },
  ) => void
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const canWriteConditions = useCan('health-conditions:write')
  const [conditionFormOpen, setConditionFormOpen] = useState(false)
  const [healthConditionId, setHealthConditionId] = useState('')
  const [status, setStatus] = useState<ConditionStatus>('active')
  const [diagnosedOn, setDiagnosedOn] = useState('')
  const [notes, setNotes] = useState('')
  const conditionOptions = useConditionPicker()

  const createCondition = useMutation({
    mutationFn: (values: HealthConditionFormValues) =>
      api<components['schemas']['HealthCondition']>(
        '/api/v1/health-conditions',
        {
          method: 'POST',
          body: JSON.stringify({
            name: values.name,
            description: values.description || null,
          }),
        },
      ),
    onSuccess: async (condition) => {
      await queryClient.invalidateQueries({ queryKey: ['health-conditions'] })
      setConditionFormOpen(false)
      setHealthConditionId(condition.id)
    },
  })

  const hasPrimary = primaryName !== null
  const availableConditions = (conditionOptions.data?.data ?? []).filter(
    (condition) => !excludeIds.has(condition.id),
  )

  return (
    <>
      <Dialog
        title="Agregar Condición de Salud"
        description="Registra una condición de salud para este paciente."
        icon={<HeartPulse className="size-5" />}
        compactHeader
        bodyClassName="pt-3"
        onClose={onClose}
      >
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            const condition = availableConditions.find(
              (item) => item.id === healthConditionId,
            )
            if (!condition) return
            onSubmit(condition, {
              status,
              diagnosedOn,
              notes: notes.trim(),
              isPrimary: !hasPrimary,
            })
          }}
        >
          <ModalSection
            icon={<HeartPulse className="size-4" />}
            title="Condición de Salud"
            action={
              canWriteConditions && (
                <Button
                  type="button"
                  variant="ghost"
                  className="size-6 px-0"
                  aria-label="Crear condición"
                  onClick={() => setConditionFormOpen(true)}
                >
                  <Plus className="size-4" />
                </Button>
              )
            }
          >
            <div className="grid gap-1.5">
              <label
                htmlFor="condition-picker"
                className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
              >
                Condición
              </label>
              <Select
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
              </Select>
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
                    {hasLinks
                      ? 'Todas las condiciones activas ya están asociadas a este paciente.'
                      : 'Todavía no hay condiciones activas. Créalas en Condiciones de salud.'}
                  </p>
                )}
            </div>
            <div className="grid gap-1.5">
              <label
                htmlFor="condition-status"
                className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
              >
                Estado
              </label>
              <Select
                id="condition-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ConditionStatus)
                }
                className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2"
              >
                {Object.entries(conditionStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </ModalSection>
          <ModalSection
            icon={<CalendarDays className="size-4" />}
            title="Detalles"
          >
            <label
              className={
                hasPrimary
                  ? 'text-muted flex items-center gap-2 text-sm'
                  : 'text-ink flex items-center gap-2 text-sm'
              }
            >
              <input type="checkbox" checked={!hasPrimary} disabled readOnly />
              Condición Principal
            </label>
            <p className="text-muted text-xs">
              {hasPrimary
                ? `${primaryName} ya es la condición principal. Desmárcala desde la lista antes de asignar otra.`
                : 'La primera condición que se asocia queda como principal.'}
            </p>
            <TextField
              label="Fecha de Diagnóstico (Opcional)"
              type="date"
              value={diagnosedOn}
              onChange={(event) => setDiagnosedOn(event.target.value)}
            />
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
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <FormActions>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Agregar Condición'}
            </Button>
          </FormActions>
        </form>
      </Dialog>
      {conditionFormOpen && (
        <Dialog
          title="Crear Condición de Salud"
          icon={<HeartPulse className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setConditionFormOpen(false)}
        >
          <HealthConditionForm
            onSave={(values) =>
              createCondition.mutateAsync(values).then(() => undefined)
            }
            onCancel={() => setConditionFormOpen(false)}
            submitting={createCondition.isPending}
          />
        </Dialog>
      )}
    </>
  )
}

/** Lista de condiciones de un paciente ya guardado. */
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

  const links = useQuery({
    queryKey: ['patients', patientId, 'conditions'],
    queryFn: () =>
      api<ConditionLinkList>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions`,
      ),
    enabled: Boolean(patientId),
  })

  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ['patients', patientId, 'conditions'],
    })
  }
  const add = useMutation({
    mutationFn: (body: {
      healthConditionId: string
      status: ConditionStatus
      diagnosedOn: string
      notes: string
      isPrimary: boolean
    }) =>
      api<ConditionLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...body,
            diagnosedOn: body.diagnosedOn || null,
            notes: body.notes || null,
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      onCloseAdd()
    },
  })
  const setPrimary = useMutation({
    mutationFn: (conditionId: string) =>
      api<ConditionLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions/${encodeURIComponent(conditionId)}`,
        { method: 'PATCH', body: JSON.stringify({ isPrimary: true }) },
      ),
    onSuccess: invalidate,
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

  const items = links.data?.data ?? []
  const primaryLink = items.find((link) => link.isPrimary)

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
        <RelationList>
          {items.map((link) => (
            <RelationRow
              key={link.id}
              actions={
                canWrite && (
                  <RelationActions
                    onSetPrimary={
                      link.isPrimary
                        ? undefined
                        : () => setPrimary.mutate(link.healthConditionId)
                    }
                    onRemove={() => remove.mutate(link.healthConditionId)}
                  />
                )
              }
            >
              <ConditionRowContent
                name={link.condition.name}
                isPrimary={link.isPrimary}
                status={link.status}
                diagnosedOn={link.diagnosedOn}
                notes={link.notes}
                onStatusChange={
                  canWrite
                    ? (nextStatus) =>
                        setConditionStatus.mutate({
                          conditionId: link.healthConditionId,
                          nextStatus,
                        })
                    : undefined
                }
              />
            </RelationRow>
          ))}
        </RelationList>
      ) : (
        <p className="text-muted text-sm">Sin condiciones registradas.</p>
      )}
      {addOpen && (
        <AddConditionDialog
          excludeIds={new Set(items.map((link) => link.healthConditionId))}
          primaryName={primaryLink?.condition.name ?? null}
          hasLinks={items.length > 0}
          submitting={add.isPending}
          error={
            add.isError
              ? add.error instanceof ApiError
                ? add.error.message
                : 'No pudimos registrar la condición.'
              : null
          }
          onSubmit={(condition, values) =>
            add.mutate({ healthConditionId: condition.id, ...values })
          }
          onClose={onCloseAdd}
        />
      )}
    </>
  )
}
