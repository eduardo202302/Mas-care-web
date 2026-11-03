import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pill } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components, paths } from '@/lib/api-types'
import { TreatmentForm } from '@/features/treatments/TreatmentForm'
import type { TreatmentFormValues } from '@/schemas/treatment'
import {
  medicationName,
  treatmentLabel,
  treatmentPauta,
  treatmentStatusLabel,
  type Medication,
  type Treatment,
} from '@/lib/treatments'

type TreatmentListResponse =
  paths['/api/v1/treatments']['get']['responses'][200]['content']['application/json']
type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']

export function PatientTreatmentsPanel({
  patientId,
  defaultBranchId,
  defaultResponsibleUserId,
  addOpen,
  onCloseAdd,
}: {
  patientId: string
  defaultBranchId?: string
  defaultResponsibleUserId?: string | null
  /** El botón `+` del encabezado de la card controla este estado. */
  addOpen: boolean
  onCloseAdd: () => void
}) {
  const canWrite = useCan('patients:write')
  const queryClient = useQueryClient()

  const treatments = useQuery({
    queryKey: ['treatments', { patientId }],
    queryFn: () =>
      api<TreatmentListResponse>(
        `/api/v1/treatments?patient_id=${encodeURIComponent(patientId)}&limit=15`,
      ),
    enabled: Boolean(patientId),
  })
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', rows: 100 }],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&rows=100'),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const users = useQuery({
    queryKey: ['users', { rows: 100 }],
    queryFn: () => api<UserList>('/api/v1/users?rows=100'),
  })

  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ['treatments', { patientId }],
    })
  }
  const add = useMutation({
    mutationFn: (values: TreatmentFormValues) => {
      const body: components['schemas']['TreatmentCreate'] = {
        patient_id: patientId,
        medication_id: values.medicationId,
        branch_id: values.branchId,
        responsible_user_id: values.responsibleUserId || null,
        dose_per_intake: values.dosePerIntake,
        intakes_per_day: values.intakesPerDay,
        quantity_per_cycle: values.quantityPerCycle,
        start_date: values.startDate,
        prescriber_name: values.prescriberName?.trim() || null,
        prescription_expires_on: values.prescriptionExpiresOn || null,
        notes: values.notes?.trim() || null,
        custom_values: values.customValues,
      } as components['schemas']['TreatmentCreate']
      return api<Treatment>('/api/v1/treatments', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: async () => {
      await invalidate()
      onCloseAdd()
    },
  })

  const items = treatments.data?.data ?? []
  const medicationById = new Map<string, Medication>(
    (medications.data?.data ?? []).map((medication) => [
      medication.id,
      medication,
    ]),
  )

  return (
    <>
      {treatments.isLoading ? (
        <p className="text-muted text-sm">Cargando tratamientos…</p>
      ) : treatments.isError ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar los tratamientos del paciente.{' '}
          {treatments.error instanceof Error ? treatments.error.message : ''}
        </p>
      ) : items.length ? (
        <ul className="grid gap-3">
          {items.map((treatment) => (
            <li
              key={treatment.id}
              className="border-border flex items-start justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-ink text-sm font-semibold">
                  <Link
                    to={`/pacientes/${encodeURIComponent(treatment.patientId)}/tratamientos/${encodeURIComponent(treatment.id)}`}
                    className="hover:text-tealmax hover:underline"
                  >
                    {treatmentLabel(
                      treatment,
                      medicationById.get(treatment.medicationId),
                    )}
                  </Link>
                </p>
                <p className="text-muted mt-0.5 text-xs">
                  {treatment.name
                    ? `${medicationName(medicationById.get(treatment.medicationId))} · `
                    : ''}
                  {treatmentPauta(
                    treatment,
                    medicationById.get(treatment.medicationId),
                  )}{' '}
                  · {treatmentStatusLabel(treatment.status)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm">Sin tratamientos registrados.</p>
      )}
      {addOpen && canWrite && (
        <Dialog
          title="Nuevo Tratamiento"
          description="Registra un nuevo tratamiento para este paciente."
          icon={<Pill className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          size="lg"
          onClose={onCloseAdd}
        >
          <TreatmentForm
            medications={medications.data?.data ?? []}
            branches={branches.data?.data ?? []}
            users={users.data?.data ?? []}
            defaultBranchId={defaultBranchId}
            defaultResponsibleUserId={defaultResponsibleUserId}
            onSave={(values) => add.mutateAsync(values).then(() => undefined)}
            onCancel={onCloseAdd}
            submitting={add.isPending}
          />
        </Dialog>
      )}
    </>
  )
}
