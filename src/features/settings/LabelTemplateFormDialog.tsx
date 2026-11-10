import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Tag } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormActions } from '@/components/ui/FormActions'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import type { LabelElement, LabelTemplate, LabelVariableKey } from '@/lib/operations'
import {
  LABEL_SAMPLES,
  LabelEditor,
  LabelVariablePalette,
  createLabelElement,
} from './LabelEditor'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

const control =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2'

export function LabelTemplateFormDialog({
  template,
  onClose,
  onSaved,
}: {
  template?: LabelTemplate
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [branchId, setBranchId] = useState(template?.branchId ?? '')
  const [widthMm, setWidthMm] = useState(Number(template?.widthMm ?? 100))
  const [heightMm, setHeightMm] = useState(Number(template?.heightMm ?? 60))
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
    template?.orientation ?? 'landscape',
  )
  const [elements, setElements] = useState<LabelElement[]>(template?.elements ?? [])
  const [isActive, setIsActive] = useState(template?.isActive ?? true)

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        branch_id: branchId || null,
        width_mm: widthMm,
        height_mm: heightMm,
        orientation,
        elements,
        is_active: isActive,
      }
      return template
        ? api<LabelTemplate>(
            `/api/v1/label-templates/${encodeURIComponent(template.id)}`,
            { method: 'PATCH', body: JSON.stringify(payload) },
          )
        : api<LabelTemplate>('/api/v1/label-templates', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['label-templates'] })
      onSaved(template ? 'Etiqueta actualizada.' : 'Etiqueta creada.')
      onClose()
    },
  })

  function addVariable(key: LabelVariableKey) {
    setElements((current) => [...current, createLabelElement({ type: 'variable', key })])
  }

  return (
    <Dialog
      title={template ? 'Editar etiqueta' : 'Nueva etiqueta'}
      icon={<Tag className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
      size="xl"
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim() || save.isPending) return
          save.mutate()
        }}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-2">
            <TextField
              label="Nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
              placeholder="Etiqueta de medicamento"
            />
          </div>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Sucursal</span>
            <select value={branchId} onChange={(event) => setBranchId(event.target.value)} className={control}>
              <option value="">Toda la organización</option>
              {(branches.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Ancho (mm)</span>
            <input
              type="number"
              min={20}
              max={300}
              value={widthMm}
              onChange={(event) => setWidthMm(Number(event.target.value))}
              className={control}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Alto (mm)</span>
            <input
              type="number"
              min={20}
              max={300}
              value={heightMm}
              onChange={(event) => setHeightMm(Number(event.target.value))}
              className={control}
            />
          </label>
        </div>

        <TextField
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={300}
          placeholder="Para qué tratamientos o sucursal se usa esta etiqueta"
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Orientación</span>
            <select
              value={orientation}
              onChange={(event) => setOrientation(event.target.value as 'landscape' | 'portrait')}
              className={control}
            >
              <option value="landscape">Horizontal</option>
              <option value="portrait">Vertical</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="border-border text-tealmax size-4 rounded"
            />
            <span className="text-ink">Etiqueta activa</span>
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-[180px_1fr]">
          <div className="border-border max-h-[480px] overflow-y-auto rounded-lg border bg-white p-3">
            <p className="text-muted mb-2 text-xs">
              Arrastra o haz clic para agregar.
            </p>
            <LabelVariablePalette onAdd={addVariable} />
          </div>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const key = event.dataTransfer.getData('text/plain') as LabelVariableKey
              if (key in LABEL_SAMPLES) addVariable(key)
            }}
          >
            <LabelEditor
              widthMm={widthMm}
              heightMm={heightMm}
              orientation={orientation}
              elements={elements}
              onChange={setElements}
            />
          </div>
        </div>

        {save.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos guardar la etiqueta. {save.error.message}
          </p>
        )}

        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim() || save.isPending}>
            {save.isPending ? 'Guardando…' : 'Guardar etiqueta'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
