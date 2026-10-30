import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, UserRound } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import {
  incidentBranchName,
  incidentTypeLabels,
  type Incident,
} from '@/lib/incidents'
import { formatDateTime } from '@/lib/operations'

type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']

export function ResolveIncidentDialog({
  incident,
  onClose,
  onResolved,
}: {
  incident: Incident
  onClose: () => void
  onResolved?: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [resolution, setResolution] = useState('')

  const resolve = useMutation({
    mutationFn: () =>
      api<Incident>(
        `/api/v1/incidents/${encodeURIComponent(incident.id)}/resolve`,
        {
          method: 'POST',
          body: JSON.stringify({ resolution: resolution.trim() }),
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['incidents'] })
      toast.push('Incidencia resuelta.', 'success')
      onResolved?.()
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  return (
    <Dialog
      title="Resolver incidencia"
      description={`${incidentTypeLabels[incident.type]} · ${incidentBranchName(incident)}`}
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (resolution.trim()) resolve.mutate()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Resolución <span className="text-red-700">*</span>
          </span>
          <textarea
            required
            autoFocus
            rows={4}
            maxLength={5000}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Describe cómo se resolvió la incidencia."
            className="border-border focus:border-tealmax rounded-lg border bg-white px-3 py-2 text-sm outline-none"
          />
          <span className="text-muted text-xs">
            Sin una resolución no se puede cerrar la incidencia.
          </span>
        </label>
        {resolve.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos resolverla. {resolve.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!resolution.trim() || resolve.isPending}
          >
            <CheckCircle2 className="size-4" />
            {resolve.isPending ? 'Resolviendo…' : 'Resolver incidencia'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}

export function AssignIncidentDialog({
  incident,
  onClose,
}: {
  incident: Incident
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [assignedTo, setAssignedTo] = useState(incident.assignedTo ?? '')
  const users = useQuery({
    queryKey: ['users', 'incidents'],
    queryFn: () => api<UserList>('/api/v1/users?limit=100'),
  })

  const assign = useMutation({
    mutationFn: () =>
      api<Incident>(`/api/v1/incidents/${encodeURIComponent(incident.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ assigned_to: assignedTo || null }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['incidents'] })
      toast.push('Responsable actualizado.', 'success')
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  return (
    <Dialog
      title="Asignar incidencia"
      description={incident.patient?.fullName ?? 'Sin paciente'}
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          assign.mutate()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">Responsable</span>
          <select
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
          >
            <option value="">Sin asignar</option>
            {(users.data?.data ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        {assign.isError && (
          <p role="alert" className="text-sm text-red-700">
            {assign.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={assign.isPending}>
            <UserRound className="size-4" />
            {assign.isPending ? 'Guardando…' : 'Guardar responsable'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}

export function IncidentDetailDialog({
  incident,
  onClose,
}: {
  incident: Incident
  onClose: () => void
}) {
  return (
    <Dialog
      title="Detalle de la incidencia"
      description={incidentTypeLabels[incident.type]}
      onClose={onClose}
    >
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-muted text-xs">Paciente</dt>
          <dd className="text-ink mt-0.5 font-medium">
            {incident.patient?.fullName ?? 'Sin paciente'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs">Sucursal</dt>
          <dd className="text-ink mt-0.5 font-medium">
            {incidentBranchName(incident)}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs">Responsable</dt>
          <dd className="text-ink mt-0.5 font-medium">
            {incident.assignee?.name ?? 'Sin asignar'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs">Descripción</dt>
          <dd className="text-ink mt-0.5 whitespace-pre-wrap">
            {incident.description}
          </dd>
        </div>
        {incident.resolution && (
          <div>
            <dt className="text-muted text-xs">Resolución</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-emerald-900">
              {incident.resolution}
            </dd>
          </div>
        )}
        <div className="text-muted grid grid-cols-2 gap-2 text-xs">
          <span>Creada {formatDateTime(incident.createdAt)}</span>
          {incident.resolvedAt && (
            <span>Resuelta {formatDateTime(incident.resolvedAt)}</span>
          )}
        </div>
      </dl>
    </Dialog>
  )
}
