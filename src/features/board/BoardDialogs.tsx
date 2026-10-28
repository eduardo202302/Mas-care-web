import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, PackageX } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import type { components } from '@/lib/api-types'
import { changeExpectedOn } from './board-api'
import type { BoardCard } from '@/lib/board'
import { dateInputValue } from '@/lib/treatments'
import type { NoticeTarget } from '@/lib/operations'
import { NoticeDialog } from '@/features/dashboard/NoticeDialog'

export function ChangeExpectedDateDialog({
  card,
  onClose,
}: {
  card: BoardCard
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [date, setDate] = useState(dateInputValue(card.expected_on))

  const save = useMutation({
    mutationFn: () =>
      changeExpectedOn(card.cycle_id, {
        expected_on: date,
        expected_version: card.version,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['board'] }),
        queryClient.invalidateQueries({ queryKey: ['cycles'] }),
      ])
      toast.push('Fecha prevista actualizada.', 'success')
      onClose()
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  return (
    <Dialog
      title="Cambiar fecha prevista"
      description={`${card.patient.nombre} · ${card.medication.nombre}`}
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (date) save.mutate()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-ink text-sm font-medium">
            Nueva fecha de reposición
          </span>
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="border-border focus:border-tealmax h-10 rounded-lg border bg-white px-3 text-sm outline-none"
          />
        </label>
        <p className="text-muted text-xs">
          El ciclo se reordena en su columna según la nueva fecha. La cobertura
          y el estado derivado no cambian.
        </p>
        {save.isError && (
          <p role="alert" className="text-sm text-red-700">
            No pudimos cambiar la fecha. {save.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!date || save.isPending}
          >
            <CalendarClock className="size-4" />
            {save.isPending ? 'Guardando…' : 'Guardar fecha'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}

export function StockOutDialog({
  card,
  onConfirm,
  onCancel,
  onUpdateStock,
  saving,
}: {
  card: BoardCard
  onConfirm: () => void
  onCancel: () => void
  onUpdateStock: () => void
  saving?: boolean
}) {
  return (
    <Dialog
      title="No hay existencias"
      description={`${card.medication.nombre} · ${card.branch.nombre}`}
      onClose={onCancel}
    >
      <div className="grid gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <PackageX className="mt-0.5 size-5 shrink-0" />
          <p>
            No hay existencias de <strong>{card.medication.nombre}</strong> en{' '}
            <strong>{card.branch.nombre}</strong>. Puedes actualizar la marca o
            mover la tarjeta igualmente; en ese caso se creará una incidencia de
            falta de existencias.
          </p>
        </div>
        <Button type="button" onClick={onUpdateStock}>
          Actualizar existencias
        </Button>
        <FormActions>
          <Button type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? 'Moviendo…' : 'Mover igualmente (crea incidencia)'}
          </Button>
        </FormActions>
      </div>
    </Dialog>
  )
}

export function BoardNoticeDialog({
  card,
  onClose,
}: {
  card: BoardCard
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const patient = useQuery({
    queryKey: ['patients', card.patient.id, 'notice-board'],
    queryFn: () =>
      api<components['schemas']['Patient']>(
        `/api/v1/patients/${encodeURIComponent(card.patient.id)}`,
      ),
  })

  if (patient.isLoading) {
    return (
      <Dialog
        title="Avisar al paciente"
        description={`${card.patient.nombre} · ${card.medication.nombre}`}
        onClose={onClose}
      >
        <div className="grid gap-3" aria-busy="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </Dialog>
    )
  }
  if (patient.isError || !patient.data) {
    return (
      <Dialog title="Avisar al paciente" onClose={onClose}>
        <p role="alert" className="text-sm text-red-700">
          No pudimos cargar los datos de contacto del paciente.
        </p>
      </Dialog>
    )
  }
  const target: NoticeTarget = {
    treatmentId: card.treatment_id,
    patientId: card.patient.id,
    patientName: card.patient.nombre,
    medicationName: card.medication.nombre,
    phone: patient.data.phone,
    phoneHasWhatsapp: patient.data.phoneHasWhatsapp,
    preferredChannel: patient.data.preferredChannel,
    reminderConsent: patient.data.reminderConsent,
  }
  return (
    <NoticeDialog
      target={target}
      onClose={onClose}
      onLogged={() => {
        void queryClient.invalidateQueries({ queryKey: ['board'] })
        void queryClient.invalidateQueries({
          queryKey: ['patients', card.patient.id, 'activities'],
        })
        void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      }}
    />
  )
}
