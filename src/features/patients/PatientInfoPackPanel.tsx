import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { formatPhone } from '@/lib/phone'
import {
  formatDate,
  medicationName,
  treatmentStatusLabel,
  type Medication,
  type Treatment,
} from '@/lib/treatments'
import type { components } from '@/lib/api-types'
import { conditionStatusLabels } from './PatientConditionsPanel'

type DoctorLink = components['schemas']['PatientDoctorLink'] & {
  doctor: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    licenseNumber: string | null
  }
}
type ConditionLink = components['schemas']['PatientConditionLink'] & {
  condition: { id: string; name: string }
}

export function PatientInfoPackPanel({
  patientId,
  treatments,
  medicationsById,
}: {
  patientId: string
  treatments: Treatment[]
  medicationsById: Map<string, Medication>
}) {
  const canReadDoctors = useCan('doctors:read')
  const doctors = useQuery({
    queryKey: ['patients', patientId, 'doctors'],
    queryFn: () =>
      api<{ data: DoctorLink[] }>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors`,
      ),
    enabled: Boolean(patientId),
  })
  const conditions = useQuery({
    queryKey: ['patients', patientId, 'conditions'],
    queryFn: () =>
      api<{ data: ConditionLink[] }>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/conditions`,
      ),
    enabled: Boolean(patientId),
  })

  const doctorLinks = doctors.data?.data ?? []
  const primaryDoctor =
    doctorLinks.find((link) => link.isPrimary) ?? doctorLinks[0]
  const activeConditions = conditions.data?.data ?? []
  const lastTreatment = treatments[0]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <section className="border-border rounded-xl border p-4">
        <h3 className="text-petroleo mb-3 text-sm font-semibold">
          Médico principal
        </h3>
        {doctors.isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : primaryDoctor ? (
          <>
            {canReadDoctors ? (
              <Link
                to={`/medicos/${encodeURIComponent(primaryDoctor.doctorId)}`}
                className="text-ink hover:text-tealmax text-sm font-semibold hover:underline"
              >
                {primaryDoctor.doctor.lastName}, {primaryDoctor.doctor.firstName}
              </Link>
            ) : (
              <p className="text-ink text-sm font-semibold">
                {primaryDoctor.doctor.lastName}, {primaryDoctor.doctor.firstName}
              </p>
            )}
            <p className="text-muted mt-1 text-xs">
              {primaryDoctor.doctor.licenseNumber || 'Sin colegiatura'} ·{' '}
              {primaryDoctor.doctor.phone
                ? formatPhone(primaryDoctor.doctor.phone)
                : 'Sin teléfono'}
            </p>
          </>
        ) : (
          <p className="text-muted text-sm">Sin médico asociado.</p>
        )}
      </section>
      <section className="border-border rounded-xl border p-4">
        <h3 className="text-petroleo mb-3 text-sm font-semibold">
          Condiciones de salud
        </h3>
        {conditions.isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : activeConditions.length ? (
          <ul className="grid gap-2">
            {activeConditions.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-ink">{link.condition.name}</span>
                <span className="text-muted text-xs">
                  {conditionStatusLabels[link.status]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted text-sm">Sin condiciones registradas.</p>
        )}
      </section>
      <section className="border-border rounded-xl border p-4">
        <h3 className="text-petroleo mb-3 text-sm font-semibold">
          Último tratamiento
        </h3>
        {lastTreatment ? (
          <>
            <p className="text-ink text-sm font-semibold">
              {medicationName(medicationsById.get(lastTreatment.medicationId))}
            </p>
            <p className="text-muted mt-1 text-xs">
              {treatmentStatusLabel(lastTreatment.status)} · Inicio{' '}
              {formatDate(lastTreatment.startDate)}
            </p>
          </>
        ) : (
          <p className="text-muted text-sm">Sin tratamientos registrados.</p>
        )}
      </section>
    </div>
  )
}
