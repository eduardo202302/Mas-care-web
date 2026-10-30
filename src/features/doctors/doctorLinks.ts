import { api } from '@/lib/http'

export async function syncDoctorSpecialties(
  doctorId: string,
  currentIds: string[],
  nextIds: string[],
) {
  const current = new Set(currentIds)
  const next = new Set(nextIds)
  await Promise.all([
    ...nextIds
      .filter((specialtyId) => !current.has(specialtyId))
      .map((specialtyId) =>
        api(`/api/v1/doctors/${encodeURIComponent(doctorId)}/specialties`, {
          method: 'POST',
          body: JSON.stringify({ specialtyId }),
        }),
      ),
    ...currentIds
      .filter((specialtyId) => !next.has(specialtyId))
      .map((specialtyId) =>
        api(
          `/api/v1/doctors/${encodeURIComponent(doctorId)}/specialties/${encodeURIComponent(specialtyId)}`,
          { method: 'DELETE' },
        ),
      ),
  ])
}

export async function syncDoctorMedicalCenters(
  doctorId: string,
  currentIds: string[],
  nextIds: string[],
) {
  const current = new Set(currentIds)
  const next = new Set(nextIds)
  await Promise.all([
    ...nextIds
      .filter((medicalCenterId) => !current.has(medicalCenterId))
      .map((medicalCenterId) =>
        api(`/api/v1/doctors/${encodeURIComponent(doctorId)}/medical-centers`, {
          method: 'POST',
          body: JSON.stringify({ medicalCenterId }),
        }),
      ),
    ...currentIds
      .filter((medicalCenterId) => !next.has(medicalCenterId))
      .map((medicalCenterId) =>
        api(
          `/api/v1/doctors/${encodeURIComponent(doctorId)}/medical-centers/${encodeURIComponent(medicalCenterId)}`,
          { method: 'PATCH', body: JSON.stringify({ isActive: false }) },
        ),
      ),
  ])
}
