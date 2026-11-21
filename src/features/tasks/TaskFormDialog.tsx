import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, UserCheck } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { editTitle } from '@/lib/editTitle'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import {
  taskPriorityLabels,
  taskPriorities,
  taskReminderOptions,
  taskTypeDefaultTitle,
  taskTypeLabels,
  taskTypes,
  type Task,
  type TaskPriority,
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

function pad(value: number) {
  return String(value).padStart(2, '0')
}

/** Valor local para <input type="datetime-local"> (YYYY-MM-DDTHH:mm). */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Hoy a las 00:00 (hora local): mínimo permitido para el vencimiento. */
function todayStartInput(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T00:00`
}

/** Mismo control que el resto de la app: ancho completo y anillo de foco. */
const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'

export function TaskFormDialog({
  task,
  patientId: presetPatientId,
  patientName,
  treatmentId: presetTreatmentId,
  treatmentOptions = [],
  branchId: presetBranchId,
  onClose,
  onCreated,
}: {
  /** Si se pasa, el diálogo edita la tarea (PATCH) en vez de crearla. */
  task?: Task
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
  const editing = Boolean(task)
  const initialDue = toLocalInput(task?.dueAt)
  const [type, setType] = useState<TaskType | ''>(task?.type ?? '')
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueAt, setDueAt] = useState(initialDue)
  const [priority, setPriority] = useState<TaskPriority | ''>(
    task?.priority ?? '',
  )
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    task?.reminderMinutesBefore != null
      ? String(task.reminderMinutesBefore)
      : '',
  )
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo ?? '')
  const [patientId, setPatientId] = useState(
    task?.patientId ?? presetPatientId ?? '',
  )
  const [treatmentId, setTreatmentId] = useState(presetTreatmentId ?? '')
  const [branchId, setBranchId] = useState(
    presetBranchId ?? activeBranchId ?? '',
  )
  // En edición, Guardar queda deshabilitado mientras nada difiera de la tarea.
  const unchanged =
    task !== undefined &&
    type === (task.type ?? '') &&
    title === task.title &&
    description === (task.description ?? '') &&
    dueAt === initialDue &&
    priority === (task.priority ?? '') &&
    reminderMinutesBefore ===
      (task.reminderMinutesBefore != null
        ? String(task.reminderMinutesBefore)
        : '') &&
    assignedTo === (task.assignedTo ?? '') &&
    patientId === (task.patientId ?? presetPatientId ?? '')
  // Una tarea ya vencida se puede editar sin tocar su fecha original.
  const minDue =
    initialDue && initialDue < todayStartInput()
      ? initialDue
      : todayStartInput()

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

  function createBody() {
    return {
      type: type as TaskType,
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      due_at: new Date(dueAt).toISOString(),
      priority: priority as TaskPriority,
      ...(reminderMinutesBefore
        ? { reminder_minutes_before: Number(reminderMinutesBefore) }
        : {}),
      ...(assignedTo ? { assigned_to: assignedTo } : {}),
      ...(patientId ? { patient_id: patientId } : {}),
      ...(treatmentId ? { treatment_id: treatmentId } : {}),
      ...(branchId ? { branch_id: branchId } : {}),
    }
  }

  function editBody() {
    const patientChanged = patientId !== (task?.patientId ?? '')
    return {
      type: type as TaskType,
      title: title.trim(),
      description: description.trim() || null,
      // Solo se envía si cambió: el backend rechaza fechas anteriores a hoy.
      ...(dueAt !== initialDue
        ? { due_at: new Date(dueAt).toISOString() }
        : {}),
      priority: priority as TaskPriority,
      reminder_minutes_before: reminderMinutesBefore
        ? Number(reminderMinutesBefore)
        : null,
      assigned_to: assignedTo || null,
      ...(patientChanged
        ? { patient_id: patientId || null, treatment_id: null }
        : {}),
    }
  }

  const create = useMutation({
    mutationFn: () =>
      api(
        task ? `/api/v1/tasks/${encodeURIComponent(task.id)}` : '/api/v1/tasks',
        {
          method: task ? 'PATCH' : 'POST',
          body: JSON.stringify(task ? editBody() : createBody()),
        },
      ),
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
    const previousDefault = type ? taskTypeDefaultTitle[type] : undefined
    setType(next)
    if (!title.trim() || title === previousDefault) {
      setTitle(taskTypeDefaultTitle[next])
    }
  }

  return (
    <Dialog
      title={task ? editTitle('tarea', task.title) : 'Crear Tarea'}
      description={
        patientName
          ? `Para ${patientName}`
          : 'Organiza el seguimiento del equipo.'
      }
      icon={<ClipboardList className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!title.trim() || !type || !priority || !dueAt || create.isPending)
            return
          create.mutate()
        }}
      >
        <ModalSection
          icon={<ClipboardList className="size-4" />}
          title="Detalles de la Tarea"
        >
          <TextField
            label="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
            placeholder="Llamar para confirmar retiro"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Tipo
              </span>
              <select
                value={type}
                onChange={(event) => changeType(event.target.value as TaskType)}
                className={control}
                required
              >
                <option value="" disabled>
                  Selecciona un tipo
                </option>
                {taskTypes.map((value) => (
                  <option key={value} value={value}>
                    {taskTypeLabels[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Vence
              </span>
              <input
                type="datetime-local"
                value={dueAt}
                min={minDue}
                required
                onChange={(event) => setDueAt(event.target.value)}
                className={control}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Prioridad
              </span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                className={control}
                required
              >
                <option value="" disabled>
                  Selecciona una prioridad
                </option>
                {taskPriorities.map((value) => (
                  <option key={value} value={value}>
                    {taskPriorityLabels[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">Recordatorio</span>
              <select
                value={reminderMinutesBefore}
                onChange={(event) =>
                  setReminderMinutesBefore(event.target.value)
                }
                className={control}
              >
                {taskReminderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="task-description"
              className="text-ink text-sm font-medium"
            >
              Descripción{' '}
              <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <TextAreaField
              id="task-description"
              className="min-h-8 py-1.5 text-xs"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={5000}
              placeholder="Detalles para quien atienda la tarea"
            />
          </div>
        </ModalSection>

        <ModalSection
          icon={<UserCheck className="size-4" />}
          title="Asignación"
        >
          {!presetPatientId && (
            <label className="grid gap-1.5">
              <span className="text-ink text-sm font-medium">
                Paciente{' '}
                <span className="text-muted font-normal">(Opcional)</span>
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
                className={control}
              >
                <option value="">Sin paciente</option>
                {task?.patient &&
                  !patients.data?.data.some(
                    (item) => item.id === task.patient?.id,
                  ) && (
                    <option value={task.patient.id}>
                      {task.patient.fullName}
                    </option>
                  )}
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
                <span className="text-muted font-normal">(Opcional)</span>
              </span>
              <select
                value={treatmentId}
                onChange={(event) => setTreatmentId(event.target.value)}
                className={control}
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
              Asignar a{' '}
              <span className="text-muted font-normal">(Opcional)</span>
            </span>
            <select
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              className={control}
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
        </ModalSection>

        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos {editing ? 'guardar' : 'crear'} la tarea.{' '}
            {create.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={create.isPending || unchanged}
            title={
              unchanged && !create.isPending
                ? 'No hay cambios para guardar'
                : undefined
            }
          >
            {create.isPending
              ? editing
                ? 'Guardando…'
                : 'Creando…'
              : editing
                ? 'Guardar Cambios'
                : 'Crear Tarea'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
