import { api } from '@/lib/http'
import type { components } from '@/lib/api-types'
import type { DoctorFormValues } from '@/schemas/doctor'
import {
  syncDoctorMedicalCenters,
  syncDoctorSpecialties,
} from '@/features/doctors/doctorLinks'

/** Crea un médico (con sus especialidades y centros) desde el formulario de médico. */
export async function createDoctorFromForm(values: DoctorFormValues) {
  const doctor = await api<components['schemas']['Doctor']>('/api/v1/doctors', {
    method: 'POST',
    body: JSON.stringify({
      firstName: values.firstName,
      lastName: values.lastName,
      licenseNumber: values.licenseNumber || null,
      phone: values.phone || null,
      email: values.email || null,
      notes: values.notes || null,
    }),
  })
  await syncDoctorSpecialties(doctor.id, [], values.specialtyIds)
  await syncDoctorMedicalCenters(doctor.id, [], values.medicalCenterIds)
  return doctor
}
