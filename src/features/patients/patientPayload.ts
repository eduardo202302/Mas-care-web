import type { components, paths } from '@/lib/api-types'
import type { PatientFormValues } from '@/schemas/patient'

export type PatientCreateResult =
  paths['/api/v1/patients']['post']['responses'][201]['content']['application/json']

export function buildPatientCreateBody(
  values: PatientFormValues,
): components['schemas']['PatientCreate'] {
  const { address, state, city, sector, latitude, longitude, ...rest } = values
  return {
    ...rest,
    addressDetails: {
      ...(address ? { address } : {}),
      ...(state ? { region: state } : {}),
      ...(city ? { city } : {}),
      ...(sector ? { sector } : {}),
      ...(latitude ? { latitude: Number(latitude) } : {}),
      ...(longitude ? { longitude: Number(longitude) } : {}),
    },
    documentId: values.documentId || null,
    birthDate: values.birthDate || null,
    phone: values.phone || null,
    email: values.email || null,
    careNotes: values.careNotes || null,
    responsibleUserId: values.responsibleUserId || null,
  }
}
