import { useState } from 'react'
import {
  CalendarClock,
  CircleCheck,
  FileCheck2,
  Pause,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'
import {
  dateInputValue,
  todayInputValue,
  type Treatment,
} from '@/lib/treatments'

export type TreatmentActionType = 'pause' | 'finish' | 'adjust' | 'renew'

const iconOf: Record<TreatmentActionType, LucideIcon> = {
  pause: Pause,
  finish: CircleCheck,
  adjust: CalendarClock,
  renew: FileCheck2,
}

const copy: Record<
  TreatmentActionType,
  { title: string; description: string; submit: string; section: string }
> = {
  pause: {
    section: 'Motivo de la Pausa',
    title: 'Pausar Tratamiento',
    description:
      'Indica el motivo de la pausa. La nota quedará en el historial del paciente.',
    submit: 'Pausar Tratamiento',
  },
  finish: {
    section: 'Motivo del Cierre',
    title: 'Finalizar Tratamiento',
    description:
      'Indica el motivo del cierre. La nota quedará en el historial del paciente.',
    submit: 'Finalizar Tratamiento',
  },
  adjust: {
    section: 'Nueva Cobertura',
    title: 'Ajustar Fin de Cobertura',
    description:
      'Define la nueva fecha de cobertura y el motivo del ajuste. Ambos quedarán registrados.',
    submit: 'Ajustar Cobertura',
  },
  renew: {
    section: 'Nueva Receta',
    title: 'Renovar Receta',
    description:
      'Actualiza el vencimiento de la receta para mantener las alertas al día.',
    submit: 'Renovar Receta',
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
          : 'No pudimos completar la acción.',
      )
    } finally {
      setPending(false)
    }
  }

  const ActionIcon = iconOf[action]

  return (
    <Dialog
      title={copy[action].title}
      description={copy[action].description}
      icon={<ActionIcon className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form className="grid gap-5" onSubmit={submit}>
        <ModalSection
          icon={<ActionIcon className="size-4" />}
          title={copy[action].section}
          tone={action === 'finish' ? 'amber' : 'mint'}
        >
          {action === 'adjust' && (
            <TextField
              label="Nuevo fin de cobertura"
              type="date"
              required
              value={newEndOn}
              onChange={(event) => setNewEndOn(event.target.value)}
            />
          )}
          {action === 'renew' && (
            <TextField
              label="Nuevo vencimiento de receta"
              type="date"
              required
              value={newExpiry}
              onChange={(event) => setNewExpiry(event.target.value)}
            />
          )}
          {needsReason && (
            <TextAreaField
              label="Motivo"
              required
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe el motivo de esta acción…"
            />
          )}
        </ModalSection>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <FormActions>
          <Button type="button" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={action === 'finish' ? 'danger' : 'primary'}
            className="w-full sm:w-auto"
            disabled={pending}
          >
            {pending ? 'Guardando…' : copy[action].submit}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
