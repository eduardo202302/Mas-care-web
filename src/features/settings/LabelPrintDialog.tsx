import { useState } from 'react'
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
import { formatInches, labelDims, type LabelDesign } from './labelConfig'
import { LabelPrint, LabelSheet } from './LabelSheet'

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

const toDesign = (template: LabelTemplate): LabelDesign => ({
  widthIn: Number(template.widthIn),
  heightIn: Number(template.heightIn),
  orientation: template.orientation,
  elements: template.elements,
})

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

  const design = template ? toDesign(template) : null
  const [w, h] = design
    ? labelDims(design.widthIn, design.heightIn, design.orientation)
    : [0, 0]

  return (
    <Dialog
      title="Imprimir Etiqueta"
      icon={<Tag className="size-5" />}
      compactHeader
      onClose={onClose}
      size="md"
    >
      {templates.isLoading ? (
        <p className="text-muted text-sm">Cargando plantillas…</p>
      ) : !template || !design ? (
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
            Etiqueta: <strong className="text-ink">{template.name}</strong> ·{' '}
            {formatInches(w)} × {formatInches(h)} in
          </p>
          <div className="bg-surface flex justify-center overflow-auto rounded-lg border border-slate-200 p-6">
            <LabelSheet
              design={design}
              values={preview.data!.values}
              className="border border-slate-300"
            />
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

      {printing && design && preview.data && (
        <LabelPrint
          design={design}
          values={preview.data.values}
          onDone={() => setPrinting(false)}
        />
      )}
    </Dialog>
  )
}
