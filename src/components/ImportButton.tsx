import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { useCustomProperties } from '@/lib/custom-properties'
import { useCan } from '@/lib/permissions'

type Entity = 'patients' | 'medications' | 'treatments'
type Field = { key: string; label: string; required?: boolean }

const FIELDS: Record<Entity, Field[]> = {
  patients: [
    { key: 'fullName', label: 'Nombre', required: true },
    { key: 'documentId', label: 'Documento' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'email', label: 'Correo' },
    { key: 'birthDate', label: 'Fecha de nacimiento' },
    { key: 'primaryBranchId', label: 'Sucursal' },
    { key: 'address', label: 'Dirección' },
    { key: 'zone', label: 'Zona' },
  ],
  treatments: [
    { key: 'patientDocumentId', label: 'Documento del paciente' },
    { key: 'patientPhone', label: 'Teléfono del paciente' },
    { key: 'medication', label: 'Medicamento', required: true },
    { key: 'presentation', label: 'Presentación' },
    { key: 'dosePerIntake', label: 'Dosis por toma', required: true },
    { key: 'intakesPerDay', label: 'Tomas por día', required: true },
    { key: 'quantityPerCycle', label: 'Cantidad por ciclo', required: true },
    { key: 'startDate', label: 'Fecha de inicio', required: true },
    { key: 'branch', label: 'Sucursal' },
    { key: 'endDate', label: 'Fecha de fin' },
    { key: 'prescriberName', label: 'Médico' },
    { key: 'prescriptionExpiresOn', label: 'Vencimiento de la receta' },
    { key: 'notes', label: 'Notas' },
  ],
  medications: [
    { key: 'presentation', label: 'Presentación', required: true },
    { key: 'genericName', label: 'Nombre genérico' },
    { key: 'brandName', label: 'Marca' },
    { key: 'activeIngredient', label: 'Principio activo' },
    { key: 'doseUnit', label: 'Unidad de dosis' },
    { key: 'unitsPerPackage', label: 'Unidades por envase' },
  ],
}

type RowError = { row: number; message: string; fields?: Record<string, string> }
type Preview = {
  columns: string[]
  total_rows: number
  valid_rows?: number
  error_rows?: number
  errors?: RowError[]
}

const norm = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

/** Upload CSV → map columns → validated preview → explicit confirmation. */
export function ImportButton({ entity, label = 'Importar' }: { entity: Entity; label?: string }) {
  const canImport = useCan('imports:write')
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<Preview | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Patient properties defined by the organization can be filled from a CSV column too (target `custom:<key>`).
  const properties = useCustomProperties(entity === 'treatments' ? 'treatment' : 'patient')
  if (!canImport) return null

  const customFields: Field[] = entity !== 'medications'
    ? (properties.data?.data ?? []).map((property) => ({ key: `custom:${property.key}`, label: property.label, required: property.required }))
    : []
  const fields = [...FIELDS[entity], ...customFields]
  const form = (map: Record<string, string>) => {
    const data = new FormData()
    data.append('file', file!)
    data.append('column_mapping', JSON.stringify(map))
    return data
  }
  const clean = Object.fromEntries(Object.entries(mapping).filter(([, column]) => column))
  // A treatment row finds its patient by document or phone: at least one of the two columns is needed.
  const missingPatient = entity === 'treatments' && !clean.patientDocumentId && !clean.patientPhone
  const missingRequired = missingPatient || fields.some((field) => field.required && !clean[field.key])

  function close() {
    setOpen(false)
    setFile(null)
    setColumns([])
    setMapping({})
    setPreview(null)
    setDone(null)
    setError(null)
  }

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos completar la acción.')
    } finally {
      setBusy(false)
    }
  }

  const pick = (selected: File) =>
    run(async () => {
      const data = new FormData()
      data.append('file', selected)
      const head = await api<Preview>(`/api/v1/imports/${entity}/preview`, { method: 'POST', body: data })
      setFile(selected)
      setColumns(head.columns)
      // Auto-map columns whose header matches the field label or key.
      setMapping(
        Object.fromEntries(
          fields.flatMap((field) => {
            const match = head.columns.find((c) => [norm(field.key), norm(field.label)].includes(norm(c)))
            return match ? [[field.key, match]] : []
          }),
        ),
      )
      setPreview(null)
    })

  const validate = () =>
    run(async () => {
      setPreview(await api<Preview>(`/api/v1/imports/${entity}/preview`, { method: 'POST', body: form(clean) }))
    })

  const confirm = () =>
    run(async () => {
      const result = await api<{ summary: { imported_rows: number; error_rows: number } }>(
        `/api/v1/imports/${entity}`,
        { method: 'POST', body: form(clean) },
      )
      await queryClient.invalidateQueries({ queryKey: [entity] })
      if (entity === 'treatments') await Promise.all(['cycles', 'board', 'pipeline'].map((key) => queryClient.invalidateQueries({ queryKey: [key] })))
      setDone(`${result.summary.imported_rows} filas importadas, ${result.summary.error_rows} omitidas por errores.`)
    })

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        {label}
      </Button>
      {open && (
        <Dialog
          title="Importar desde CSV"
          description="Nada se guarda hasta que confirmes en la vista previa."
          onClose={close}
          size="lg"
        >
          <div className="grid gap-4">
            <input
              type="file"
              accept=".csv,text/csv"
              aria-label="Archivo CSV"
              onChange={(event) => {
                const selected = event.target.files?.[0]
                if (selected) void pick(selected)
              }}
            />
            {columns.length > 0 && !done && (
              <div className="grid gap-2 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.key} className="grid gap-1 text-sm font-medium">
                    {field.label}
                    {field.required && ' *'}
                    <select
                      value={mapping[field.key] ?? ''}
                      onChange={(event) => {
                        setMapping({ ...mapping, [field.key]: event.target.value })
                        setPreview(null)
                      }}
                      className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
                    >
                      <option value="">— No importar —</option>
                      {columns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}
            {preview?.valid_rows !== undefined && (
              <div className="grid gap-2 text-sm" role="status">
                <p>
                  <strong>{preview.valid_rows}</strong> de {preview.total_rows} filas se importarán;{' '}
                  <strong>{preview.error_rows}</strong> tienen errores y se omitirán.
                </p>
                {!!preview.errors?.length && (
                  <ul className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    {preview.errors.map((rowError) => (
                      <li key={rowError.row}>
                        Fila {rowError.row}: {rowError.message}
                        {rowError.fields &&
                          ` (${Object.entries(rowError.fields)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('; ')})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {done && (
              <p role="status" className="text-sm font-medium">
                {done}
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={close}>
                {done ? 'Cerrar' : 'Cancelar'}
              </Button>
              {!done && (
                <Button type="button" disabled={busy || !file || missingRequired} onClick={validate}>
                  Vista previa
                </Button>
              )}
              {!done && (
                <Button
                  type="button"
                  variant="primary"
                  disabled={busy || !preview?.valid_rows}
                  onClick={confirm}
                >
                  Confirmar importación
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
