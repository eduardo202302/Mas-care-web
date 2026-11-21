import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCan } from '@/lib/permissions'
import type { components } from '@/lib/api-types'
import { DoctorQuickCreateDialog } from './DoctorQuickCreateDialog'

/**
 * Único punto de entrada para "Crear Médico" desde otros formularios: el "+"
 * (solo con permiso `doctors:write`), el diálogo de alta y la invalidación de
 * la lista. Cualquier cambio aquí se refleja en todos los formularios.
 */
export function NewDoctorButton({
  onCreated,
}: {
  onCreated: (doctor: components['schemas']['Doctor']) => void
}) {
  const canWriteDoctors = useCan('doctors:write')
  const [open, setOpen] = useState(false)
  if (!canWriteDoctors) return null
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="size-6 px-0"
        aria-label="Crear médico"
        title="Crear médico"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
      </Button>
      {open && (
        // El diálogo cuelga del formulario que lo abre en el árbol de React: su submit no debe subir a él.
        <div onSubmit={(event) => event.stopPropagation()}>
          <DoctorQuickCreateDialog
            onCreated={onCreated}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </>
  )
}
