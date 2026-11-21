import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { PrintFrame, printDialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { PAGE_ROWS, pageQuery } from '@/lib/paging'
import { formatPhone } from '@/lib/phone'
import {
  activityDetail,
  activityTitleFor,
  formatTimestamp,
} from '@/lib/operations'
import { formatDate } from '@/lib/treatments'
import type { paths } from '@/lib/api-types'
import type { PatientTransferList } from '@/lib/transfers'
import { conditionStatusLabels } from './PatientConditionsPanel'

type ActivityList =
  paths['/api/v1/patients/{id}/activities']['get']['responses'][200]['content']['application/json']
type CaregiverList =
  paths['/api/v1/patients/{id}/caregivers']['get']['responses'][200]['content']['application/json']
type DoctorLink = {
  doctorId: string
  isPrimary: boolean
  notes?: string | null
  doctor: {
    firstName: string
    lastName: string
    phone: string | null
    licenseNumber: string | null
    specialties: { specialty: { name: string } }[]
    medicalCenters: { medicalCenter: { name: string } }[]
  }
}
type ConditionLink = {
  id: string
  isPrimary: boolean
  status: keyof typeof conditionStatusLabels
  diagnosedOn?: string | null
  notes?: string | null
  condition: { name: string }
}

/** Sección ya resuelta por la página (campos o tabla) que se imprime junto con las que carga la vista. */
export type PrintSection = {
  title: string
  /** Pares etiqueta/valor (los vacíos se omiten). */
  items?: { label: string; value?: string | null }[]
  /** Tabla con encabezados de columna, repetidos en cada página. */
  headers?: string[]
  rows?: string[][]
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border">
      <h2 className="print-card-header text-petroleo mb-2 rounded-lg px-3 py-1.5 text-sm font-bold">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Fields({ items }: { items: NonNullable<PrintSection['items']> }) {
  const visible = items.filter((item) => item.value)
  if (!visible.length) return <p className="text-xs">Sin datos.</p>
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
      {visible.map((item) => (
        <div key={item.label} className="flex gap-1.5">
          <dt className="font-semibold">{item.label}:</dt>
          <dd className="whitespace-pre-wrap">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  if (!rows.length) return <p className="text-xs">Sin registros.</p>
  return (
    <table className="w-full border-collapse text-xs">
      <thead className="table-header-group">
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className="border border-slate-300 bg-slate-100 px-1.5 py-1 text-left font-semibold"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="break-inside-avoid">
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="border border-slate-300 px-1.5 py-1 align-top"
              >
                {cell || '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Vista imprimible de TODA la ficha del paciente (todas las secciones y
 * pestañas, no solo la activa). Se monta fuera de pantalla (`hidden`), espera a
 * que carguen sus datos, abre el diálogo de impresión y avisa con `onDone`.
 */
export function PatientPrintView({
  patientId,
  patientName,
  sections,
  onDone,
}: {
  patientId: string
  patientName: string
  sections: PrintSection[]
  onDone: () => void
}) {
  const base = `/api/v1/patients/${encodeURIComponent(patientId)}`
  const doctors = useQuery({
    queryKey: ['patients', patientId, 'doctors'],
    queryFn: () => api<{ data: DoctorLink[] }>(`${base}/doctors`),
  })
  const caregivers = useQuery({
    queryKey: ['patients', patientId, 'caregivers'],
    queryFn: () => api<CaregiverList>(`${base}/caregivers`),
  })
  const conditions = useQuery({
    queryKey: ['patients', patientId, 'conditions'],
    queryFn: () => api<{ data: ConditionLink[] }>(`${base}/conditions`),
  })
  const activities = useQuery({
    queryKey: ['patients', patientId, 'activities', { print: true }],
    queryFn: () => api<ActivityList>(`${base}/activities?limit=100`),
  })
  const transfers = useQuery({
    queryKey: ['patients', patientId, 'transfers', 'print'],
    queryFn: () =>
      api<PatientTransferList>(
        `${base}/transfers?${pageQuery({ page: 1, rows: PAGE_ROWS })}`,
      ),
  })

  const settled = [
    doctors,
    caregivers,
    conditions,
    activities,
    transfers,
  ].every((query) => !query.isLoading)
  const started = useRef(false)
  useEffect(() => {
    if (!settled || started.current) return
    started.current = true
    window.addEventListener('afterprint', onDone, { once: true })
    // Deja que el portal pinte las secciones antes de abrir el diálogo.
    const timer = window.setTimeout(printDialog, 150)
    return () => window.clearTimeout(timer)
  }, [settled, onDone])

  return createPortal(
    <div data-print-dialog="" className="hidden print:block">
      <PrintFrame title={`Ficha del Paciente · ${patientName}`}>
        <div className="grid gap-4">
          {sections.map((section) => (
            <Section key={section.title} title={section.title}>
              {section.items && <Fields items={section.items} />}
              {section.headers && (
                <SimpleTable
                  headers={section.headers}
                  rows={section.rows ?? []}
                />
              )}
            </Section>
          ))}
          <Section title="Médicos">
            <SimpleTable
              headers={[
                'Médico',
                'Principal',
                'Especialidades',
                'Colegiatura',
                'Teléfono',
                'Centros médicos',
              ]}
              rows={(doctors.data?.data ?? []).map((link) => [
                `${link.doctor.firstName} ${link.doctor.lastName}`,
                link.isPrimary ? 'Sí' : 'No',
                link.doctor.specialties
                  .map((item) => item.specialty.name)
                  .join(', '),
                link.doctor.licenseNumber ?? '',
                link.doctor.phone ? formatPhone(link.doctor.phone) : '',
                link.doctor.medicalCenters
                  .map((item) => item.medicalCenter.name)
                  .join(', '),
              ])}
            />
          </Section>
          <Section title="Cuidadores">
            <SimpleTable
              headers={['Nombre', 'Parentesco', 'Teléfono', 'Principal']}
              rows={(caregivers.data?.data ?? []).map((caregiver) => [
                caregiver.fullName,
                caregiver.relationship,
                formatPhone(caregiver.phone),
                caregiver.isPrimary ? 'Sí' : 'No',
              ])}
            />
          </Section>
          <Section title="Condiciones de Salud">
            <SimpleTable
              headers={['Condición', 'Estado', 'Diagnóstico', 'Notas']}
              rows={(conditions.data?.data ?? []).map((link) => [
                link.isPrimary
                  ? `${link.condition.name} (principal)`
                  : link.condition.name,
                conditionStatusLabels[link.status] ?? link.status,
                link.diagnosedOn ? formatDate(link.diagnosedOn) : '',
                link.notes ?? '',
              ])}
            />
          </Section>
          <Section title="Traspasos">
            <SimpleTable
              headers={['ID', 'Fecha', 'De', 'A', 'Motivo', 'Tratamientos']}
              rows={(transfers.data?.data ?? []).map((row) => [
                `#${row.numeric_id}`,
                formatTimestamp(row.occurred_at),
                row.from_branch.name,
                row.to_branch.name,
                row.reason,
                String(row.treatments_count),
              ])}
            />
          </Section>
          <Section title="Historial">
            <SimpleTable
              headers={['Fecha', 'Evento', 'Detalle']}
              rows={(activities.data?.data ?? []).map((activity) => [
                formatTimestamp(activity.occurredAt),
                activityTitleFor(activity),
                activityDetail(activity) ?? '',
              ])}
            />
          </Section>
        </div>
      </PrintFrame>
    </div>,
    document.body,
  )
}
