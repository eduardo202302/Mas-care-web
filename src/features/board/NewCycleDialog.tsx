import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'

type Eligible = {
  id: string
  patient: { id: string; name: string }
  medication: string
}

/**
 * Cycles are always born from an existing treatment. Only active treatments
 * without an open cycle are offered, and the new cycle lands in `status`.
 */
export function NewCycleDialog({
  status,
  stageName,
  onClose,
}: {
  status: string
  stageName: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [treatmentId, setTreatmentId] = useState('')
  const eligible = useQuery({
    queryKey: ['eligible-treatments', search],
    queryFn: () =>
      api<{ data: Eligible[] }>(
        `/api/v1/cycles/eligible-treatments${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`,
      ),
  })
  const create = useMutation({
    mutationFn: () =>
      api('/api/v1/cycles', {
        method: 'POST',
        body: JSON.stringify({ treatment_id: treatmentId, status }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['board'] })
      await queryClient.invalidateQueries({ queryKey: ['cycles'] })
      onClose()
    },
  })
  const options = eligible.data?.data ?? []

  return (
    <Dialog
      title="Nuevo ciclo"
      description={`El ciclo se creará en «${stageName}» a partir de un tratamiento existente.`}
      onClose={onClose}
    >
      <div className="grid gap-3">
        <input
          aria-label="Buscar paciente"
          placeholder="Buscar paciente"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
        />
        <label className="grid gap-1 text-sm font-medium">
          Tratamiento
          <select
            value={treatmentId}
            onChange={(event) => setTreatmentId(event.target.value)}
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
          >
            <option value="">Selecciona un tratamiento</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.patient.name} — {option.medication}
              </option>
            ))}
          </select>
        </label>
        {eligible.isSuccess && options.length === 0 && (
          <p className="text-muted text-sm">
            No hay tratamientos activos sin un ciclo abierto.
          </p>
        )}
        {create.isError && (
          <p role="alert" className="text-sm text-red-700">
            {create.error.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!treatmentId || create.isPending}
            onClick={() => create.mutate()}
          >
            Crear ciclo
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
