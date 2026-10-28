import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldPath } from 'react-hook-form'
import { CalendarDays, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  coveragePreview,
  formatDateValue,
  medicationName,
  todayInputValue,
  type Medication,
  type Treatment,
} from '@/lib/treatments'
import { treatmentSchema, type TreatmentFormValues } from '@/schemas/treatment'

type BranchOption = Pick<components['schemas']['Branch'], 'id' | 'name'>
type UserOption = Pick<components['schemas']['OrganizationUser'], 'id' | 'name'>

const serverFields: Record<string, FieldPath<TreatmentFormValues>> = {
  medication_id: 'medicationId',
  dose_per_intake: 'dosePerIntake',
  intakes_per_day: 'intakesPerDay',
  quantity_per_cycle: 'quantityPerCycle',
  start_date: 'startDate',
  prescriber_name: 'prescriberName',
  prescription_expires_on: 'prescriptionExpiresOn',
  branch_id: 'branchId',
  responsible_user_id: 'responsibleUserId',
  notes: 'notes',
}

const fieldClass =
  'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2 aria-[invalid=true]:border-red-400'

export function TreatmentForm({
  treatment,
  medications,
  branches,
  users,
  defaultBranchId,
  defaultResponsibleUserId,
  onSave,
  onCancel,
  submitting = false,
}: {
  treatment?: Treatment
  medications: Medication[]
  branches: BranchOption[]
  users: UserOption[]
  defaultBranchId?: string
  defaultResponsibleUserId?: string | null
  onSave: (values: TreatmentFormValues) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const selectedAtOpen = treatment
    ? medications.find((medication) => medication.id === treatment.medicationId)
    : undefined
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState(
    selectedAtOpen ? medicationName(selectedAtOpen) : '',
  )
  const [listOpen, setListOpen] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: treatment
      ? {
          medicationId: treatment.medicationId,
          dosePerIntake: Number(treatment.dosePerIntake),
          intakesPerDay: Number(treatment.intakesPerDay),
          quantityPerCycle: Number(treatment.quantityPerCycle),
          startDate: treatment.startDate.slice(0, 10),
          prescriberName: treatment.prescriberName ?? '',
          prescriptionExpiresOn: treatment.prescriptionExpiresOn?.slice(0, 10),
          branchId: treatment.branchId,
          responsibleUserId: treatment.responsibleUserId ?? '',
          notes: treatment.notes ?? '',
        }
      : {
          medicationId: '',
          dosePerIntake: 1,
          intakesPerDay: 1,
          quantityPerCycle: 30,
          startDate: todayInputValue(),
          prescriberName: '',
          prescriptionExpiresOn: '',
          branchId: defaultBranchId ?? branches[0]?.id ?? '',
          responsibleUserId: defaultResponsibleUserId ?? '',
          notes: '',
        },
  })
  const medicationId = watch('medicationId')
  const selectedMedication = medications.find(
    (medication) => medication.id === medicationId,
  )
  const filteredMedications = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    if (!term) return medications.slice(0, 8)
    return medications
      .filter((medication) =>
        [
          medication.brandName,
          medication.genericName,
          medication.activeIngredient,
          medication.presentation,
        ].some((value) => value?.toLocaleLowerCase('es').includes(term)),
      )
      .slice(0, 8)
  }, [medications, search])

  const quantityPerCycle = Number(watch('quantityPerCycle'))
  const dosePerIntake = Number(watch('dosePerIntake'))
  const intakesPerDay = Number(watch('intakesPerDay'))
  const startDate = watch('startDate')
  const preview = coveragePreview({
    quantityPerCycle,
    dosePerIntake,
    intakesPerDay,
    startDate: startDate ?? '',
  })

  function chooseMedication(medication: Medication) {
    setValue('medicationId', medication.id, { shouldValidate: true })
    setSearch(medicationName(medication))
    setListOpen(false)
  }

  function clearMedication() {
    setValue('medicationId', '', { shouldValidate: false })
    setSearch('')
    setListOpen(true)
    searchRef.current?.focus()
  }

  async function submit(values: TreatmentFormValues) {
    try {
      await onSave(values)
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.fields &&
        typeof error.fields === 'object'
      ) {
        let mapped = false
        for (const [key, message] of Object.entries(error.fields)) {
          const field = serverFields[key]
          if (field && typeof message === 'string') {
            setError(field, { type: 'server', message })
            mapped = true
          }
        }
        if (!mapped)
          setError('root.server' as FieldPath<TreatmentFormValues>, {
            type: 'server',
            message: error.message,
          })
      } else {
        setError('root.server' as FieldPath<TreatmentFormValues>, {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'No pudimos guardar el tratamiento.',
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="grid content-start gap-5 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <label
              htmlFor="treatment-medication"
              className="text-ink text-sm font-medium"
            >
              Medicamento <span className="text-red-700">*</span>
            </label>
            {selectedMedication ? (
              <div className="border-border flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2">
                <div className="min-w-0">
                  <p className="text-ink truncate text-sm font-semibold">
                    {medicationName(selectedMedication)}
                  </p>
                  <p className="text-muted truncate text-xs">
                    {selectedMedication.presentation}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 shrink-0 px-2 text-xs"
                  onClick={clearMedication}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <input
                    id="treatment-medication"
                    ref={searchRef}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setValue('medicationId', '')
                      setListOpen(true)
                    }}
                    onFocus={() => setListOpen(true)}
                    onBlur={() =>
                      window.setTimeout(() => setListOpen(false), 120)
                    }
                    placeholder="Buscar por nombre o presentación…"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={listOpen}
                    aria-controls="treatment-medication-options"
                    aria-autocomplete="list"
                    aria-invalid={Boolean(errors.medicationId)}
                    className={`${fieldClass} pr-9 pl-9`}
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Limpiar búsqueda"
                      onClick={() => {
                        setSearch('')
                        searchRef.current?.focus()
                      }}
                      className="text-muted hover:text-ink absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                {listOpen && (
                  <div
                    id="treatment-medication-options"
                    role="listbox"
                    aria-label="Medicamentos"
                    className="border-border mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white p-1 shadow-lg"
                  >
                    {filteredMedications.length ? (
                      filteredMedications.map((medication) => (
                        <button
                          key={medication.id}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => chooseMedication(medication)}
                          className="hover:bg-surface flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left"
                        >
                          <span className="text-ink text-sm font-medium">
                            {medicationName(medication)}
                          </span>
                          <span className="text-muted text-xs">
                            {medication.presentation}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-muted px-3 py-2 text-sm">
                        No encontramos medicamentos con esa búsqueda.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            {errors.medicationId && (
              <p className="text-xs text-red-700">
                {errors.medicationId.message}
              </p>
            )}
            {!medications.length && (
              <p className="text-muted text-xs">
                Primero registra un medicamento en el catálogo.
              </p>
            )}
          </div>
          <TextField
            label="Dosis por toma"
            type="number"
            min="0.001"
            step="any"
            required
            {...register('dosePerIntake', { valueAsNumber: true })}
            error={errors.dosePerIntake?.message}
          />
          <TextField
            label="Tomas por día"
            type="number"
            min="0.001"
            step="any"
            required
            {...register('intakesPerDay', { valueAsNumber: true })}
            error={errors.intakesPerDay?.message}
          />
          <TextField
            label="Cantidad por ciclo"
            type="number"
            min="0.01"
            step="any"
            required
            {...register('quantityPerCycle', { valueAsNumber: true })}
            error={errors.quantityPerCycle?.message}
          />
          <TextField
            label="Fecha de inicio"
            type="date"
            required
            {...register('startDate')}
            error={errors.startDate?.message}
          />
          <TextField
            label="Prescriptor"
            placeholder="Nombre del médico"
            {...register('prescriberName')}
            error={errors.prescriberName?.message}
          />
          <TextField
            label="Vencimiento de receta"
            type="date"
            {...register('prescriptionExpiresOn')}
            error={errors.prescriptionExpiresOn?.message}
          />
          <div className="grid gap-1.5">
            <label
              htmlFor="treatment-branch"
              className="text-ink text-sm font-medium"
            >
              Sucursal <span className="text-red-700">*</span>
            </label>
            <select
              id="treatment-branch"
              {...register('branchId')}
              aria-invalid={Boolean(errors.branchId)}
              className={`${fieldClass} appearance-none`}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {errors.branchId?.message && (
              <p className="text-xs text-red-700">{errors.branchId.message}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <label
              htmlFor="treatment-responsible"
              className="text-ink text-sm font-medium"
            >
              Responsable
            </label>
            <select
              id="treatment-responsible"
              {...register('responsibleUserId')}
              className={`${fieldClass} appearance-none`}
            >
              <option value="">Sin responsable</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <label
              htmlFor="treatment-notes"
              className="text-ink text-sm font-medium"
            >
              Notas
            </label>
            <textarea
              id="treatment-notes"
              rows={3}
              placeholder="Indicaciones adicionales del tratamiento…"
              {...register('notes')}
              className={`${fieldClass} h-auto min-h-20 resize-y py-2.5`}
            />
          </div>
        </div>
        <aside className="border-border bg-surface/60 grid content-start gap-3 self-start rounded-xl border p-4 md:sticky md:top-0">
          <div className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
            <CalendarDays className="size-4" />
            Cobertura estimada
          </div>
          {preview ? (
            <>
              <p className="text-petroleo font-display text-3xl font-bold tracking-tight">
                {preview.days}{' '}
                <span className="text-lg font-semibold">
                  {preview.days === 1 ? 'día' : 'días'}
                </span>
              </p>
              <p className="text-ink text-sm">
                Cubre {preview.days} {preview.days === 1 ? 'día' : 'días'},
                hasta {formatDateValue(preview.endOn)}
              </p>
            </>
          ) : (
            <p className="text-muted text-sm leading-6">
              Completa dosis, tomas, cantidad y fecha de inicio para ver la
              cobertura estimada.
            </p>
          )}
          <p className="text-muted border-border border-t pt-3 text-xs leading-5">
            Cálculo local solo informativo. La API confirma el fin de cobertura.
          </p>
        </aside>
      </div>
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
          disabled={submitting || !medications.length}
        >
          {submitting
            ? 'Guardando…'
            : treatment
              ? 'Guardar cambios'
              : 'Crear tratamiento'}
        </Button>
      </FormActions>
    </form>
  )
}
