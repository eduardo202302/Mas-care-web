import { Link } from 'react-router-dom'
import {
  ArrowRightLeft,
  BarChart3,
  ClipboardList,
  MessageSquareOff,
  PackageSearch,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  reportDescriptions,
  reportLabels,
  reportTypes,
  type ReportType,
} from '@/lib/reports'

const reportIcons: Record<ReportType, LucideIcon> = {
  adherence: BarChart3,
  overdue: TriangleAlert,
  'no-response': MessageSquareOff,
  refills: PackageSearch,
  'treatments-flow': ClipboardList,
  transfers: ArrowRightLeft,
}

export default function ReportsIndexPage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="Informes"
        subtitle="Reportes de adherencia, vencidos, reposiciones, altas y bajas, y traspasos."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((type) => {
          const Icon = reportIcons[type]
          return (
            <Link
              key={type}
              to={`/informes/${type}`}
              className="border-border shadow-card group hover:border-tealmax flex flex-col gap-3 rounded-xl border bg-white p-5 transition"
            >
              <span className="bg-surface text-tealmax grid size-10 place-items-center rounded-lg">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="text-ink font-display group-hover:text-tealmax text-base font-bold">
                  {reportLabels[type]}
                </h2>
                <p className="text-muted mt-1 text-sm leading-5">
                  {reportDescriptions[type]}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
