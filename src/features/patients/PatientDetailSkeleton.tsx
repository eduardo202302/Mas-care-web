import { Skeleton } from '@/components/ui/Skeleton'

function PanelSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="border-border rounded-xl border bg-white p-5">
      <Skeleton className="h-4 w-28" />
      <div className="mt-4 grid gap-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={index === 0 ? 'h-3.5 w-full' : 'h-3.5 w-4/5'}
          />
        ))}
      </div>
    </div>
  )
}

export function PatientDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando ficha del paciente…"
      className="animate-in"
    >
      <Skeleton className="mb-5 h-4 w-24" />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(250px,0.9fr)_minmax(360px,1.35fr)_minmax(230px,0.8fr)]">
        <div className="grid gap-4">
          <PanelSkeleton lines={4} />
          <PanelSkeleton lines={2} />
          <PanelSkeleton lines={2} />
          <PanelSkeleton lines={3} />
        </div>
        <section className="border-border min-h-[480px] rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="mt-6 grid gap-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="grid gap-2">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            ))}
          </div>
        </section>
        <div className="grid gap-4">
          <PanelSkeleton lines={3} />
          <PanelSkeleton lines={3} />
          <PanelSkeleton lines={3} />
        </div>
      </div>
    </div>
  )
}
