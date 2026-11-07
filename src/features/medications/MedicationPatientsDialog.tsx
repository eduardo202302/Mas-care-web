import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { formatDurationYMD } from '@/lib/treatments'
import type { components } from '@/lib/api-types'

type MedicationPatient = components['schemas']['MedicationPatient']

function elapsedLabel(startDate: string) {
  const start = new Date(startDate).getTime()
  if (Number.isNaN(start)) return '—'
  return formatDurationYMD(Math.floor((Date.now() - start) / 86_400_000))
}

export function MedicationPatientsDialog({
  medication,
  name,
  onClose,
}: {
  medication: components['schemas']['Medication']
  name: string
  onClose: () => void
}) {
  const patients = useQuery({
    queryKey: ['medication-patients', medication.id],
    queryFn: () =>
      api<{ data: MedicationPatient[] }>(
        `/api/v1/medications/${encodeURIComponent(medication.id)}/patients`,
      ).then((result) => result.data),
  })
  const rows = patients.data ?? []

  return (
    <Dialog
      title="Clientes en tratamiento"
      titleAside={name}
      description="Clientes con este medicamento en un tratamiento activo o en pausa."
      icon={<Users className="size-5" />}
      compactHeader
      size="xl"
      bodyClassName="pt-3"
      onClose={onClose}
    >
      {patients.isPending ? (
        <p className="text-muted text-sm">Cargando…</p>
      ) : patients.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar los clientes. {patients.error.message}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-muted text-sm">
          Ningún cliente tiene tratamientos en curso con este medicamento.
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted text-xs font-semibold uppercase">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">WhatsApp</th>
                <th className="px-3 py-2">Ciudad</th>
                <th className="px-3 py-2">Tiempo de tratamiento</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {rows.map((row) => (
                <tr key={row.treatmentId}>
                  <td className="text-muted px-3 py-2 font-mono text-xs">
                    {row.patientNumericId}
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    <Link
                      to={`/pacientes/${encodeURIComponent(row.patientId)}`}
                      className="text-petroleo hover:text-tealmax underline-offset-2 hover:underline"
                    >
                      {row.fullName}
                    </Link>
                    {row.status === 'paused' && (
                      <span className="text-muted ml-2 text-xs font-normal">
                        En pausa
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.phone ? (
                      <>
                        {row.phone}
                        {!row.phoneHasWhatsapp && (
                          <span className="text-muted ml-2 text-xs">
                            sin WhatsApp
                          </span>
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2">{row.city ?? '—'}</td>
                  <td className="px-3 py-2">{elapsedLabel(row.startDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Dialog>
  )
}
