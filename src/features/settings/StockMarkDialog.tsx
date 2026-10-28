import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PackageSearch } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { useToast } from '@/components/ui/Toast'
import { setStockMark } from '@/features/board/board-api'
import { stockLevelLabels, type StockLevel } from '@/lib/board'

const options: { value: StockLevel; hint: string }[] = [
  { value: 'in_stock', hint: 'Hay unidades suficientes para preparar.' },
  { value: 'low', hint: 'Quedan pocas unidades; conviene reponer.' },
  { value: 'out_of_stock', hint: 'No hay unidades disponibles ahora.' },
]

export function StockMarkDialog({
  branchId,
  branchName,
  medicationId,
  medicationName,
  initialLevel,
  onClose,
  onSaved,
}: {
  branchId: string
  branchName: string
  medicationId: string
  medicationName: string
  initialLevel?: StockLevel | null
  onClose: () => void
  onSaved?: (level: StockLevel) => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [level, setLevel] = useState<StockLevel>(
    initialLevel ?? 'in_stock',
  )

  const save = useMutation({
    mutationFn: () => setStockMark(branchId, medicationId, level),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock-marks'] }),
        queryClient.invalidateQueries({ queryKey: ['board'] }),
      ])
      toast.push('Existencias actualizadas.', 'success')
      onSaved?.(level)
      onClose()
    },
    onError: (error) => {
      toast.push(error.message, 'error')
    },
  })

  return (
    <Dialog
      title="Actualizar existencias"
      description={`${medicationName} · ${branchName}`}
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate()
        }}
      >
        <fieldset className="grid gap-2">
          <legend className="text-ink text-sm font-semibold">
            ¿Hay existencias en esta sucursal?
          </legend>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                level === option.value
                  ? 'border-tealmax bg-teal-50/60'
                  : 'border-border bg-white hover:border-tealmax/40'
              }`}
            >
              <input
                type="radio"
                name="stock-level"
                value={option.value}
                checked={level === option.value}
                onChange={() => setLevel(option.value)}
                className="mt-1 accent-teal-700"
              />
              <span>
                <span className="text-ink block text-sm font-semibold">
                  {stockLevelLabels[option.value]}
                </span>
                <span className="text-muted mt-0.5 block text-xs">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
        {save.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos guardar la marca. {save.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={save.isPending}>
            <PackageSearch className="size-4" />
            {save.isPending ? 'Guardando…' : 'Guardar existencias'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
