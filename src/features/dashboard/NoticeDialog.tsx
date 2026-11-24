import { Select } from '@/components/ui/Select'
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ClipboardCheck,
  ListChecks,
  MessagesSquare,
  UserRoundCheck,
} from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { ModalSection } from '@/components/ui/ModalSection'
import { TextField } from '@/components/ui/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { useToast } from '@/components/ui/Toast'
import { moveCycle } from '@/features/board/board-api'
import { ApiError, api } from '@/lib/http'
import { isOpenCycle, type BoardCard, type CycleStatus } from '@/lib/board'
import type { NoticeTarget } from '@/lib/operations'
import { effectiveStage, usePipeline } from '@/lib/pipeline'
import { DeliveryDialog } from './DeliveryDialog'

type ContactChannel = 'whatsapp' | 'email' | 'telegram' | 'call'

const CHANNELS: { value: ContactChannel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Gmail' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'call', label: 'Llamada' },
]

function initialChannel(
  preferred: NoticeTarget['preferredChannel'],
): ContactChannel {
  return preferred === 'whatsapp' ||
    preferred === 'telegram' ||
    preferred === 'call'
    ? preferred
    : 'whatsapp'
}

const selectClass =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2'

export function NoticeDialog({
  target,
  keepStatus = false,
  stageEditable = true,
  onClose,
  onLogged,
}: {
  target: NoticeTarget
  /** La reposición ya se movió: no se propone avanzarla a "Avisado" al registrar el seguimiento. */
  keepStatus?: boolean
  /** En `false` el estado se muestra pero no se puede cambiar (el tablero no cambia estados). */
  stageEditable?: boolean
  onClose: () => void
  onLogged?: () => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [channel, setChannel] = useState<ContactChannel>(
    initialChannel(target.preferredChannel),
  )
  const [contactName, setContactName] = useState('')
  const [note, setNote] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [chosenStageId, setChosenStageId] = useState<string | null>(null)
  const [delivering, setDelivering] = useState(false)

  // La reposición abierta del tratamiento: su etapa es el "estado" que se puede cambiar aquí.
  const cycles = useQuery({
    queryKey: ['cycles', 'followup', target.treatmentId],
    queryFn: () =>
      api<{ data: BoardCard[] }>(
        `/api/v1/cycles?treatment_ids=${encodeURIComponent(target.treatmentId)}&rows=5`,
      ),
  })
  const pipeline = usePipeline().data
  const openCycle = cycles.data?.data.find(isOpenCycle)
  const stages = [...(pipeline?.stages ?? [])].sort(
    (a, b) => a.position - b.position,
  )
  const currentStage =
    openCycle && pipeline
      ? effectiveStage(
          pipeline,
          openCycle.status,
          (openCycle as { stage_id?: string | null }).stage_id,
        )
      : undefined
  // Registrar un seguimiento desde "Creado" propone pasarla a "Avisado", como antes; se puede cambiar.
  const suggestedStage =
    stageEditable && !keepStatus && openCycle?.status === 'to_notify'
      ? stages.find((stage) => stage.system_status === 'notified')
      : undefined
  const selectedStageId = stageEditable
    ? (chosenStageId ?? suggestedStage?.id ?? currentStage?.id ?? '')
    : (currentStage?.id ?? '')
  const targetStage = stages.find((stage) => stage.id === selectedStageId)
  const stageChanged = Boolean(
    openCycle && targetStage && targetStage.id !== currentStage?.id,
  )
  const fromCancelled = currentStage?.name.trim().toLowerCase() === 'cancelado'

  const nameMissing = !contactName.trim()
  const noteMissing = !note.trim()

  const log = useMutation({
    mutationFn: async (confirmOutOfStock: boolean) => {
      // Primero el cambio de etapa: si falla (existencias, versión…) no queda un seguimiento a medias.
      if (
        openCycle &&
        targetStage &&
        stageChanged &&
        targetStage.system_status !== 'closed'
      ) {
        if (targetStage.system_status !== openCycle.status) {
          await moveCycle(openCycle.cycle_id, {
            to_status: targetStage.system_status as CycleStatus,
            stage_id: targetStage.id,
            expected_version: openCycle.version,
            ...(confirmOutOfStock ? { confirm_out_of_stock: true } : {}),
          })
        } else {
          await api(
            `/api/v1/cycles/${encodeURIComponent(openCycle.cycle_id)}/stage`,
            {
              method: 'PATCH',
              body: JSON.stringify({ stage_id: targetStage.id }),
            },
          )
        }
      }
      await api(
        `/api/v1/treatments/${encodeURIComponent(target.treatmentId)}/notice-logged`,
        {
          method: 'POST',
          body: JSON.stringify({
            channel,
            contact_name: contactName.trim(),
            note: note.trim(),
            // La etapa la decide el desplegable, no el registro del seguimiento.
            advance: false,
          }),
        },
      )
    },
    onSuccess: async () => {
      onLogged?.()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['board'] }),
        queryClient.invalidateQueries({ queryKey: ['cycles'] }),
        queryClient.invalidateQueries({ queryKey: ['pipeline'] }),
        queryClient.invalidateQueries({
          queryKey: ['patients', target.patientId, 'activities'],
        }),
      ])
      toast.push(
        'Seguimiento registrado en el historial del paciente.',
        'success',
      )
      // Entregar pide su propia fecha y cantidad: se abre su diálogo.
      if (stageChanged && targetStage?.system_status === 'closed')
        setDelivering(true)
      else onClose()
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (log.isPending) return
    if (nameMissing || noteMissing) {
      setShowErrors(true)
      return
    }
    log.mutate(false)
  }

  const stockConflict =
    log.error instanceof ApiError && log.error.code === 'STOCK_OUT_OF_STOCK'

  return (
    <Dialog
      title={`Seguimiento al Paciente: ${target.patientName}`}
      description={target.medicationName}
      icon={<UserRoundCheck className="size-6" />}
      compactHeader
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <form noValidate onSubmit={submit} className="grid gap-4">
        <ModalSection
          icon={<ListChecks className="size-4" />}
          title="Estado Del Tratamiento"
          defaultCollapsed={false}
        >
          <label className="grid gap-1.5">
            <span className="text-ink text-sm font-medium">Estado</span>
            <Select
              showAll
              value={selectedStageId}
              disabled={!openCycle || log.isPending || !stageEditable}
              onChange={(event) => setChosenStageId(event.target.value)}
              className={selectClass}
            >
              {!openCycle && (
                <option value="">
                  {cycles.isLoading ? 'Cargando…' : 'Sin reposición abierta'}
                </option>
              )}
              {stages.map((stage) => (
                <option
                  key={stage.id}
                  value={stage.id}
                  disabled={
                    fromCancelled &&
                    (stage.system_status === 'prepared' ||
                      stage.system_status === 'closed')
                  }
                >
                  {stage.name}
                </option>
              ))}
            </Select>
          </label>
          {!stageEditable && (
            <p className="text-muted text-xs">
              El estado no se cambia desde el tablero: usa el Seguimiento en la
              ficha del paciente.
            </p>
          )}
          {stageEditable && cycles.isSuccess && !openCycle && (
            <p className="text-muted text-xs">
              Este tratamiento no tiene una reposición abierta: el estado no se
              puede cambiar desde aquí.
            </p>
          )}
        </ModalSection>

        <ModalSection
          icon={<MessagesSquare className="size-4" />}
          title="Contacto Con El Paciente"
          defaultCollapsed={false}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid content-start gap-1.5">
              <span className="text-ink text-sm font-medium after:ml-0.5 after:text-red-600 after:content-['*']">
                Canal de Comunicación
              </span>
              <Select
                value={channel}
                onChange={(event) =>
                  setChannel(event.target.value as ContactChannel)
                }
                className={selectClass}
              >
                {CHANNELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>

            <TextField
              label="Nombre de Quien Respondió"
              required
              value={contactName}
              maxLength={160}
              autoComplete="off"
              error={
                showErrors && nameMissing
                  ? 'Indica quién respondió.'
                  : undefined
              }
              onChange={(event) => setContactName(event.target.value)}
            />
          </div>

          <TextAreaField
            label="Nota"
            required
            value={note}
            maxLength={2000}
            error={
              showErrors && noteMissing ? 'Escribe de qué se habló.' : undefined
            }
            onChange={(event) => setNote(event.target.value)}
          />
        </ModalSection>

        {log.isError && (
          <div role="alert" className="grid gap-2 text-sm text-red-700">
            <p>No pudimos registrar el seguimiento. {log.error.message}</p>
            {stockConflict && (
              <Button
                type="button"
                className="w-fit"
                disabled={log.isPending}
                onClick={() => log.mutate(true)}
              >
                Continuar sin existencias
              </Button>
            )}
          </div>
        )}

        <FormActions>
          <Button type="button" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={log.isPending}
          >
            <ClipboardCheck className="size-4" />
            {log.isPending ? 'Registrando…' : 'Registrar Aviso'}
          </Button>
        </FormActions>
      </form>
      {delivering && (
        <DeliveryDialog
          treatmentId={target.treatmentId}
          patientName={target.patientName}
          medicationName={target.medicationName}
          onClose={onClose}
          onCompleted={() => {
            void queryClient.invalidateQueries({ queryKey: ['board'] })
            void queryClient.invalidateQueries({ queryKey: ['cycles'] })
            onClose()
          }}
        />
      )}
    </Dialog>
  )
}
