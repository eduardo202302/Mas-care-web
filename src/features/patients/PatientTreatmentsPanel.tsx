import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pill } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { newIdempotencyKey } from '@/lib/operations'
import { useCan } from '@/lib/permissions'
import { useOriginState } from '@/lib/navigation-origin'
import type { paths } from '@/lib/api-types'
import { TreatmentForm } from '@/features/treatments/TreatmentForm'
import type { TreatmentSaveValues } from '@/schemas/treatment'
import {
  createTreatmentFromForm,
  medicationName,
  treatmentPauta,
  treatmentStatusLabel,
  type Medication,
} from '@/lib/treatments'
import { RelationList, RelationRow } from './RelationParts'
import { useMedicationList } from './relationQueries'

type TreatmentListResponse =
  paths['/api/v1/treatments']['get']['responses'][200]['content']['application/json']
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

/** Contenido de una fila de tratamiento (compartido por el panel real y el de alta). */
export function TreatmentRowContent({
  name,
  medication,
  pauta,
  statusLabel,
  linkTo,
}: {
  name: string | null | undefined
  medication: string
  pauta: string
  statusLabel: string
  linkTo?: string
}) {
  const originState = useOriginState()
  const title = name || medication
  return (
    <>
      <p className="text-ink text-sm font-semibold">
        {linkTo ? (
          <Link
            to={linkTo}
            state={originState}
            className="hover:text-tealmax hover:underline"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
      <p className="text-muted mt-0.5 text-xs">
        {name ? `${medication} · ` : ''}
        {pauta} · {statusLabel}
      </p>
    </>
  )
}

/**
 * Diálogo "Medicamentos del Tratamiento": permite agregar varios
 * medicamentos seguidos. No conoce al paciente: cada guardado se delega en
 * `onSave` (el panel real lo envía al servidor; el de alta lo guarda en
 * memoria). Se monta solo mientras está abierto.
 */
export function AddTreatmentDialog({
  patientName,
  defaultBranchId,
  defaultResponsibleUserId,
  submitting = false,
  onSave,
  onClose,
}: {
  patientName?: string
  defaultBranchId?: string
  defaultResponsibleUserId?: string | null
  submitting?: boolean
  onSave: (values: TreatmentSaveValues) => Promise<void>
  onClose: () => void
}) {
  const medications = useMedicationList()
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  // Médicos activos: el prescriptor del tratamiento es un médico registrado.
  const canReadDoctors = useCan('doctors:read')
  const doctors = useQuery({
    queryKey: ['doctors', 'picker'],
    queryFn: () =>
      api<DoctorPickerList>('/api/v1/doctors?isActive=true&rows=100'),
    enabled: canReadDoctors,
  })
  const [addedInSession, setAddedInSession] = useState<
    { medicationId: string; name: string }[]
  >([])
  const [formKey, setFormKey] = useState(0)

  async function save(values: TreatmentSaveValues) {
    await onSave(values)
    const medication = (medications.data?.data ?? []).find(
      (item) => item.id === values.medicationId,
    )
    setAddedInSession((current) => [
      ...current,
      { medicationId: values.medicationId, name: medicationName(medication) },
    ])
    setFormKey((key) => key + 1)
  }

  return (
    <Dialog
      title="Medicamentos Del Tratamiento"
      description="Agrega uno o varios medicamentos de esta indicación; cada uno queda guardado al instante y puedes seguir agregando."
      icon={<Pill className="size-5" />}
      compactHeader
      printable
      bodyClassName="pt-0"
      size="lg"
      onClose={onClose}
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
              onClick={onClose}
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
          doctors={doctors.data?.data ?? []}
          doctorsLoading={doctors.isLoading}
          defaultBranchId={defaultBranchId}
          defaultResponsibleUserId={defaultResponsibleUserId}
          onSave={save}
          onCancel={onClose}
          submitting={submitting}
        />
      </div>
    </Dialog>
  )
}

/** Lista de tratamientos de un paciente ya guardado. */
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
  const medications = useMedicationList()

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

  // Varios medicamentos agregados en una misma sesión ("Crear Tratamiento")
  // comparten este id para poder mostrarse agrupados después, sin cambiar la
  // relación 1 tratamiento : 1 medicamento del backend. Se renueva cada vez
  // que se abre el diálogo.
  const [groupId, setGroupId] = useState(() => newIdempotencyKey())

  useEffect(() => {
    if (addOpen) setGroupId(newIdempotencyKey())
  }, [addOpen])

  const add = useMutation({
    mutationFn: (values: TreatmentSaveValues) =>
      createTreatmentFromForm(patientId, values, groupId),
    onSuccess: invalidate,
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
        <RelationList>
          {items.map((treatment) => {
            const medication = medicationById.get(treatment.medicationId)
            return (
              <RelationRow key={treatment.id}>
                <TreatmentRowContent
                  name={treatment.name}
                  medication={medicationName(medication)}
                  pauta={treatmentPauta(treatment, medication)}
                  statusLabel={treatmentStatusLabel(treatment.status)}
                  linkTo={`/pacientes/${encodeURIComponent(treatment.patientId)}/tratamientos/${encodeURIComponent(treatment.id)}`}
                />
              </RelationRow>
            )
          })}
        </RelationList>
      ) : (
        <p className="text-muted text-sm">Sin tratamientos registrados.</p>
      )}
      {addOpen && canWrite && (
        <AddTreatmentDialog
          patientName={patientName}
          defaultBranchId={defaultBranchId}
          defaultResponsibleUserId={defaultResponsibleUserId}
          submitting={add.isPending}
          onSave={(values) => add.mutateAsync(values).then(() => undefined)}
          onClose={onCloseAdd}
        />
      )}
    </>
  )
}
