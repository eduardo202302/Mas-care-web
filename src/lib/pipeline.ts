import { useQuery } from '@tanstack/react-query'
import { api } from './http'

export type PipelineStage = {
  id: string
  system_status: string
  name: string
  description: string | null
  color: string
  position: number
  /** Etapa de entrada ("Creado"): a ella llegan las reposiciones nuevas, no las que no tienen etapa. */
  is_initial: boolean
  cycle_count: number
}

export type Pipeline = {
  id: string
  key: string
  name: string
  description: string | null
  stages: PipelineStage[]
}

export const pipelineQueryKey = ['pipeline', 'refill_cycles']

export function usePipeline() {
  return useQuery({
    queryKey: pipelineQueryKey,
    queryFn: () => api<Pipeline>('/api/v1/pipelines/refill-cycles'),
    staleTime: 60_000,
  })
}

/** Board column a cycle status sits in (`closed` groups delivered and not picked up). */
export const columnOfStatus = (status: string) =>
  status === 'delivered' || status === 'not_picked_up' ? 'closed' : status

export const stagesOfColumn = (pipeline: Pipeline, status: string) =>
  pipeline.stages.filter(
    (stage) => stage.system_status === columnOfStatus(status),
  )

/** Etapa por defecto de una columna: la primera que no es la inicial (a "Creado" solo llegan reposiciones nuevas). */
export const defaultStageOfColumn = (pipeline: Pipeline, status: string) => {
  const options = stagesOfColumn(pipeline, status)
  return options.find((stage) => !stage.is_initial) ?? options[0]
}

/** The stage a cycle shows: the one it points at if it is under its column, else the column's default stage. */
export function effectiveStage(
  pipeline: Pipeline,
  status: string,
  stageId: string | null | undefined,
) {
  const options = stagesOfColumn(pipeline, status)
  return (
    options.find((stage) => stage.id === stageId) ??
    defaultStageOfColumn(pipeline, status)
  )
}
