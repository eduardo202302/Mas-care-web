import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Printer, Tag } from 'lucide-react'
import { cn } from '@/lib/cn'
import { toTitleCase } from '@/lib/titleCase'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import type {
  LabelElement,
  LabelResolvedValues,
  LabelTemplate,
  LabelVariableKey,
} from '@/lib/operations'
import { medicationName, treatmentStatusLabel } from '@/lib/treatments'
import {
  PatientPicker,
  type PickerPatient,
} from '@/features/treatments/PatientPicker'
import {
  LABEL_SIZES,
  LABEL_VARIABLE_LABELS,
  DEFAULT_LABEL_SIZE,
  createElement,
  formatInches,
  labelDims,
  labelSizeChoice,
  type LabelDesign,
  type LabelSizeChoice,
} from './labelConfig'
import { LabelEditor, LabelVariablePalette } from './LabelEditor'
import { LabelPrint } from './LabelSheet'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']
type TreatmentListResponse =
  paths['/api/v1/treatments']['get']['responses'][200]['content']['application/json']
type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']

const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 disabled:opacity-60'

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))
const round2 = (value: number) => Math.round(value * 100) / 100
const MIN_LABEL_IN = 1
const MAX_LABEL_IN = 12

/** Al cambiar el tamaño, la fuente y el alto mínimo escalan con el ancho; x, y y ancho ya son % del papel. */
function scaleElements(elements: LabelElement[], ratio: number): LabelElement[] {
  return elements.map((element) => ({
    ...element,
    fontSize: clamp(round2(element.fontSize * ratio), 6, 72),
    h: element.type === 'line' ? element.h : clamp(round2(element.h * ratio), 4, 400),
  }))
}

export function LabelTemplateFormDialog({
  template,
  onClose,
  onSaved,
}: {
  template?: LabelTemplate
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [branchId, setBranchId] = useState(template?.branchId ?? '')
  const [widthIn, setWidthIn] = useState(
    Number(template?.widthIn ?? DEFAULT_LABEL_SIZE),
  )
  const [heightIn, setHeightIn] = useState(
    Number(template?.heightIn ?? DEFAULT_LABEL_SIZE),
  )
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    template?.orientation ?? 'landscape',
  )
  const [elements, setElements] = useState<LabelElement[]>(template?.elements ?? [])
  const [isActive, setIsActive] = useState(template?.isActive ?? true)
  const [patient, setPatient] = useState<PickerPatient | null>(null)
  const [treatmentChoice, setTreatmentChoice] = useState('')
  const [printing, setPrinting] = useState(false)

  const sizeChoice = labelSizeChoice(widthIn, heightIn)
  const [paperW, paperH] = labelDims(widthIn, heightIn, orientation)
  // Una plantilla heredada con un tamaño que no es 3/4/5 abre directo en "Personalizado".
  const [customMode, setCustomMode] = useState(sizeChoice === 'custom')
  const [customW, setCustomW] = useState(formatInches(paperW))
  const [customH, setCustomH] = useState(formatInches(paperH))

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const medications = useQuery({
    queryKey: ['medications', { archived: 'false', rows: 100 }],
    queryFn: () => api<MedicationList>('/api/v1/medications?archived=false&rows=100'),
    enabled: Boolean(patient),
  })
  const treatments = useQuery({
    queryKey: ['treatments', { patientId: patient?.id, purpose: 'label' }],
    queryFn: () =>
      api<TreatmentListResponse>(
        `/api/v1/treatments?patient_id=${encodeURIComponent(patient!.id)}&limit=100`,
      ),
    enabled: Boolean(patient),
  })

  const treatmentList = treatments.data?.data ?? []
  const medicationById = useMemo(
    () => new Map((medications.data?.data ?? []).map((item) => [item.id, item])),
    [medications.data],
  )
  const defaultTreatmentId =
    (treatmentList.find((item) => item.status === 'active') ?? treatmentList[0])?.id ?? ''
  const treatmentId = treatmentList.some((item) => item.id === treatmentChoice)
    ? treatmentChoice
    : defaultTreatmentId

  const resolved = useQuery({
    queryKey: ['label-templates', 'resolve', patient?.id, treatmentId],
    queryFn: () =>
      api<LabelResolvedValues>(
        `/api/v1/label-templates/resolve?patient_id=${encodeURIComponent(patient!.id)}${
          treatmentId ? `&treatment_id=${encodeURIComponent(treatmentId)}` : ''
        }`,
      ),
    enabled: Boolean(patient) && !treatments.isLoading,
  })
  const previewValues =
    patient && resolved.data ? resolved.data.values : null

  const usedKeys = useMemo(
    () => [
      ...new Set(
        elements.flatMap((element) =>
          element.type === 'variable' ? [element.key] : [],
        ),
      ),
    ],
    [elements],
  )
  const missingKeys = previewValues
    ? usedKeys.filter((key) => !previewValues[key]?.trim())
    : []
  const design: LabelDesign = { widthIn, heightIn, orientation, elements }
  const canPrint =
    elements.length > 0 && (usedKeys.length === 0 || Boolean(previewValues))

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        branch_id: branchId || null,
        width_in: widthIn,
        height_in: heightIn,
        orientation,
        elements,
        is_active: isActive,
      }
      return template
        ? api<LabelTemplate>(
            `/api/v1/label-templates/${encodeURIComponent(template.id)}`,
            { method: 'PATCH', body: JSON.stringify(payload) },
          )
        : api<LabelTemplate>('/api/v1/label-templates', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['label-templates'] })
      onSaved(template ? 'Etiqueta actualizada.' : 'Etiqueta creada.')
      onClose()
    },
  })

  function changeSize(choice: LabelSizeChoice) {
    if (choice === 'custom') {
      setCustomW(formatInches(paperW))
      setCustomH(formatInches(paperH))
      setCustomMode(true)
      return
    }
    setCustomMode(false)
    const next = Number(choice)
    const ratio = next / paperW
    setElements((current) => scaleElements(current, ratio))
    setWidthIn(next)
    setHeightIn(next)
    setOrientation('landscape')
  }

  /** Aplica el ancho y alto escritos (en pulgadas); un valor vacío o fuera de rango se corrige al límite o se descarta. */
  function commitCustomSize() {
    const parsedW = Number(customW)
    const parsedH = Number(customH)
    const nextW = customW.trim() && Number.isFinite(parsedW) ? round2(clamp(parsedW, MIN_LABEL_IN, MAX_LABEL_IN)) : paperW
    const nextH = customH.trim() && Number.isFinite(parsedH) ? round2(clamp(parsedH, MIN_LABEL_IN, MAX_LABEL_IN)) : paperH
    setCustomW(formatInches(nextW))
    setCustomH(formatInches(nextH))
    if (nextW === paperW && nextH === paperH) return
    if (nextW !== paperW) {
      const ratio = nextW / paperW
      setElements((current) => scaleElements(current, ratio))
    }
    setWidthIn(nextW)
    setHeightIn(nextH)
    setOrientation(nextW >= nextH ? 'landscape' : 'portrait')
  }

  function addVariable(key: LabelVariableKey) {
    setElements((current) => [
      ...current,
      createElement(
        { type: 'variable', key },
        { y: Math.min(85, 6 + (current.length % 9) * 9), elements: current, widthIn: paperW },
      ),
    ])
  }

  return (
    <Dialog
      title={template ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
      icon={<Tag className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
      size="xl"
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim() || save.isPending) return
          save.mutate()
        }}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-12">
          <div className={cn('col-span-2', customMode ? 'lg:col-span-3' : 'lg:col-span-4')}>
            <TextField
              label="Nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
              placeholder="Etiqueta de Medicamento"
            />
          </div>
          <label className="col-span-2 grid gap-1.5 sm:col-span-1 lg:col-span-3">
            <span className="text-ink text-sm font-medium">Sucursal</span>
            <select
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              className={control}
            >
              <option value="">Toda la Organización</option>
              {(branches.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 grid gap-1.5 sm:col-span-1 lg:col-span-2">
            <span className="text-ink text-sm font-medium">Tamaño</span>
            <select
              value={customMode ? 'custom' : sizeChoice}
              onChange={(event) => changeSize(event.target.value as LabelSizeChoice)}
              className={control}
            >
              {LABEL_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} × {size} in
                </option>
              ))}
              <option value="custom">Personalizado</option>
            </select>
          </label>
          {customMode && (
            <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 lg:col-span-3">
              {(
                [
                  ['Ancho (in)', customW, setCustomW],
                  ['Alto (in)', customH, setCustomH],
                ] as const
              ).map(([label, value, setValue]) => (
                <label key={label} className="grid min-w-0 gap-1.5">
                  <span className="text-ink text-sm font-medium">{label}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={MIN_LABEL_IN}
                    max={MAX_LABEL_IN}
                    step={0.25}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onBlur={commitCustomSize}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      commitCustomSize()
                    }}
                    className={control}
                  />
                </label>
              ))}
            </div>
          )}
          <label className="col-span-2 flex h-10 items-center gap-2 self-end text-sm sm:col-span-1 lg:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="border-border text-tealmax size-4 rounded"
            />
            <span className="text-ink">Etiqueta Activa</span>
          </label>
        </div>

        <div className="grid items-start gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <PatientPicker
              inline
              label="Paciente para la Vista Previa"
              required={false}
              value={patient}
              onChange={(next) => {
                setPatient(next)
                setTreatmentChoice('')
              }}
            />
          </div>
          <label className="grid gap-1.5 lg:col-span-6">
            <span className="text-ink text-sm font-medium">Tratamiento</span>
            <select
              value={treatmentId}
              onChange={(event) => setTreatmentChoice(event.target.value)}
              disabled={!patient || treatmentList.length === 0}
              className={control}
            >
              {!patient ? (
                <option value="">Selecciona un Paciente</option>
              ) : treatments.isLoading ? (
                <option value="">Cargando Tratamientos…</option>
              ) : treatmentList.length === 0 ? (
                <option value="">Sin Tratamientos</option>
              ) : (
                treatmentList.map((item) => {
                  const medication = medicationName(medicationById.get(item.medicationId))
                  const status =
                    item.status === 'active' ? '' : ` (${treatmentStatusLabel(item.status)})`
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name ? `${item.name} · ${medication}` : medication}
                      {status}
                    </option>
                  )
                })
              )}
            </select>
          </label>
        </div>

        <PreviewStatus
          hasPatient={Boolean(patient)}
          loading={Boolean(patient) && (treatments.isLoading || resolved.isLoading)}
          error={resolved.isError ? resolved.error.message : null}
          noTreatments={Boolean(patient) && !treatments.isLoading && treatmentList.length === 0}
          missingKeys={missingKeys}
        />

        <div className="grid gap-3 lg:grid-cols-[190px_minmax(0,1fr)]">
          <div className="border-border order-2 max-h-[560px] overflow-y-auto rounded-lg border bg-white p-3 lg:order-1">
            <p className="text-muted mb-2 text-xs">Arrastra O Haz Clic para Agregar.</p>
            <LabelVariablePalette onAdd={addVariable} />
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <LabelEditor
              widthIn={widthIn}
              heightIn={heightIn}
              orientation={orientation}
              elements={elements}
              onChange={setElements}
              previewValues={previewValues}
            />
          </div>
        </div>

        <TextField
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={300}
          placeholder="Para Qué Tratamientos O Sucursal Se Usa Esta Etiqueta"
        />

        {save.isError && (
          <p role="alert" className="text-sm text-red-700">
            {toTitleCase('No pudimos guardar la etiqueta.')} {save.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canPrint}
            onClick={() => setPrinting(true)}
            title={
              canPrint
                ? `Imprime Solo la Etiqueta (${formatInches(paperW)} × ${formatInches(paperH)} in)`
                : elements.length === 0
                  ? 'Agrega Elementos A la Etiqueta para Imprimirla'
                  : 'Selecciona un Paciente para Imprimir con Sus Datos'
            }
          >
            <Printer className="size-4" />
            Imprimir
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim() || save.isPending}>
            {save.isPending ? 'Guardando…' : 'Guardar Etiqueta'}
          </Button>
        </FormActions>
      </form>

      {printing && (
        <LabelPrint
          design={design}
          values={previewValues}
          onDone={() => setPrinting(false)}
        />
      )}
    </Dialog>
  )
}

function PreviewStatus({
  hasPatient,
  loading,
  error,
  noTreatments,
  missingKeys,
}: {
  hasPatient: boolean
  loading: boolean
  error: string | null
  noTreatments: boolean
  missingKeys: LabelVariableKey[]
}) {
  if (!hasPatient) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {toTitleCase(
          'Selecciona un paciente para ver sus datos reales en la etiqueta. Sin paciente, las variables aparecen como marcadores y no se puede imprimir una etiqueta con datos.',
        )}
      </p>
    )
  }
  if (error) {
    return (
      <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
        {toTitleCase('No pudimos cargar los datos del paciente.')} {error}
      </p>
    )
  }
  if (loading) return <p className="text-muted text-xs">Cargando Datos del Paciente…</p>
  const notes: string[] = []
  if (noTreatments) {
    notes.push(
      toTitleCase(
        'Este paciente no tiene tratamientos: las variables de Medicamento y Tratamiento no tendrán información.',
      ),
    )
  }
  if (missingKeys.length) {
    notes.push(
      `${toTitleCase('Sin información para:')} ${missingKeys.map((key) => toTitleCase(LABEL_VARIABLE_LABELS[key])).join(', ')}.`,
    )
  }
  if (!notes.length) return null
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      {notes.join(' ')}
    </p>
  )
}
