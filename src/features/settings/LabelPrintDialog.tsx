import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Printer, Tag } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import type {
  LabelPreviewValues,
  LabelTemplate,
  LabelTemplateList,
} from '@/lib/operations'
import { LABEL_VARIABLE_LABELS } from './LabelEditor'

const MM_TO_PX = 3.78

function pickDefaultTemplate(
  templates: LabelTemplate[],
  branchId: string | null,
): LabelTemplate | null {
  const active = templates.filter((template) => template.isActive)
  return (
    active.find((template) => template.isDefault && template.branchId === branchId) ??
    active.find((template) => template.isDefault && !template.branchId) ??
    active.find((template) => template.branchId === branchId) ??
    active.find((template) => !template.branchId) ??
    null
  )
}

/** Renders one label at its real mm size for printing, variables already resolved. */
function LabelSheet({
  template,
  values,
}: {
  template: LabelTemplate
  values: Record<string, string>
}) {
  const widthMm = Number(template.widthMm)
  const heightMm = Number(template.heightMm)
  let w = widthMm
  let h = heightMm
  if (template.orientation === 'portrait' && w > h) [w, h] = [h, w]
  if (template.orientation === 'landscape' && h > w) [w, h] = [h, w]

  return (
    <>
      <style>{`@page { size: ${w}mm ${h}mm; margin: 0; }`}</style>
      <div
        className="label-print-sheet relative mx-auto border border-slate-300 bg-white"
        style={{ width: w * MM_TO_PX, height: h * MM_TO_PX }}
      >
        {template.elements.map((element) => {
          const text =
            element.type === 'text'
              ? element.text
              : element.type === 'line'
                ? ''
                : element.showLabel
                  ? `${LABEL_VARIABLE_LABELS[element.key]}: ${values[element.key] ?? ''}`
                  : values[element.key] ?? ''
          return (
            <div
              key={element.id}
              className="absolute px-1 py-0.5 leading-tight whitespace-pre-wrap"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.w}%`,
                minHeight: element.h,
                fontSize: element.fontSize,
                fontWeight: element.bold ? 700 : 400,
                fontStyle: element.italic ? 'italic' : 'normal',
                textAlign: element.align,
                color: element.color,
                textDecoration: element.underline ? 'underline' : 'none',
                borderBottom: element.type === 'line' ? `1px solid ${element.color}` : undefined,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              }}
            >
              {text}
            </div>
          )
        })}
      </div>
    </>
  )
}

export function LabelPrintDialog({
  treatmentId,
  branchId,
  onClose,
}: {
  treatmentId: string
  branchId: string | null
  onClose: () => void
}) {
  const [printing, setPrinting] = useState(false)
  const templates = useQuery({
    queryKey: ['label-templates', 'active'],
    queryFn: () => api<LabelTemplateList>('/api/v1/label-templates?active=true'),
  })
  const template = templates.data
    ? pickDefaultTemplate(templates.data.data, branchId)
    : null

  const preview = useQuery({
    queryKey: ['label-templates', template?.id, 'preview', treatmentId],
    queryFn: () =>
      api<LabelPreviewValues>(
        `/api/v1/label-templates/${encodeURIComponent(template!.id)}/preview?treatment_id=${encodeURIComponent(treatmentId)}`,
      ),
    enabled: Boolean(template),
  })

  useEffect(() => {
    if (!printing) return
    const after = () => setPrinting(false)
    window.addEventListener('afterprint', after, { once: true })
    const timer = window.setTimeout(() => window.print(), 50)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('afterprint', after)
    }
  }, [printing])

  return (
    <Dialog
      title="Imprimir etiqueta"
      icon={<Tag className="size-5" />}
      compactHeader
      onClose={onClose}
      size="md"
    >
      {templates.isLoading ? (
        <p className="text-muted text-sm">Cargando plantillas…</p>
      ) : !template ? (
        <p role="alert" className="text-sm text-amber-800">
          No hay ninguna etiqueta activa configurada como predeterminada.
          Configúrala en Ajustes → Plantillas de aviso → Etiquetas.
        </p>
      ) : preview.isLoading ? (
        <p className="text-muted text-sm">Cargando datos del tratamiento…</p>
      ) : preview.isError ? (
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar los datos para la etiqueta. {preview.error.message}
        </p>
      ) : (
        <div className="grid gap-4">
          <p className="text-muted text-xs">
            Etiqueta: <strong className="text-ink">{template.name}</strong>
          </p>
          <div className="bg-surface flex justify-center overflow-auto rounded-lg border border-slate-200 p-6">
            <LabelSheet template={template} values={preview.data!.values} />
          </div>
        </div>
      )}

      <FormActions>
        <Button type="button" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!template || preview.isLoading || !preview.data}
          onClick={() => setPrinting(true)}
        >
          <Printer className="size-4" />
          Imprimir
        </Button>
      </FormActions>

      {printing && template && preview.data && (
        <div className="label-print-portal">
          <LabelSheet template={template} values={preview.data.values} />
        </div>
      )}
    </Dialog>
  )
}
