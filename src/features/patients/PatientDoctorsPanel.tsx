import { Select } from '@/components/ui/Select'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { MoreBubble } from '@/components/ui/MoreBubble'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { ApiError, api } from '@/lib/http'
import { formatPhone } from '@/lib/phone'
import { useCan } from '@/lib/permissions'
import { NewDoctorButton } from '@/features/doctors/NewDoctorButton'
import {
  PrincipalBadge,
  RelationActions,
  RelationList,
  RelationRow,
} from './RelationParts'
import { useDoctorPicker, type PickerDoctor } from './relationQueries'
import type { components } from '@/lib/api-types'

type DoctorLink = components['schemas']['PatientDoctorLink'] & {
  doctor: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    licenseNumber: string | null
    specialties: { specialty: { id: string; name: string } }[]
    medicalCenters: { medicalCenter: { id: string; name: string } }[]
  }
}
type DoctorLinkList = { data: DoctorLink[] }

function doctorOptionLabel(doctor: PickerDoctor) {
  const specialties = doctor.specialties?.[0]?.specialty.name ?? ''
  return [
    `${doctor.firstName} ${doctor.lastName}`,
    doctor.licenseNumber ?? '',
    specialties,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Contenido de una fila de médico (compartido por el panel real y el de alta). */
export function DoctorRowContent({
  name,
  linkTo,
  isPrimary,
  specialties,
  licenseNumber,
  phone,
  medicalCenters,
  notes,
}: {
  name: string
  linkTo?: string
  isPrimary: boolean
  specialties: string[]
  licenseNumber: string | null | undefined
  phone: string | null | undefined
  medicalCenters: string[]
  notes?: string | null
}) {
  return (
    <>
      <p className="text-ink text-sm font-semibold">
        {linkTo ? (
          <Link to={linkTo} className="hover:text-tealmax hover:underline">
            {name}
          </Link>
        ) : (
          name
        )}
        {isPrimary && <PrincipalBadge />}
      </p>
      {specialties.length > 0 && (
        <p className="text-tealmax mt-0.5 flex items-center gap-1 text-xs font-medium">
          {specialties[0]}
          <MoreBubble
            label="Otras especialidades"
            items={specialties.slice(1)}
          />
        </p>
      )}
      <p className="text-muted mt-0.5 text-xs">
        {licenseNumber || 'Sin colegiatura'} ·{' '}
        {phone ? formatPhone(phone) : 'Sin teléfono'}
      </p>
      <p className="text-muted mt-0.5 text-xs">
        {medicalCenters.length > 0
          ? medicalCenters.join(', ')
          : 'Sin centro médico'}
      </p>
      {notes && (
        <p className="text-muted mt-1 text-xs whitespace-pre-wrap">{notes}</p>
      )}
    </>
  )
}

/**
 * Diálogo "Agregar Médico". No conoce al paciente ni la API de vínculos:
 * entrega la selección por `onSubmit` (el panel real la envía al servidor; el
 * de alta la guarda en memoria). Se monta solo mientras está abierto.
 */
export function AddDoctorDialog({
  excludeIds,
  primaryName,
  hasLinks,
  submitting = false,
  error,
  onSubmit,
  onClose,
}: {
  /** Médicos ya asociados: no se ofrecen en el selector. */
  excludeIds: Set<string>
  /** Nombre del médico principal actual, si lo hay. */
  primaryName: string | null
  hasLinks: boolean
  submitting?: boolean
  error?: string | null
  onSubmit: (
    doctor: PickerDoctor,
    values: { isPrimary: boolean; notes: string },
  ) => void
  onClose: () => void
}) {
  const [doctorId, setDoctorId] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [notes, setNotes] = useState('')
  const doctorOptions = useDoctorPicker()

  const hasPrimary = primaryName !== null
  const availableDoctors = (doctorOptions.data?.data ?? []).filter(
    (doctor) => !excludeIds.has(doctor.id),
  )

  return (
    <>
      <Dialog
        title="Agregar Médico"
        description="Asocia un doctor a este paciente."
        icon={<Stethoscope className="size-5" />}
        compactHeader
        bodyClassName="pt-3"
        onClose={onClose}
      >
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            const doctor = availableDoctors.find((item) => item.id === doctorId)
            if (!doctor) return
            onSubmit(doctor, {
              isPrimary: hasPrimary ? false : isPrimary,
              notes: notes.trim(),
            })
          }}
        >
          <ModalSection
            icon={<Stethoscope className="size-4" />}
            title="Médico Asociado"
            action={
              <NewDoctorButton onCreated={(doctor) => setDoctorId(doctor.id)} />
            }
          >
            <div className="grid gap-1.5">
              <label
                htmlFor="doctor-picker"
                className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
              >
                Médico
              </label>
              <Select
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
                    {doctorOptionLabel(doctor)}
                  </option>
                ))}
              </Select>
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
                    {hasLinks
                      ? 'Todos los médicos activos ya están asociados a este paciente.'
                      : 'Todavía no hay médicos activos. Créalos en Médicos.'}
                  </p>
                )}
            </div>
          </ModalSection>
          <ModalSection icon={<Star className="size-4" />} title="Detalles">
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
                {primaryName} ya es el médico principal. Desmárcalo desde la
                lista antes de asignar otro.
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
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <FormActions>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Agregar Médico'}
            </Button>
          </FormActions>
        </form>
      </Dialog>
    </>
  )
}

/** Lista de médicos de un paciente ya guardado. */
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

  const links = useQuery({
    queryKey: ['patients', patientId, 'doctors'],
    queryFn: () =>
      api<DoctorLinkList>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors`,
      ),
    enabled: Boolean(patientId),
  })

  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ['patients', patientId, 'doctors'],
    })
  }
  const add = useMutation({
    mutationFn: (body: {
      doctorId: string
      isPrimary: boolean
      notes: string
    }) =>
      api<DoctorLink>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/doctors`,
        {
          method: 'POST',
          body: JSON.stringify({ ...body, notes: body.notes || null }),
        },
      ),
    onSuccess: async () => {
      await invalidate()
      onCloseAdd()
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

  const items = links.data?.data ?? []
  const primaryLink = items.find((link) => link.isPrimary)

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
        <RelationList>
          {items.map((link) => (
            <RelationRow
              key={link.id}
              actions={
                canWrite && (
                  <RelationActions
                    onSetPrimary={
                      link.isPrimary
                        ? undefined
                        : () => setPrimary.mutate(link.doctorId)
                    }
                    onRemove={() => remove.mutate(link.doctorId)}
                  />
                )
              }
            >
              <DoctorRowContent
                name={`${link.doctor.firstName} ${link.doctor.lastName}`}
                linkTo={
                  canReadDoctors
                    ? `/medicos/${encodeURIComponent(link.doctorId)}`
                    : undefined
                }
                isPrimary={link.isPrimary}
                specialties={link.doctor.specialties.map(
                  (item) => item.specialty.name,
                )}
                licenseNumber={link.doctor.licenseNumber}
                phone={link.doctor.phone}
                medicalCenters={link.doctor.medicalCenters.map(
                  (item) => item.medicalCenter.name,
                )}
                notes={link.notes}
              />
            </RelationRow>
          ))}
        </RelationList>
      ) : (
        <p className="text-muted text-sm">Sin médicos asociados.</p>
      )}
      {addOpen && (
        <AddDoctorDialog
          excludeIds={new Set(items.map((link) => link.doctorId))}
          primaryName={
            primaryLink
              ? `${primaryLink.doctor.firstName} ${primaryLink.doctor.lastName}`
              : null
          }
          hasLinks={items.length > 0}
          submitting={add.isPending}
          error={
            add.isError
              ? add.error instanceof ApiError
                ? add.error.message
                : 'No pudimos asociar al médico.'
              : null
          }
          onSubmit={(doctor, values) =>
            add.mutate({ doctorId: doctor.id, ...values })
          }
          onClose={onCloseAdd}
        />
      )}
    </>
  )
}
