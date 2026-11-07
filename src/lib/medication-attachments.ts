import type { components } from './api-types'
import { api, ApiError } from './http'

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

export function uploadMedicationAttachment(
  medicationId: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const form = new FormData()
  form.set('file', file)
  if (!onProgress)
    return api<MedicationAttachment>(base(medicationId), {
      method: 'POST',
      body: form,
    })
  // fetch no reporta el avance de subida; XHR sí.
  return new Promise<MedicationAttachment>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}${base(medicationId)}`)
    xhr.withCredentials = true
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        // Enviar todos los bytes no es terminar: el 100 % lo marca quien llama.
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)))
    }
    xhr.onerror = () =>
      reject(new ApiError('No pudimos conectar con el servidor.', 0))
    xhr.onload = () => {
      if (xhr.status === 401 && !window.location.pathname.startsWith('/acceso'))
        window.location.assign('/acceso')
      let data: unknown
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        data = undefined
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as MedicationAttachment)
        return
      }
      const payload = data as components['schemas']['ErrorResponse'] | undefined
      reject(
        new ApiError(
          payload?.error.message ?? `Error de solicitud (${xhr.status})`,
          xhr.status,
          payload?.error.fields,
          payload?.error.code,
          payload?.error.details,
        ),
      )
    }
    xhr.send(form)
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
