import { api } from '@/lib/http'
import type { components } from '@/lib/api-types'
import {
  setPrimaryMedicationAttachment,
  uploadMedicationAttachment,
} from '@/lib/medication-attachments'
import type { MedicationFormValues } from '@/schemas/medication'
import type { StagedAttachment } from './MedicationAttachments'

/**
 * Crea un medicamento desde el formulario y sube sus adjuntos. Un adjunto que
 * falla no deshace el alta: se devuelve en `failed` para avisar al usuario.
 */
export async function createMedicationFromForm(
  values: MedicationFormValues,
  staged: StagedAttachment[],
) {
  const body: components['schemas']['MedicationCreate'] = {
    ...values,
    ...(values.brandName
      ? { brandName: values.brandName }
      : { brandName: null }),
    ...(values.genericName
      ? { genericName: values.genericName }
      : { genericName: null }),
    ...(values.activeIngredient
      ? { activeIngredient: values.activeIngredient }
      : { activeIngredient: null }),
  }
  const created = await api<components['schemas']['Medication']>(
    '/api/v1/medications',
    { method: 'POST', body: JSON.stringify(body) },
  )
  const failed: string[] = []
  let primaryId: string | undefined
  for (const item of staged) {
    try {
      const uploaded = await uploadMedicationAttachment(created.id, item.file)
      if (item.isPrimary) primaryId = uploaded.id
    } catch {
      failed.push(item.file.name)
    }
  }
  if (primaryId)
    await setPrimaryMedicationAttachment(created.id, primaryId).catch(
      () => undefined,
    )
  return { medication: created, failed }
}

export const attachmentsFailedMessage = (failed: string[]) =>
  'El medicamento se creó, pero no se pudieron subir: ' +
  failed.join(', ') +
  '. Vuelve a intentarlo desde Imágenes y Documentos.'
