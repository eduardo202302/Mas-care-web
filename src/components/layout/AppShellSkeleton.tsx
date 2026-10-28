import { Skeleton } from '@/components/ui/Skeleton'

export function AppShellSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando…"
      className="bg-modulos min-h-screen"
    >
      <aside className="bg-petroleo fixed inset-y-0 left-0 hidden w-64 flex-col p-6 md:flex">
        <div className="flex items-center gap-3">
          <Skeleton className="skeleton-dark size-9 rounded-xl" />
          <Skeleton className="skeleton-dark h-5 w-24" />
        </div>
        <div className="mt-10 grid gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="skeleton-dark h-9 rounded-lg" />
          ))}
        </div>
      </aside>
      <div className="min-h-screen md:pl-64">
        <header className="border-border flex h-[76px] items-center gap-4 border-b bg-white px-5 md:px-8">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="ml-auto flex items-center gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-8 md:px-8 lg:px-10">
          <div className="grid gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="border-border mt-6 rounded-xl border bg-white p-4">
            <Skeleton className="h-10 w-full max-w-lg" />
          </div>
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
