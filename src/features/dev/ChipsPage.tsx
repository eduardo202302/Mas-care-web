import { BranchTag } from '@/components/BranchTag'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusChip } from '@/components/StatusChip'
import { statusLabels } from '@/components/status-labels'

export default function ChipsPage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="Componentes de estado"
        subtitle="Muestra de etiquetas para revisar contraste, color y lectura."
      />
      <section className="border-border rounded-xl border bg-white p-6 md:p-8">
        <h2 className="text-ink text-sm font-semibold">Estados de operación</h2>
        <p className="text-muted mt-1 text-sm">
          El rojo identifica únicamente productos vencidos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {statusLabels.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </div>
        <div className="border-border mt-8 border-t pt-6">
          <h2 className="text-ink text-sm font-semibold">
            Etiquetas de sucursal
          </h2>
          <p className="text-muted mt-1 text-sm">
            El color de cada etiqueta viene de{' '}
            <code className="bg-surface rounded px-1.5 py-0.5 text-xs">
              label_color
            </code>
            .
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <BranchTag name="Centro" labelColor="#0E7C86" />
            <BranchTag name="Norte" labelColor="#2DB88A" />
            <BranchTag name="Sur" labelColor="#FF8A5B" />
            <BranchTag name="Mercado" labelColor="#805AD5" />
          </div>
        </div>
      </section>
    </div>
  )
}
