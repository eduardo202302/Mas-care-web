import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PackageCheck, PackageOpen, ShoppingCart } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { FormActions } from '@/components/ui/FormActions'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import { todayDateOnly } from '@/lib/prescription'
import type { BoardCard } from '@/lib/board'

export type CycleOutcome = 'delivered' | 'not_picked_up'
type Origin = 'ours' | 'external'

/**
 * Al cerrar un ciclo (entregado o no retirado) se pregunta de dónde salió el
 * medicamento. Con «Con Nosotros» se registra la entrega o el no retiro normal;
 * con «En Otro Lado» se registra la compra externa y el ciclo se cierra igual.
 */
export function CycleCloseDialog({
  card,
  outcome,
  onClose,
  onCompleted,
}: {
  card: BoardCard
  outcome: CycleOutcome
  onClose: () => void
  onCompleted: () => void
}) {
  const toast = useToast()
  const [origin, setOrigin] = useState<Origin>('ours')
  const [quantity, setQuantity] = useState('')
  const [place, setPlace] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(todayDateOnly())

  // El tratamiento trae la cantidad del ciclo para precargarla.
  const treatment = useQuery({
    queryKey: ['treatments', 'close-picker', card.treatment_id],
    queryFn: () =>
      api<{ quantityPerCycle: string }>(
        `/api/v1/treatments/${encodeURIComponent(card.treatment_id)}`,
      ),
    enabled: Boolean(card.treatment_id),
  })
  // La cantidad se precarga con la del ciclo; sin esto el campo `required`
  // bloquea el envío con la validación nativa del navegador.
  useEffect(() => {
    if (quantity) return
    const suggested = treatment.data?.quantityPerCycle
    if (suggested !== undefined) setQuantity(String(suggested))
  }, [quantity, treatment.data?.quantityPerCycle])

  const suggestedQuantity =
    quantity || String(treatment.data?.quantityPerCycle ?? '')

  const deliver = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(card.treatment_id)}/deliver`,
        {
          method: 'POST',
          body: JSON.stringify({
            quantity: Number(suggestedQuantity),
            delivered_on: date,
            picked_up_by: 'patient',
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          }),
        },
      ),
    onSuccess: async () => {
      await onCompleted()
      toast.push('Entrega registrada.', 'success')
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  const notPickedUp = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/cycles/${encodeURIComponent(card.cycle_id)}/mark-not-picked-up`,
        {
          method: 'POST',
        },
      ),
    onSuccess: async () => {
      await onCompleted()
      toast.push('Ciclo marcado como no retirado.', 'success')
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  const closeExternal = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/cycles/${encodeURIComponent(card.cycle_id)}/close-external`,
        {
          method: 'POST',
          body: JSON.stringify({
            outcome,
            quantity: Number(suggestedQuantity),
            purchased_on: date,
            ...(place.trim() ? { place: place.trim() } : {}),
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          }),
        },
      ),
    onSuccess: async () => {
      await onCompleted()
      toast.push('Reposición cerrada como compra en otro lado.', 'success')
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  const pending =
    deliver.isPending || notPickedUp.isPending || closeExternal.isPending
  const invalidQuantity =
    origin === 'external' &&
    (!suggestedQuantity ||
      Number.isNaN(Number(suggestedQuantity)) ||
      Number(suggestedQuantity) <= 0)

  function submit() {
    if (pending || invalidQuantity) return
    if (origin === 'external') closeExternal.mutate()
    else if (outcome === 'delivered') deliver.mutate()
    else notPickedUp.mutate()
  }

  const title =
    outcome === 'delivered' ? 'Marcar Entregado' : 'Marcar No Retirado'

  return (
    <Dialog
      title={title}
      description={`${card.patient.nombre} · ${card.medication.nombre}`}
      icon={
        outcome === 'delivered' ? (
          <PackageCheck className="size-5" />
        ) : (
          <PackageOpen className="size-5" />
        )
      }
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <ModalSection
          icon={<ShoppingCart className="size-4" />}
          title="¿Dónde la Compró?"
        >
          <div
            role="radiogroup"
            aria-label="¿Dónde la compró?"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {[
              {
                value: 'ours' as Origin,
                label: 'Con Nosotros',
                hint:
                  outcome === 'delivered'
                    ? 'Se registra la entrega y se extiende la cobertura.'
                    : 'No la retiró de la farmacia.',
              },
              {
                value: 'external' as Origin,
                label: 'En Otro Lado',
                hint:
                  outcome === 'delivered'
                    ? 'Se registra la compra y se cierra el ciclo.'
                    : 'Se registra la compra y el ciclo queda como no retirado.',
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition ${
                  origin === option.value
                    ? 'border-tealmax bg-tealmax/5'
                    : 'border-border hover:border-tealmax/40 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="cycle-close-origin"
                  value={option.value}
                  checked={origin === option.value}
                  onChange={() => setOrigin(option.value)}
                  className="accent-tealmax mt-0.5 size-4"
                />
                <span>
                  <span className="text-ink block font-medium">
                    {option.label}
                  </span>
                  <span className="text-muted block text-xs">
                    {option.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </ModalSection>

        {origin === 'external' && (
          <ModalSection
            icon={<ShoppingCart className="size-4" />}
            title="Datos de la Compra"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Cantidad Comprada"
                type="number"
                min="0.001"
                step="any"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="30"
                required
                error={
                  quantity && invalidQuantity
                    ? 'Ingresa una cantidad mayor a cero.'
                    : undefined
                }
              />
              <TextField
                label="Fecha de Compra"
                type="date"
                max={todayDateOnly()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <TextField
              label="Lugar"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              maxLength={160}
              placeholder="Farmacia o comercio"
            />
            <TextAreaField
              label="Notas (Opcional)"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={5000}
            />
          </ModalSection>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            <ButtonIcon outcome={outcome} />
            {pending ? 'Guardando…' : title}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}

function ButtonIcon({ outcome }: { outcome: CycleOutcome }) {
  return outcome === 'delivered' ? (
    <PackageCheck className="size-4" />
  ) : (
    <PackageOpen className="size-4" />
  )
}
