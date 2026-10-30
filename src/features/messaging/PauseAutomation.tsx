import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BellOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { api } from '@/lib/http'

type Target = 'patients' | 'treatments'

/** Pauses or resumes the automatic notices of one patient or treatment. Pausing also cancels what was already queued. */
export function useSetAutomationPaused(
  target: Target,
  id: string,
  invalidate: readonly unknown[][],
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ paused, reason }: { paused: boolean; reason?: string }) =>
      api<{ cancelled_messages: number }>(
        `/api/v1/${target}/${encodeURIComponent(id)}/automation`,
        {
          method: 'PATCH',
          body: JSON.stringify({ paused, ...(reason ? { reason } : {}) }),
        },
      ),
    onSuccess: async () => {
      await Promise.all(
        invalidate.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      )
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
      title="Pausar Avisos Automáticos"
      description={`No se enviará ningún aviso automático ${subject} hasta que los reanudes. Los avisos que estaban en cola se cancelan.`}
      icon={<BellOff className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          onConfirm(reason.trim())
        }}
      >
        <ModalSection
          icon={<BellOff className="size-4" />}
          title="Motivo de la Pausa"
          tone="mint"
        >
          <div className="grid gap-1.5">
            <label
              htmlFor="pause-reason"
              className="text-ink text-sm font-medium"
            >
              Motivo <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <TextAreaField
              id="pause-reason"
              className="min-h-8 py-1.5 text-xs"
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
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
          <Button type="submit" variant="primary" disabled={pending}>
            Pausar Avisos
          </Button>
        </FormActions>
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
  const mutation = useSetAutomationPaused('patients', patientId, [
    ['patients', patientId],
    ['outbox'],
  ])
  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <h2 className="text-petroleo mb-3 font-semibold">Avisos automáticos</h2>
      <p className="text-sm">
        {paused
          ? 'Pausados para este paciente.'
          : 'Activos para este paciente.'}
      </p>
      {paused && reason && (
        <p className="text-muted mt-1 text-xs">Motivo: {reason}</p>
      )}
      {canEdit && (
        <Button
          className="mt-3 h-8 px-2 text-xs"
          disabled={mutation.isPending}
          onClick={() =>
            paused ? mutation.mutate({ paused: false }) : setAsking(true)
          }
        >
          {paused ? 'Reanudar Avisos' : 'Pausar Avisos'}
        </Button>
      )}
      {mutation.isError && !asking && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {mutation.error.message}
        </p>
      )}
      {asking && (
        <PauseDialog
          subject="a este paciente"
          pending={mutation.isPending}
          error={mutation.error?.message}
          onClose={() => setAsking(false)}
          onConfirm={(text) =>
            mutation.mutate(
              { paused: true, ...(text ? { reason: text } : {}) },
              { onSuccess: () => setAsking(false) },
            )
          }
        />
      )}
    </section>
  )
}
