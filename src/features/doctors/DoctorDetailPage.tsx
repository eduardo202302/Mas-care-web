import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, Plus, Stethoscope, X } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Skeleton } from '@/components/ui/Skeleton'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { api, ApiError } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components, paths } from '@/lib/api-types'
import type { DoctorFormValues } from '@/schemas/doctor'
import { DoctorForm } from './DoctorForm'
import { syncDoctorMedicalCenters, syncDoctorSpecialties } from './doctorLinks'

type Doctor = components['schemas']['Doctor']
type SpecialtyLink = { specialty: components['schemas']['MedicalSpecialty'] }
type MedicalCenterLink = components['schemas']['DoctorMedicalCenterLink'] & {
  medicalCenter: components['schemas']['MedicalCenter']
}
type DoctorDetail = Doctor & {
  specialties: SpecialtyLink[]
  medicalCenters: MedicalCenterLink[]
}
type SpecialtyList =
  paths['/api/v1/medical-specialties']['get']['responses'][200]['content']['application/json']
type MedicalCenterList =
  paths['/api/v1/medical-centers']['get']['responses'][200]['content']['application/json']
type DoctorPatientLink = components['schemas']['PatientDoctorLink'] & {
  patient: { id: string; fullName: string; phone: string | null }
}
type DoctorPatientList = { data: DoctorPatientLink[] }

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-petroleo font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function DoctorDetailPage() {
  const { id = '' } = useParams()
  const canWrite = useCan('doctors:write')
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false)
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('')
  const [centerDialogOpen, setCenterDialogOpen] = useState(false)
  const [centerForm, setCenterForm] = useState({
    medicalCenterId: '',
    officeNumber: '',
    position: '',
    scheduleNotes: '',
    phoneExtension: '',
  })
  const [centerFormError, setCenterFormError] = useState<string | null>(null)

  const doctor = useQuery({
    queryKey: ['doctors', id],
    queryFn: () =>
      api<DoctorDetail>(`/api/v1/doctors/${encodeURIComponent(id)}`),
    enabled: Boolean(id),
  })
  const specialties = useQuery({
    queryKey: ['medical-specialties', { isActive: 'true', rows: 100 }],
    queryFn: () =>
      api<SpecialtyList>('/api/v1/medical-specialties?isActive=true&rows=100'),
    enabled: specialtyDialogOpen,
  })
  const centers = useQuery({
    queryKey: ['medical-centers', { isActive: 'true', rows: 100 }],
    queryFn: () =>
      api<MedicalCenterList>('/api/v1/medical-centers?isActive=true&rows=100'),
    enabled: centerDialogOpen,
  })
  const patients = useQuery({
    queryKey: ['doctors', id, 'patients'],
    queryFn: () =>
      api<DoctorPatientList>(
        `/api/v1/doctors/${encodeURIComponent(id)}/patients`,
      ),
    enabled: Boolean(id),
  })

  const update = useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      const updated = await api<Doctor>(
        `/api/v1/doctors/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            licenseNumber: values.licenseNumber || null,
            phone: values.phone || null,
            email: values.email || null,
            notes: values.notes || null,
          }),
        },
      )
      await syncDoctorSpecialties(
        id,
        doctor.data?.specialties.map((link) => link.specialty.id) ?? [],
        values.specialtyIds,
      )
      await syncDoctorMedicalCenters(
        id,
        doctor.data?.medicalCenters
          .filter((link) => link.isActive)
          .map((link) => link.medicalCenterId) ?? [],
        values.medicalCenterIds,
      )
      return updated
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors', id] })
      setEditing(false)
    },
  })
  const addSpecialty = useMutation({
    mutationFn: (specialtyId: string) =>
      api(`/api/v1/doctors/${encodeURIComponent(id)}/specialties`, {
        method: 'POST',
        body: JSON.stringify({ specialtyId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors', id] })
      setSpecialtyDialogOpen(false)
      setSelectedSpecialtyId('')
    },
  })
  const removeSpecialty = useMutation({
    mutationFn: (specialtyId: string) =>
      api(
        `/api/v1/doctors/${encodeURIComponent(id)}/specialties/${encodeURIComponent(specialtyId)}`,
        { method: 'DELETE' },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors', id] }),
  })
  const addCenter = useMutation({
    mutationFn: () =>
      api(`/api/v1/doctors/${encodeURIComponent(id)}/medical-centers`, {
        method: 'POST',
        body: JSON.stringify({
          medicalCenterId: centerForm.medicalCenterId,
          officeNumber: centerForm.officeNumber || null,
          position: centerForm.position || null,
          scheduleNotes: centerForm.scheduleNotes || null,
          phoneExtension: centerForm.phoneExtension || null,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors', id] })
      closeCenterDialog()
    },
    onError: (error) => {
      setCenterFormError(
        error instanceof ApiError
          ? error.message
          : 'No pudimos agregar el centro médico.',
      )
    },
  })
  const removeCenter = useMutation({
    mutationFn: (medicalCenterId: string) =>
      api(
        `/api/v1/doctors/${encodeURIComponent(id)}/medical-centers/${encodeURIComponent(medicalCenterId)}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: false }) },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors', id] }),
  })

  function closeCenterDialog() {
    setCenterDialogOpen(false)
    setCenterFormError(null)
    setCenterForm({
      medicalCenterId: '',
      officeNumber: '',
      position: '',
      scheduleNotes: '',
      phoneExtension: '',
    })
  }

  if (doctor.isLoading)
    return (
      <div className="grid gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  if (doctor.isError || !doctor.data)
    return (
      <div>
        <Link
          to="/medicos"
          className="text-tealmax inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          Volver a médicos
        </Link>
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          No pudimos cargar este médico. {doctor.error?.message}
        </p>
      </div>
    )

  const record = doctor.data
  const linkedSpecialtyIds = new Set(record.specialties.map((link) => link.specialty.id))
  const availableSpecialties = (specialties.data?.data ?? []).filter(
    (specialty) => !linkedSpecialtyIds.has(specialty.id),
  )
  const activeCenters = record.medicalCenters.filter((link) => link.isActive)
  const linkedCenterIds = new Set(activeCenters.map((link) => link.medicalCenterId))
  const availableCenters = (centers.data?.data ?? []).filter(
    (center) => !linkedCenterIds.has(center.id),
  )
  const patientLinks = patients.data?.data ?? []

  return (
    <div className="animate-in">
      <Link
        to="/medicos"
        className="text-muted hover:text-petroleo mb-2 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" />
        Médicos
      </Link>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-tealmax text-sm">Ficha del médico</p>
          <h1 className="font-display text-petroleo text-2xl font-bold tracking-tight">
            {record.lastName}, {record.firstName}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {record.licenseNumber ? `Colegiatura ${record.licenseNumber}` : 'Sin colegiatura'}
          </p>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </header>
      {!record.isActive && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          Este médico está inactivo.
        </p>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(260px,0.9fr)_minmax(320px,1.3fr)]">
        <div className="grid gap-4">
          <Panel title="Datos de contacto">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-muted">Teléfono</dt>
                <dd className="mt-0.5">{record.phone || 'Sin teléfono'}</dd>
              </div>
              <div>
                <dt className="text-muted">Correo</dt>
                <dd className="mt-0.5">{record.email || 'Sin correo'}</dd>
              </div>
              <div>
                <dt className="text-muted">Notas</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">{record.notes || 'Sin notas'}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Pacientes asociados">
            {patients.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : patientLinks.length ? (
              <ul className="grid gap-3">
                {patientLinks.map((link) => (
                  <li
                    key={link.id}
                    className="border-border border-b pb-3 last:border-0 last:pb-0"
                  >
                    <Link
                      to={`/pacientes/${encodeURIComponent(link.patient.id)}`}
                      className="text-petroleo hover:text-tealmax text-sm font-semibold hover:underline"
                    >
                      {link.patient.fullName}
                      {link.isPrimary ? ' · Principal' : ''}
                    </Link>
                    <p className="text-muted mt-0.5 text-xs">
                      {link.patient.phone || 'Sin teléfono'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Sin pacientes asociados.</p>
            )}
          </Panel>
        </div>
        <div className="grid gap-4">
          <Panel
            title="Especialidades"
            action={
              canWrite && (
                <Button
                  className="h-8 px-2 text-xs"
                  onClick={() => setSpecialtyDialogOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Agregar
                </Button>
              )
            }
          >
            {record.specialties.length ? (
              <ul className="flex flex-wrap gap-2">
                {record.specialties.map((link) => (
                  <li
                    key={link.specialty.id}
                    className="bg-surface text-ink flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
                  >
                    {link.specialty.name}
                    {canWrite && (
                      <button
                        type="button"
                        aria-label={`Quitar ${link.specialty.name}`}
                        onClick={() => removeSpecialty.mutate(link.specialty.id)}
                        className="text-muted hover:text-red-600"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Sin especialidades asignadas.</p>
            )}
          </Panel>
          <Panel
            title="Centros médicos"
            action={
              canWrite && (
                <Button
                  className="h-8 px-2 text-xs"
                  onClick={() => setCenterDialogOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Agregar
                </Button>
              )
            }
          >
            {activeCenters.length ? (
              <ul className="grid gap-3">
                {activeCenters.map((link) => (
                  <li
                    key={link.id}
                    className="border-border flex items-start justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-ink text-sm font-semibold">
                        {link.medicalCenter.name}
                      </p>
                      <p className="text-muted mt-0.5 text-xs">
                        {[link.position, link.officeNumber ? `Cons. ${link.officeNumber}` : null]
                          .filter(Boolean)
                          .join(' · ') || 'Sin detalles adicionales'}
                      </p>
                    </div>
                    {canWrite && (
                      <button
                        type="button"
                        aria-label={`Quitar ${link.medicalCenter.name}`}
                        onClick={() => removeCenter.mutate(link.medicalCenterId)}
                        className="text-muted hover:text-red-600"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">Sin centros médicos asignados.</p>
            )}
          </Panel>
        </div>
      </div>
      {editing && (
        <Dialog title="Editar médico" description="Actualiza los datos del médico." onClose={() => setEditing(false)} size="lg">
          <DoctorForm
            doctor={record}
            onSave={(values) => update.mutateAsync(values).then(() => undefined)}
            onCancel={() => setEditing(false)}
            submitting={update.isPending}
          />
        </Dialog>
      )}
      {specialtyDialogOpen && (
        <Dialog
          title="Agregar especialidad"
          description="Selecciona una especialidad para asignarla a este médico."
          onClose={() => setSpecialtyDialogOpen(false)}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (selectedSpecialtyId) addSpecialty.mutate(selectedSpecialtyId)
            }}
          >
            <ModalSection icon={<Stethoscope className="size-4" />} title="Especialidad" tone="mint">
              <div className="grid gap-1.5">
                <label htmlFor="specialty-select" className="text-ink text-sm font-medium">
                  Especialidad
                </label>
                <select
                  id="specialty-select"
                  required
                  value={selectedSpecialtyId}
                  onChange={(event) => setSelectedSpecialtyId(event.target.value)}
                  className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
                >
                  <option value="">Selecciona una especialidad…</option>
                  {availableSpecialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
            </ModalSection>
            {addSpecialty.isError && (
              <p role="alert" className="text-sm text-red-700">
                {addSpecialty.error instanceof ApiError
                  ? addSpecialty.error.message
                  : 'No pudimos agregar la especialidad.'}
              </p>
            )}
            <FormActions>
              <Button type="button" className="w-full sm:w-auto" onClick={() => setSpecialtyDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={!selectedSpecialtyId || addSpecialty.isPending}
              >
                {addSpecialty.isPending ? 'Agregando…' : 'Agregar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
      {centerDialogOpen && (
        <Dialog
          title="Agregar centro médico"
          description="Asocia este médico a un centro médico activo."
          onClose={closeCenterDialog}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              setCenterFormError(null)
              addCenter.mutate()
            }}
          >
            <ModalSection icon={<Building2 className="size-4" />} title="Centro médico" tone="mint">
              <div className="grid gap-1.5">
                <label htmlFor="center-select" className="text-ink text-sm font-medium">
                  Centro médico
                </label>
                <select
                  id="center-select"
                  required
                  value={centerForm.medicalCenterId}
                  onChange={(event) =>
                    setCenterForm((current) => ({ ...current, medicalCenterId: event.target.value }))
                  }
                  className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
                >
                  <option value="">Selecciona un centro médico…</option>
                  {availableCenters.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Posición"
                  value={centerForm.position}
                  onChange={(event) =>
                    setCenterForm((current) => ({ ...current, position: event.target.value }))
                  }
                />
                <TextField
                  label="Consultorio"
                  value={centerForm.officeNumber}
                  onChange={(event) =>
                    setCenterForm((current) => ({ ...current, officeNumber: event.target.value }))
                  }
                />
                <TextField
                  label="Extensión telefónica"
                  value={centerForm.phoneExtension}
                  onChange={(event) =>
                    setCenterForm((current) => ({ ...current, phoneExtension: event.target.value }))
                  }
                />
                <TextField
                  label="Notas de horario"
                  value={centerForm.scheduleNotes}
                  onChange={(event) =>
                    setCenterForm((current) => ({ ...current, scheduleNotes: event.target.value }))
                  }
                />
              </div>
            </ModalSection>
            {centerFormError && (
              <p role="alert" className="text-sm text-red-700">
                {centerFormError}
              </p>
            )}
            <FormActions>
              <Button type="button" className="w-full sm:w-auto" onClick={closeCenterDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={!centerForm.medicalCenterId || addCenter.isPending}
              >
                {addCenter.isPending ? 'Agregando…' : 'Agregar'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
    </div>
  )
}
