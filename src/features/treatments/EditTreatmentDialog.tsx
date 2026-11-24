import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pill } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  StatusDraftProvider,
  useStatusDraft,
} from '@/components/ui/StatusDraft'
import { editTitle } from '@/lib/editTitle'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import {
  medicationName,
  updateTreatmentFromForm,
  type Treatment,
} from '@/lib/treatments'
import type { paths } from '@/lib/api-types'
import type { TreatmentSaveValues } from '@/schemas/treatment'
import { TreatmentForm } from './TreatmentForm'
import {
  invalidateTreatmentQueries,
  setTreatmentActive,
} from './treatmentMutations'

type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type DoctorPickerList = {
  data: {
    id: string
    firstName: string
    lastName: string
    licenseNumber?: string | null
    specialties?: { specialty: { name: string } }[]
  }[]
}

export function EditTreatmentDialog({
  treatmentId,
  patientName,
  onSaved,
  onClose,
}: {
  treatmentId: string
  patientName?: string
  onSaved?: () => void
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const canManage = useCan('treatments:manage')
  const canReadDoctors = useCan('doctors:read')

  const editing = useQuery({
    queryKey: ['treatments', treatmentId],
    queryFn: () =>
      api<Treatment>(`/api/v1/treatments/${encodeURIComponent(treatmentId)}`),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', rows: 100 }],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&rows=100'),
  })
  const doctors = useQuery({
    queryKey: ['doctors', 'picker'],
    queryFn: () =>
      api<DoctorPickerList>('/api/v1/doctors?isActive=true&rows=100'),
    enabled: canReadDoctors,
  })
  const patient = useQuery({
    queryKey: ['patients', editing.data?.patientId],
    queryFn: () =>
      api<{ fullName: string }>(
        `/api/v1/patients/${encodeURIComponent(editing.data!.patientId)}`,
      ),
    enabled: !patientName && Boolean(editing.data?.patientId),
  })

  // Inactivo = pausado; el interruptor se aplica recién al guardar.
  const statusDraft = useStatusDraft(editing.data?.status === 'active')
  const update = useMutation({
    mutationFn: async (values: TreatmentSaveValues) => {
      await updateTreatmentFromForm(treatmentId, values)
      if (statusDraft.changed)
        await setTreatmentActive(treatmentId, statusDraft.value)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['treatments'] }),
        queryClient.invalidateQueries({ queryKey: ['eligible-treatments'] }),
        queryClient.invalidateQueries({ queryKey: ['board'] }),
        queryClient.invalidateQueries({ queryKey: ['cycles'] }),
        statusDraft.changed
          ? invalidateTreatmentQueries(queryClient)
          : undefined,
      ])
      onSaved?.()
      onClose()
    },
  })

  const medication = medications.data?.data.find(
    (item) => item.id === editing.data?.medicationId,
  )

  return (
    <StatusDraftProvider changed={statusDraft.changed}>
      <Dialog
        title={editTitle(
          'Tratamiento',
          editing.data?.name || (medication ? medicationName(medication) : ''),
        )}
        description="Define la pauta, la cobertura y los datos de la receta."
        icon={<Pill className="size-5" />}
        compactHeader
        printable
        bodyClassName="pt-0"
        size="lg"
        onClose={onClose}
        headerAction={
          editing.data && canManage ? (
            <StatusToggle
              active={statusDraft.value}
              disabled={editing.data.status === 'finished'}
              pending={update.isPending}
              onChange={statusDraft.set}
            />
          ) : undefined
        }
      >
        {editing.data ? (
          <TreatmentForm
            key={editing.data.id}
            treatment={editing.data}
            patientName={patientName ?? patient.data?.fullName}
            medications={medications.data?.data ?? []}
            branches={branches.data?.data ?? []}
            doctors={doctors.data?.data ?? []}
            doctorsLoading={doctors.isLoading}
            onSave={(values) =>
              update.mutateAsync(values).then(() => undefined)
            }
            onCancel={onClose}
            submitting={update.isPending}
          />
        ) : editing.isError ? (
          <p role="alert" className="text-sm text-red-700">
            No pudimos cargar el tratamiento. {editing.error.message}
          </p>
        ) : (
          <p className="text-muted text-sm">Cargando tratamiento…</p>
        )}
      </Dialog>
    </StatusDraftProvider>
  )
}
