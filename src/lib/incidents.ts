import type { components, paths } from './api-types'

export type Incident = components['schemas']['Incident']
export type IncidentType = Incident['type']
export type IncidentStatus = Incident['status']
export type IncidentListResponse =
  paths['/api/v1/incidents']['get']['responses'][200]['content']['application/json']

export const incidentColumns: readonly IncidentStatus[] = [
  'new',
  'in_progress',
  'resolved',
]

export const incidentColumnLabels: Record<IncidentStatus, string> = {
  new: 'Nueva',
  in_progress: 'En curso',
  resolved: 'Resuelta',
}

export const incidentTypeLabels: Record<IncidentType, string> = {
  prescription_expired: 'Receta caducada',
  out_of_stock: 'Sin existencias',
  patient_no_response: 'Sin respuesta',
  patient_reported: 'Problema reportado',
}

export const incidentTypeOptions = (
  Object.keys(incidentTypeLabels) as IncidentType[]
).map((value) => ({ value, label: incidentTypeLabels[value] }))

export type IncidentFilters = {
  branch_id?: string
  type?: IncidentType
  assigned_to?: string
}

export function incidentFiltersFromSearch(
  params: URLSearchParams,
): IncidentFilters {
  const filters: IncidentFilters = {}
  const branch = params.get('branch_id')
  const assigned = params.get('assigned_to')
  const type = params.get('type')
  if (branch) filters.branch_id = branch
  if (assigned) filters.assigned_to = assigned
  if (type && type in incidentTypeLabels) filters.type = type as IncidentType
  return filters
}

export function incidentFiltersToSearch(
  filters: IncidentFilters,
  base?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams(base)
  for (const key of ['branch_id', 'type', 'assigned_to'] as const) {
    const value = filters[key]
    if (value) params.set(key, value)
    else params.delete(key)
  }
  return params
}

export function incidentQueryKey(
  status: IncidentStatus,
  filters: IncidentFilters,
) {
  return [
    'incidents',
    status,
    incidentFiltersToSearch(filters).toString(),
  ] as const
}

export function incidentPatientName(incident: Incident): string {
  return incident.patient?.fullName ?? 'Sin paciente'
}

export function incidentBranchName(incident: Incident): string {
  return incident.branch?.name ?? 'Sucursal'
}

export function incidentAssignedName(incident: Incident): string {
  return incident.assignee?.name ?? 'Sin asignar'
}
