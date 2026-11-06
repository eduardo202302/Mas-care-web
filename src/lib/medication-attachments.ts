import { api } from './http'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type MedicationAttachment = {
  id: string
  kind: 'image' | 'document'
  originalName: string
  mimeType: string
  sizeBytes: number
  isPrimary: boolean
  createdAt: string
}

export const ATTACHMENT_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.txt'
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

const base = (medicationId: string) =>
  `/api/v1/medications/${encodeURIComponent(medicationId)}/attachments`

export const attachmentFilePath = (
  medicationId: string,
  attachmentId: string,
) => `${base(medicationId)}/${encodeURIComponent(attachmentId)}/file`

export const listMedicationAttachments = (medicationId: string) =>
  api<{ data: MedicationAttachment[] }>(base(medicationId)).then(
    (result) => result.data,
  )

export function uploadMedicationAttachment(medicationId: string, file: File) {
  const form = new FormData()
  form.set('file', file)
  return api<MedicationAttachment>(base(medicationId), {
    method: 'POST',
    body: form,
  })
}

export const setPrimaryMedicationAttachment = (
  medicationId: string,
  attachmentId: string,
) =>
  api<MedicationAttachment>(
    `${base(medicationId)}/${encodeURIComponent(attachmentId)}/primary`,
    { method: 'POST' },
  )

export const deleteMedicationAttachment = (
  medicationId: string,
  attachmentId: string,
) =>
  api<void>(`${base(medicationId)}/${encodeURIComponent(attachmentId)}`, {
    method: 'DELETE',
  })

export function validateAttachmentFile(file: File): string | null {
  if (file.size > ATTACHMENT_MAX_BYTES) return `${file.name} supera los 10 MB`
  const okType =
    /^image\/(jpeg|png|webp|gif)$/.test(file.type) ||
    /\.(pdf|docx?|xlsx?|txt)$/i.test(file.name)
  return okType ? null : `${file.name}: tipo de archivo no permitido`
}

/** Descarga con cookies y devuelve el blob; los archivos nunca se sirven como URL pública. */
export async function fetchAttachmentBlob(
  medicationId: string,
  attachmentId: string,
) {
  const response = await fetch(
    `${API_URL}${attachmentFilePath(medicationId, attachmentId)}`,
    { credentials: 'include' },
  )
  if (!response.ok)
    throw new Error(`No se pudo cargar el archivo (${response.status})`)
  return response.blob()
}

export async function openAttachment(
  medicationId: string,
  attachment: Pick<MedicationAttachment, 'id' | 'originalName' | 'kind'>,
) {
  const blob = await fetchAttachmentBlob(medicationId, attachment.id)
  const url = URL.createObjectURL(blob)
  if (attachment.kind === 'image' || blob.type === 'application/pdf') {
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return
  }
  const link = document.createElement('a')
  link.href = url
  link.download = attachment.originalName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
