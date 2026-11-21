import { api } from '@/lib/http'
import type { PatientFormValues } from '@/schemas/patient'
import {
  buildPatientCreateBody,
  type PatientCreateResult,
} from './patientPayload'

/** Crea un paciente desde el formulario de paciente. */
export function createPatientFromForm(values: PatientFormValues) {
  return api<PatientCreateResult>('/api/v1/patients', {
    method: 'POST',
    body: JSON.stringify(buildPatientCreateBody(values)),
  })
}
