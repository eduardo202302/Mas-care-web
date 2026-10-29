import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type ExportEntity = 'patients' | 'medications' | 'cycles'
export type ExportFilters = { q?: string; branchId?: string; status?: string }

type Format = 'csv' | 'xlsx'

/** Export dialog: pick columns and format, then download. Hidden without `export:csv`. */
export function ExportButton({
  entity,
  filters = {},
}: {
  entity: ExportEntity
  filters?: ExportFilters
}) {
  const canExport = useCan('export:csv')
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<Format>('csv')
  const [selected, setSelected] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const catalog = useQuery({
    queryKey: ['export-columns', entity],
    queryFn: () =>
      api<{ columns: { key: string; header: string }[] }>(
        `/api/v1/exports/${entity}/columns`,
      ),
    enabled: canExport && open,
  })
  if (!canExport) return null

  const columns = catalog.data?.columns ?? []
  const chosen = selected ?? columns.map((column) => column.key)

  async function download() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/v1/exports/${entity}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          columns: chosen,
          ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value),
          ),
        }),
      })
      if (!response.ok) {
        const payload = (await response.json().catch(() => undefined)) as
          | { error?: { message?: string } }
          | undefined
        throw new Error(payload?.error?.message ?? 'No pudimos generar el archivo.')
      }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `${entity}.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setOpen(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos generar el archivo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Download className="size-4" />
        Exportar
      </Button>
      {open && (
        <Dialog
          title="Exportar"
          description="El archivo contiene datos de pacientes. Cada exportación queda registrada."
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-4">
            <label className="grid gap-1 text-sm font-medium">
              Formato
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as Format)}
                className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX (Excel)</option>
              </select>
            </label>
            <fieldset className="grid max-h-64 gap-1.5 overflow-y-auto">
              <legend className="mb-1 text-sm font-medium">Columnas</legend>
              {columns.map((column) => (
                <label key={column.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={chosen.includes(column.key)}
                    onChange={(event) =>
                      setSelected(
                        event.target.checked
                          ? [...chosen, column.key]
                          : chosen.filter((key) => key !== column.key),
                      )
                    }
                  />
                  {column.header}
                </label>
              ))}
            </fieldset>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={busy || chosen.length === 0}
                onClick={download}
              >
                {busy ? 'Exportando…' : 'Descargar'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}
