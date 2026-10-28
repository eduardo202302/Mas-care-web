import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'
import {
  dateInputValue,
  todayInputValue,
  type Treatment,
} from '@/lib/treatments'

export type TreatmentActionType = 'pause' | 'finish' | 'adjust' | 'renew'

const copy: Record<
  TreatmentActionType,
  { title: string; description: string; submit: string }
> = {
  pause: {
    title: 'Pausar tratamiento',
    description:
      'Indica el motivo de la pausa. La nota quedarÃ¡ en el historial del paciente.',
    submit: 'Pausar tratamiento',
  },
  finish: {
    title: 'Finalizar tratamiento',
    description:
      'Indica el motivo del cierre. La nota quedarÃ¡ en el historial del paciente.',
    submit: 'Finalizar tratamiento',
  },
  adjust: {
    title: 'Ajustar fin de cobertura',
    description:
      'Define la nueva fecha de cobertura y el motivo del ajuste. Ambos quedarÃ¡n registrados.',
    submit: 'Ajustar cobertura',
  },
  renew: {
    title: 'Renovar receta',
    description:
      'Actualiza el vencimiento de la receta para mantener las alertas al dÃ­a.',
    submit: 'Renovar receta',
  },
}

export function TreatmentActionDialog({
  action,
  treatment,
  onClose,
  onCompleted,
}: {
  action: TreatmentActionType
  treatment: Treatment
  onClose: () => void
  onCompleted: () => Promise<void> | void
}) {
  const [reason, setReason] = useState('')
  const [newEndOn, setNewEndOn] = useState(
    dateInputValue(treatment.coverageEndOn) || todayInputValue(),
  )
  const [newExpiry, setNewExpiry] = useState(
    dateInputValue(treatment.prescriptionExpiresOn) || todayInputValue(),
  )
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const needsReason =
    action === 'pause' || action === 'finish' || action === 'adjust'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (needsReason && !reason.trim()) {
      setError('El motivo es obligatorio.')
      return
    }
    if (action === 'adjust' && !newEndOn) {
      setError('Indica la nueva fecha de fin de cobertura.')
      return
    }
    if (action === 'renew' && !newExpiry) {
      setError('Indica el nuevo vencimiento de la receta.')
      return
    }
    setPending(true)
    try {
      const base = `/api/v1/treatments/${encodeURIComponent(treatment.id)}`
      if (action === 'pause' || action === 'finish')
        await api<Treatment>(`${base}/${action}`, {
          method: 'POST',
          body: JSON.stringify({ reason: reason.trim() }),
        })
      else if (action === 'adjust')
        await api<Treatment>(`${base}/adjust-coverage`, {
          method: 'POST',
          body: JSON.stringify({ new_end_on: newEndOn, reason: reason.trim() }),
        })
      else
        await api<Treatment>(`${base}/renew-prescription`, {
          method: 'POST',
          body: JSON.stringify({ new_expiry: newExpiry }),
        })
      await onCompleted()
      onClose()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'No pudimos completar la acciÃ³n.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      title={copy[action].title}
      description={copy[action].description}
      onClose={onClose}
    >
      <form className="mt-5 grid gap-4" onSubmit={submit}>
        {action === 'adjust' && (
          <TextField
            label="Nuevo fin de cobertura"
            type="date"
            value={newEndOn}
            onChange={(event) => setNewEndOn(event.target.value)}
          />
        )}
        {action === 'renew' && (
          <TextField
            label="Nuevo vencimiento de receta"
            type="date"
            value={newExpiry}
            onChange={(event) => setNewExpiry(event.target.value)}
          />
        )}
        {needsReason && (
          <div className="grid gap-1.5">
            <label
              htmlFor="treatment-action-reason"
              className="text-ink text-sm font-medium"
            >
              Motivo <span className="text-red-700">*</span>
            </label>
            <textarea
              id="treatment-action-reason"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe el motivo de esta acciÃ³nâ€¦"
              className="border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 w-full rounded-lg border bg-white px-3 py-2 text-sm transition outline-none focus:ring-2"
            />
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={action === 'finish' ? 'danger' : 'primary'}
            disabled={pending}
          >
            {pending ? 'Guardandoâ€¦' : copy[action].submit}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
