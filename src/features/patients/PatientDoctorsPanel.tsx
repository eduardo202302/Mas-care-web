import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star, Stethoscope, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { ApiError, api } from '@/lib/http'
import { formatPhone } from '@/lib/phone'
import { useCan } from '@/lib/permissions'
import type { components, paths } from '@/lib/api-types'

type DoctorLink = components['schemas']['PatientDoctorLink'] & {
  doctor: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    licenseNumber: string | null
  }
}
type DoctorLinkList = { data: DoctorLink[] }
type DoctorList =
  paths['/api/v1/doctors']['get']['responses'][200]['content']['application/json']

export function PatientDoctorsPanel({
  patientId,
  addOpen,
  onCloseAdd,
}: {
  patientId: string
  /** El botón `+` del encabezado de la card controla este estado. */
  addOpen: boolean
  onCloseAdd: () => void
}) {
  const canWrite = useCan('patients:write')
  const canReadDoctors = useCan('doctors:read')
  const queryClient = useQueryClient()
  const [doctorId, setDoctorId] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [notes, setNotes] = useState('')

  const links = useQuery({
    queryKey: ['patients', patientId, 'doctors'],
    queryFn: () =>
      api<DoctorLinkList>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors`,
      ),
    enabled: Boolean(patientId),
  })
  const doctorOptions = useQuery({
    queryKey: ['doctors', 'picker'],
    // La API rechaza rows > 100 (pagingFields: max(100)) → el picker quedaba
    // vacío mostrando un 400 silencioso.
    queryFn: () => api<DoctorList>('/api/v1/doctors?isActive=true&rows=100'),
    enabled: addOpen,
  })

  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ['patients', patientId, 'doctors'],
    })
  }
  const add = useMutation({
    mutationFn: () =>
      api<DoctorLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors`,
        {
          method: 'POST',
          body: JSON.stringify({
            doctorId,
            isPrimary: hasPrimary ? false : isPrimary,
            notes: notes.trim() || null,
          }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      closeAdd()
    },
  })
  const setPrimary = useMutation({
    mutationFn: (targetDoctorId: string) =>
      api<DoctorLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors/${encodeURIComponent(targetDoctorId)}`,
        { method: 'PATCH', body: JSON.stringify({ isPrimary: true }) },
      ),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (targetDoctorId: string) =>
      api<DoctorLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors/${encodeURIComponent(targetDoctorId)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: false }) },
      ),
    onSuccess: invalidate,
  })

  function closeAdd() {
    setDoctorId('')
    setIsPrimary(false)
    setNotes('')
    onCloseAdd()
  }

  const items = links.data?.data ?? []
  const linkedDoctorIds = new Set(items.map((link) => link.doctorId))
  const availableDoctors = (doctorOptions.data?.data ?? []).filter(
    (doctor) => !linkedDoctorIds.has(doctor.id),
  )
  const primaryLink = items.find((link) => link.isPrimary)
  const hasPrimary = Boolean(primaryLink)

  return (
    <>
      {links.isLoading ? (
        <p className="text-muted text-sm">Cargando médicos…</p>
      ) : links.isError ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar los médicos del paciente.{' '}
          {links.error instanceof Error ? links.error.message : ''}
        </p>
      ) : items.length ? (
        <ul className="grid gap-3">
          {items.map((link) => (
            <li
              key={link.id}
              className="border-border flex items-start justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-ink text-sm font-semibold">
                  {canReadDoctors ? (
                    <Link
                      to={`/medicos/${encodeURIComponent(link.doctorId)}`}
                      className="hover:text-tealmax hover:underline"
                    >
                      {link.doctor.firstName} {link.doctor.lastName}
                    </Link>
                  ) : (
                    `${link.doctor.firstName} ${link.doctor.lastName}`
                  )}
                  {link.isPrimary && (
                    <span className="bg-tealmax/10 text-tealmax ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                      Principal
                    </span>
                  )}
                </p>
                <p className="text-muted mt-0.5 text-xs">
                  {link.doctor.licenseNumber || 'Sin colegiatura'} ·{' '}
                  {link.doctor.phone
                    ? formatPhone(link.doctor.phone)
                    : 'Sin teléfono'}
                </p>
                {link.notes && (
                  <p className="text-muted mt-1 text-xs whitespace-pre-wrap">
                    {link.notes}
                  </p>
                )}
              </div>
              {canWrite && (
                <div className="flex shrink-0 gap-1">
                  {!link.isPrimary && (
                    <button
                      type="button"
                      title="Marcar como principal"
                      onClick={() => setPrimary.mutate(link.doctorId)}
                      className="text-muted hover:text-tealmax"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Quitar"
                    onClick={() => remove.mutate(link.doctorId)}
                    className="text-muted hover:text-red-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm">Sin médicos asociados.</p>
      )}
      {addOpen && (
        <Dialog
          title="Agregar Médico"
          description="Asocia un médico prescriptor a este paciente."
          icon={<Stethoscope className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={closeAdd}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              add.mutate()
            }}
          >
            <ModalSection
              icon={<Stethoscope className="size-4" />}
              title="Médico Asociado"
              tone="mint"
            >
              <div className="grid gap-1.5">
                <label
                  htmlFor="doctor-picker"
                  className="text-ink text-sm font-medium"
                >
                  Médico
                </label>
                <select
                  id="doctor-picker"
                  required
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  disabled={doctorOptions.isPending}
                  className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {doctorOptions.isPending
                      ? 'Cargando médicos…'
                      : doctorOptions.isError
                        ? 'No se pudieron cargar los médicos'
                        : availableDoctors.length
                          ? 'Selecciona un médico'
                          : 'No hay médicos disponibles'}
                  </option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
                {doctorOptions.isError && (
                  <p role="alert" className="text-xs text-red-700">
                    No pudimos cargar la lista de médicos.{' '}
                    {doctorOptions.error instanceof Error
                      ? doctorOptions.error.message
                      : ''}
                  </p>
                )}
                {!doctorOptions.isPending &&
                  !doctorOptions.isError &&
                  !availableDoctors.length && (
                    <p className="text-muted text-xs">
                      {items.length
                        ? 'Todos los médicos activos ya están asociados a este paciente.'
                        : 'Todavía no hay médicos activos. Créalos en Médicos.'}
                    </p>
                  )}
              </div>
            </ModalSection>
            <ModalSection
              icon={<Star className="size-4" />}
              title="Detalles"
              tone="sky"
            >
              <label
                className={
                  hasPrimary
                    ? 'text-muted flex items-center gap-2 text-sm'
                    : 'text-ink flex items-center gap-2 text-sm'
                }
              >
                <input
                  type="checkbox"
                  checked={hasPrimary ? false : isPrimary}
                  disabled={hasPrimary}
                  onChange={(event) => setIsPrimary(event.target.checked)}
                />
                Médico Principal
              </label>
              {hasPrimary && (
                <p className="text-muted text-xs">
                  {primaryLink?.doctor.firstName} {primaryLink?.doctor.lastName}{' '}
                  ya es el médico principal. Desmárcalo desde la lista antes de
                  asignar otro.
                </p>
              )}
              <div className="grid gap-1.5">
                <label
                  htmlFor="doctor-link-notes"
                  className="text-ink text-sm font-medium"
                >
                  Notas (Opcional)
                </label>
                <TextAreaField
                  id="doctor-link-notes"
                  className="min-h-8 py-1.5 text-xs"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </ModalSection>
            {add.isError && (
              <p role="alert" className="text-sm text-red-700">
                {add.error instanceof ApiError
                  ? add.error.message
                  : 'No pudimos asociar al médico.'}
              </p>
            )}
            <FormActions>
              <Button type="button" onClick={closeAdd}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={add.isPending || !doctorId}
              >
                {add.isPending ? 'Guardando…' : 'Agregar Médico'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
    </>
  )
}
