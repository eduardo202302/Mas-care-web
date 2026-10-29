import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'

type Target = 'patients' | 'treatments'

/** Pauses or resumes the automatic notices of one patient or treatment. Pausing also cancels what was already queued. */
export function useSetAutomationPaused(target: Target, id: string, invalidate: readonly unknown[][]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ paused, reason }: { paused: boolean; reason?: string }) =>
      api<{ cancelled_messages: number }>(`/api/v1/${target}/${encodeURIComponent(id)}/automation`, {
        method: 'PATCH',
        body: JSON.stringify({ paused, ...(reason ? { reason } : {}) }),
      }),
    onSuccess: async () => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
    },
  })
}

export function PauseDialog({
  subject,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  subject: string
  pending: boolean
  error?: string | undefined
  onConfirm: (reason: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  return (
    <Dialog
      title="Pausar avisos automáticos"
      description={`No se enviará ningún aviso automático ${subject} hasta que los reanudes. Los avisos que estaban en cola se cancelan.`}
      onClose={onClose}
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          onConfirm(reason.trim())
        }}
      >
        <label className="grid gap-1 text-sm font-medium">
          Motivo (opcional)
          <textarea
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="border-border rounded-lg border px-3 py-2 text-sm"
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={pending}>Pausar avisos</Button>
        </div>
      </form>
    </Dialog>
  )
}

/** Patient record panel: current state plus the pause / resume action. */
export function PatientAutomationPanel({
  patientId,
  paused,
  reason,
  canEdit,
}: {
  patientId: string
  paused: boolean
  reason: string | null | undefined
  canEdit: boolean
}) {
  const [asking, setAsking] = useState(false)
  const mutation = useSetAutomationPaused('patients', patientId, [['patients', patientId], ['outbox']])
  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <h2 className="text-petroleo mb-3 font-semibold">Avisos automáticos</h2>
      <p className="text-sm">{paused ? 'Pausados para este paciente.' : 'Activos para este paciente.'}</p>
      {paused && reason && <p className="text-muted mt-1 text-xs">Motivo: {reason}</p>}
      {canEdit && (
        <Button
          className="mt-3 h-8 px-2 text-xs"
          disabled={mutation.isPending}
          onClick={() => (paused ? mutation.mutate({ paused: false }) : setAsking(true))}
        >
          {paused ? 'Reanudar avisos' : 'Pausar avisos'}
        </Button>
      )}
      {mutation.isError && !asking && <p role="alert" className="mt-2 text-xs text-red-700">{mutation.error.message}</p>}
      {asking && (
        <PauseDialog
          subject="a este paciente"
          pending={mutation.isPending}
          error={mutation.error?.message}
          onClose={() => setAsking(false)}
          onConfirm={(text) => mutation.mutate({ paused: true, ...(text ? { reason: text } : {}) }, { onSuccess: () => setAsking(false) })}
        />
      )}
    </section>
  )
}
