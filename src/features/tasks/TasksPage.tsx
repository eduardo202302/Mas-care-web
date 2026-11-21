import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  CalendarClock,
  Check,
  CircleCheck,
  ListChecks,
  PackageCheck,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'
import { BranchFilter } from '@/components/BranchFilter'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useActiveBranch } from '@/lib/active-branch'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import {
  isTaskOverdue,
  taskDueLabel,
  taskStatusLabel,
  taskTabLabels,
  taskTabs,
  taskTypeLabels,
  type Task,
  type TaskList,
  type TaskStatus,
  type TaskTab,
} from '@/lib/operations'
import { TaskFormDialog } from './TaskFormDialog'
import { TaskDetailDialog } from './TaskDetailDialog'
import { TaskRescheduleDialog } from './TaskRescheduleDialog'

function statusClasses(task: Task): string {
  if (task.status === 'done')
    return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  if (task.status === 'cancelled')
    return 'border-slate-200 bg-slate-100 text-slate-700'
  if (task.status === 'in_progress')
    return 'border-amber-200 bg-amber-50 text-amber-900'
  return 'border-sky-200 bg-sky-50 text-sky-900'
}

const statusFeedback: Partial<Record<TaskStatus, string>> = {
  open: 'Tarea marcada como pendiente',
  in_progress: 'Tarea en proceso',
  done: 'Tarea terminada',
}

export default function TasksPage() {
  const queryClient = useQueryClient()
  const { branchId: activeBranchId, ready: branchReady } = useActiveBranch()
  const canWrite = useCan('tasks:write')
  const canOperate = useCan('treatments:write')
  const [tab, setTab] = useState<TaskTab>('open')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(PAGE_ROWS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [rescheduling, setRescheduling] = useState<Task | null>(null)
  const [viewing, setViewing] = useState<Task | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [tab, activeBranchId])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 4500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const tasks = useQuery({
    queryKey: ['tasks', tab, activeBranchId ?? 'all', page, rows],
    queryFn: () => {
      const params = new URLSearchParams({
        status: tab,
        page: String(page),
        rows: String(rows),
      })
      if (activeBranchId) params.set('branch_id', activeBranchId)
      return api<TaskList>(`/api/v1/tasks?${params.toString()}`)
    },
    enabled: branchReady,
  })

  // Conteo por pestaña: una consulta de 1 fila por estado, usando `total`.
  const counts = useQueries({
    queries: taskTabs.map((value) => ({
      queryKey: ['tasks', 'count', value, activeBranchId ?? 'all'],
      queryFn: () => {
        const params = new URLSearchParams({
          status: value,
          page: '1',
          rows: '1',
        })
        if (activeBranchId) params.set('branch_id', activeBranchId)
        return api<TaskList>(`/api/v1/tasks?${params.toString()}`)
      },
      enabled: branchReady,
    })),
  })

  const changeStatus = useMutation({
    mutationFn: ({ task, status }: { task: Task; status: TaskStatus }) =>
      api<Task>(`/api/v1/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: async (task) => {
      setFeedback(
        `${statusFeedback[task.status] ?? 'Tarea actualizada'}: ${task.title}`,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({
          queryKey: ['patients', task.patientId, 'activities'],
        }),
      ])
    },
  })

  const cancel = useMutation({
    mutationFn: (task: Task) =>
      api(`/api/v1/tasks/${encodeURIComponent(task.id)}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      setFeedback('Tarea cancelada.')
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const prepare = useMutation({
    mutationFn: (task: Task) => {
      if (!task.cycleId) throw new Error('La tarea no tiene un ciclo asociado.')
      return api(
        `/api/v1/cycles/${encodeURIComponent(task.cycleId)}/mark-prepared`,
        {
          method: 'POST',
        },
      )
    },
    onSuccess: async () => {
      setFeedback(
        'Ciclo marcado como preparado. Ya está en retiros pendientes.',
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['treatments'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
      ])
    },
  })

  const items = tasks.data?.data ?? []
  const actionError =
    changeStatus.error?.message ??
    cancel.error?.message ??
    prepare.error?.message

  return (
    <div className="animate-in">
      <PageHeader
        title="Tareas"
        subtitle="Llamadas, recetas y entregas que el equipo debe atender."
        actions={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <BranchFilter />
              {canWrite && (
                <Button variant="primary" onClick={() => setFormOpen(true)}>
                  <Plus className="size-4" />
                  Crear Tarea
                </Button>
              )}
            </div>
          </>
        }
      />

      {feedback && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <CircleCheck className="size-4" />
          {feedback}
        </p>
      )}
      {(tasks.isError || actionError) && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {tasks.isError
            ? `No pudimos cargar las tareas. ${tasks.error.message}`
            : actionError}
        </p>
      )}

      <div className="border-border mb-4 flex flex-wrap items-center gap-1 rounded-xl border bg-white p-1.5">
        {taskTabs.map((value, index) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className={`h-9 rounded-lg px-3 text-sm font-semibold transition ${
              tab === value
                ? 'bg-tealmax text-white shadow-sm'
                : 'text-muted hover:text-ink hover:bg-slate-50'
            }`}
          >
            {taskTabLabels[value]}
            {counts[index]?.data ? ` (${counts[index].data.total})` : ''}
          </button>
        ))}
      </div>

      <section className="border-border shadow-card overflow-hidden rounded-xl border bg-white">
        <div className="divide-border divide-y">
          {tasks.isLoading || !branchReady ? (
            <div className="grid gap-4 p-5" aria-busy="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex justify-between gap-4">
                  <div className="grid flex-1 gap-2">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title={`No hay tareas ${
                  tab === 'open'
                    ? 'pendientes'
                    : tab === 'in_progress'
                      ? 'en proceso'
                      : 'terminadas'
                }`}
                description="Crea una tarea o cambia de estado para ver las demás tareas del equipo."
                action={
                  canWrite ? (
                    <Button variant="primary" onClick={() => setFormOpen(true)}>
                      <Plus className="size-4" />
                      Crear Tarea
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            items.map((task) => {
              const overdue = isTaskOverdue(task)
              const changing =
                changeStatus.isPending &&
                changeStatus.variables?.task.id === task.id
              const changingTo = changing
                ? changeStatus.variables?.status
                : undefined
              const isCancelling =
                cancel.isPending && cancel.variables?.id === task.id
              const isPreparing =
                prepare.isPending && prepare.variables?.id === task.id
              return (
                <article
                  key={task.id}
                  title="Doble clic para ver"
                  onDoubleClick={() => setViewing(task)}
                  className="flex cursor-pointer flex-col gap-3 p-5 select-none hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border-border text-muted rounded-full border bg-slate-50 px-2 py-0.5 text-[11px] font-semibold">
                        {taskTypeLabels[task.type]}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses(task)}`}
                      >
                        {taskStatusLabel(task.status)}
                      </span>
                      {task.autoGenerated && (
                        <span className="text-muted text-[11px]">
                          Generada automáticamente
                        </span>
                      )}
                    </div>
                    <h2 className="text-ink mt-2 text-sm font-semibold">
                      {task.title}
                    </h2>
                    {task.description && (
                      <p className="text-muted mt-1 line-clamp-2 max-w-2xl text-xs leading-5">
                        {task.description}
                      </p>
                    )}
                    <div className="text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span
                        className={
                          overdue ? 'font-semibold text-amber-800' : undefined
                        }
                      >
                        {!task.dueAt
                          ? 'Sin fecha'
                          : `${overdue ? 'Venció' : 'Vence'} ${taskDueLabel(task)}`}
                      </span>
                      {task.patient && (
                        <Link
                          to={`/pacientes/${encodeURIComponent(task.patient.id)}`}
                          className="text-petroleo font-medium hover:underline"
                        >
                          {task.patient.fullName}
                        </Link>
                      )}
                      <span>
                        {task.assignee
                          ? `Asignada a ${task.assignee.name}`
                          : 'Sin asignar'}
                      </span>
                    </div>
                  </div>
                  {task.status === 'done' && canWrite && (
                    <div
                      className="flex shrink-0 flex-wrap gap-2"
                      onDoubleClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        className="h-9 px-3 text-xs"
                        onClick={() =>
                          changeStatus.mutate({ task, status: 'open' })
                        }
                        disabled={changing}
                        title="Volver la tarea a pendiente"
                      >
                        <RotateCcw className="size-4" />
                        {changing ? 'Reabriendo…' : 'Reabrir'}
                      </Button>
                    </div>
                  )}
                  {(task.status === 'open' || task.status === 'in_progress') &&
                    canWrite && (
                      <div
                        className="flex shrink-0 flex-wrap gap-2"
                        onDoubleClick={(event) => event.stopPropagation()}
                      >
                        {task.type === 'prepare_delivery' &&
                          task.cycleId &&
                          canOperate && (
                            <Button
                              className="h-9 px-3 text-xs"
                              onClick={() => prepare.mutate(task)}
                              disabled={isPreparing}
                              title="Marcar el ciclo como preparado"
                            >
                              <PackageCheck className="size-4" />
                              {isPreparing ? 'Preparando…' : 'Preparado'}
                            </Button>
                          )}
                        {overdue && (
                          <Button
                            className="h-9 px-3 text-xs"
                            onClick={() => setRescheduling(task)}
                            title="Elegir una nueva fecha de vencimiento"
                          >
                            <CalendarClock className="size-4" />
                            Reprogramar
                          </Button>
                        )}
                        {task.status === 'open' ? (
                          <Button
                            className="h-9 px-3 text-xs"
                            onClick={() =>
                              changeStatus.mutate({
                                task,
                                status: 'in_progress',
                              })
                            }
                            disabled={changing}
                            title="Marcar la tarea como en proceso"
                          >
                            <Play className="size-4" />
                            {changingTo === 'in_progress'
                              ? 'Iniciando…'
                              : 'Iniciar'}
                          </Button>
                        ) : (
                          <Button
                            className="h-9 px-3 text-xs"
                            onClick={() =>
                              changeStatus.mutate({ task, status: 'open' })
                            }
                            disabled={changing}
                            title="Volver la tarea a pendiente"
                          >
                            <RotateCcw className="size-4" />
                            {changingTo === 'open' ? 'Moviendo…' : 'Pendiente'}
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            variant="primary"
                            className="h-9 px-3 text-xs"
                            onClick={() =>
                              changeStatus.mutate({ task, status: 'done' })
                            }
                            disabled={changing || !task.patientId}
                            title={
                              task.patientId
                                ? 'Terminar tarea'
                                : 'Asocia un paciente para terminarla'
                            }
                          >
                            <Check className="size-4" />
                            {changingTo === 'done' ? 'Terminando…' : 'Terminar'}
                          </Button>
                        )}
                        <Button
                          className="h-9 px-3 text-xs"
                          onClick={() => setEditing(task)}
                          aria-label={`Editar tarea ${task.title}`}
                        >
                          <Pencil className="size-4" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 px-3 text-xs"
                          onClick={() => cancel.mutate(task)}
                          disabled={isCancelling}
                          aria-label={`Cancelar tarea ${task.title}`}
                        >
                          <X className="size-4" />
                          {isCancelling ? 'Cancelando…' : 'Cancelar'}
                        </Button>
                      </div>
                    )}
                </article>
              )
            })
          )}
        </div>
        <Pagination
          page={page}
          rows={rows}
          total={tasks.data?.total ?? 0}
          onChange={setPage}
          onRowsChange={(next) => {
            setRows(next)
            setPage(1)
          }}
          disabled={tasks.isFetching}
        />
      </section>

      {!items.length && !tasks.isLoading && branchReady && (
        <p className="text-muted mt-4 flex items-center gap-2 text-xs">
          <ListChecks className="size-4" />
          Las tareas terminadas se guardan en el historial del paciente.
        </p>
      )}

      {formOpen && (
        <TaskFormDialog
          onClose={() => setFormOpen(false)}
          onCreated={() => setTab('open')}
        />
      )}
      {editing && (
        <TaskFormDialog
          key={editing.id}
          task={editing}
          onClose={() => setEditing(null)}
          onCreated={() => setFeedback('Tarea actualizada.')}
        />
      )}
      {viewing && (
        <TaskDetailDialog
          key={viewing.id}
          task={viewing}
          canWrite={canWrite}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      )}
      {rescheduling && (
        <TaskRescheduleDialog
          key={rescheduling.id}
          task={rescheduling}
          onClose={() => setRescheduling(null)}
          onRescheduled={() => setFeedback('Tarea reprogramada.')}
        />
      )}
    </div>
  )
}
