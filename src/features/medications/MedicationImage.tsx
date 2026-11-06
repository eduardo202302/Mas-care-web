import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pill } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fetchAttachmentBlob } from '@/lib/medication-attachments'

/** Imagen de un adjunto: se descarga con cookies y se muestra desde un blob local. */
export function MedicationImage({
  medicationId,
  attachmentId,
  alt = '',
  className,
}: {
  medicationId: string
  attachmentId: string | null | undefined
  alt?: string
  className?: string
}) {
  const blob = useQuery({
    queryKey: ['medication-image', medicationId, attachmentId],
    queryFn: () => fetchAttachmentBlob(medicationId, attachmentId!),
    enabled: Boolean(attachmentId),
    staleTime: Infinity,
    retry: false,
  })
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob.data) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(blob.data)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob.data])

  if (url)
    return (
      <img
        src={url}
        alt={alt}
        className={cn('bg-surface object-cover', className)}
      />
    )
  return (
    <span
      aria-hidden="true"
      className={cn('bg-surface text-muted grid place-items-center', className)}
    >
      <Pill className="size-1/2" />
    </span>
  )
}
