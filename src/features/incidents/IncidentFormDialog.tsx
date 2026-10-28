import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, TriangleAlert } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import type { components, paths } from '@/lib/api-types'
import {
  incidentTypeLabels,
  incidentTypeOptions,
  type Incident,
  type IncidentType,
} from '@/lib/incidents'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']
type PatientList =
  paths['/api/v1/patients']['get']['responses'][200]['content']['application/json']

export function IncidentFormDialog({
  defaultBranchId,
  defaultPatient,
  defaultTreatmentId,
  defaultCycleId,
  defaultType = 'patient_reported',
  onClose,
  onCreated,
}: {
  defaultBranchId?: string
  defaultPatient?: { id: string; fullName: string } | null
  defaultTreatmentId?: string | null
  defaultCycleId?: string | null
  defaultType?: IncidentType
  onClose: () => void
  onCreated?: (incident: Incident) => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [branchId, setBranchId] = useState(defaultBranchId ?? '')
  const [type, setType] = useState<IncidentType>(defaultType)
  const [patient, setPatient] = useState(defaultPatient ?? null)
  const [patientQuery, setPatientQuery] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [description, setDescription] = useState('')

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const users = useQuery({
    queryKey: ['users', 'incidents'],
    queryFn: () => api<UserList>('/api/v1/users?limit=100'),
  })
  const patients = useQuery({
    queryKey: ['patients', 'incident-search', patientQuery],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '20' })
      if (patientQuery.trim()) params.set('q', patientQuery.trim())
      return api<PatientList>(`/api/v1/patients?${params.toString()}`)
    },
    enabled: !defaultPatient,
  })

  const create = useMutation({
    mutationFn: () => {
      const body: components['schemas']['IncidentCreate'] = {
        branch_id: branchId,
        type,
        ...(patient ? { patient_id: patient.id } : {}),
        ...(defaultTreatmentId ? { treatment_id: defaultTreatmentId } : {}),
        ...(defaultCycleId ? { cycle_id: defaultCycleId } : {}),
        ...(assignedTo ? { assigned_to: assignedTo } : {}),
        description: description.trim(),
      }
      return api<Incident>('/api/v1/incidents', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async (incident) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['incidents'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
      ])
      toast.push('Incidencia creada.', 'success')
      onCreated?.(incident)
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  const valid = Boolean(branchId && description.trim())

  return (
    <Dialog
      title="Crear incidencia"
      description="Registra un problema para seguirlo en el pipeline."
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (valid) create.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Sucursal</span>
            <select
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              required
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            >
              <option value="">Selecciona una sucursal</option>
              {(branches.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Tipo</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as IncidentType)}
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            >
              {incidentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Paciente <span className="text-muted font-normal">(opcional)</span>
          </span>
          {patient ? (
            <div className="border-border flex items-center justify-between gap-3 rounded-lg border bg-slate-50 px-3 py-2 text-sm">
              <span>{patient.fullName}</span>
              {!defaultPatient && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setPatient(null)}
                >
                  Quitar
                </Button>
              )}
            </div>
          ) : (
            <>
              <TextField
                label="Buscar paciente"
                value={patientQuery}
                onChange={(event) => setPatientQuery(event.target.value)}
                placeholder="Nombre del paciente"
              />
              {patientQuery.trim().length >= 2 && (
                <ul className="border-border max-h-40 divide-y overflow-y-auto rounded-lg border bg-white">
                  {(patients.data?.data ?? []).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="hover:bg-surface flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
                        onClick={() => {
                          setPatient({ id: item.id, fullName: item.fullName })
                          if (!branchId && item.primaryBranchId) {
                            setBranchId(item.primaryBranchId)
                          }
                        }}
                      >
                        <span>{item.fullName}</span>
                        <Plus className="size-3.5" />
                      </button>
                    </li>
                  ))}
                  {patients.isSuccess && patients.data?.data.length === 0 && (
                    <li className="text-muted px-3 py-2 text-xs">
                      Sin coincidencias.
                    </li>
                  )}
                </ul>
              )}
            </>
          )}
        </div>

        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Responsable <span className="text-muted font-normal">(opcional)</span>
          </span>
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

        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Descripción{' '}
            <span className="text-muted font-normal">
              ({incidentTypeLabels[type]})
            </span>
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={4}
            maxLength={5000}
            placeholder="Describe qué ocurrió y qué necesita el paciente."
            className="border-border focus:border-tealmax rounded-lg border bg-white px-3 py-2 text-sm outline-none"
          />
        </label>

        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos crear la incidencia. {create.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!valid || create.isPending}>
            <TriangleAlert className="size-4" />
            {create.isPending ? 'Creando…' : 'Crear incidencia'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
