import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'

type DoctorList =
  paths['/api/v1/doctors']['get']['responses'][200]['content']['application/json']
type HealthConditionList =
  paths['/api/v1/health-conditions']['get']['responses'][200]['content']['application/json']
type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']

export type PickerDoctor = DoctorList['data'][number] & {
  specialties?: { specialty: { name: string } }[]
  medicalCenters?: { medicalCenter: { name: string } }[]
}
export type PickerCondition = HealthConditionList['data'][number]

/** Médicos activos para el selector (misma caché en edición y en alta). */
export function useDoctorPicker(enabled = true) {
  return useQuery({
    queryKey: ['doctors', 'picker'],
    // La API rechaza rows > 100 (pagingFields: max(100)) → el picker quedaba
    // vacío mostrando un 400 silencioso.
    queryFn: () =>
      api<{ data: PickerDoctor[] }>('/api/v1/doctors?isActive=true&rows=100'),
    enabled,
  })
}

/** Condiciones activas para el selector (misma caché en edición y en alta). */
export function useConditionPicker(enabled = true) {
  return useQuery({
    queryKey: ['health-conditions', 'picker'],
    queryFn: () =>
      api<HealthConditionList>(
        '/api/v1/health-conditions?isActive=true&rows=100',
      ),
    enabled,
  })
}

/** Medicamentos activos (misma caché en edición y en alta). */
export function useMedicationList() {
  return useQuery({
    queryKey: ['medications', { archived: 'false', rows: 100 }],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&rows=100'),
  })
}
