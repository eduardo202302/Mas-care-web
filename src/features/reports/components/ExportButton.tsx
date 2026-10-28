import { useState } from 'react'
import { Download, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCan } from '@/lib/permissions'
import { useUiStore, type ReportCsvSeparator } from '@/stores/ui-store'
import type { ReportFilters, ReportType } from '@/lib/reports'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

const separatorLabels: Record<ReportCsvSeparator, string> = {
  ',': 'Coma (,)',
  ';': 'Punto y coma (;)',
}

function buildExportUrl(type: ReportType, filters: ReportFilters, separator: ReportCsvSeparator) {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.branch_id.length > 0) params.set('branch_id', filters.branch_id.join(','))
  params.set('separator', separator === ',' ? 'comma' : 'semicolon')
  return `${API_URL}/api/v1/reports/export/${type}?${params.toString()}`
}

/**
 * CSV export button. Hidden from the DOM entirely (not just CSS) when the
 * user lacks `export:csv` — a role without the permission never sees this
 * control render at all, matching the owner/admin-only backend gate.
 * Shows a patient-data notice only when the response itself carried the
 * `X-Contains-Patient-Data` header — never assumed from the report type,
 * even though in practice it lines up with overdue/no-response.
 */
export function ExportButton({ type, filters }: { type: ReportType; filters: ReportFilters }) {
  const canExport = useCan('export:csv')
  const separator = useUiStore((state) => state.reportCsvSeparator)
  const setSeparator = useUiStore((state) => state.setReportCsvSeparator)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [containsPatientData, setContainsPatientData] = useState(false)

  if (!canExport) return null

  async function handleExport() {
    setState('loading')
    setError(null)
    try {
      const response = await fetch(buildExportUrl(type, filters, separator), {
        credentials: 'include',
      })
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permiso para exportar este informe.')
        }
        if (response.status === 413) {
          throw new Error(
            'El informe tiene demasiadas filas para exportar. Acota el periodo o las sucursales.',
          )
        }
        if (response.status === 429) {
          throw new Error('Demasiadas exportaciones en poco tiempo. Intenta de nuevo en unos minutos.')
        }
        throw new Error('No pudimos generar el archivo. Intenta de nuevo.')
      }
      const hasPatientData = response.headers.get('X-Contains-Patient-Data') === 'true'
      setContainsPatientData(hasPatientData)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setState('idle')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos generar el archivo.')
      setState('error')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <label className="flex items-center gap-1.5 text-xs">
        <span className="text-muted font-medium">Separador</span>
        <select
          aria-label="Separador del CSV"
          value={separator}
          onChange={(event) => setSeparator(event.target.value as ReportCsvSeparator)}
          className="border-border h-8 rounded-lg border bg-white px-2 text-xs outline-none"
        >
          {Object.entries(separatorLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        className="h-8"
        onClick={handleExport}
        disabled={state === 'loading'}
      >
        <Download className="size-3.5" />
        {state === 'loading' ? 'Exportando…' : 'Exportar CSV'}
      </Button>
      {containsPatientData && (
        <span className="text-expired-text flex items-center gap-1 text-xs font-medium">
          <TriangleAlert className="size-3.5" />
          Contiene datos de pacientes
        </span>
      )}
      {error && (
        <span role="alert" className="text-xs text-red-700">
          {error}
        </span>
      )}
    </div>
  )
}
