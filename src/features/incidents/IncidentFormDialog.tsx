import { Select } from '@/components/ui/Select'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { useToast } from '@/components/ui/Toast'
import {
  PatientPicker,
  type PickerPatient,
} from '@/features/treatments/PatientPicker'
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

/** Mismo control que el resto de la app: ancho completo y anillo de foco. */
const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'

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
  const [picked, setPicked] = useState<PickerPatient | null>(null)
  const patient = defaultPatient ?? picked
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
      title="Crear Incidencia"
      description="Registra un problema para seguirlo en el pipeline."
      icon={<TriangleAlert className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (valid) create.mutate()
        }}
      >
        <ModalSection
          icon={<TriangleAlert className="size-4" />}
          title="Datos de la Incidencia"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Sucursal
              </span>
              <Select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                required
                className={control}
              >
                <option value="">Selecciona una sucursal</option>
                {(branches.data?.data ?? []).map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Tipo
              </span>
              <Select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as IncidentType)
                }
                className={control}
              >
                {incidentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </ModalSection>

        <ModalSection
          icon={<TriangleAlert className="size-4" />}
          title="Paciente Y Responsable"
        >
          {defaultPatient ? (
            <div className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Paciente</span>
              <div className="border-border rounded-lg border bg-slate-50 px-3 py-2 text-sm">
                {defaultPatient.fullName}
              </div>
            </div>
          ) : (
            <PatientPicker
              inline
              required={false}
              label="Paciente (Opcional)"
              value={picked}
              onChange={(next) => {
                setPicked(next)
                if (next && !branchId && next.primaryBranchId) {
                  setBranchId(next.primaryBranchId)
                }
              }}
            />
          )}

          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">
              Responsable{' '}
              <span className="text-muted font-normal">(Opcional)</span>
            </span>
            <Select
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              className={control}
            >
              <option value="">Sin asignar</option>
              {(users.data?.data ?? []).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </label>
        </ModalSection>

        <ModalSection
          icon={<TriangleAlert className="size-4" />}
          title="Descripción"
        >
          <div className="grid gap-1.5">
            <label
              htmlFor="incident-description"
              className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
            >
              Descripción{' '}
              <span className="text-muted font-normal">
                ({incidentTypeLabels[type]})
              </span>
            </label>
            <TextAreaField
              id="incident-description"
              className="min-h-8 py-1.5 text-xs"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={5000}
              placeholder="Describe qué ocurrió y qué necesita el paciente."
            />
          </div>
        </ModalSection>

        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos crear la incidencia. {create.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={create.isPending}>
            <TriangleAlert className="size-4" />
            {create.isPending ? 'Creando…' : 'Crear Incidencia'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
