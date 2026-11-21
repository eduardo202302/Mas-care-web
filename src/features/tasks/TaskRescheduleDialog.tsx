import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarClock } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import { taskDueLabel, type Task } from '@/lib/operations'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function nowInput(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function TaskRescheduleDialog({
  task,
  onClose,
  onRescheduled,
}: {
  task: Task
  onClose: () => void
  onRescheduled: () => void
}) {
  const queryClient = useQueryClient()
  const [dueAt, setDueAt] = useState('')
  const minDue = nowInput()
  const valid = dueAt !== '' && dueAt >= minDue

  const reschedule = useMutation({
    mutationFn: () =>
      api<Task>(`/api/v1/tasks/${encodeURIComponent(task.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ due_at: new Date(dueAt).toISOString() }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
      onRescheduled()
      onClose()
    },
  })

  return (
    <Dialog
      title="Reprogramar tarea"
      description={`${task.title} · venció ${taskDueLabel(task)}`}
      icon={<CalendarClock className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid || reschedule.isPending) return
          reschedule.mutate()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
            Nueva fecha de vencimiento
          </span>
          <input
            type="datetime-local"
            value={dueAt}
            min={minDue}
            required
            onChange={(event) => setDueAt(event.target.value)}
            className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2"
          />
        </label>

        {reschedule.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos reprogramar la tarea. {reschedule.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!valid || reschedule.isPending}
          >
            {reschedule.isPending ? 'Reprogramando…' : 'Reprogramar'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
