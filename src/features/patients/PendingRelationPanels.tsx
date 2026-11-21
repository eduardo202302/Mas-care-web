import type { Dispatch, SetStateAction } from 'react'
import { useCan } from '@/lib/permissions'
import {
  medicationName,
  treatmentPauta,
  type Treatment,
} from '@/lib/treatments'
import type { TreatmentSaveValues } from '@/schemas/treatment'
import {
  AddConditionDialog,
  ConditionRowContent,
  type ConditionStatus,
} from './PatientConditionsPanel'
import { AddDoctorDialog, DoctorRowContent } from './PatientDoctorsPanel'
import {
  AddTreatmentDialog,
  TreatmentRowContent,
} from './PatientTreatmentsPanel'
import { RelationActions, RelationList, RelationRow } from './RelationParts'
import { useDoctorPicker, useMedicationList } from './relationQueries'

/*
 * Pestañas del alta de paciente: mismo diseño que los paneles de edición
 * (filas, diálogos de agregar), pero los elementos viven en memoria hasta que
 * `PatientForm` crea al paciente y los persiste.
 */

export type PendingDoctor = {
  doctorId: string
  name: string
  isPrimary: boolean
  notes: string
}
export type PendingCondition = {
  healthConditionId: string
  name: string
  status: ConditionStatus
  diagnosedOn: string
  notes: string
  isPrimary: boolean
}
export type PendingTreatment = {
  values: TreatmentSaveValues
  medicationLabel: string
}

export function PendingDoctorsPanel({
  pending,
  setPending,
  addOpen,
  onCloseAdd,
}: {
  pending: PendingDoctor[]
  setPending: Dispatch<SetStateAction<PendingDoctor[]>>
  addOpen: boolean
  onCloseAdd: () => void
}) {
  const canWrite = useCan('patients:write')
  // Detalle (especialidad, colegiatura…) de cada médico elegido: sale del
  // selector, sin guardarlo en el pendiente.
  const doctors = useDoctorPicker()
  const doctorById = new Map(
    (doctors.data?.data ?? []).map((doctor) => [doctor.id, doctor]),
  )
  const primary = pending.find((item) => item.isPrimary)

  return (
    <>
      {pending.length ? (
        <RelationList>
          {pending.map((item) => {
            const doctor = doctorById.get(item.doctorId)
            return (
              <RelationRow
                key={item.doctorId}
                actions={
                  canWrite && (
                    <RelationActions
                      onSetPrimary={
                        item.isPrimary
                          ? undefined
                          : () =>
                              setPending((current) =>
                                current.map((d) => ({
                                  ...d,
                                  isPrimary: d.doctorId === item.doctorId,
                                })),
                              )
                      }
                      onRemove={() =>
                        setPending((current) =>
                          current.filter((d) => d.doctorId !== item.doctorId),
                        )
                      }
                    />
                  )
                }
              >
                <DoctorRowContent
                  name={item.name}
                  isPrimary={item.isPrimary}
                  specialties={(doctor?.specialties ?? []).map(
                    (link) => link.specialty.name,
                  )}
                  licenseNumber={doctor?.licenseNumber}
                  phone={doctor?.phone}
                  medicalCenters={(doctor?.medicalCenters ?? []).map(
                    (link) => link.medicalCenter.name,
                  )}
                  notes={item.notes}
                />
              </RelationRow>
            )
          })}
        </RelationList>
      ) : (
        <p className="text-muted text-sm">Sin médicos asociados.</p>
      )}
      {addOpen && (
        <AddDoctorDialog
          excludeIds={new Set(pending.map((item) => item.doctorId))}
          primaryName={primary?.name ?? null}
          hasLinks={pending.length > 0}
          onSubmit={(doctor, values) => {
            setPending((current) => [
              ...current,
              {
                doctorId: doctor.id,
                name: `${doctor.firstName} ${doctor.lastName}`,
                ...values,
              },
            ])
            onCloseAdd()
          }}
          onClose={onCloseAdd}
        />
      )}
    </>
  )
}

export function PendingConditionsPanel({
  pending,
  setPending,
  addOpen,
  onCloseAdd,
}: {
  pending: PendingCondition[]
  setPending: Dispatch<SetStateAction<PendingCondition[]>>
  addOpen: boolean
  onCloseAdd: () => void
}) {
  const canWrite = useCan('patients:write')
  const primary = pending.find((item) => item.isPrimary)

  return (
    <>
      {pending.length ? (
        <RelationList>
          {pending.map((item) => (
            <RelationRow
              key={item.healthConditionId}
              actions={
                canWrite && (
                  <RelationActions
                    onSetPrimary={
                      item.isPrimary
                        ? undefined
                        : () =>
                            setPending((current) =>
                              current.map((c) => ({
                                ...c,
                                isPrimary:
                                  c.healthConditionId ===
                                  item.healthConditionId,
                              })),
                            )
                    }
                    onRemove={() =>
                      setPending((current) =>
                        current.filter(
                          (c) => c.healthConditionId !== item.healthConditionId,
                        ),
                      )
                    }
                  />
                )
              }
            >
              <ConditionRowContent
                name={item.name}
                isPrimary={item.isPrimary}
                status={item.status}
                diagnosedOn={item.diagnosedOn}
                notes={item.notes}
                onStatusChange={
                  canWrite
                    ? (status) =>
                        setPending((current) =>
                          current.map((c) =>
                            c.healthConditionId === item.healthConditionId
                              ? { ...c, status }
                              : c,
                          ),
                        )
                    : undefined
                }
              />
            </RelationRow>
          ))}
        </RelationList>
      ) : (
        <p className="text-muted text-sm">Sin condiciones registradas.</p>
      )}
      {addOpen && (
        <AddConditionDialog
          excludeIds={new Set(pending.map((item) => item.healthConditionId))}
          primaryName={primary?.name ?? null}
          hasLinks={pending.length > 0}
          onSubmit={(condition, values) => {
            setPending((current) => [
              ...current,
              {
                healthConditionId: condition.id,
                name: condition.name,
                ...values,
              },
            ])
            onCloseAdd()
          }}
          onClose={onCloseAdd}
        />
      )}
    </>
  )
}

export function PendingTreatmentsPanel({
  pending,
  setPending,
  patientName,
  defaultBranchId,
  addOpen,
  onCloseAdd,
}: {
  pending: PendingTreatment[]
  setPending: Dispatch<SetStateAction<PendingTreatment[]>>
  patientName?: string
  defaultBranchId?: string
  addOpen: boolean
  onCloseAdd: () => void
}) {
  const canWrite = useCan('patients:write')
  const medications = useMedicationList()
  const medicationById = new Map(
    (medications.data?.data ?? []).map((medication) => [
      medication.id,
      medication,
    ]),
  )

  return (
    <>
      {pending.length ? (
        <RelationList>
          {pending.map((item, index) => {
            const medication = medicationById.get(item.values.medicationId)
            return (
              <RelationRow
                key={`${item.values.medicationId}-${index}`}
                actions={
                  canWrite && (
                    <RelationActions
                      onRemove={() =>
                        setPending((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                    />
                  )
                }
              >
                <TreatmentRowContent
                  name={item.values.name?.trim()}
                  medication={
                    medication
                      ? medicationName(medication)
                      : item.medicationLabel
                  }
                  pauta={treatmentPauta(
                    {
                      dosePerIntake: item.values.dosePerIntake,
                      intakesPerDay: item.values.intakesPerDay,
                    } as Treatment,
                    medication,
                  )}
                  statusLabel="Activo"
                />
              </RelationRow>
            )
          })}
        </RelationList>
      ) : (
        <p className="text-muted text-sm">Sin tratamientos registrados.</p>
      )}
      {addOpen && canWrite && (
        <AddTreatmentDialog
          patientName={patientName}
          defaultBranchId={defaultBranchId}
          onSave={async (values) => {
            const medication = medicationById.get(values.medicationId)
            setPending((current) => [
              ...current,
              {
                values,
                medicationLabel: medication ? medicationName(medication) : '',
              },
            ])
          }}
          onClose={onCloseAdd}
        />
      )}
    </>
  )
}
