import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PackageCheck } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  newIdempotencyKey,
  type DeliveryResult,
  type Treatment,
} from '@/lib/operations'
import { todayInputValue } from '@/lib/treatments'

type Pickup = NonNullable<
  components['schemas']['DeliveryInput']['picked_up_by']
>

const pickupOptions: { value: Pickup; label: string }[] = [
  { value: 'patient', label: 'Paciente' },
  { value: 'caregiver', label: 'Cuidador' },
  { value: 'home_delivery', label: 'Entrega a domicilio' },
  { value: 'other', label: 'Otra persona' },
]

export function DeliveryDialog({
  treatmentId,
  patientName,
  medicationName,
  defaultQuantity,
  onClose,
  onCompleted,
}: {
  treatmentId: string
  patientName: string
  medicationName: string
  defaultQuantity?: string | number
  onClose: () => void
  onCompleted?: (replay: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(
    defaultQuantity === undefined ? '' : String(defaultQuantity),
  )
  const [deliveredOn, setDeliveredOn] = useState(todayInputValue())
  const [pickedUpBy, setPickedUpBy] = useState<Pickup>('patient')
  const [pickedUpByName, setPickedUpByName] = useState('')
  const [notes, setNotes] = useState('')
  const idempotencyKey = useRef('')
  const inFlight = useRef(false)
  if (!idempotencyKey.current) idempotencyKey.current = newIdempotencyKey()

  const treatment = useQuery({
    queryKey: ['treatments', 'detail', treatmentId],
    queryFn: () =>
      api<Treatment>(`/api/v1/treatments/${encodeURIComponent(treatmentId)}`),
    enabled: defaultQuantity === undefined,
  })

  useEffect(() => {
    if (defaultQuantity !== undefined || quantity) return
    if (treatment.data?.quantityPerCycle !== undefined) {
      setQuantity(String(treatment.data.quantityPerCycle))
    }
  }, [defaultQuantity, quantity, treatment.data?.quantityPerCycle])

  const deliver = useMutation({
    mutationFn: () =>
      api<DeliveryResult>(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/deliver`,
        {
          method: 'POST',
          headers: { 'Idempotency-Key': idempotencyKey.current },
          body: JSON.stringify({
            quantity: Number(quantity),
            delivered_on: deliveredOn,
            picked_up_by: pickedUpBy,
            ...(pickedUpBy === 'other' && pickedUpByName.trim()
              ? { picked_up_by_name: pickedUpByName.trim() }
              : {}),
            ...(notes.trim() ? { notes: notes.trim() } : {}),
          }),
        },
      ),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['treatments'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      ])
      onCompleted?.(result.idempotent_replay)
      onClose()
    },
    onSettled: () => {
      inFlight.current = false
    },
  })

  const quantityNumber = Number(quantity)
  const invalidQuantity =
    !quantity || Number.isNaN(quantityNumber) || quantityNumber <= 0

  return (
    <Dialog
      title="Registrar entrega"
      description={`${patientName} · ${medicationName}`}
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (inFlight.current || invalidQuantity || !deliveredOn) return
          inFlight.current = true
          deliver.mutate()
        }}
      >
        <div className="border-tealmax/20 bg-tealmax/5 rounded-lg border px-3 py-2 text-xs text-teal-900">
          La entrega descuenta este ciclo y extiende la cobertura del
          tratamiento. Si reintentas, se usará la misma clave de idempotencia
          para evitar duplicados.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Cantidad entregada"
            name="quantity"
            type="number"
            min="0.001"
            step="any"
            inputMode="decimal"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
            error={
              quantity && invalidQuantity
                ? 'Ingresa una cantidad mayor a cero.'
                : undefined
            }
          />
          <TextField
            label="Fecha de entrega"
            name="delivered_on"
            type="date"
            value={deliveredOn}
            max={todayInputValue()}
            onChange={(event) => setDeliveredOn(event.target.value)}
            required
          />
        </div>
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">¿Quién retira?</span>
          <select
            value={pickedUpBy}
            onChange={(event) => setPickedUpBy(event.target.value as Pickup)}
            className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
          >
            {pickupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {pickedUpBy === 'other' && (
          <TextField
            label="Nombre de quien retira"
            value={pickedUpByName}
            onChange={(event) => setPickedUpByName(event.target.value)}
            maxLength={200}
            placeholder="Nombre completo"
          />
        )}
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Notas <span className="text-muted font-normal">(Opcional)</span>
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Observaciones de la entrega"
            className="border-border focus:border-tealmax rounded-lg border bg-white px-3 py-2 text-sm outline-none"
          />
        </label>
        {treatment.isError && (
          <p role="alert" className="text-xs text-red-700">
            No pudimos consultar la cantidad del tratamiento. Puedes ingresarla
            manualmente.
          </p>
        )}
        {deliver.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos registrar la entrega. {deliver.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={deliver.isPending || invalidQuantity || !deliveredOn}
          >
            <PackageCheck className="size-4" />
            {deliver.isPending ? 'Registrando…' : 'Confirmar entrega'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
