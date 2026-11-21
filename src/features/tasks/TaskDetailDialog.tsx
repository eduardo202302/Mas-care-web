import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, History, MessageSquare, Send } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { ModalSection } from '@/components/ui/ModalSection'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { FormFooter } from '@/components/ui/FormMode'
import { api } from '@/lib/http'
import {
  formatDateTime,
  taskDueLabel,
  taskEventLabel,
  taskPriorityLabels,
  taskStatusLabel,
  taskTypeLabels,
  type Task,
  type TaskEvent,
} from '@/lib/operations'

type DetailTab = 'comments' | 'history'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-[11px] font-semibold uppercase">
        {label}
      </dt>
      <dd className="text-ink mt-0.5 truncate text-sm">{value}</dd>
    </div>
  )
}

export function TaskDetailDialog({
  task,
  canWrite,
  onClose,
  onEdit,
}: {
  task: Task
  canWrite: boolean
  onClose: () => void
  onEdit: () => void
}) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<DetailTab>('comments')
  const [comment, setComment] = useState('')

  const events = useQuery({
    queryKey: ['tasks', 'events', task.id],
    queryFn: () =>
      api<{ data: TaskEvent[] }>(
        `/api/v1/tasks/${encodeURIComponent(task.id)}/events`,
      ),
  })

  const addComment = useMutation({
    mutationFn: (body: string) =>
      api<TaskEvent>(`/api/v1/tasks/${encodeURIComponent(task.id)}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
    onSuccess: async () => {
      setComment('')
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'events', task.id],
      })
    },
  })

  const all = events.data?.data ?? []
  const comments = all.filter((event) => event.type === 'comment')
  const history = all.filter((event) => event.type !== 'comment')
  const trimmed = comment.trim()

  function submit() {
    if (!trimmed || addComment.isPending) return
    addComment.mutate(trimmed)
  }

  const editable = task.status === 'open' || task.status === 'in_progress'

  return (
    <Dialog
      title={task.title}
      description="Detalle de la tarea"
      icon={<ClipboardList className="size-5" />}
      compactHeader
      size="lg"
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <div className="grid gap-4">
        <ModalSection
          icon={<ClipboardList className="size-4" />}
          title="Detalles de la Tarea"
          collapsible={false}
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <Field label="Estado" value={taskStatusLabel(task.status)} />
            <Field label="Tipo" value={taskTypeLabels[task.type]} />
            <Field
              label="Prioridad"
              value={taskPriorityLabels[task.priority]}
            />
            <Field label="Vence" value={taskDueLabel(task)} />
            <Field
              label="Paciente"
              value={task.patient?.fullName ?? 'Sin paciente'}
            />
            <Field
              label="Asignada a"
              value={task.assignee?.name ?? 'Sin asignar'}
            />
          </dl>
          {task.description && (
            <p className="text-muted border-border border-t pt-3 text-xs leading-5 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </ModalSection>

        <ModalSection
          icon={<MessageSquare className="size-4" />}
          title="Seguimiento"
          collapsible={false}
        >
          <Tabs<DetailTab>
            value={tab}
            onChange={setTab}
            tabs={[
              {
                value: 'comments',
                label: 'Comentarios',
                icon: <MessageSquare className="size-4" />,
                badge: comments.length,
              },
              {
                value: 'history',
                label: 'Historial',
                icon: <History className="size-4" />,
              },
            ]}
          />

          <div role="tabpanel">
            {events.isLoading ? (
              <div className="grid gap-3" aria-busy="true">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : events.isError ? (
              <p role="alert" className="text-sm text-red-700">
                No pudimos cargar el historial. {events.error.message}
              </p>
            ) : tab === 'comments' ? (
              <div className="grid gap-4">
                {canWrite && (
                  <div className="grid gap-2">
                    <TextAreaField
                      aria-label="Nuevo comentario"
                      className="min-h-16 py-2 text-sm"
                      value={comment}
                      maxLength={2000}
                      placeholder="Escribe un comentario para el equipo"
                      onChange={(event) => setComment(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.ctrlKey || event.metaKey)
                        ) {
                          event.preventDefault()
                          submit()
                        }
                      }}
                    />
                    <div className="flex items-center justify-end gap-3">
                      {addComment.isError && (
                        <p
                          role="alert"
                          className="mr-auto text-xs text-red-700"
                        >
                          No pudimos guardar el comentario.{' '}
                          {addComment.error.message}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        className="h-9 px-3 text-xs"
                        disabled={!trimmed || addComment.isPending}
                        onClick={submit}
                      >
                        <Send className="size-4" />
                        {addComment.isPending ? 'Enviando…' : 'Comentar'}
                      </Button>
                    </div>
                  </div>
                )}
                {comments.length === 0 ? (
                  <p className="text-muted text-sm">Aún no hay comentarios.</p>
                ) : (
                  <ul className="grid gap-3">
                    {comments.map((event) => (
                      <li
                        key={event.id}
                        className="border-border rounded-lg border bg-white p-3"
                      >
                        <p className="text-muted text-xs">
                          <span className="text-ink font-semibold">
                            {event.author?.name ?? 'Sistema'}
                          </span>{' '}
                          · {formatDateTime(event.createdAt)}
                        </p>
                        <p className="text-ink mt-1 text-sm whitespace-pre-wrap">
                          {event.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <ol className="border-border grid gap-4 border-l pl-4">
                {history.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="bg-tealmax absolute top-1.5 -left-[21px] size-2 rounded-full" />
                    <p className="text-ink text-sm">{taskEventLabel(event)}</p>
                    <p className="text-muted text-xs">
                      {event.author?.name ?? 'Sistema'} ·{' '}
                      {formatDateTime(event.createdAt)}
                    </p>
                  </li>
                ))}
                <li className="relative">
                  <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-slate-300" />
                  <p className="text-ink text-sm">
                    {task.autoGenerated
                      ? 'Tarea creada automáticamente'
                      : 'Tarea creada'}
                  </p>
                  <p className="text-muted text-xs">
                    {formatDateTime(task.createdAt)}
                  </p>
                </li>
              </ol>
            )}
          </div>
        </ModalSection>

        <FormFooter
          readOnly
          submitLabel="Guardar"
          onClose={onClose}
          onEdit={canWrite && editable ? onEdit : undefined}
        />
      </div>
    </Dialog>
  )
}
