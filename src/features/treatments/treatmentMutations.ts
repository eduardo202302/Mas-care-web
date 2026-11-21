import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { api } from '@/lib/http'
import type { Treatment } from '@/lib/treatments'

const AFFECTED_QUERIES = [
  'treatments',
  'board',
  'cycles',
  'eligible-treatments',
  'patients',
  'dashboard',
] as const

/** Un tratamiento alimenta el tablero, los ciclos, el paciente y el dashboard: se refrescan todos. */
export function invalidateTreatmentQueries(queryClient: QueryClient) {
  return Promise.all(
    AFFECTED_QUERIES.map((key) =>
      queryClient.invalidateQueries({ queryKey: [key] }),
    ),
  )
}

/** Borra el tratamiento (y lo que depende solo de él) definitivamente de la base de datos. */
export function useTreatmentPurge(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/treatments/${encodeURIComponent(id)}/permanent`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      onDone?.()
      await invalidateTreatmentQueries(queryClient)
    },
  })
}

/** Activo = `active` (reanudar), inactivo = `paused` (pausar). */
export function setTreatmentActive(id: string, active: boolean) {
  const base = `/api/v1/treatments/${encodeURIComponent(id)}`
  return active
    ? api<Treatment>(`${base}/resume`, { method: 'POST' })
    : api<Treatment>(`${base}/pause`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Desactivado desde el formulario' }),
      })
}

/** Interruptor Activo/Inactivo: activo = `active`, inactivo = `paused`. */
export function useTreatmentActiveToggle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setTreatmentActive(id, active),
    onSuccess: () => invalidateTreatmentQueries(queryClient),
  })
}
