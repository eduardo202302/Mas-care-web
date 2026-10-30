import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { cn } from '@/lib/cn'

/**
 * Wraps the fields of a form. In read-only mode every native control inside is
 * disabled and shown muted, so the edit form doubles as a record viewer without
 * duplicating a separate read-only layout.
 */
export function FormFields({
  readOnly,
  children,
}: {
  readOnly?: boolean
  children: ReactNode
}) {
  return (
    <fieldset
      disabled={readOnly}
      className={cn(
        'm-0 grid min-w-0 gap-5 border-0 p-0',
        readOnly &&
          '[&_input]:bg-surface [&_input]:text-muted [&_select]:bg-surface [&_select]:text-muted [&_textarea]:bg-surface [&_textarea]:text-muted [&_input]:cursor-not-allowed [&_select]:cursor-not-allowed [&_textarea]:cursor-not-allowed',
      )}
    >
      {children}
    </fieldset>
  )
}

/**
 * Action bar for a form that can be displayed read-only: the primary "Guardar"
 * button becomes "Editar" and unlocks the fields.
 */
export function FormFooter({
  readOnly,
  onEdit,
  onClose,
  submitting = false,
  submitLabel,
  savingLabel = 'Guardando…',
  closeLabel = 'Cancelar',
  readOnlyCloseLabel = 'Cerrar',
  compact = false,
}: {
  readOnly?: boolean
  onEdit?: () => void
  onClose: () => void
  submitting?: boolean
  submitLabel: string
  savingLabel?: string
  closeLabel?: string
  readOnlyCloseLabel?: string
  compact?: boolean
}) {
  if (readOnly) {
    return (
      <FormActions className={compact ? 'py-2.5' : undefined}>
        <Button
          type="button"
          className={compact ? 'h-9 w-full sm:w-auto' : 'w-full sm:w-auto'}
          onClick={onClose}
        >
          {readOnlyCloseLabel}
        </Button>
        {onEdit && (
          <Button
            type="button"
            variant="primary"
            className={compact ? 'h-9 w-full sm:w-auto' : 'w-full sm:w-auto'}
            onClick={onEdit}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
        )}
      </FormActions>
    )
  }
  return (
    <FormActions className={compact ? 'py-2.5' : undefined}>
      <Button
        type="button"
        className={compact ? 'h-9 w-full sm:w-auto' : 'w-full sm:w-auto'}
        onClick={onClose}
      >
        {closeLabel}
      </Button>
      <Button
        type="submit"
        variant="primary"
        className={compact ? 'h-9 w-full sm:w-auto' : 'w-full sm:w-auto'}
        disabled={submitting}
      >
        {submitting ? savingLabel : submitLabel}
      </Button>
    </FormActions>
  )
}
