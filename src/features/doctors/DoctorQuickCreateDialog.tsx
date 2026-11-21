import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Stethoscope } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import type { components } from '@/lib/api-types'
import { createDoctorFromForm } from '@/features/patients/createDoctor'
import { DoctorForm } from './DoctorForm'

/**
 * Alta de un médico desde otro formulario (Crear Tratamiento, Agregar Médico…).
 * Reutiliza `DoctorForm` + `createDoctorFromForm` y avisa con el médico creado
 * para dejarlo seleccionado.
 */
export function DoctorQuickCreateDialog({
  onCreated,
  onClose,
}: {
  onCreated: (doctor: components['schemas']['Doctor']) => void
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: createDoctorFromForm,
    onSuccess: async (doctor) => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      onCreated(doctor)
      onClose()
    },
  })
  return (
    <Dialog
      title="Crear Médico"
      icon={<Stethoscope className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      size="lg"
      onClose={onClose}
    >
      <DoctorForm
        onSave={(values) => create.mutateAsync(values).then(() => undefined)}
        onCancel={onClose}
        submitting={create.isPending}
      />
    </Dialog>
  )
}
