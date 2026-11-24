import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pill } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import type { components } from '@/lib/api-types'
import { MedicationForm } from './MedicationForm'
import {
  attachmentsFailedMessage,
  createMedicationFromForm,
} from './createMedication'

/**
 * Alta de un medicamento desde otro formulario (p. ej. Crear Tratamiento).
 * Reutiliza `MedicationForm` y avisa con el medicamento creado para dejarlo
 * seleccionado.
 */
export function MedicationQuickCreateDialog({
  onCreated,
  onClose,
}: {
  onCreated: (medication: components['schemas']['Medication']) => void
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: async (args: Parameters<typeof createMedicationFromForm>) => {
      const result = await createMedicationFromForm(...args)
      await queryClient.invalidateQueries({ queryKey: ['medications'] })
      // El medicamento ya existe: se deja elegido aunque algún adjunto falle.
      onCreated(result.medication)
      if (result.failed.length)
        throw new Error(attachmentsFailedMessage(result.failed))
      return result.medication
    },
  })
  return (
    <Dialog
      title="Crear Medicamento"
      description="Registra los datos de presentación del producto."
      icon={<Pill className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      panelClassName="max-w-2xl"
      onClose={onClose}
    >
      <MedicationForm
        onSave={(values, staged) =>
          create.mutateAsync([values, staged]).then(() => {
            onClose()
          })
        }
        onCancel={onClose}
        submitting={create.isPending}
      />
    </Dialog>
  )
}
