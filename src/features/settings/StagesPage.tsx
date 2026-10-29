import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import { boardColumnLabels } from '@/lib/board'
import { pipelineQueryKey, type Pipeline } from '@/lib/pipeline'

const isNew = (id: string) => id.startsWith('new:')
const columns = ['to_notify', 'notified', 'confirmed', 'prepared', 'closed'] as const

/**
 * Editor for the refill-cycles pipeline. The five board columns are fixed (they
 * follow the cycle status); stages are labels inside a column. Any stage can be
 * renamed, recoloured, reordered and, when it holds no cycles and is not the
 * last of its column, deleted; new ones are added under a column.
 */
export default function StagesPage() {
  const queryClient = useQueryClient()
  const pipeline = useQuery({
    queryKey: pipelineQueryKey,
    queryFn: () => api<Pipeline>('/api/v1/pipelines/refill-cycles'),
  })
  const [draft, setDraft] = useState<Pipeline | null>(null)
  const [addTo, setAddTo] = useState<(typeof columns)[number]>('to_notify')
  const [counter, setCounter] = useState(0)
  useEffect(() => {
    if (pipeline.data) setDraft(pipeline.data)
  }, [pipeline.data])

  const save = useMutation({
    mutationFn: (value: Pipeline) =>
      api<Pipeline>('/api/v1/pipelines/refill-cycles', {
        method: 'PUT',
        body: JSON.stringify({
          name: value.name,
          description: value.description || null,
          stages: value.stages.map(({ id, name, description, color, system_status }) => ({
            ...(isNew(id) ? { system_status } : { id }),
            name,
            description: description || null,
            color,
          })),
        }),
      }),
    onSuccess: (data) => queryClient.setQueryData(pipelineQueryKey, data),
  })

  if (!draft) return <Skeleton className="h-96 w-full rounded-xl" />

  const setStage = (index: number, patch: Partial<Pipeline['stages'][number]>) =>
    setDraft({
      ...draft,
      stages: draft.stages.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)),
    })
  const move = (index: number, by: -1 | 1) => {
    const stages = [...draft.stages]
    const [item] = stages.splice(index, 1)
    stages.splice(index + by, 0, item!)
    setDraft({ ...draft, stages })
  }
  const add = () => {
    setCounter(counter + 1)
    setDraft({
      ...draft,
      stages: [...draft.stages, { id: `new:${counter}`, system_status: addTo, name: '', description: null, color: '#64748b', position: draft.stages.length, cycle_count: 0 }],
    })
  }
  const remove = (index: number) => setDraft({ ...draft, stages: draft.stages.filter((_, i) => i !== index) })
  const lastOfColumn = (status: string) => draft.stages.filter((stage) => stage.system_status === status).length === 1
  const input = 'border-border h-10 rounded-lg border bg-white px-3 text-sm'

  return (
    <div className="animate-in max-w-3xl">
      <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
        Etapas del tablero
      </h1>
      <p className="text-muted mt-2 mb-6 text-sm">
        Las cinco columnas del tablero siguen el flujo de los ciclos y no cambian. Dentro de cada una puedes tener varias etapas: cambia su
        nombre, color y orden, añade nuevas o borra las que no uses. Mover un ciclo entre etapas de la misma columna no cambia su estado.
      </p>
      <section className="border-border mb-5 grid gap-3 rounded-xl border bg-white p-5">
        <label className="grid gap-1 text-sm font-medium">
          Nombre del pipeline
          <input
            className={input}
            value={draft.name}
            maxLength={80}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Descripción
          <input
            className={input}
            value={draft.description ?? ''}
            maxLength={300}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </label>
      </section>
      <ol className="grid gap-3">
        {draft.stages.map((stage, index) => (
          <li
            key={stage.id}
            className="border-border grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[auto_1fr_auto]"
          >
            <div className="flex items-center gap-1 sm:flex-col">
              <Button
                type="button"
                className="size-8 px-0"
                aria-label={`Subir ${stage.name}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                className="size-8 px-0"
                aria-label={`Bajar ${stage.name}`}
                disabled={index === draft.stages.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-4" />
              </Button>
            </div>
            <div className="grid gap-2">
              <input
                className={input}
                aria-label={`Nombre de la etapa ${index + 1}`}
                value={stage.name}
                maxLength={60}
                onChange={(event) => setStage(index, { name: event.target.value })}
              />
              <input
                className={input}
                aria-label={`Descripción de la etapa ${index + 1}`}
                placeholder="Descripción (opcional)"
                value={stage.description ?? ''}
                maxLength={300}
                onChange={(event) => setStage(index, { description: event.target.value })}
              />
            </div>
            <div className="flex flex-col items-start gap-1 text-xs">
              <input
                type="color"
                aria-label={`Color de la etapa ${index + 1}`}
                value={stage.color}
                onChange={(event) => setStage(index, { color: event.target.value })}
                className="h-10 w-14 rounded-lg"
              />
              <span className="text-muted">{boardColumnLabels[stage.system_status as keyof typeof boardColumnLabels] ?? stage.system_status} · {stage.cycle_count} ciclos</span>
              <Button
                type="button"
                variant="danger"
                className="h-8 px-2 text-xs"
                aria-label={`Borrar ${stage.name || 'etapa nueva'}`}
                disabled={stage.cycle_count > 0 || lastOfColumn(stage.system_status)}
                title={stage.cycle_count > 0 ? 'Tiene ciclos: muévelos a otra etapa primero' : lastOfColumn(stage.system_status) ? 'Cada columna necesita al menos una etapa' : undefined}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select className={input} aria-label="Columna de la nueva etapa" value={addTo} onChange={(event) => setAddTo(event.target.value as (typeof columns)[number])}>
          {columns.map((column) => <option key={column} value={column}>{boardColumnLabels[column]}</option>)}
        </select>
        <Button type="button" onClick={add}>Añadir etapa</Button>
      </div>
      {save.isError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {save.error.message}
        </p>
      )}
      {save.isSuccess && (
        <p role="status" className="mt-3 text-sm">
          Cambios guardados.
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          disabled={save.isPending || draft.stages.some((stage) => !stage.name.trim())}
          onClick={() => save.mutate(draft)}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
