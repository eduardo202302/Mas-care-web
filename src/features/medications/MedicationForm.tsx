import { Select } from '@/components/ui/Select'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { ChevronDown, Pill, Plus, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormFields, FormFooter } from '@/components/ui/FormMode'
import { useStatusDraftChanged } from '@/components/ui/StatusDraft'
import { authClient } from '@/lib/auth-client'
import { printTable } from '@/lib/print-table'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import {
  fetchAttachmentBlob,
  listMedicationAttachments,
} from '@/lib/medication-attachments'
import type { components } from '@/lib/api-types'
import {
  medicationSchema,
  type MedicationFormValues,
} from '@/schemas/medication'
import {
  MedicationAttachments,
  type StagedAttachment,
} from './MedicationAttachments'
import { MedicationPhotoViewer } from './MedicationPhotoViewer'
import { DoseUnitsDialog } from './DoseUnitsDialog'
import { useDoseUnits } from './useDoseUnits'

export function MedicationForm({
  readOnly = false,
  onEdit,
  medication,
  onSave,
  onCancel,
  submitting = false,
}: {
  medication?: components['schemas']['Medication']
  onSave: (
    values: MedicationFormValues,
    staged: StagedAttachment[],
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  /** Muestra el formulario bloqueado, como visor de la ficha. */
  readOnly?: boolean
  /** Desbloquea los campos desde el botón Editar del modo ver. */
  onEdit?: () => void
}) {
  const [staged, setStaged] = useState<StagedAttachment[]>([])
  const [unitsDialogOpen, setUnitsDialogOpen] = useState(false)
  const [pendingUnit, setPendingUnit] = useState<string | null>(null)
  const doseUnits = useDoseUnits()
  const unitOptions = doseUnits.data ?? []
  const statusChanged = useStatusDraftChanged()
  const activeOrganization = authClient.useActiveOrganization()
  const organizations = authClient.useListOrganizations()
  const sessionUser = authClient.useSession().data?.user
  const attachments = useQuery({
    queryKey: ['medication-attachments', medication?.id],
    queryFn: () => listMedicationAttachments(medication!.id),
    enabled: Boolean(medication),
  })
  const primaryImageId =
    attachments.data?.find((item) => item.isPrimary)?.id ??
    medication?.primaryImageId
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: medication
      ? {
          brandName: medication.brandName ?? '',
          genericName: medication.genericName ?? '',
          activeIngredient: medication.activeIngredient ?? '',
          presentation: medication.presentation,
          doseUnit: medication.doseUnit,
          unitsPerPackage: Number(medication.unitsPerPackage) || 1,
        }
      : {
          brandName: '',
          genericName: '',
          activeIngredient: '',
          presentation: '',
          doseUnit: '',
          unitsPerPackage: undefined,
        },
  })

  // La unidad que se acaba de crear (o renombrar) en el diálogo se selecciona
  // aquí, pero solo cuando ya es una opción del <Select>: un valor que aún no
  // existe como opción el navegador lo ignora.
  useEffect(() => {
    if (!pendingUnit || !unitOptions.some((unit) => unit.name === pendingUnit))
      return
    setValue('doseUnit', pendingUnit, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setPendingUnit(null)
  }, [pendingUnit, unitOptions, setValue])

  async function printMedication() {
    const values = getValues()
    let imageUrl: string | undefined
    try {
      const stagedImage = staged.find(
        (item) => item.isPrimary && item.file.type.startsWith('image/'),
      )
      const blob = stagedImage
        ? stagedImage.file
        : medication && primaryImageId
          ? await fetchAttachmentBlob(medication.id, primaryImageId)
          : undefined
      if (blob) {
        imageUrl = URL.createObjectURL(blob)
        const objectUrl = imageUrl
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
      }
    } catch {
      imageUrl = undefined
    }
    printTable({
      imageUrl,
      company:
        activeOrganization.data?.name ?? organizations.data?.[0]?.name ?? '',
      user: sessionUser?.name || sessionUser?.email,
      title: 'Medicamento',
      headers: [
        'Nombre Comercial',
        'Nombre Genérico',
        'Principio Activo',
        'Presentación',
        'Unidad de Dosis',
        'Unidades por Envase',
      ],
      rows: [
        [
          values.brandName ?? '',
          values.genericName ?? '',
          values.activeIngredient ?? '',
          values.presentation ?? '',
          values.doseUnit ?? '',
          Number.isFinite(values.unitsPerPackage)
            ? String(values.unitsPerPackage)
            : '',
        ],
      ],
    })
  }

  async function submit(values: MedicationFormValues) {
    try {
      await onSave(values, staged)
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in medicationSchema.shape && typeof message === 'string')
            setError(key as FieldPath<MedicationFormValues>, {
              type: 'server',
              message,
            })
        }
      } else {
        setError('root.server' as FieldPath<MedicationFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar el medicamento.',
        })
      }
    }
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit(submit)} className="grid gap-5">
        <FormFields readOnly={readOnly}>
          <ModalSection
            icon={<Pill className="size-4" />}
            title="Identificación"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Nombre Comercial"
                required
                {...register('brandName')}
                error={errors.brandName?.message}
              />
              <TextField
                label="Nombre Genérico"
                {...register('genericName')}
                error={errors.genericName?.message}
              />
              <TextField
                label="Principio Activo"
                {...register('activeIngredient')}
                error={errors.activeIngredient?.message}
              />
              {medication && primaryImageId && (
                <MedicationPhotoViewer
                  medicationId={medication.id}
                  attachmentId={primaryImageId}
                  fileName={
                    attachments.data?.find((item) => item.id === primaryImageId)
                      ?.originalName
                  }
                  title={medication.genericName || medication.brandName || ''}
                />
              )}
            </div>
          </ModalSection>

          <ModalSection
            icon={<Pill className="size-4" />}
            title="Presentación Y Dosis"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Presentación"
                required
                placeholder="Caja con tabletas"
                {...register('presentation')}
                error={errors.presentation?.message}
              />
              <div className="grid content-start gap-1.5">
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor="dose-unit"
                    className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']"
                  >
                    Unidad de Dosis
                  </label>
                  <button
                    type="button"
                    aria-label="Administrar unidades de dosis"
                    title="Crear o administrar unidades de dosis"
                    onClick={() => setUnitsDialogOpen(true)}
                    className="text-petroleo hover:bg-modulos focus-visible:ring-tealmax flex size-6 items-center justify-center rounded-md transition focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <div className="relative">
                  <Select
                    id="dose-unit"
                    aria-invalid={Boolean(errors.doseUnit)}
                    {...register('doseUnit')}
                    className="border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400"
                  >
                    <option value="">Selecciona una unidad</option>
                    {medication?.doseUnit &&
                      !unitOptions.some(
                        (unit) => unit.name === medication.doseUnit,
                      ) && (
                        <option value={medication.doseUnit}>
                          {medication.doseUnit}
                        </option>
                      )}
                    {unitOptions.map((unit) => (
                      <option key={unit.id} value={unit.name}>
                        {unit.name}
                      </option>
                    ))}
                  </Select>
                  <ChevronDown
                    className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                </div>
                {errors.doseUnit?.message && (
                  <p className="text-xs text-red-700">
                    {errors.doseUnit.message}
                  </p>
                )}
              </div>
              <TextField
                label="Unidades por Envase"
                type="number"
                min="0.01"
                step="any"
                required
                {...register('unitsPerPackage', { valueAsNumber: true })}
                error={errors.unitsPerPackage?.message}
              />
            </div>
          </ModalSection>

          {errors.root?.server?.message && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
            >
              {errors.root.server.message}
            </p>
          )}
        </FormFields>
        <MedicationAttachments
          medicationId={medication?.id}
          readOnly={readOnly}
          staged={staged}
          onStagedChange={setStaged}
        />
        <FormFooter
          readOnly={readOnly}
          onEdit={onEdit}
          extra={
            <Button
              type="button"
              className="w-full bg-white hover:bg-[#c3e9cf] sm:w-auto"
              onClick={printMedication}
            >
              <Printer className="size-4" />
              Imprimir
            </Button>
          }
          onClose={onCancel}
          submitting={submitting}
          unchanged={Boolean(medication) && !isDirty && !statusChanged}
          submitLabel={medication ? 'Guardar Cambios' : 'Crear Medicamento'}
        />
      </form>
      {unitsDialogOpen && (
        <DoseUnitsDialog
          units={unitOptions}
          onCreated={setPendingUnit}
          onRenamed={(from, to) => {
            if (getValues('doseUnit') === from) setPendingUnit(to)
          }}
          onClose={() => setUnitsDialogOpen(false)}
        />
      )}
    </>
  )
}
