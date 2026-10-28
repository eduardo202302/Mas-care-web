import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { isReportType, reportLabels } from '@/lib/reports'
import { useUiStore } from '@/stores/ui-store'
import { ReportFilterBar, useReportFilters } from './FilterBar'
import { AdherenceReport } from './types/AdherenceReport'
import { OverdueReport } from './types/OverdueReport'
import { NoResponseReport } from './types/NoResponseReport'
import { RefillsReport } from './types/RefillsReport'
import { TreatmentsFlowReport } from './types/TreatmentsFlowReport'
import { TransfersReport } from './types/TransfersReport'

/**
 * Dynamic /informes/:tipo route. Validates `:tipo` against the 6 known
 * report ids before rendering anything else — an unknown id gets a plain
 * "informe no válido" empty state, never a crash or the generic 404 (the
 * route itself is always allowed, see alwaysAllowedPaths in lib/menu.ts).
 */
export default function ReportPage() {
  const { tipo } = useParams<{ tipo: string }>()
  const [filters, setFilters] = useReportFilters()
  const setLastReportType = useUiStore((state) => state.setLastReportType)

  const valid = tipo !== undefined && isReportType(tipo)

  useEffect(() => {
    if (valid && tipo) setLastReportType(tipo)
  }, [setLastReportType, tipo, valid])

  if (!tipo || !isReportType(tipo)) {
    return (
      <div className="animate-in">
        <EmptyState
          title="Informe no válido"
          description="Elige uno de los informes disponibles desde la lista de Informes."
          action={
            <span className="text-muted flex items-center gap-2 text-sm">
              <FileQuestion className="size-4" />
              Revisa la dirección e inténtalo de nuevo.
            </span>
          }
        />
      </div>
    )
  }

  return (
    <div className="animate-in report-print-page">
      <header className="mb-5">
        <p className="text-tealmax mb-2 text-sm font-medium">Informes</p>
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
          {reportLabels[tipo]}
        </h1>
        <p className="text-muted mt-1 text-xs">
          Generado el {new Date().toLocaleString('es')}
        </p>
      </header>

      <ReportFilterBar reportType={tipo} filters={filters} onChange={setFilters} />

      {tipo === 'adherence' && <AdherenceReport filters={filters} />}
      {tipo === 'overdue' && <OverdueReport filters={filters} />}
      {tipo === 'no-response' && <NoResponseReport filters={filters} />}
      {tipo === 'refills' && <RefillsReport filters={filters} />}
      {tipo === 'treatments-flow' && <TreatmentsFlowReport filters={filters} />}
      {tipo === 'transfers' && <TransfersReport filters={filters} />}
    </div>
  )
}
