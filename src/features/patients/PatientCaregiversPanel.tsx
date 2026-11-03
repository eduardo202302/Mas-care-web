import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Pencil, Users, X } from 'lucide-react'
import { AddressMapPicker } from '@/components/AddressMapPicker'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError, api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { formatPhone, maskPhoneInput } from '@/lib/phone'
import type { paths } from '@/lib/api-types'

export type CaregiverList =
  paths['/api/v1/patients/{id}/caregivers']['get']['responses'][200]['content']['application/json']
export type Caregiver = CaregiverList['data'][number]

export function addressText(
  details: Caregiver['addressDetails'],
  key: string,
): string {
  const value = (details as Record<string, unknown> | null)?.[key]
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

export function PatientCaregiversPanel({
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
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [address, setAddress] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [sector, setSector] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)

  const caregivers = useQuery({
    queryKey: ['patients', patientId, 'caregivers'],
    queryFn: () =>
      api<CaregiverList>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/caregivers`,
      ),
    enabled: Boolean(patientId),
  })

  function invalidate() {
    return queryClient.invalidateQueries({
      queryKey: ['patients', patientId, 'caregivers'],
    })
  }
  function buildPayload() {
    return {
      fullName: fullName.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
      addressDetails: {
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(state.trim() ? { region: state.trim() } : {}),
        ...(city.trim() ? { city: city.trim() } : {}),
        ...(sector.trim() ? { sector: sector.trim() } : {}),
        ...(latitude.trim() ? { latitude: Number(latitude) } : {}),
        ...(longitude.trim() ? { longitude: Number(longitude) } : {}),
      },
      isPrimary,
    }
  }
  const add = useMutation({
    mutationFn: () =>
      api<Caregiver>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/caregivers`,
        { method: 'POST', body: JSON.stringify(buildPayload()) },
      ),
    onSuccess: async () => {
      await invalidate()
      closeDialog()
    },
  })
  const update = useMutation({
    mutationFn: () =>
      api<Caregiver>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/caregivers/${encodeURIComponent(editingId!)}`,
        { method: 'PATCH', body: JSON.stringify(buildPayload()) },
      ),
    onSuccess: async () => {
      await invalidate()
      closeDialog()
    },
  })
  const remove = useMutation({
    mutationFn: (caregiverId: string) =>
      api<Caregiver>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/caregivers/${encodeURIComponent(caregiverId)}`,
        { method: 'DELETE' },
      ),
    onSuccess: invalidate,
  })

  function openEdit(caregiver: Caregiver) {
    setEditingId(caregiver.id)
    setFullName(caregiver.fullName)
    setPhone(maskPhoneInput(caregiver.phone))
    setRelationship(caregiver.relationship)
    setAddress(addressText(caregiver.addressDetails, 'address'))
    setState(addressText(caregiver.addressDetails, 'region'))
    setCity(addressText(caregiver.addressDetails, 'city'))
    setSector(addressText(caregiver.addressDetails, 'sector'))
    setLatitude(addressText(caregiver.addressDetails, 'latitude'))
    setLongitude(addressText(caregiver.addressDetails, 'longitude'))
    setIsPrimary(caregiver.isPrimary)
  }

  function closeDialog() {
    setEditingId(null)
    setFullName('')
    setPhone('')
    setRelationship('')
    setAddress('')
    setState('')
    setCity('')
    setSector('')
    setLatitude('')
    setLongitude('')
    setIsPrimary(false)
    add.reset()
    update.reset()
    onCloseAdd()
  }

  const items = caregivers.data?.data ?? []
  const dialogOpen = addOpen || Boolean(editingId)
  const saving = editingId ? update : add

  return (
    <>
      {caregivers.isLoading ? (
        <p className="text-muted text-sm">Cargando cuidadores…</p>
      ) : caregivers.isError ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar los cuidadores del paciente.{' '}
          {caregivers.error instanceof Error ? caregivers.error.message : ''}
        </p>
      ) : items.length ? (
        <ul className="grid gap-3">
          {items.map((caregiver) => {
            const location = [
              addressText(caregiver.addressDetails, 'address'),
              addressText(caregiver.addressDetails, 'city'),
              addressText(caregiver.addressDetails, 'region'),
              addressText(caregiver.addressDetails, 'sector'),
            ]
              .filter(Boolean)
              .join(' · ')
            return (
              <li
                key={caregiver.id}
                className="border-border flex items-start justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-ink text-sm font-semibold">
                    {caregiver.fullName}
                    {caregiver.isPrimary && (
                      <span className="bg-tealmax/10 text-tealmax ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                        Principal
                      </span>
                    )}
                  </p>
                  <p className="text-muted mt-0.5 text-xs">
                    {caregiver.relationship} · {formatPhone(caregiver.phone)}
                  </p>
                  {location && (
                    <p className="text-muted mt-0.5 text-xs">{location}</p>
                  )}
                </div>
                {canWrite && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => openEdit(caregiver)}
                      className="text-muted hover:text-tealmax"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Quitar"
                      onClick={() => remove.mutate(caregiver.id)}
                      className="text-muted hover:text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-muted text-sm">No hay cuidadores registrados.</p>
      )}
      {dialogOpen && (
        <Dialog
          title={editingId ? 'Editar Cuidador' : 'Agregar Cuidador'}
          description={
            editingId
              ? 'Actualiza los datos de este cuidador.'
              : 'Registra un cuidador para este paciente.'
          }
          icon={<Users className="size-5" />}
          compactHeader
          size="lg"
          bodyClassName="pt-3"
          onClose={closeDialog}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              saving.mutate()
            }}
          >
            <ModalSection
              icon={<Users className="size-4" />}
              title="Datos del Cuidador"
              tone="mint"
            >
              <div className="grid items-start gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <TextField
                    label="Nombre completo"
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                  <label className="text-ink flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      onChange={(event) => setIsPrimary(event.target.checked)}
                    />
                    Cuidador Principal
                  </label>
                </div>
                <TextField
                  label="WhatsApp"
                  type="tel"
                  inputMode="tel"
                  placeholder="(809) 555-1234"
                  required
                  value={phone}
                  onChange={(event) =>
                    setPhone(maskPhoneInput(event.target.value))
                  }
                />
                <TextField
                  label="Parentesco"
                  required
                  value={relationship}
                  onChange={(event) => setRelationship(event.target.value)}
                />
              </div>
            </ModalSection>
            <ModalSection
              icon={<MapPin className="size-4" />}
              title="Dirección"
              tone="amber"
              action={
                <AddressMapPicker
                  getValues={() => ({
                    address,
                    city,
                    state,
                    sector,
                    latitude,
                    longitude,
                  })}
                  onApply={(next) => {
                    setAddress(next.address)
                    setCity(next.city)
                    setState(next.state)
                    setSector(next.sector)
                    setLatitude(next.latitude)
                    setLongitude(next.longitude)
                  }}
                />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextField
                    label="Dirección"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
                <TextField
                  label="Región"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                />
                <TextField
                  label="Ciudad"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
                <TextField
                  label="Sector"
                  value={sector}
                  onChange={(event) => setSector(event.target.value)}
                />
                <TextField
                  label="Latitud"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                />
                <TextField
                  label="Longitud"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                />
              </div>
            </ModalSection>
            {saving.isError && (
              <p role="alert" className="text-sm text-red-700">
                {saving.error instanceof ApiError
                  ? saving.error.message
                  : 'No pudimos guardar al cuidador.'}
              </p>
            )}
            <FormActions>
              <Button type="button" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  saving.isPending ||
                  !fullName.trim() ||
                  !phone.trim() ||
                  !relationship.trim()
                }
              >
                {saving.isPending
                  ? 'Guardando…'
                  : editingId
                    ? 'Guardar Cambios'
                    : 'Agregar Cuidador'}
              </Button>
            </FormActions>
          </form>
        </Dialog>
      )}
    </>
  )
}
