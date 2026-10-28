import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import {
  taskTypeDefaultTitle,
  taskTypeLabels,
  taskTypes,
  type TaskType,
} from '@/lib/operations'
import { useUiStore } from '@/stores/ui-store'

type PatientList =
  paths['/api/v1/patients']['get']['responses'][200]['content']['application/json']
type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']

export type TaskTreatmentOption = {
  id: string
  label: string
}

export function TaskFormDialog({
  patientId: presetPatientId,
  patientName,
  treatmentId: presetTreatmentId,
  treatmentOptions = [],
  branchId: presetBranchId,
  onClose,
  onCreated,
}: {
  patientId?: string
  patientName?: string
  treatmentId?: string
  treatmentOptions?: TaskTreatmentOption[]
  branchId?: string | null
  onClose: () => void
  onCreated?: (patientId: string | null) => void
}) {
  const queryClient = useQueryClient()
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const [type, setType] = useState<TaskType>('call')
  const [title, setTitle] = useState(taskTypeDefaultTitle.call)
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [patientId, setPatientId] = useState(presetPatientId ?? '')
  const [treatmentId, setTreatmentId] = useState(presetTreatmentId ?? '')
  const [branchId, setBranchId] = useState(
    presetBranchId ?? activeBranchId ?? '',
  )

  const patients = useQuery({
    queryKey: ['patients', 'task-picker'],
    queryFn: () =>
      api<PatientList>('/api/v1/patients?archived=false&limit=100'),
    enabled: !presetPatientId,
  })
  const users = useQuery({
    queryKey: ['users', { limit: 100 }],
    queryFn: () => api<UserList>('/api/v1/users?limit=100'),
  })

  const create = useMutation({
    mutationFn: () =>
      api('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify({
          type,
          title: title.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(dueAt ? { due_at: new Date(dueAt).toISOString() } : {}),
          ...(assignedTo ? { assigned_to: assignedTo } : {}),
          ...(patientId ? { patient_id: patientId } : {}),
          ...(treatmentId ? { treatment_id: treatmentId } : {}),
          ...(branchId ? { branch_id: branchId } : {}),
        }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({
          queryKey: ['patients', patientId || presetPatientId, 'activities'],
        }),
      ])
      onCreated?.(patientId || presetPatientId || null)
      onClose()
    },
  })

  const selectedPatient = patients.data?.data.find(
    (patient) => patient.id === patientId,
  )

  function changeType(next: TaskType) {
    const previousDefault = taskTypeDefaultTitle[type]
    setType(next)
    if (!title.trim() || title === previousDefault) {
      setTitle(taskTypeDefaultTitle[next])
    }
  }

  return (
    <Dialog
      title="Nueva tarea"
      description={
        patientName
          ? `Para ${patientName}`
          : 'Organiza el seguimiento del equipo.'
      }
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!title.trim() || create.isPending) return
          create.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Tipo</span>
            <select
              value={type}
              onChange={(event) => changeType(event.target.value as TaskType)}
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            >
              {taskTypes.map((value) => (
                <option key={value} value={value}>
                  {taskTypeLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">
              Vence <span className="text-muted font-normal">(opcional)</span>
            </span>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            />
          </label>
        </div>

        <TextField
          label="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          placeholder="Llamar para confirmar retiro"
        />

        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Descripción{' '}
            <span className="text-muted font-normal">(opcional)</span>
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={5000}
            rows={3}
            className="border-border focus:border-tealmax rounded-lg border bg-white px-3 py-2 text-sm outline-none"
            placeholder="Detalles para quien atienda la tarea"
          />
        </label>

        {!presetPatientId && (
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">
              Paciente{' '}
              <span className="text-muted font-normal">(opcional)</span>
            </span>
            <select
              value={patientId}
              onChange={(event) => {
                const next = event.target.value
                setPatientId(next)
                setTreatmentId('')
                const patient = patients.data?.data.find(
                  (item) => item.id === next,
                )
                if (patient?.primaryBranchId) {
                  setBranchId(patient.primaryBranchId)
                }
              }}
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            >
              <option value="">Sin paciente</option>
              {(patients.data?.data ?? []).map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </label>
        )}

        {treatmentOptions.length > 0 && (patientId || presetPatientId) && (
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">
              Tratamiento{' '}
              <span className="text-muted font-normal">(opcional)</span>
            </span>
            <select
              value={treatmentId}
              onChange={(event) => setTreatmentId(event.target.value)}
              className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
            >
              <option value="">Sin tratamiento</option>
              {treatmentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Asignar a <span className="text-muted font-normal">(opcional)</span>
          </span>
          <select
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
          >
            <option value="">Sin asignar</option>
            {(users.data?.data ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} · {user.email}
              </option>
            ))}
          </select>
        </label>

        {selectedPatient?.primaryBranchId && !branchId && (
          <p className="text-muted text-xs">
            Se usará la sucursal principal del paciente.
          </p>
        )}

        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos crear la tarea. {create.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim() || create.isPending}
          >
            {create.isPending ? 'Creando…' : 'Crear tarea'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
