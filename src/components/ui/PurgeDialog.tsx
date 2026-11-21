import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/** Confirmación para borrar un registro definitivamente de la base de datos. */
export function PurgeDialog({
  name,
  confirming,
  error,
  onConfirm,
  onClose,
}: {
  name: string
  confirming?: boolean
  error?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <ConfirmDialog
      title="Eliminar Definitivamente"
      description={
        <div className="grid gap-2">
          <p>
            ¿Está seguro de que desea eliminar <strong>{name}</strong> de la
            base de datos? Esta acción es permanente y no se podrá deshacer.
          </p>
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
        </div>
      }
      confirmLabel="Eliminar"
      confirmPrimary
      confirming={confirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
