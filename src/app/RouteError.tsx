import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const chunkErrorHints = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Unable to preload CSS',
]

function isChunkLoadError(error: unknown) {
  if (error instanceof Error) {
    if (error.name === 'ChunkLoadError') return true
    return chunkErrorHints.some((hint) => error.message.includes(hint))
  }
  return (
    typeof error === 'string' &&
    chunkErrorHints.some((hint) => error.includes(hint))
  )
}

function getCopy(error: unknown) {
  if (isChunkLoadError(error))
    return {
      title: 'No pudimos cargar esta sección',
      description:
        'Es probable que se haya publicado una versión nueva del sistema. Recarga la página para seguir trabajando.',
    }
  if (isRouteErrorResponse(error)) {
    if (error.status === 404)
      return {
        title: 'No encontramos esta página',
        description: 'Revisa la dirección o vuelve al inicio del sistema.',
      }
    return {
      title: 'Algo salió mal',
      description:
        error.statusText ||
        'Ocurrió un error al mostrar esta página. Intenta nuevamente.',
    }
  }
  return {
    title: 'Algo salió mal',
    description:
      'Ocurrió un error inesperado al mostrar esta página. Recarga para intentarlo de nuevo.',
  }
}

export function RouteError() {
  const error = useRouteError()
  const { title, description } = getCopy(error)
  const isDev = import.meta.env.DEV
  const detail = isDev && error instanceof Error ? error.message : undefined

  return (
    <main className="bg-modulos text-ink grid min-h-screen place-items-center px-5 py-10">
      <div
        role="alert"
        className="border-border w-full max-w-lg rounded-xl border bg-white p-6 md:p-8"
      >
        <span className="bg-coral/10 text-coral grid size-11 place-items-center rounded-full">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>
        <h1 className="font-display text-petroleo mt-4 text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted mt-2 text-sm leading-6">{description}</p>
        {detail && (
          <p className="border-border text-muted mt-4 rounded-lg border border-dashed p-3 font-mono text-xs break-words">
            {detail}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="primary"
            autoFocus
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Recargar página
          </Button>
          <a
            href="/inicio"
            className="border-border text-ink hover:bg-surface inline-flex h-10 w-full items-center justify-center rounded-lg border bg-white px-4 text-sm font-semibold transition sm:w-auto"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </main>
  )
}
