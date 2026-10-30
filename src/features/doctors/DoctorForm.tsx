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
import { TextAreaField } from '@/components/ui/TextAreaField'
import { Skeleton } from '@/components/ui/Skeleton'
import { ApiError, api } from '@/lib/http'
import { maskPhoneInput } from '@/lib/phone'
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
  disabled = false,
  assignedSuffix = 'ya asignada',
}: {
  label: string
  placeholder: string
  options: { id: string; name: string; assigned?: boolean }[]
  onPick: (id: string) => void
  disabled?: boolean
  assignedSuffix?: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <select
        aria-label={label}
        value=""
        disabled={disabled}
        onChange={(event) => {
          if (event.target.value) onPick(event.target.value)
        }}
        className="border-border text-ink focus:border-tealmax h-10 w-full min-w-0 rounded-lg border bg-white px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id} disabled={option.assigned}>
            {option.assigned
              ? `${option.name} — ${assignedSuffix}`
              : option.name}
          </option>
        ))}
      </select>
    </div>
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
    setValue,
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
    queryKey: ['medical-specialties', { isActive: 'true', rows: 100 }],
    queryFn: () =>
      api<SpecialtyList>('/api/v1/medical-specialties?isActive=true&rows=100'),
  })
  const centerOptions = useQuery({
    queryKey: ['medical-centers', { isActive: 'true', rows: 100 }],
    queryFn: () =>
      api<MedicalCenterList>('/api/v1/medical-centers?isActive=true&rows=100'),
  })
  const queryClient = useQueryClient()
  const canWriteSpecialties = useCan('specialties:write')
  const canWriteCenters = useCan('medical-centers:write')
  const [specialtyFormOpen, setSpecialtyFormOpen] = useState(false)
  const [centerFormOpen, setCenterFormOpen] = useState(false)
  const [specialtyPickerOpen, setSpecialtyPickerOpen] = useState(false)
  const [centerPickerOpen, setCenterPickerOpen] = useState(false)
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
    setSpecialtyPickerOpen(false)
  }
  function removeSpecialty(id: string) {
    setSpecialtyIds((current) => current.filter((value) => value !== id))
  }
  function addMedicalCenter(id: string) {
    setMedicalCenterIds((current) =>
      current.includes(id) ? current : [...current, id],
    )
    setCenterPickerOpen(false)
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
  const specialtyPickerOptions = useMemo(
    () =>
      (specialtyOptions.data?.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        assigned: specialtyIds.includes(item.id),
      })),
    [specialtyIds, specialtyOptions.data],
  )
  const centerPickerOptions = useMemo(
    () =>
      (centerOptions.data?.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        assigned: medicalCenterIds.includes(item.id),
      })),
    [centerOptions.data, medicalCenterIds],
  )
  const hasFreeSpecialties = specialtyPickerOptions.some((o) => !o.assigned)
  const hasFreeCenters = centerPickerOptions.some((o) => !o.assigned)
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

  const specialtyPlaceholder = !specialtyPickerOptions.length
    ? 'Sin especialidades registradas'
    : !hasFreeSpecialties
      ? 'Todas ya están asignadas'
      : 'Selecciona una especialidad…'
  const centerPlaceholder = !centerPickerOptions.length
    ? 'Sin centros médicos registrados'
    : !hasFreeCenters
      ? 'Todos ya están asignados'
      : 'Selecciona un centro médico…'

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
              inputMode="tel"
              placeholder="(809) 555-1234"
              {...register('phone')}
              onChange={(event) =>
                setValue('phone', maskPhoneInput(event.target.value), {
                  shouldDirty: true,
                })
              }
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
              <TextAreaField
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
          action={
            <Button
              type="button"
              variant="ghost"
              className="size-6 px-0"
              aria-expanded={specialtyPickerOpen}
              aria-label={
                specialtyPickerOpen
                  ? 'Ocultar selector de especialidad'
                  : 'Mostrar selector de especialidad'
              }
              onClick={() => setSpecialtyPickerOpen((open) => !open)}
            >
              {specialtyPickerOpen ? (
                <X className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
            </Button>
          }
        >
          {specialtyOptions.isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <>
              {specialtyPickerOpen && (
                <div className="flex flex-wrap items-end gap-2">
                  <PickerSelect
                    label="Especialidad"
                    placeholder={specialtyPlaceholder}
                    options={specialtyPickerOptions}
                    onPick={addSpecialty}
                    disabled={!hasFreeSpecialties}
                  />
                  {canWriteSpecialties && (
                    <AddButton
                      label="Nueva Especialidad"
                      onClick={() => setSpecialtyFormOpen(true)}
                    />
                  )}
                </div>
              )}
              {specialtyOptions.isError && (
                <p role="alert" className="text-sm text-red-700">
                  No pudimos cargar las especialidades.{' '}
                  {specialtyOptions.error instanceof Error
                    ? specialtyOptions.error.message
                    : ''}
                </p>
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
          action={
            <Button
              type="button"
              variant="ghost"
              className="size-6 px-0"
              aria-expanded={centerPickerOpen}
              aria-label={
                centerPickerOpen
                  ? 'Ocultar selector de centro médico'
                  : 'Mostrar selector de centro médico'
              }
              onClick={() => setCenterPickerOpen((open) => !open)}
            >
              {centerPickerOpen ? (
                <X className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
            </Button>
          }
        >
          {centerOptions.isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <>
              {centerPickerOpen && (
                <div className="flex flex-wrap items-end gap-2">
                  <PickerSelect
                    label="Centro médico"
                    placeholder={centerPlaceholder}
                    options={centerPickerOptions}
                    onPick={addMedicalCenter}
                    disabled={!hasFreeCenters}
                    assignedSuffix="ya asignado"
                  />
                  {canWriteCenters && (
                    <AddButton
                      label="Nuevo Centro Médico"
                      onClick={() => setCenterFormOpen(true)}
                    />
                  )}
                </div>
              )}
              {centerOptions.isError && (
                <p role="alert" className="text-sm text-red-700">
                  No pudimos cargar los centros médicos.{' '}
                  {centerOptions.error instanceof Error
                    ? centerOptions.error.message
                    : ''}
                </p>
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
