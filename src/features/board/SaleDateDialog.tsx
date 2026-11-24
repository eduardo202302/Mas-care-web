import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'

const fieldClass =
  'border-border focus:border-tealmax h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm outline-none'

/** Pide la fecha de venta (cuándo debería entregarse) al crear una reposición; el campo siempre arranca vacío. */
export function SaleDateDialog({
  description,
  submitLabel,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  description: string
  submitLabel: string
  pending: boolean
  error?: string
  onConfirm: (date: string) => void
  onClose: () => void
}) {
  const [date, setDate] = useState('')
  const [showError, setShowError] = useState(false)

  return (
    <Dialog
      title="Fecha de Venta"
      description={description}
      icon={<CalendarClock className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={() => {
        if (!pending) onClose()
      }}
    >
      <form
        noValidate
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (pending) return
          if (!date) {
            setShowError(true)
            return
          }
          onConfirm(date)
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
            Fecha de venta
          </span>
          <input
            type="date"
            autoFocus
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-invalid={showError && !date}
            className={fieldClass}
          />
          {showError && !date ? (
            <p className="text-xs text-red-700">Campo requerido.</p>
          ) : (
            <p className="text-muted text-xs">
              Cuándo debería entregarse esta reposición.
            </p>
          )}
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <FormActions>
          <Button type="button" disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={pending}
            className="hover:bg-emerald-700"
          >
            {pending ? 'Registrando…' : submitLabel}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
