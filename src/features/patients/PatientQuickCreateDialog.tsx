import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserRound } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import type { components } from '@/lib/api-types'
import { useAccessibleBranches } from '@/lib/permissions'
import { createPatientFromForm } from './createPatient'
import { PatientForm } from './PatientForm'

/**
 * Alta de un paciente desde otro formulario (Crear Tratamiento). Reutiliza
 * `PatientForm` + `createPatientFromForm` y avisa con el paciente creado para
 * dejarlo seleccionado.
 */
export function PatientQuickCreateDialog({
  branches,
  onCreated,
  onClose,
}: {
  branches: Pick<components['schemas']['Branch'], 'id' | 'name'>[]
  onCreated: (patient: components['schemas']['Patient']) => void
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const accessibleBranches = useAccessibleBranches(branches)
  const create = useMutation({
    mutationFn: createPatientFromForm,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      onCreated(result.patient)
      onClose()
    },
  })
  return (
    <Dialog
      title="Crear Paciente"
      description="Registra sus datos de contacto y atención."
      icon={<UserRound className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      size="lg"
      onClose={onClose}
    >
      <PatientForm
        branches={accessibleBranches}
        onSave={(values) =>
          create.mutateAsync(values).then((result) => result.patient.id)
        }
        onCancel={onClose}
        submitting={create.isPending}
      />
    </Dialog>
  )
}
