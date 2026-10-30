import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Stethoscope, User, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { Skeleton } from '@/components/ui/Skeleton'
import { ApiError, api } from '@/lib/http'
import type { components, paths } from '@/lib/api-types'
import {
  doctorSchema,
  type DoctorBaseFormValues,
  type DoctorFormValues,
} from '@/schemas/doctor'
import type { MedicalSpecialtyFormValues } from '@/schemas/medicalSpecialty'
import type { MedicalCenterFormValues } from '@/schemas/medicalCenter'
import { useCan } from '@/lib/permissions'
import { MedicalSpecialtyForm } from '@/features/medical-specialties/MedicalSpecialtyForm'
import { MedicalCenterForm } from '@/features/medical-centers/MedicalCenterForm'

type DoctorRecord = components['schemas']['Doctor'] & {
  specialties?: { specialty: components['schemas']['MedicalSpecialty'] }[]
  medicalCenters?: (components['schemas']['DoctorMedicalCenterLink'] & {
    medicalCenter: components['schemas']['MedicalCenter']
  })[]
}
type SpecialtyList =
  paths['/api/v1/medical-specialties']['get']['responses'][200]['content']['application/json']
type MedicalCenterList =
  paths['/api/v1/medical-centers']['get']['responses'][200]['content']['application/json']

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" className="shrink-0" onClick={onClick}>
      <Plus className="size-4" />
      {label}
    </Button>
  )
}

function PickerSelect({
  label,
  placeholder,
  options,
  onPick,
}: {
  label: string
  placeholder: string
  options: { id: string; name: string }[]
  onPick: (id: string) => void
}) {
  return (
    <select
      aria-label={label}
      value=""
      onChange={(event) => {
        if (event.target.value) onPick(event.target.value)
      }}
      className="border-border text-ink focus:border-tealmax h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  )
}

function SelectedList({
  items,
  onRemove,
}: {
  items: { id: string; name: string }[]
  onRemove: (id: string) => void
}) {
  if (!items.length)
    return (
      <p className="text-muted text-sm">Todavía no has seleccionado ninguno.</p>
    )
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="bg-surface text-ink flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
        >
          {item.name}
          <button
            type="button"
            aria-label={`Quitar ${item.name}`}
            onClick={() => onRemove(item.id)}
            className="text-muted hover:text-red-600"
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  )
}

export function DoctorForm({
  doctor,
  onSave,
  onCancel,
  submitting = false,
}: {
  doctor?: DoctorRecord
  onSave: (values: DoctorFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DoctorBaseFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor
      ? {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          licenseNumber: doctor.licenseNumber ?? '',
          phone: doctor.phone ?? '',
          email: doctor.email ?? '',
          notes: doctor.notes ?? '',
        }
      : {
          firstName: '',
          lastName: '',
          licenseNumber: '',
          phone: '',
          email: '',
          notes: '',
        },
  })
  const [specialtyIds, setSpecialtyIds] = useState<string[]>(
    doctor?.specialties?.map((link) => link.specialty.id) ?? [],
  )
  const [medicalCenterIds, setMedicalCenterIds] = useState<string[]>(
    doctor?.medicalCenters
      ?.filter((link) => link.isActive)
      .map((link) => link.medicalCenterId) ?? [],
  )
  const specialtyOptions = useQuery({
    queryKey: ['medical-specialties', 'picker'],
    queryFn: () =>
      api<SpecialtyList>('/api/v1/medical-specialties?isActive=true&rows=200'),
  })
  const centerOptions = useQuery({
    queryKey: ['medical-centers', 'picker'],
    queryFn: () =>
      api<MedicalCenterList>('/api/v1/medical-centers?isActive=true&rows=200'),
  })
  const queryClient = useQueryClient()
  const canWriteSpecialties = useCan('specialties:write')
  const canWriteCenters = useCan('medical-centers:write')
  const [specialtyFormOpen, setSpecialtyFormOpen] = useState(false)
  const [centerFormOpen, setCenterFormOpen] = useState(false)
  const [createdSpecialties, setCreatedSpecialties] = useState<
    { id: string; name: string }[]
  >([])
  const [createdCenters, setCreatedCenters] = useState<
    { id: string; name: string }[]
  >([])
  const createSpecialty = useMutation({
    mutationFn: (values: MedicalSpecialtyFormValues) =>
      api<components['schemas']['MedicalSpecialty']>(
        '/api/v1/medical-specialties',
        {
          method: 'POST',
          body: JSON.stringify({
            name: values.name,
            description: values.description || null,
          }),
        },
      ),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['medical-specialties'] })
      setCreatedSpecialties((current) =>
        current.some((item) => item.id === created.id)
          ? current
          : [...current, { id: created.id, name: created.name }],
      )
      setSpecialtyIds((current) =>
        current.includes(created.id) ? current : [...current, created.id],
      )
      setSpecialtyFormOpen(false)
    },
  })
  const createCenter = useMutation({
    mutationFn: (values: MedicalCenterFormValues) =>
      api<components['schemas']['MedicalCenter']>('/api/v1/medical-centers', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          centerType: values.centerType,
          rnc: values.rnc || null,
          phone: values.phone || null,
          email: values.email || null,
          address: values.address || null,
          province: values.province || null,
          municipality: values.municipality || null,
          notes: values.notes || null,
        }),
      }),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['medical-centers'] })
      setCreatedCenters((current) =>
        current.some((item) => item.id === created.id)
          ? current
          : [...current, { id: created.id, name: created.name }],
      )
      setMedicalCenterIds((current) =>
        current.includes(created.id) ? current : [...current, created.id],
      )
      setCenterFormOpen(false)
    },
  })

  function addSpecialty(id: string) {
    setSpecialtyIds((current) =>
      current.includes(id) ? current : [...current, id],
    )
  }
  function removeSpecialty(id: string) {
    setSpecialtyIds((current) => current.filter((value) => value !== id))
  }
  function addMedicalCenter(id: string) {
    setMedicalCenterIds((current) =>
      current.includes(id) ? current : [...current, id],
    )
  }
  function removeMedicalCenter(id: string) {
    setMedicalCenterIds((current) => current.filter((value) => value !== id))
  }

  async function submit(values: DoctorBaseFormValues) {
    try {
      await onSave({ ...values, specialtyIds, medicalCenterIds })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in doctorSchema.shape && typeof message === 'string')
            setError(key as FieldPath<DoctorBaseFormValues>, {
              type: 'server',
              message,
            })
        }
      } else if (error instanceof ApiError && error.status === 409) {
        setError('licenseNumber', { type: 'server', message: error.message })
      } else {
        setError('root.server' as FieldPath<DoctorBaseFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar al médico.',
        })
      }
    }
  }

  const specialtyNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const link of doctor?.specialties ?? [])
      map.set(link.specialty.id, link.specialty.name)
    for (const item of createdSpecialties) map.set(item.id, item.name)
    for (const item of specialtyOptions.data?.data ?? [])
      map.set(item.id, item.name)
    return map
  }, [createdSpecialties, doctor, specialtyOptions.data])
  const centerNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const link of doctor?.medicalCenters ?? [])
      map.set(link.medicalCenterId, link.medicalCenter.name)
    for (const item of createdCenters) map.set(item.id, item.name)
    for (const item of centerOptions.data?.data ?? [])
      map.set(item.id, item.name)
    return map
  }, [centerOptions.data, createdCenters, doctor])
  const availableSpecialties = useMemo(
    () =>
      (specialtyOptions.data?.data ?? []).filter(
        (item) => !specialtyIds.includes(item.id),
      ),
    [specialtyIds, specialtyOptions.data],
  )
  const availableCenters = useMemo(
    () =>
      (centerOptions.data?.data ?? []).filter(
        (item) => !medicalCenterIds.includes(item.id),
      ),
    [centerOptions.data, medicalCenterIds],
  )
  const selectedSpecialties = useMemo(
    () =>
      specialtyIds.map((id) => ({
        id,
        name: specialtyNameById.get(id) ?? id,
      })),
    [specialtyIds, specialtyNameById],
  )
  const selectedCenters = useMemo(
    () =>
      medicalCenterIds.map((id) => ({
        id,
        name: centerNameById.get(id) ?? id,
      })),
    [centerNameById, medicalCenterIds],
  )

  return (
    <>
      <form onSubmit={handleSubmit(submit)} className="grid gap-5">
        <ModalSection
          icon={<User className="size-4" />}
          title="Datos del Médico"
          tone="mint"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Nombre"
              required
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <TextField
              label="Apellido"
              required
              {...register('lastName')}
              error={errors.lastName?.message}
            />
            <TextField
              label="Número de colegiatura"
              {...register('licenseNumber')}
              error={errors.licenseNumber?.message}
            />
            <TextField
              label="Teléfono"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <div className="sm:col-span-2">
              <TextField
                label="Correo electrónico"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="Notas"
                {...register('notes')}
                error={errors.notes?.message}
              />
            </div>
          </div>
        </ModalSection>
        <ModalSection
          icon={<Stethoscope className="size-4" />}
          title="Especialidades"
          tone="sky"
        >
          {specialtyOptions.isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <>
              {specialtyOptions.data?.data.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <PickerSelect
                    label="Agregar especialidad"
                    placeholder="Selecciona una especialidad…"
                    options={availableSpecialties}
                    onPick={addSpecialty}
                  />
                  {canWriteSpecialties && (
                    <AddButton
                      label="Nueva Especialidad"
                      onClick={() => setSpecialtyFormOpen(true)}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-muted text-sm">
                    No hay especialidades activas.
                  </p>
                  {canWriteSpecialties && (
                    <AddButton
                      label="Nueva Especialidad"
                      onClick={() => setSpecialtyFormOpen(true)}
                    />
                  )}
                </div>
              )}
              <SelectedList
                items={selectedSpecialties}
                onRemove={removeSpecialty}
              />
            </>
          )}
        </ModalSection>
        <ModalSection
          icon={<Building2 className="size-4" />}
          title="Centros Médicos"
          tone="amber"
        >
          {centerOptions.isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <>
              {centerOptions.data?.data.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <PickerSelect
                    label="Agregar centro médico"
                    placeholder="Selecciona un centro médico…"
                    options={availableCenters}
                    onPick={addMedicalCenter}
                  />
                  {canWriteCenters && (
                    <AddButton
                      label="Nuevo Centro Médico"
                      onClick={() => setCenterFormOpen(true)}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-muted text-sm">
                    No hay centros médicos activos.
                  </p>
                  {canWriteCenters && (
                    <AddButton
                      label="Nuevo Centro Médico"
                      onClick={() => setCenterFormOpen(true)}
                    />
                  )}
                </div>
              )}
              <SelectedList
                items={selectedCenters}
                onRemove={removeMedicalCenter}
              />
            </>
          )}
        </ModalSection>
        {errors.root?.server?.message && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {errors.root.server.message}
          </p>
        )}
        <FormActions>
          <Button type="button" className="w-full sm:w-auto" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={submitting}
          >
            {submitting
              ? 'Guardando…'
              : doctor
                ? 'Guardar cambios'
                : 'Crear médico'}
          </Button>
        </FormActions>
      </form>
      {specialtyFormOpen && (
        <Dialog
          title="Nueva Especialidad"
          icon={<Stethoscope className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setSpecialtyFormOpen(false)}
        >
          <MedicalSpecialtyForm
            onSave={(values) =>
              createSpecialty.mutateAsync(values).then(() => undefined)
            }
            onCancel={() => setSpecialtyFormOpen(false)}
            submitting={createSpecialty.isPending}
          />
        </Dialog>
      )}
      {centerFormOpen && (
        <Dialog
          title="Nuevo Centro Médico"
          icon={<Building2 className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          size="lg"
          onClose={() => setCenterFormOpen(false)}
        >
          <MedicalCenterForm
            onSave={(values) =>
              createCenter.mutateAsync(values).then(() => undefined)
            }
            onCancel={() => setCenterFormOpen(false)}
            submitting={createCenter.isPending}
          />
        </Dialog>
      )}
    </>
  )
}
