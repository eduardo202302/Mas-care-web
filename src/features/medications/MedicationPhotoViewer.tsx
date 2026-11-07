import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, Printer, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fetchAttachmentBlob } from '@/lib/medication-attachments'

const MIN_ZOOM = 1
const MAX_ZOOM = 5

function useBlobUrl(blob: Blob | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])
  return url
}

function printImage(url: string) {
  const frame = document.createElement('iframe')
  frame.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  frame.srcdoc = `<!doctype html><html><head><style>@page{margin:12mm}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body><img src="${url}"></body></html>`
  frame.onload = () => {
    const win = frame.contentWindow
    const img = win?.document.querySelector('img')
    const run = () => {
      win?.focus()
      win?.print()
      setTimeout(() => frame.remove(), 1000)
    }
    if (img && !img.complete) img.onload = run
    else run()
  }
  document.body.appendChild(frame)
}

/** Foto del medicamento: botón para mostrarla en pequeño y, al tocarla, verla ampliada con imprimir y descargar. */
export function MedicationPhotoViewer({
  medicationId,
  attachmentId,
  fileName,
  title,
}: {
  medicationId: string
  attachmentId: string
  fileName?: string
  title: string
}) {
  const [enlarged, setEnlarged] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number } | null>(null)

  function changeZoom(next: number) {
    const value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next))
    setZoom(value)
    if (value === MIN_ZOOM) setOffset({ x: 0, y: 0 })
  }
  const blob = useQuery({
    queryKey: ['medication-image', medicationId, attachmentId],
    queryFn: () => fetchAttachmentBlob(medicationId, attachmentId),
    staleTime: Infinity,
    retry: false,
  })
  const url = useBlobUrl(blob.data)

  useEffect(() => {
    if (!enlarged) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEnlarged(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enlarged])

  function download() {
    if (!url || !blob.data) return
    const extension = blob.data.type.split('/')[1]?.replace('jpeg', 'jpg')
    const link = document.createElement('a')
    link.href = url
    link.download =
      fileName || `${title || 'medicamento'}${extension ? `.${extension}` : ''}`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Estos controles no son <button> para que el modo ver (fieldset deshabilitado) siga permitiendo abrir la foto.
  const asButton = (action: () => void) => ({
    role: 'button' as const,
    tabIndex: 0,
    onClick: action,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        action()
      }
    },
  })

  return (
    <div className="grid content-start gap-2">
      {url ? (
        <img
          {...asButton(() => {
            changeZoom(1)
            setEnlarged(true)
          })}
          src={url}
          alt="Foto del medicamento"
          title="Clic para ampliar"
          className="border-border focus-visible:ring-tealmax size-24 cursor-zoom-in rounded-lg border bg-white object-cover focus-visible:ring-2 focus-visible:outline-none"
        />
      ) : (
        <p className="text-muted text-sm">
          {blob.isError ? 'No se pudo cargar la foto.' : 'Cargando foto…'}
        </p>
      )}

      {enlarged &&
        url &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex flex-col bg-slate-950/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Foto del medicamento"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEnlarged(false)
            }}
          >
            <div className="mx-auto mb-3 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                aria-label="Alejar"
                title="Alejar"
                className="px-3"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => changeZoom(zoom / 1.5)}
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                type="button"
                title="Restablecer zoom"
                className="w-16 px-0 tabular-nums"
                onClick={() => changeZoom(1)}
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Button
                type="button"
                aria-label="Acercar"
                title="Acercar"
                className="px-3"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => changeZoom(zoom * 1.5)}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button type="button" onClick={() => printImage(url)}>
                <Printer className="size-4" />
                Imprimir
              </Button>
              <Button type="button" onClick={download}>
                <Download className="size-4" />
                Descargar
              </Button>
              <Button
                type="button"
                aria-label="Cerrar"
                className="px-3"
                onClick={() => setEnlarged(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div
              className="flex min-h-0 flex-1 items-center justify-center overflow-hidden"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setEnlarged(false)
              }}
              onWheel={(event) =>
                changeZoom(zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15))
              }
            >
              <img
                src={url}
                alt="Foto del medicamento ampliada"
                draggable={false}
                onDoubleClick={() => changeZoom(zoom > 1 ? 1 : 2.5)}
                onPointerDown={(event) => {
                  if (zoom <= 1) return
                  event.currentTarget.setPointerCapture(event.pointerId)
                  drag.current = {
                    x: event.clientX - offset.x,
                    y: event.clientY - offset.y,
                  }
                }}
                onPointerMove={(event) => {
                  if (!drag.current) return
                  setOffset({
                    x: event.clientX - drag.current.x,
                    y: event.clientY - drag.current.y,
                  })
                }}
                onPointerUp={() => {
                  drag.current = null
                }}
                onPointerCancel={() => {
                  drag.current = null
                }}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                }}
                className={`max-h-full max-w-full touch-none rounded-lg bg-white object-contain shadow-2xl select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
