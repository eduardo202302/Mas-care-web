import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { HeartPulse, Pill, Stethoscope, UserRound } from 'lucide-react'
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
import { InfoCard } from '@/components/ui/InfoCard'
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

const conditionTone: Record<string, string> = {
  active: 'bg-amber-50 text-amber-700 border-amber-200',
  controlled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-slate-50 text-slate-600 border-slate-200',
}

const derivedTone: Record<string, string> = {
  al_dia: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  proxima_reposicion: 'bg-sky-50 text-sky-700 border-sky-200',
  vence_pronto: 'bg-amber-50 text-amber-700 border-amber-200',
  retiro_pendiente: 'bg-violet-50 text-violet-700 border-violet-200',
  vencido: 'bg-red-50 text-red-700 border-red-200',
}

const derivedLabels: Record<string, string> = {
  al_dia: 'Al día',
  proxima_reposicion: 'Próxima reposición',
  vence_pronto: 'Vence pronto',
  retiro_pendiente: 'Retiro pendiente',
  vencido: 'Vencido',
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted text-sm">{children}</p>
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-ink text-sm">{value}</dd>
    </div>
  )
}

export function PatientInfoPackPanel({
  patientId,
  patient,
  branchName,
  treatments,
  medicationsById,
}: {
  patientId: string
  /** Ficha del paciente, para el resumen de datos. */
  patient?: components['schemas']['Patient']
  branchName?: string
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
  const otherDoctors = doctorLinks.filter((link) => link !== primaryDoctor)
  const activeConditions = conditions.data?.data ?? []
  const activeTreatment =
    treatments.find((item) => item.status === 'active') ?? treatments[0]

  const age = patient?.birthDate
    ? Math.floor(
        (Date.now() - new Date(patient.birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InfoCard
        icon={<Stethoscope className="size-4" />}
        title="Médico principal"
        badge={
          doctorLinks.length > 1 ? `${doctorLinks.length} médicos` : undefined
        }
      >
        {doctors.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : primaryDoctor ? (
          <>
            <div className="flex items-start gap-3">
              <span className="bg-tealmax/10 text-petroleo grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold">
                {primaryDoctor.doctor.firstName.slice(0, 1)}
                {primaryDoctor.doctor.lastName.slice(0, 1)}
              </span>
              <div className="min-w-0">
                {canReadDoctors ? (
                  <Link
                    to={`/medicos/${encodeURIComponent(primaryDoctor.doctorId)}`}
                    className="text-ink hover:text-tealmax text-base font-semibold hover:underline"
                  >
                    {primaryDoctor.doctor.firstName}{' '}
                    {primaryDoctor.doctor.lastName}
                  </Link>
                ) : (
                  <p className="text-ink text-base font-semibold">
                    {primaryDoctor.doctor.firstName}{' '}
                    {primaryDoctor.doctor.lastName}
                  </p>
                )}
                <p className="text-muted mt-0.5 text-xs">
                  {primaryDoctor.doctor.licenseNumber || 'Sin colegiatura'}
                </p>
                <p className="text-ink mt-1 text-sm">
                  {primaryDoctor.doctor.phone
                    ? formatPhone(primaryDoctor.doctor.phone)
                    : 'Sin teléfono'}
                </p>
              </div>
            </div>
            {otherDoctors.length > 0 && (
              <div className="border-border border-t pt-2">
                <p className="text-muted mb-1 text-[11px] font-semibold tracking-wide uppercase">
                  También le atienden
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {otherDoctors.map((link) => (
                    <li
                      key={link.id}
                      className="border-border text-ink rounded-full border bg-white px-2.5 py-1 text-xs font-medium"
                    >
                      {link.doctor.firstName} {link.doctor.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <Empty>Sin médico asociado.</Empty>
        )}
      </InfoCard>

      <InfoCard
        icon={<HeartPulse className="size-4" />}
        title="Condiciones de salud"
        badge={
          activeConditions.length ? String(activeConditions.length) : undefined
        }
      >
        {conditions.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : activeConditions.length ? (
          <ul className="grid gap-2">
            {activeConditions.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-ink text-sm font-medium">
                  {link.condition.name}
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    conditionTone[link.status] ??
                    'border-border text-muted bg-white'
                  }`}
                >
                  {conditionStatusLabels[link.status]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Sin condiciones registradas.</Empty>
        )}
      </InfoCard>

      <InfoCard
        icon={<Pill className="size-4" />}
        title="Tratamiento en curso"
        className="lg:col-span-2"
      >
        {activeTreatment ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-ink text-base font-semibold">
                  {medicationName(
                    medicationsById.get(activeTreatment.medicationId),
                  )}
                </p>
                <p className="text-muted mt-0.5 text-xs">
                  {treatmentStatusLabel(activeTreatment.status)} · desde{' '}
                  {formatDate(activeTreatment.startDate)}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeTreatment.derived_status && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      derivedTone[activeTreatment.derived_status] ??
                      'border-border text-muted bg-white'
                    }`}
                  >
                    {derivedLabels[activeTreatment.derived_status]}
                  </span>
                )}
                {activeTreatment.prescription_flag && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Receta por renovar
                  </span>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Fact
                label="Dosis"
                value={`${activeTreatment.dosePerIntake} · ${activeTreatment.intakesPerDay}/día`}
              />
              <Fact
                label="Cobertura"
                value={
                  activeTreatment.coverageEndOn
                    ? formatDate(activeTreatment.coverageEndOn)
                    : 'Sin cobertura'
                }
              />
              <Fact
                label="Días restantes"
                value={
                  activeTreatment.days_remaining != null
                    ? String(activeTreatment.days_remaining)
                    : '—'
                }
              />
              <Fact
                label="Última entrega"
                value={
                  activeTreatment.lastDeliveryOn
                    ? formatDate(activeTreatment.lastDeliveryOn)
                    : 'Sin entregas'
                }
              />
            </dl>
          </>
        ) : (
          <Empty>Sin tratamientos registrados.</Empty>
        )}
      </InfoCard>

      {patient && (
        <InfoCard
          icon={<UserRound className="size-4" />}
          title="Datos del paciente"
          className="lg:col-span-2"
        >
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact
              label="Documento"
              value={patient.documentId || 'Sin registrar'}
            />
            <Fact
              label="Edad"
              value={age != null ? `${age} años` : 'Sin fecha'}
            />
            <Fact label="Sucursal" value={branchName || 'Sin asignar'} />
            <Fact
              label="Consentimiento"
              value={
                patient.reminderConsent ? 'Otorgado' : 'Sin consentimiento'
              }
            />
          </dl>
        </InfoCard>
      )}
    </div>
  )
}
