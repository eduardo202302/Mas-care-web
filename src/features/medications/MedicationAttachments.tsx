import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Paperclip, Star, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ModalSection } from '@/components/ui/ModalSection'
import { cn } from '@/lib/cn'
import {
  ATTACHMENT_ACCEPT,
  deleteMedicationAttachment,
  formatFileSize,
  listMedicationAttachments,
  openAttachment,
  setPrimaryMedicationAttachment,
  uploadMedicationAttachment,
  validateAttachmentFile,
} from '@/lib/medication-attachments'
import { MedicationImage } from './MedicationImage'

/** Archivo elegido al crear un medicamento; se sube cuando el medicamento ya existe. */
export type StagedAttachment = { key: string; file: File; isPrimary: boolean }

const isImage = (file: File) => file.type.startsWith('image/')

type Item = {
  key: string
  kind: 'image' | 'document'
  name: string
  size: number
  isPrimary: boolean
  preview: ReactNode
  onOpen: () => void
  onPrimary: () => void
  onRemove: () => void
}

function Thumb({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return <img src={url} alt="" className="size-full object-cover" />
}

/**
 * Imágenes y documentos de un medicamento. Con `medicationId` actúa sobre el
 * servidor al instante; sin él (crear) acumula archivos en `staged`.
 */
export function MedicationAttachments({
  medicationId,
  readOnly = false,
  staged,
  onStagedChange,
}: {
  medicationId?: string
  readOnly?: boolean
  staged: StagedAttachment[]
  onStagedChange: (next: StagedAttachment[]) => void
}) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const queryKey = ['medication-attachments', medicationId]
  const saved = useQuery({
    queryKey,
    queryFn: () => listMedicationAttachments(medicationId!),
    enabled: Boolean(medicationId),
  })

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ['medications'] }),
    ])
  }
  const fail = (e: unknown) =>
    setError(e instanceof Error ? e.message : 'No pudimos completar la acción.')
  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files)
        await uploadMedicationAttachment(medicationId!, file)
    },
    onSuccess: refresh,
    onError: fail,
  })
  const makePrimary = useMutation({
    mutationFn: (id: string) =>
      setPrimaryMedicationAttachment(medicationId!, id),
    onSuccess: refresh,
    onError: fail,
  })
  const remove = useMutation({
    mutationFn: (id: string) => deleteMedicationAttachment(medicationId!, id),
    onSuccess: refresh,
    onError: fail,
  })
  const busy = upload.isPending || makePrimary.isPending || remove.isPending

  function addFiles(list: FileList | null) {
    const files = Array.from(list ?? [])
    if (!files.length) return
    const problem = files.map(validateAttachmentFile).find(Boolean)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    if (medicationId) {
      upload.mutate(files)
      return
    }
    let hasPrimary = staged.some((item) => item.isPrimary)
    const added = files.map((file) => {
      const isPrimary = isImage(file) && !hasPrimary
      if (isPrimary) hasPrimary = true
      return { key: crypto.randomUUID(), file, isPrimary }
    })
    onStagedChange([...staged, ...added])
  }

  const items: Item[] = medicationId
    ? (saved.data ?? []).map((attachment) => ({
        key: attachment.id,
        kind: attachment.kind,
        name: attachment.originalName,
        size: attachment.sizeBytes,
        isPrimary: attachment.isPrimary,
        preview:
          attachment.kind === 'image' ? (
            <MedicationImage
              medicationId={medicationId}
              attachmentId={attachment.id}
              className="size-full"
            />
          ) : null,
        onOpen: () => {
          openAttachment(medicationId, attachment).catch(fail)
        },
        onPrimary: () => makePrimary.mutate(attachment.id),
        onRemove: () => remove.mutate(attachment.id),
      }))
    : staged.map((item) => ({
        key: item.key,
        kind: isImage(item.file) ? 'image' : 'document',
        name: item.file.name,
        size: item.file.size,
        isPrimary: item.isPrimary,
        preview: isImage(item.file) ? <Thumb file={item.file} /> : null,
        onOpen: () => {
          const url = URL.createObjectURL(item.file)
          window.open(url, '_blank', 'noopener')
          setTimeout(() => URL.revokeObjectURL(url), 60_000)
        },
        onPrimary: () =>
          onStagedChange(
            staged.map((s) => ({ ...s, isPrimary: s.key === item.key })),
          ),
        onRemove: () => {
          const rest = staged.filter((s) => s.key !== item.key)
          if (item.isPrimary) {
            const next = rest.findIndex((s) => isImage(s.file))
            if (next >= 0) rest[next] = { ...rest[next]!, isPrimary: true }
          }
          onStagedChange(rest)
        },
      }))

  return (
    <ModalSection
      icon={<Paperclip className="size-4" />}
      title="Imágenes y Documentos"
      tone="amber"
      action={
        !readOnly && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              accept={ATTACHMENT_ACCEPT}
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
            />
            <Button
              type="button"
              className="h-8 px-3 text-xs"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              {upload.isPending ? 'Subiendo…' : 'Agregar'}
            </Button>
          </>
        )
      }
    >
      {items.length === 0 ? (
        <p className="text-muted text-sm">
          {saved.isPending && medicationId
            ? 'Cargando…'
            : readOnly
              ? 'Sin archivos adjuntos.'
              : 'Agrega fotos del producto (JPG, PNG, WEBP, GIF) o documentos (PDF, Word, Excel, TXT) de hasta 10 MB. Marca una imagen como principal para mostrarla en la lista.'}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.key}
              className={cn(
                'border-border flex items-center gap-3 rounded-lg border bg-white p-2',
                item.isPrimary && 'border-tealmax ring-tealmax/30 ring-1',
              )}
            >
              <button
                type="button"
                title="Ver"
                aria-label={`Ver ${item.name}`}
                onClick={item.onOpen}
                className="bg-surface text-muted grid size-14 shrink-0 place-items-center overflow-hidden rounded-md"
              >
                {item.preview ?? <FileText className="size-6" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={item.name}>
                  {item.name}
                </p>
                <p className="text-muted text-xs">
                  {item.kind === 'image' ? 'Imagen' : 'Documento'} ·{' '}
                  {formatFileSize(item.size)}
                  {item.isPrimary && (
                    <span className="bg-tealmax/10 text-tealmax ml-2 rounded-full px-2 py-0.5 font-semibold">
                      Principal
                    </span>
                  )}
                </p>
              </div>
              {!readOnly && (
                <div className="flex shrink-0 items-center gap-1">
                  {item.kind === 'image' && !item.isPrimary && (
                    <button
                      type="button"
                      title="Marcar como principal"
                      aria-label={`Marcar ${item.name} como principal`}
                      disabled={busy}
                      onClick={item.onPrimary}
                      className="text-muted hover:bg-surface hover:text-tealmax grid size-8 place-items-center rounded-md disabled:opacity-50"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Quitar"
                    aria-label={`Quitar ${item.name}`}
                    disabled={busy}
                    onClick={item.onRemove}
                    className="text-muted grid size-8 place-items-center rounded-md hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}
    </ModalSection>
  )
}
