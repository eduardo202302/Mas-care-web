import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CircleAlert } from 'lucide-react'

export function ConfirmDialog({
  title = 'Confirmar',
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Atrás',
  confirming = false,
  onConfirm,
  onClose,
}: {
  title?: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirming?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const titleId = useId()
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="bg-petroleo flex items-center gap-2 px-5 py-3.5">
          <CircleAlert className="size-5 text-white" />
          <h2
            id={titleId}
            className="font-display text-base font-bold text-white"
          >
            {title}
          </h2>
        </header>
        <div className="text-ink px-5 py-5 text-sm">{description}</div>
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-full border border-red-300 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className="border-border text-ink hover:bg-surface h-9 rounded-full border px-5 text-sm font-semibold transition disabled:opacity-50"
          >
            {confirming ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
