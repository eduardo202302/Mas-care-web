import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/http'
import { effectiveStage, stagesOfColumn, usePipeline } from '@/lib/pipeline'
import type { BoardCard } from '@/lib/board'

/** Sub-stage of a cycle inside its column. Rendered only when the column has more than one stage. */
export function StagePicker({
  card,
  canMove,
}: {
  card: BoardCard
  canMove: boolean
}) {
  const { data: pipeline } = usePipeline()
  const queryClient = useQueryClient()
  const change = useMutation({
    mutationFn: (stageId: string) =>
      api(`/api/v1/cycles/${encodeURIComponent(card.cycle_id)}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage_id: stageId }),
      }),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['board'] }),
        queryClient.invalidateQueries({ queryKey: ['cycles'] }),
        queryClient.invalidateQueries({ queryKey: ['pipeline'] }),
      ]),
  })
  if (!pipeline) return null
  const options = stagesOfColumn(pipeline, card.status)
  if (options.length < 2) return null
  const current = effectiveStage(
    pipeline,
    card.status,
    (card as { stage_id?: string | null }).stage_id,
  )
  return (
    <label className="mt-2 flex items-center gap-2 text-[11px]">
      <span className="text-muted">Etapa</span>
      <select
        aria-label="Etapa del ciclo"
        className="border-border h-7 min-w-0 flex-1 rounded-md border bg-white px-1 text-xs"
        style={{ borderLeft: `4px solid ${current?.color ?? 'transparent'}` }}
        value={current?.id ?? ''}
        disabled={!canMove || change.isPending}
        onChange={(event) => change.mutate(event.target.value)}
      >
        {options.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.name}
          </option>
        ))}
      </select>
      {change.isError && (
        <span role="alert" className="text-red-700">
          No se pudo cambiar.
        </span>
      )}
    </label>
  )
}
