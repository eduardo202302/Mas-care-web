import { useId, useState } from 'react'
import { BarChart as BarChartIcon, Table as TableIcon } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Branch/series color palette. Deliberately excludes the two reserved
 * brand colors: --coral (used for "avisar"/warn states) and --expired-text
 * (used for "vencido"/overdue states) — a report chart series must never
 * use either, so a reader never confuses "this branch's bar" with an
 * expired/warning indicator elsewhere in the UI. When a series has a real
 * `label_color` from the API (branch color), that takes priority; this
 * palette is the fallback for series without one (e.g. medication names).
 */
export const chartSeriesPalette = [
  '#0e7c86', // tealmax
  '#0a3d4a', // petroleo
  '#2db88a', // cuidado
  '#3b82f6', // blue-500 (neutral, not reserved)
  '#a855f7', // purple-500
  '#eab308', // yellow-500
]

export function seriesColor(index: number, labelColor?: string | null): string {
  if (labelColor) return labelColor
  return chartSeriesPalette[index % chartSeriesPalette.length]!
}

export type ChartSeries = {
  key: string
  label: string
  color?: string
}

/**
 * Generic chart wrapper: title, accessible description, a Gráfico/Tabla
 * toggle (the table renders the exact same rows with accessible headers),
 * tooltip + legend, loading/empty states. `kind` picks bar vs line; callers
 * pass pre-colored series (never red/coral) so this component itself never
 * has to guess a palette per report.
 */
export function ReportChart({
  title,
  description,
  data,
  xKey,
  series,
  kind = 'bar',
  unit,
  loading,
  columns,
  /**
   * When set, a single-series bar chart colors each bar individually by
   * this per-row field (e.g. a branch's `label_color`) instead of one flat
   * fill for the whole series. Only applies to `kind: 'bar'` with exactly
   * one series (per-row coloring on a line or on grouped bars would be
   * ambiguous), and still never used for the two reserved colors — callers
   * are expected to pass real branch colors here, not red/coral.
   */
  colorByCategory,
}: {
  title: string
  description: string
  data: Record<string, unknown>[]
  xKey: string
  series: ChartSeries[]
  kind?: 'bar' | 'line'
  unit?: string
  loading?: boolean
  /** Table column headers; defaults to [xKey label, ...series labels]. */
  columns?: string[]
  colorByCategory?: string
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const descId = useId()
  const tableColumns = columns ?? [xKey, ...series.map((s) => s.label)]

  return (
    <div className="border-border shadow-card rounded-xl border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-petroleo text-base font-bold">{title}</h3>
          <p id={descId} className="text-muted mt-0.5 text-xs">
            {description}
            {unit ? ` (${unit})` : ''}
          </p>
        </div>
        <div
          role="tablist"
          aria-label={`Vista de ${title}`}
          className="border-border flex rounded-lg border bg-white p-0.5 print:hidden"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === 'chart'}
            onClick={() => setView('chart')}
            className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold ${
              view === 'chart' ? 'text-petroleo bg-surface' : 'text-muted hover:text-ink'
            }`}
          >
            <BarChartIcon className="size-3.5" />
            Gráfico
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'table'}
            onClick={() => setView('table')}
            className={`flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold ${
              view === 'table' ? 'text-petroleo bg-surface' : 'text-muted hover:text-ink'
            }`}
          >
            <TableIcon className="size-3.5" />
            Tabla
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : data.length === 0 ? (
        <EmptyState title="No hay datos en este periodo" description="Ajusta los filtros o elige otro rango de fechas." />
      ) : view === 'table' || typeof window === 'undefined' ? (
        <div className="overflow-x-auto print:block">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{description}</caption>
            <thead className="bg-surface text-muted text-xs tracking-wide uppercase">
              <tr>
                {tableColumns.map((column) => (
                  <th key={column} scope="col" className="px-4 py-2.5 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="text-ink px-4 py-2.5">{String(row[xKey] ?? '')}</td>
                  {series.map((s) => (
                    <td key={s.key} className="text-ink px-4 py-2.5">
                      {String(row[s.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          role="img"
          aria-label={description}
          className="h-72 w-full print:hidden"
        >
          <ResponsiveContainer width="100%" height="100%">
            {kind === 'bar' ? (
              <BarChart data={data} aria-describedby={descId}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3eef0" />
                <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#71878c" />
                <YAxis tick={{ fontSize: 12 }} stroke="#71878c" />
                <Tooltip />
                <Legend />
                {series.map((s, index) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    fill={s.color ?? seriesColor(index)}
                    radius={[4, 4, 0, 0]}
                  >
                    {colorByCategory && series.length === 1
                      ? data.map((row, rowIndex) => (
                          <Cell
                            key={rowIndex}
                            fill={seriesColor(rowIndex, row[colorByCategory] as string | undefined)}
                          />
                        ))
                      : null}
                  </Bar>
                ))}
              </BarChart>
            ) : (
              <LineChart data={data} aria-describedby={descId}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3eef0" />
                <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#71878c" />
                <YAxis tick={{ fontSize: 12 }} stroke="#71878c" />
                <Tooltip />
                <Legend />
                {series.map((s, index) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color ?? seriesColor(index)}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
