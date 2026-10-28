import { BranchTag } from '@/components/BranchTag'
import { StatusChip } from '@/components/StatusChip'
import { statusLabels } from '@/components/status-labels'

export default function ChipsPage() {
  return (
    <div className="animate-in">
      <div className="mb-8">
        <p className="text-tealmax mb-2 text-sm font-medium">
          Entorno de desarrollo
        </p>
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
          Componentes de estado
        </h1>
        <p className="text-muted mt-2 text-sm">
          Muestra de etiquetas para revisar contraste, color y lectura.
        </p>
      </div>
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
