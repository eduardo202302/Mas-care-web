import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/**
 * 404 for unknown routes and for screens the user's role cannot open. Both
 * look the same so the page never reveals which screens exist.
 */
export function NotFoundPage({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      className={cn(
        'grid place-items-center px-5',
        fullScreen ? 'bg-modulos min-h-screen' : 'py-16',
      )}
    >
      <div className="animate-in border-border w-full max-w-md rounded-2xl border bg-white px-8 py-12 text-center shadow-sm">
        <p className="font-display text-tealmax text-6xl font-bold tracking-tight">
          404
        </p>
        <h1 className="font-display text-petroleo mt-4 text-2xl font-bold">
          Página no encontrada
        </h1>
        <p className="text-muted mt-2 text-sm leading-6">
          La página que buscas no existe o no tienes acceso a ella.
        </p>
        <Link
          to="/inicio"
          className="bg-tealmax hover:bg-petroleo focus-visible:ring-tealmax mt-7 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
