import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pill } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { SaleDateDialog } from '@/features/board/SaleDateDialog'
import { PatientQuickCreateDialog } from '@/features/patients/PatientQuickCreateDialog'
import { useActiveBranch } from '@/lib/active-branch'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { createTreatmentFromForm, type Treatment } from '@/lib/treatments'
import type { paths } from '@/lib/api-types'
import type { TreatmentSaveValues } from '@/schemas/treatment'
import { PatientPicker, type PickerPatient } from './PatientPicker'
import { TreatmentForm } from './TreatmentForm'

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

export function CreateTreatmentDialog({
  initialPatient = null,
  withCycle = true,
  onCreated,
  onClose,
}: {
  /** Paciente ya elegido al abrir el diálogo; se puede cambiar. */
  initialPatient?: PickerPatient | null
  /** Con `false` solo se crea el tratamiento: sin fecha de venta ni reposición (se registra aparte). */
  withCycle?: boolean
  onCreated?: (treatment: Treatment, values: TreatmentSaveValues) => void
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { branchId } = useActiveBranch()
  const canCreatePatient = useCan('patients:write')
  const canReadDoctors = useCan('doctors:read')
  const [patient, setPatient] = useState<PickerPatient | null>(initialPatient)
  const [patientFormOpen, setPatientFormOpen] = useState(false)
  // Al guardar el formulario se pide la fecha de venta; el tratamiento se crea al confirmarla.
  const [pendingValues, setPendingValues] =
    useState<TreatmentSaveValues | null>(null)

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

  const medicationLabel = (id: string) => {
    const medication = medications.data?.data.find((item) => item.id === id)
    return (
      medication?.brandName ||
      medication?.genericName ||
      medication?.activeIngredient ||
      'Medicamento'
    )
  }

  const create = useMutation({
    mutationFn: ({
      values,
      expectedOn,
    }: {
      values: TreatmentSaveValues
      expectedOn?: string
    }) => {
      if (!patient) throw new Error('Selecciona un paciente.')
      return createTreatmentFromForm(
        patient.id,
        values,
        undefined,
        expectedOn,
        withCycle,
      )
    },
    onSuccess: async (treatment, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['treatments'] }),
        queryClient.invalidateQueries({ queryKey: ['eligible-treatments'] }),
        queryClient.invalidateQueries({ queryKey: ['board'] }),
        queryClient.invalidateQueries({ queryKey: ['cycles'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
      onCreated?.(treatment, variables.values)
      onClose()
    },
  })

  const picker = (
    <PatientPicker
      value={patient}
      onChange={setPatient}
      branchId={branchId}
      onCreate={canCreatePatient ? () => setPatientFormOpen(true) : undefined}
    />
  )

  return (
    <Dialog
      title="Crear Tratamiento"
      description="Elige al paciente y registra los datos del medicamento."
      icon={<Pill className="size-5" />}
      compactHeader
      printable
      bodyClassName="pt-0"
      size="2xl"
      onClose={onClose}
    >
      <div className="grid gap-5">
        {!patient && (
          // Mismo ancho que una columna del alta completa (2 columnas con gap-5).
          <div className="lg:w-[calc((100%-1.25rem)/2)]">{picker}</div>
        )}
        {patient ? (
          <TreatmentForm
            key={patient.id}
            columns
            leadingBlock={picker}
            patientName={patient.fullName}
            medications={medications.data?.data ?? []}
            branches={branches.data?.data ?? []}
            doctors={doctors.data?.data ?? []}
            doctorsLoading={doctors.isLoading}
            defaultBranchId={patient.primaryBranchId}
            defaultResponsibleUserId={patient.responsibleUserId}
            onSave={(values) => {
              create.reset()
              if (withCycle) setPendingValues(values)
              else create.mutate({ values })
              return Promise.resolve()
            }}
            onCancel={onClose}
            submitting={create.isPending}
          />
        ) : (
          <p className="text-muted text-sm">
            Selecciona un paciente para completar el tratamiento.
          </p>
        )}
        {!withCycle && create.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos crear el tratamiento. {create.error.message}
          </p>
        )}
      </div>
      {pendingValues && patient && (
        <SaleDateDialog
          description={`${patient.fullName} · ${medicationLabel(pendingValues.medicationId)}`}
          submitLabel="Crear Tratamiento"
          pending={create.isPending}
          error={
            create.isError
              ? `No pudimos crear el tratamiento. ${create.error.message}`
              : undefined
          }
          onConfirm={(expectedOn) =>
            create.mutate({ values: pendingValues, expectedOn })
          }
          onClose={() => setPendingValues(null)}
        />
      )}
      {patientFormOpen && canCreatePatient && (
        <PatientQuickCreateDialog
          branches={branches.data?.data ?? []}
          onCreated={(created) => setPatient(created as PickerPatient)}
          onClose={() => setPatientFormOpen(false)}
        />
      )}
    </Dialog>
  )
}
