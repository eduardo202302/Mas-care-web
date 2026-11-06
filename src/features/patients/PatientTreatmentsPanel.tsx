import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pill } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { newIdempotencyKey } from '@/lib/operations'
import { useCan } from '@/lib/permissions'
import type { paths } from '@/lib/api-types'
import { TreatmentForm } from '@/features/treatments/TreatmentForm'
import type { TreatmentSaveValues } from '@/schemas/treatment'
import {
  createTreatmentFromForm,
  medicationName,
  treatmentLabel,
  treatmentPauta,
  treatmentStatusLabel,
  type Medication,
} from '@/lib/treatments'

type TreatmentListResponse =
  paths['/api/v1/treatments']['get']['responses'][200]['content']['application/json']
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
  }[]
}
type UserList =
  paths['/api/v1/users']['get']['responses'][200]['content']['application/json']

export function PatientTreatmentsPanel({
  patientId,
  patientName,
  defaultBranchId,
  defaultResponsibleUserId,
  addOpen,
  onCloseAdd,
}: {
  patientId: string
  patientName?: string
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
  // Médicos activos: el prescriptor del tratamiento es un médico registrado.
  const canReadDoctors = useCan('doctors:read')
  const doctors = useQuery({
    queryKey: ['doctors', 'picker'],
    queryFn: () =>
      api<DoctorPickerList>('/api/v1/doctors?isActive=true&rows=100'),
    enabled: canReadDoctors,
  })

  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ['treatments', { patientId }],
    })
  }

  const items = treatments.data?.data ?? []
  const medicationById = new Map<string, Medication>(
    (medications.data?.data ?? []).map((medication) => [
      medication.id,
      medication,
    ]),
  )

  // Varios medicamentos agregados en una misma sesión ("Nuevo Tratamiento")
  // comparten este id para poder mostrarse agrupados después, sin cambiar la
  // relación 1 tratamiento : 1 medicamento del backend. Se renueva cada vez
  // que se abre el diálogo.
  const [groupId, setGroupId] = useState(() => newIdempotencyKey())
  const [addedInSession, setAddedInSession] = useState<
    { medicationId: string; name: string }[]
  >([])
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (addOpen) {
      setGroupId(newIdempotencyKey())
      setAddedInSession([])
      setFormKey((key) => key + 1)
    }
  }, [addOpen])

  const add = useMutation({
    mutationFn: (values: TreatmentSaveValues) =>
      createTreatmentFromForm(patientId, values, groupId),
    onSuccess: async (_treatment, values) => {
      await invalidate()
      setAddedInSession((current) => [
        ...current,
        {
          medicationId: values.medicationId,
          name: medicationName(medicationById.get(values.medicationId)),
        },
      ])
      setFormKey((key) => key + 1)
    },
  })

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
          title="Medicamentos del Tratamiento"
          description="Agrega uno o varios medicamentos de esta indicación; cada uno queda guardado al instante y puedes seguir agregando."
          icon={<Pill className="size-5" />}
          compactHeader
          printable
          bodyClassName="pt-3"
          size="lg"
          onClose={onCloseAdd}
        >
          <div className="grid gap-4">
            {addedInSession.length > 0 && (
              <div className="border-border rounded-lg border bg-emerald-50 p-3">
                <p className="text-ink mb-1.5 text-xs font-semibold tracking-wide uppercase">
                  Agregados en esta indicación
                </p>
                <ul className="grid gap-1">
                  {addedInSession.map((item, index) => (
                    <li
                      key={`${item.medicationId}-${index}`}
                      className="text-ink flex items-center gap-1.5 text-sm"
                    >
                      <Check className="text-tealmax size-3.5" />
                      {item.name}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 h-8 px-2 text-xs"
                  onClick={onCloseAdd}
                >
                  Terminar
                </Button>
              </div>
            )}
            <TreatmentForm
              key={formKey}
              patientName={patientName}
              medications={medications.data?.data ?? []}
              branches={branches.data?.data ?? []}
              users={users.data?.data ?? []}
              doctors={doctors.data?.data ?? []}
              doctorsLoading={doctors.isLoading}
              defaultBranchId={defaultBranchId}
              defaultResponsibleUserId={defaultResponsibleUserId}
              onSave={(values) => add.mutateAsync(values).then(() => undefined)}
              onCancel={onCloseAdd}
              submitting={add.isPending}
            />
          </div>
        </Dialog>
      )}
    </>
  )
}
