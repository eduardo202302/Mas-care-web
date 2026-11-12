import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Star, Tag } from 'lucide-react'
import { BranchTag } from '@/components/BranchTag'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'
import type { paths } from '@/lib/api-types'
import { useCan } from '@/lib/permissions'
import type { LabelTemplate, LabelTemplateList } from '@/lib/operations'
import { LabelTemplateFormDialog } from './LabelTemplateFormDialog'
import { formatInches } from './labelConfig'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

export function LabelTemplatesTab() {
  const queryClient = useQueryClient()
  const canWrite = useCan('templates:write')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LabelTemplate | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const templates = useQuery({
    queryKey: ['label-templates'],
    queryFn: () => api<LabelTemplateList>('/api/v1/label-templates'),
  })
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
  })
  const branchMap = new Map(
    (branches.data?.data ?? []).map((branch) => [branch.id, branch]),
  )

  const toggleActive = useMutation({
    mutationFn: (template: LabelTemplate) =>
      api<LabelTemplate>(
        `/api/v1/label-templates/${encodeURIComponent(template.id)}`,
        { method: 'PATCH', body: JSON.stringify({ is_active: !template.isActive }) },
      ),
    onSuccess: async (template) => {
      setFeedback(template.isActive ? 'Etiqueta activada.' : 'Etiqueta desactivada.')
      await queryClient.invalidateQueries({ queryKey: ['label-templates'] })
    },
  })
  const setDefault = useMutation({
    mutationFn: (template: LabelTemplate) =>
      api<LabelTemplate>(
        `/api/v1/label-templates/${encodeURIComponent(template.id)}`,
        { method: 'PATCH', body: JSON.stringify({ is_default: true }) },
      ),
    onSuccess: async () => {
      setFeedback('Etiqueta predeterminada actualizada.')
      await queryClient.invalidateQueries({ queryKey: ['label-templates'] })
    },
  })

  const data = templates.data?.data ?? []

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-muted text-xs">
          Diseña las etiquetas físicas que se imprimen para cada medicamento de
          un tratamiento.
        </p>
        {canWrite && (
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nueva Etiqueta
          </Button>
        )}
      </div>

      {feedback && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {feedback}
        </p>
      )}
      {templates.isError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          No pudimos cargar las etiquetas. {templates.error.message}{' '}
          <button type="button" className="font-semibold underline" onClick={() => void templates.refetch()}>
            Reintentar
          </button>
        </p>
      )}

      {templates.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title="Aún no hay etiquetas"
          description="Diseña una etiqueta para imprimirla al entregar los medicamentos de un tratamiento."
          action={
            canWrite ? (
              <Button variant="primary" onClick={() => { setEditing(null); setFormOpen(true) }}>
                <Plus className="size-4" />
                Nueva Etiqueta
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((template) => {
            const branch = template.branchId ? branchMap.get(template.branchId) : undefined
            return (
              <article key={template.id} className="border-border shadow-card rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-surface text-tealmax grid size-9 place-items-center rounded-lg">
                      <Tag className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-ink text-sm font-semibold">{template.name}</h3>
                      <p className="text-muted text-xs">
                        {formatInches(Number(template.widthIn))} × {formatInches(Number(template.heightIn))} in ·{' '}
                        {template.orientation === 'landscape' ? 'Horizontal' : 'Vertical'}
                      </p>
                    </div>
                  </div>
                  {template.isDefault && (
                    <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      <Star className="size-3" fill="currentColor" />
                      Predeterminada
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      template.isActive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    {template.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  {branch ? (
                    <BranchTag name={branch.name} labelColor={branch.labelColor} />
                  ) : (
                    <span className="text-muted text-[11px]">Toda la organización</span>
                  )}
                </div>

                {template.description && (
                  <p className="text-muted mt-2 line-clamp-2 text-xs">{template.description}</p>
                )}

                {canWrite && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        setEditing(template)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs"
                        onClick={() => setDefault.mutate(template)}
                        disabled={setDefault.isPending}
                      >
                        <Star className="size-3.5" />
                        Predeterminar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="h-8 px-3 text-xs"
                      onClick={() => toggleActive.mutate(template)}
                      disabled={toggleActive.isPending}
                    >
                      {template.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {formOpen && (
        <LabelTemplateFormDialog
          key={editing?.id ?? 'new'}
          template={editing ?? undefined}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSaved={setFeedback}
        />
      )}
    </div>
  )
}
