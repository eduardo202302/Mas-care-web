import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { EmptyState } from '@/components/EmptyState'

export type ProjectionRow = {
  /** Fecha local (YYYY-MM-DD) del día en que toca tomar. */
  date: string
  /** Unidades que se consumen ese día. */
  units: number
  /** Saldo después de las tomas de ese día. */
  remaining: number
}

export type InventorySummary = {
  /** Saldo del libro (entregas y compras). */
  balance: number
  /** Lo que queda físicamente: el libro menos lo ya tomado sin registrar. */
  balance_real?: number
  /** Unidades de tomas cuya hora pasó y nadie registró. */
  consumed_unlogged?: number
  rate_per_day: number
  rate_source: 'actual' | 'scheduled'
  days_remaining_real: number | null
  low_inventory_threshold: string | null
  is_low: boolean
  /** Fecha en la que la programación real agota el saldo (null si no se agota). */
  exhausted_on?: string | null
  /** Sólo los días con toma programada (el backend materializa el horario). */
  projection?: ProjectionRow[]
}

type InventoryEntry = {
  id: string
  type:
    | 'initial'
    | 'external_purchase'
    | 'pharmacy_delivery'
    | 'manual_adjustment'
    | 'dose_consumption'
    | 'reversal'
  quantityDelta: string
  note: string | null
  createdAt: string
}

const entryTypeLabels: Record<InventoryEntry['type'], string> = {
  initial: 'Saldo inicial',
  external_purchase: 'Compra Externa',
  pharmacy_delivery: 'Entrega de farmacia',
  manual_adjustment: 'Ajuste manual',
  dose_consumption: 'Toma registrada',
  reversal: 'Reversión',
}

/** Balance, consumption rate and ledger history for one treatment - parallel to the refill-cycle pipeline, not a replacement for it. */
export function InventoryPanel({ treatmentId }: { treatmentId: string }) {
  const queryClient = useQueryClient()
  const canPurchase = useCan('inventory:purchase')
  const canAdjust = useCan('inventory:adjust')
  const canSetThreshold = useCan('inventory:settings:write')
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [thresholdOpen, setThresholdOpen] = useState(false)
  const [thresholdValue, setThresholdValue] = useState('')

  const summary = useQuery({
    queryKey: ['treatments', treatmentId, 'inventory'],
    queryFn: () =>
      api<InventorySummary>(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/inventory`,
      ),
  })
  const entries = useQuery({
    queryKey: ['treatments', treatmentId, 'inventory', 'entries'],
    queryFn: () =>
      api<{ data: InventoryEntry[]; next_cursor: string | null }>(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/inventory/entries?limit=20`,
      ),
  })

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['treatments', treatmentId, 'inventory'],
      }),
    ])

  const [purchaseQuantity, setPurchaseQuantity] = useState('')
  const [purchasePlace, setPurchasePlace] = useState('')
  const [purchasedOn, setPurchasedOn] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const purchase = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/external-purchases`,
        {
          method: 'POST',
          body: JSON.stringify({
            quantity: Number(purchaseQuantity),
            place: purchasePlace.trim() || null,
            purchased_on: purchasedOn,
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      setPurchaseOpen(false)
      setPurchaseQuantity('')
      setPurchasePlace('')
    },
  })

  const [adjustDelta, setAdjustDelta] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const adjust = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/inventory/adjust`,
        {
          method: 'POST',
          body: JSON.stringify({
            quantity_delta: Number(adjustDelta),
            note: adjustNote.trim(),
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      setAdjustOpen(false)
      setAdjustDelta('')
      setAdjustNote('')
    },
  })

  const setThreshold = useMutation({
    mutationFn: () =>
      api(
        `/api/v1/treatments/${encodeURIComponent(treatmentId)}/inventory/threshold`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            low_inventory_threshold: thresholdValue.trim()
              ? Number(thresholdValue)
              : null,
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      setThresholdOpen(false)
    },
  })

  return (
    <section className="border-border min-w-0 rounded-xl border bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-petroleo font-semibold">Inventario</h2>
        <div className="flex flex-wrap gap-2">
          {canPurchase && (
            <Button onClick={() => setPurchaseOpen(true)}>
              Compra Externa
            </Button>
          )}
          {canAdjust && (
            <Button onClick={() => setAdjustOpen(true)}>Ajustar</Button>
          )}
          {canSetThreshold && (
            <Button
              onClick={() => {
                setThresholdValue(summary.data?.low_inventory_threshold ?? '')
                setThresholdOpen(true)
              }}
            >
              Umbral
            </Button>
          )}
        </div>
      </div>

      {summary.data && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-muted">Saldo Real</dt>
            <dd className="text-ink mt-0.5 font-medium">
              {summary.data.balance_real ?? summary.data.balance} unidades
              {summary.data.consumed_unlogged ? (
                <span className="text-muted mt-0.5 block text-xs font-normal">
                  de {summary.data.balance} entregadas ·{' '}
                  {summary.data.consumed_unlogged} ya tomadas
                </span>
              ) : null}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted">Umbral de Alerta</dt>
            <dd className="mt-0.5">
              {summary.data.low_inventory_threshold ?? 'Sin definir'}{' '}
              {summary.data.is_low && (
                <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                  Inventario bajo
                </span>
              )}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-5"></div>

      <div className="mt-5">
        <h3 className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
          Historial
        </h3>
        {entries.data?.data.length ? (
          <ul className="grid gap-2">
            {entries.data.data.map((entry) => (
              <li
                key={entry.id}
                className="border-border flex items-center justify-between gap-2 border-b pb-2 text-sm last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink font-medium">
                    {entryTypeLabels[entry.type]}
                  </p>
                  {entry.note && (
                    <p className="text-muted truncate text-xs">{entry.note}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={
                      Number(entry.quantityDelta) < 0
                        ? 'font-semibold text-red-700'
                        : 'font-semibold text-emerald-700'
                    }
                  >
                    {Number(entry.quantityDelta) > 0 ? '+' : ''}
                    {entry.quantityDelta}
                  </p>
                  <p className="text-muted text-xs">
                    {new Date(entry.createdAt).toLocaleDateString('es')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Sin movimientos"
            description="Las compras, entregas y ajustes de inventario aparecerán aquí."
          />
        )}
      </div>

      {purchaseOpen && (
        <Dialog
          title="Registrar Compra Externa"
          description="Unidades compradas fuera de la farmacia, se suman al saldo."
          icon={<ShoppingCart className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setPurchaseOpen(false)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (!purchaseQuantity) return
              purchase.mutate()
            }}
          >
            <ModalSection
              icon={<ShoppingCart className="size-4" />}
              title="Datos de la Compra"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Cantidad"
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={purchaseQuantity}
                  onChange={(event) => setPurchaseQuantity(event.target.value)}
                />
                <TextField
                  label="Fecha de compra"
                  type="date"
                  required
                  value={purchasedOn}
                  onChange={(event) => setPurchasedOn(event.target.value)}
                />
                <TextField
                  label="Lugar (opcional)"
                  className="sm:col-span-2"
                  value={purchasePlace}
                  onChange={(event) => setPurchasePlace(event.target.value)}
                />
              </div>
            </ModalSection>
            {purchase.isError && (
              <p role="alert" className="text-sm text-red-700">
                {purchase.error.message}
              </p>
            )}
            <FormActions>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setPurchaseOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto"
                disabled={purchase.isPending}
              >
                {purchase.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}

      {adjustOpen && (
        <Dialog
          title="Ajustar Inventario"
          description="Usa un número negativo para descontar (ej. medicamento vencido)."
          icon={<SlidersHorizontal className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setAdjustOpen(false)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (!adjustDelta || !adjustNote.trim()) return
              adjust.mutate()
            }}
          >
            <ModalSection
              icon={<SlidersHorizontal className="size-4" />}
              title="Ajuste de Saldo"
            >
              <TextField
                label="Cantidad (+/-)"
                type="number"
                step="0.001"
                required
                value={adjustDelta}
                onChange={(event) => setAdjustDelta(event.target.value)}
              />
              <TextAreaField
                label="Motivo"
                required
                value={adjustNote}
                onChange={(event) => setAdjustNote(event.target.value)}
              />
            </ModalSection>
            {adjust.isError && (
              <p role="alert" className="text-sm text-red-700">
                {adjust.error.message}
              </p>
            )}
            <FormActions>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setAdjustOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto"
                disabled={adjust.isPending}
              >
                {adjust.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}

      {thresholdOpen && (
        <Dialog
          title="Umbral de Inventario Bajo"
          description="Cuando el saldo llegue a este número o menos, se crea una incidencia para el equipo. Déjalo vacío para desactivar la alerta."
          icon={<TriangleAlert className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setThresholdOpen(false)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              setThreshold.mutate()
            }}
          >
            <ModalSection
              icon={<TriangleAlert className="size-4" />}
              title="Alerta de Stock"
            >
              <TextField
                label="Umbral (unidades)"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Sin umbral"
                value={thresholdValue}
                onChange={(event) => setThresholdValue(event.target.value)}
              />
            </ModalSection>
            {setThreshold.isError && (
              <p role="alert" className="text-sm text-red-700">
                {setThreshold.error.message}
              </p>
            )}
            <FormActions>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setThresholdOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="w-full sm:w-auto"
                disabled={setThreshold.isPending}
              >
                {setThreshold.isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
    </section>
  )
}
