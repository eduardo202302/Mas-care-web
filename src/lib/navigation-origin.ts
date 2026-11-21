import { useLocation } from 'react-router-dom'

/** Página desde la que se abrió un registro, para que "atrás" vuelva a ella. */
export type NavigationOrigin = { to: string; label?: string }

/**
 * Estado de navegación (`location.state`) para los enlaces que abren un
 * registro: guarda la ruta actual (con filtros de la URL) y, opcionalmente,
 * el texto que debe mostrar el botón de regreso.
 */
export function useOriginState(label?: string): { from: NavigationOrigin } {
  const location = useLocation()
  return { from: { to: location.pathname + location.search, label } }
}

/** Lee el origen guardado por `useOriginState`; devuelve null si no es válido. */
export function readOrigin(state: unknown): NavigationOrigin | null {
  const from = (state as { from?: unknown } | null | undefined)?.from
  if (!from || typeof from !== 'object') return null
  const { to, label } = from as { to?: unknown; label?: unknown }
  // Solo rutas internas: evita redirigir a una URL externa.
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//'))
    return null
  return { to, label: typeof label === 'string' ? label : undefined }
}
