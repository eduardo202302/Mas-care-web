import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PackageCheck, ShieldAlert } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { FormActions } from '@/components/ui/FormActions'
import { api, ApiError } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  newIdempotencyKey,
  type DeliveryResult,
  type Treatment,
} from '@/lib/operations'
import {
  formatDateOnly,
  prescriptionState,
  todayDateOnly,
} from '@/lib/prescription'
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
  })

  useEffect(() => {
    if (defaultQuantity !== undefined || quantity) return
    if (treatment.data?.quantityPerCycle !== undefined) {
      setQuantity(String(treatment.data.quantityPerCycle))
    }
  }, [defaultQuantity, quantity, treatment.data?.quantityPerCycle])

  // La receta vencida bloquea la entrega: el backend también la rechaza.
  const prescription = useMemo(
    () => prescriptionState(treatment.data?.prescriptionExpiresOn),
    [treatment.data?.prescriptionExpiresOn],
  )
  const blocked = prescription === 'expired'
  const expiryText = treatment.data?.prescriptionExpiresOn
    ? formatDateOnly(treatment.data.prescriptionExpiresOn)
    : null

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
  const blockedByServer =
    deliver.error instanceof ApiError && deliver.error.status === 409

  return (
    <Dialog
      title="Registrar Entrega"
      description={`${patientName} · ${medicationName}`}
      icon={<PackageCheck className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (inFlight.current || invalidQuantity || !deliveredOn || blocked)
            return
          inFlight.current = true
          deliver.mutate()
        }}
      >
        {blocked ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Receta vencida</p>
              <p className="mt-1 leading-6">
                La receta de este tratamiento venció el {expiryText}. No se
                puede registrar la entrega hasta renovarla.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900">
            La entrega descuenta este ciclo y extiende la cobertura del
            tratamiento. Si reintentas, se usará la misma clave de idempotencia
            para evitar duplicados.
          </div>
        )}

        <ModalSection
          icon={<PackageCheck className="size-4" />}
          title="Datos de la Entrega"
          tone="mint"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Cantidad Entregada"
              name="quantity"
              type="number"
              min="0.001"
              step="any"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              disabled={blocked}
              error={
                quantity && invalidQuantity
                  ? 'Ingresa una cantidad mayor a cero.'
                  : undefined
              }
            />
            <TextField
              label="Fecha de Entrega"
              name="delivered_on"
              type="date"
              value={deliveredOn}
              max={todayDateOnly()}
              onChange={(event) => setDeliveredOn(event.target.value)}
              required
              disabled={blocked}
            />
            <div className="grid gap-1.5">
              <label
                htmlFor="delivery-pickup"
                className="text-ink text-sm font-medium"
              >
                ¿Quién Retira?
              </label>
              <select
                id="delivery-pickup"
                value={pickedUpBy}
                onChange={(event) =>
                  setPickedUpBy(event.target.value as Pickup)
                }
                disabled={blocked}
                className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                {pickupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {pickedUpBy === 'other' && (
              <TextField
                label="Nombre de Quien Retira"
                value={pickedUpByName}
                onChange={(event) => setPickedUpByName(event.target.value)}
                maxLength={200}
                placeholder="Nombre completo"
                disabled={blocked}
              />
            )}
          </div>
          <TextField
            label="Notas (Opcional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            placeholder="Observaciones de la entrega"
            disabled={blocked}
          />
        </ModalSection>

        {treatment.isError && (
          <p role="alert" className="text-xs text-red-700">
            No pudimos consultar el tratamiento. Puedes ingresar la cantidad
            manualmente.
          </p>
        )}
        {deliver.isError && (
          <p role="alert" className="text-sm text-red-700">
            {blockedByServer
              ? deliver.error.message
              : `No pudimos registrar la entrega. ${deliver.error.message}`}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              blocked || deliver.isPending || invalidQuantity || !deliveredOn
            }
          >
            <PackageCheck className="size-4" />
            {deliver.isPending ? 'Registrando…' : 'Confirmar Entrega'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
