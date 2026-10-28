import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRightLeft, TriangleAlert } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import { newIdempotencyKey } from '@/lib/operations'
import type { Treatment } from '@/lib/treatments'
import { medicationName, type Medication } from '@/lib/treatments'
import {
  isTransferPending,
  transferWarningLabel,
  type Transfer,
  type TransferPending,
  type TransferWarning,
} from '@/lib/transfers'
import type { components } from '@/lib/api-types'

type Branch = components['schemas']['Branch']

export function TransferDialog({
  patientId,
  patientName,
  currentBranchId,
  branches,
  treatments,
  medications,
  onClose,
  onCompleted,
}: {
  patientId: string
  patientName: string
  currentBranchId: string
  branches: Branch[]
  treatments: Treatment[]
  medications: Map<string, Medication>
  onClose: () => void
  onCompleted?: () => void
}) {
  const queryClient = useQueryClient()
  const destinations = branches.filter(
    (branch) => branch.id !== currentBranchId && !branch.archivedAt,
  )
  const activeTreatments = treatments.filter(
    (treatment) => treatment.status === 'active',
  )
  const [toBranchId, setToBranchId] = useState(destinations[0]?.id ?? '')
  const [reason, setReason] = useState('')
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>(
    activeTreatments.map((treatment) => treatment.id),
  )
  const [warnings, setWarnings] = useState<TransferWarning[] | null>(null)
  const idempotencyKey = useRef('')
  const inFlight = useRef(false)
  if (!idempotencyKey.current) idempotencyKey.current = newIdempotencyKey()

  async function invalidateAfterTransfer() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] }),
      queryClient.invalidateQueries({
        queryKey: ['treatments', { patientId }],
      }),
      queryClient.invalidateQueries({ queryKey: ['treatments'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['board'] }),
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'consolidated'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['patients', patientId, 'transfers'],
      }),
      queryClient.invalidateQueries({ queryKey: ['transfers'] }),
    ])
  }

  const transfer = useMutation({
    mutationFn: (confirmStockWarning: boolean) =>
      api<Transfer | TransferPending>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/transfers`,
        {
          method: 'POST',
          headers: { 'Idempotency-Key': idempotencyKey.current },
          body: JSON.stringify({
            to_branch_id: toBranchId,
            reason: reason.trim(),
            treatment_ids: selectedTreatmentIds,
            ...(confirmStockWarning ? { confirm_stock_warning: true } : {}),
          }),
        },
      ),
    onSuccess: async (result) => {
      if (isTransferPending(result)) {
        setWarnings(result.warnings)
        return
      }
      await invalidateAfterTransfer()
      onCompleted?.()
      onClose()
    },
    onSettled: () => {
      inFlight.current = false
    },
  })

  function toggleTreatment(id: string) {
    setSelectedTreatmentIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const destinationBranch = destinations.find(
    (branch) => branch.id === toBranchId,
  )
  const invalid = !toBranchId || !reason.trim()

  return (
    <Dialog
      title="Trasladar paciente"
      description={patientName}
      onClose={onClose}
      size="lg"
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (inFlight.current || invalid) return
          inFlight.current = true
          transfer.mutate(false)
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
            Sucursal destino
          </span>
          <select
            value={toBranchId}
            onChange={(event) => setToBranchId(event.target.value)}
            required
            className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
          >
            <option value="" disabled>
              Selecciona una sucursal
            </option>
            {destinations.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          {destinations.length === 0 && (
            <p className="text-xs text-red-700">
              No hay otra sucursal activa disponible para trasladar a este
              paciente.
            </p>
          )}
        </label>
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
            Motivo del traslado
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            rows={3}
            maxLength={2000}
            placeholder="Explica por qué se traslada al paciente"
            className="border-border focus:border-tealmax rounded-lg border bg-white px-3 py-2 text-sm outline-none"
          />
        </label>
        <div className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Tratamientos a trasladar
          </span>
          {activeTreatments.length === 0 ? (
            <p className="text-muted text-sm">
              Este paciente no tiene tratamientos activos; el traslado solo
              moverá su ficha.
            </p>
          ) : (
            <ul className="border-border grid gap-2 rounded-lg border p-3">
              {activeTreatments.map((treatment) => (
                <li key={treatment.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTreatmentIds.includes(treatment.id)}
                      onChange={() => toggleTreatment(treatment.id)}
                    />
                    {medicationName(medications.get(treatment.medicationId))}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-surface border-border rounded-lg border px-3 py-2 text-sm">
          <p className="text-ink font-medium">Resumen</p>
          <p className="text-muted mt-1">
            {destinationBranch
              ? `${patientName} se trasladará a ${destinationBranch.name} con ${selectedTreatmentIds.length} tratamiento(s).`
              : 'Selecciona una sucursal destino para ver el resumen.'}
          </p>
        </div>
        {warnings && warnings.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="flex items-center gap-2 font-medium">
              <TriangleAlert className="size-4 shrink-0" />
              Hay advertencias antes de completar el traslado
            </p>
            <ul className="ml-6 list-disc">
              {warnings.map((warning, index) => (
                <li key={index}>
                  {transferWarningLabel(warning.code)}
                  {warning.medication_name ? ` · ${warning.medication_name}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {transfer.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos completar el traslado. {transfer.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          {warnings && warnings.length > 0 ? (
            <Button
              type="button"
              variant="primary"
              disabled={transfer.isPending}
              onClick={() => {
                if (inFlight.current) return
                inFlight.current = true
                transfer.mutate(true)
              }}
            >
              <ArrowRightLeft className="size-4" />
              {transfer.isPending
                ? 'Confirmando…'
                : 'Confirmar traslado de todas formas'}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={transfer.isPending || invalid}
            >
              <ArrowRightLeft className="size-4" />
              {transfer.isPending ? 'Trasladando…' : 'Trasladar paciente'}
            </Button>
          )}
        </FormActions>
      </form>
    </Dialog>
  )
}
