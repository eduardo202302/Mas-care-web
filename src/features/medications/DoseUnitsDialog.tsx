import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Ruler, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TextField } from '@/components/ui/TextField'
import { api, ApiError } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { DOSE_UNITS_KEY, type DoseUnit } from './useDoseUnits'

function errorText(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function DoseUnitsDialog({
  units,
  onCreated,
  onRenamed,
  onClose,
}: {
  units: DoseUnit[]
  /** Se llama con el nombre de la unidad recién creada para dejarla seleccionada. */
  onCreated: (name: string) => void
  onRenamed: (from: string, to: string) => void
  onClose: () => void
}) {
  const canWrite = useCan('medications:write')
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: DOSE_UNITS_KEY })

  const create = useMutation({
    mutationFn: (name: string) =>
      api<DoseUnit>('/api/v1/dose-units', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: async (unit) => {
      await refresh()
      setNewName('')
      onCreated(unit.name)
      onClose()
    },
  })
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api<DoseUnit>(`/api/v1/dose-units/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: async (unit, { id }) => {
      const previous = units.find((item) => item.id === id)
      await Promise.all([
        refresh(),
        queryClient.invalidateQueries({ queryKey: ['medications'] }),
      ])
      if (previous) onRenamed(previous.name, unit.name)
      setEditingId(null)
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/api/v1/dose-units/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await refresh()
      setDeletingId(null)
    },
  })

  const trimmedNew = newName.trim()
  const trimmedEdit = editName.trim()
  const busy = create.isPending || rename.isPending || remove.isPending

  function submitCreate() {
    if (!trimmedNew || busy) return
    create.mutate(trimmedNew)
  }
  function submitRename(unit: DoseUnit) {
    if (!trimmedEdit || busy) return
    if (trimmedEdit === unit.name) return setEditingId(null)
    rename.mutate({ id: unit.id, name: trimmedEdit })
  }

  return (
    <Dialog
      title="Unidades de Dosis"
      description="Crea, renombra o elimina las unidades disponibles para los medicamentos."
      icon={<Ruler className="size-5" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <div className="grid gap-4">
        {canWrite && (
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <TextField
                label="Nueva unidad"
                placeholder="Ej. comprimido"
                maxLength={50}
                autoComplete="off"
                value={newName}
                onChange={(event) => {
                  create.reset()
                  setNewName(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  submitCreate()
                }}
                error={
                  create.isError
                    ? errorText(create.error, 'No pudimos crear la unidad.')
                    : undefined
                }
              />
            </div>
            <Button
              type="button"
              variant="primary"
              disabled={!trimmedNew || busy}
              onClick={submitCreate}
            >
              <Plus className="size-4" />
              Agregar
            </Button>
          </div>
        )}

        <ul className="border-border divide-border max-h-80 divide-y overflow-y-auto rounded-lg border bg-white">
          {units.length === 0 && (
            <li className="text-muted px-3 py-3 text-sm">
              Aún no hay unidades.
            </li>
          )}
          {units.map((unit) => (
            <li key={unit.id} className="grid gap-1 px-3 py-2">
              {editingId === unit.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    aria-label={`Nombre de la unidad ${unit.name}`}
                    maxLength={50}
                    value={editName}
                    onChange={(event) => {
                      rename.reset()
                      setEditName(event.target.value)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        submitRename(unit)
                      }
                      if (event.key === 'Escape') {
                        event.stopPropagation()
                        setEditingId(null)
                      }
                    }}
                    className="border-border text-ink focus:border-tealmax h-9 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-2"
                    aria-label="Guardar nombre"
                    disabled={!trimmedEdit || busy}
                    onClick={() => submitRename(unit)}
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-2"
                    aria-label="Cancelar edición"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : deletingId === unit.id ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink text-sm">
                    ¿Eliminar «
                    <strong className="font-bold">{unit.name}</strong>»?
                  </span>
                  <span className="flex gap-1">
                    <Button
                      type="button"
                      variant="danger"
                      className="h-8 px-3 text-xs"
                      disabled={busy}
                      onClick={() => remove.mutate(unit.id)}
                    >
                      Eliminar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        remove.reset()
                        setDeletingId(null)
                      }}
                    >
                      No
                    </Button>
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink text-sm">{unit.name}</span>
                  {canWrite && (
                    <span className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2"
                        aria-label={`Renombrar ${unit.name}`}
                        onClick={() => {
                          rename.reset()
                          setDeletingId(null)
                          setEditName(unit.name)
                          setEditingId(unit.id)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2 text-red-700"
                        aria-label={`Eliminar ${unit.name}`}
                        onClick={() => {
                          remove.reset()
                          setEditingId(null)
                          setDeletingId(unit.id)
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </span>
                  )}
                </div>
              )}
              {editingId === unit.id && rename.isError && (
                <p className="text-xs text-red-700">
                  {errorText(rename.error, 'No pudimos renombrar la unidad.')}
                </p>
              )}
              {deletingId === unit.id && remove.isError && (
                <p className="text-xs text-red-700">
                  {errorText(remove.error, 'No pudimos eliminar la unidad.')}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
