import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { api } from '@/lib/http'
import { activityDetail, activityTitleFor } from '@/lib/operations'
import type { paths } from '@/lib/api-types'

type ActivityList =
  paths['/api/v1/patients/{id}/activities']['get']['responses'][200]['content']['application/json']

/** El backend pagina por cursor y no expone un total, así que se muestran de 10 en 10. */
const PAGE_SIZE = 10

const authorName = (activity: object) =>
  (activity as { author?: { name?: string } | null }).author?.name

/**
 * Línea de tiempo del historial con paginación de 10 eventos. Se usa igual en
 * la ficha del paciente (todo su historial) y en la del tratamiento (filtrado
 * con `treatmentId`).
 */
export function ActivityHistory({
  patientId,
  treatmentId,
  emptyTitle,
  emptyDescription,
}: {
  patientId: string
  /** Filtra el historial a un tratamiento concreto. */
  treatmentId?: string
  emptyTitle: string
  emptyDescription: string
}) {
  const [page, setPage] = useState(1)

  const activities = useInfiniteQuery({
    queryKey: treatmentId
      ? ['patients', patientId, 'activities', { treatmentId, rows: PAGE_SIZE }]
      : ['patients', patientId, 'activities', { rows: PAGE_SIZE }],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
      if (treatmentId) params.set('treatment_id', treatmentId)
      if (pageParam) params.set('cursor', pageParam)
      return api<ActivityList>(
        `/api/v1/patients/${encodeURIComponent(patientId)}/activities?${params.toString()}`,
      )
    },
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: Boolean(patientId),
  })

  const loadedPages = activities.data?.pages.length ?? 0
  // Si se quedó en una página que ya no existe (p. ej. tras recargar), vuelve a la 1.
  const currentPage = Math.min(page, Math.max(1, loadedPages))
  const rows = activities.data?.pages[currentPage - 1]?.data ?? []
  const canGoBack = currentPage > 1
  const canGoForward = currentPage < loadedPages || activities.hasNextPage
  const from = (currentPage - 1) * PAGE_SIZE + 1
  const to = from + rows.length - 1
  // Con una sola página no hay nada que paginar: se oculta la barra.
  const showPager = canGoBack || canGoForward

  async function goNext() {
    if (currentPage < loadedPages) {
      setPage(currentPage + 1)
      return
    }
    if (!activities.hasNextPage) return
    const result = await activities.fetchNextPage()
    if ((result.data?.pages.length ?? 0) > currentPage) setPage(currentPage + 1)
  }

  if (activities.isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Cargando historial…"
        className="grid gap-5"
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (activities.isError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
      >
        No pudimos cargar el historial. {activities.error.message}
      </p>
    )
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div>
      <ol className="border-border relative ml-2 grid gap-5 border-l pl-5">
        {rows.map((activity) => {
          const detail = activityDetail(activity)
          return (
            <li key={activity.id} className="relative">
              <span className="bg-tealmax absolute top-1 -left-[26px] size-2.5 rounded-full ring-4 ring-white" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-petroleo text-sm font-semibold">
                  {activityTitleFor(activity)}
                </p>
                <time className="text-muted text-xs">
                  {new Date(activity.occurredAt).toLocaleString('es')}
                </time>
              </div>
              {detail && (
                <p className="text-ink mt-1 text-sm leading-6 whitespace-pre-wrap">
                  {detail}
                </p>
              )}
              {authorName(activity) && (
                <p className="text-muted mt-1 text-[11px]">
                  Registrado por {authorName(activity)}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      {showPager && (
        <div className="border-border mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <span className="text-muted text-sm">
            {from}–{to} · Página {currentPage}
          </span>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Página anterior"
              className="h-9 px-3"
              disabled={!canGoBack || activities.isFetchingNextPage}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              aria-label="Página siguiente"
              className="h-9 px-3"
              disabled={!canGoForward || activities.isFetchingNextPage}
              onClick={goNext}
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
