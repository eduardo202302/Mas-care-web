import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Power, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextField } from '@/components/ui/TextField'
import { TelegramBotCard } from '@/features/telegram/TelegramBotCard'
import { WhatsAppAccountCard } from '@/features/whatsapp/WhatsAppAccountCard'
import { AutomationRules } from './AutomationRules'
import { api } from '@/lib/http'
import { useCan, useMe } from '@/lib/permissions'
import type { components } from '@/lib/api-types'
import {
  automationSettingsSchema,
  type AutomationSettingsFormValues,
} from '@/schemas/automation'

type AutomationSettings = components['schemas']['AutomationSettings']

function Toggle({
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  label: string
  description: string
}) {
  return (
    <label className="border-border flex items-start justify-between gap-4 rounded-lg border bg-white p-4">
      <span className="min-w-0">
        <span className="text-ink block text-sm font-medium">{label}</span>
        <span className="text-muted mt-0.5 block text-xs">{description}</span>
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          onClick={() => !disabled && onChange(!checked)}
          className={`h-6 w-11 cursor-pointer rounded-full transition ${checked ? 'bg-tealmax' : 'bg-border'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <span
            className={`block size-5 translate-x-0.5 translate-y-0.5 rounded-full bg-white shadow transition ${checked ? 'translate-x-[22px]' : ''}`}
          />
        </span>
      </span>
    </label>
  )
}

export default function AutomationSettingsPage() {
  const queryClient = useQueryClient()
  const canManage = useCan('automation:manage')
  const { isLoading: meLoading } = useMe()
  const [saved, setSaved] = useState(false)
  const [killDialogOpen, setKillDialogOpen] = useState(false)

  const settings = useQuery({
    queryKey: ['automation-settings', null],
    queryFn: () => api<AutomationSettings>('/api/v1/automation/settings'),
    enabled: canManage,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AutomationSettingsFormValues>({
    resolver: zodResolver(automationSettingsSchema),
    defaultValues: {
      automationEnabled: false,
      automationDryRun: true,
      timezone: 'America/Santo_Domingo',
      noticeLeadDays: 5,
      maxNoticeAttempts: 3,
      retryAfterHours: 24,
      noticeWindowStart: '09:00',
      noticeWindowEnd: '18:00',
      autoCallTaskWithoutConsent: false,
    },
  })

  useEffect(() => {
    if (!settings.data) return
    reset({
      automationEnabled: settings.data.automation_enabled,
      automationDryRun: settings.data.automation_dry_run,
      timezone: settings.data.timezone,
      noticeLeadDays: settings.data.notice_lead_days,
      maxNoticeAttempts: settings.data.max_notice_attempts,
      retryAfterHours: settings.data.retry_after_hours,
      noticeWindowStart: settings.data.notice_window_start,
      noticeWindowEnd: settings.data.notice_window_end,
      autoCallTaskWithoutConsent: settings.data.auto_call_task_without_consent,
    })
  }, [reset, settings.data])

  const save = useMutation({
    mutationFn: (values: AutomationSettingsFormValues) => {
      const body: components['schemas']['AutomationSettingsPatch'] = {
        automation_enabled: values.automationEnabled,
        automation_dry_run: values.automationDryRun,
        timezone: values.timezone,
        notice_lead_days: values.noticeLeadDays,
        max_notice_attempts: values.maxNoticeAttempts,
        retry_after_hours: values.retryAfterHours,
        notice_window_start: values.noticeWindowStart,
        notice_window_end: values.noticeWindowEnd,
        auto_call_task_without_consent: values.autoCallTaskWithoutConsent,
      }
      return api<AutomationSettings>('/api/v1/automation/settings', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['automation-settings', null], data)
      setSaved(true)
    },
  })

  const killSwitch = useMutation({
    mutationFn: () =>
      api<{ automation_enabled: boolean; branch_id: string | null }>(
        '/api/v1/automation/kill-switch',
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => {
      setKillDialogOpen(false)
      setValue('automationEnabled', false)
      void queryClient.invalidateQueries({ queryKey: ['automation-settings'] })
    },
  })

  const automationEnabled = watch('automationEnabled')
  const automationDryRun = watch('automationDryRun')

  if (meLoading)
    return (
      <div className="grid gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="mt-4 h-96 w-full rounded-xl" />
      </div>
    )
  if (!canManage)
    return (
      <div className="animate-in">
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
          Automatización
        </h1>
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No tienes permiso para ver la automatización de avisos.
        </p>
      </div>
    )

  return (
    <div className="animate-in">
      <div className="mb-7">
        <p className="text-tealmax mb-2 text-sm font-medium">Ajustes</p>
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
          Automatización
        </h1>
        <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
          Controla cuándo y cómo se envían los avisos automáticos por
          WhatsApp. El sistema nunca envía nada en silencio ni sin poder
          detenerse.
        </p>
      </div>

      {settings.isLoading ? (
        <div
          role="status"
          aria-busy="true"
          aria-label="Cargando automatización…"
          className="grid gap-4"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : settings.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar la automatización. {settings.error.message}
        </p>
      ) : (
        <form
          className="grid gap-5"
          onSubmit={handleSubmit((values) => {
            setSaved(false)
            save.mutate(values)
          })}
        >
          <section className="grid gap-3">
            <Toggle
              checked={automationEnabled}
              onChange={(value) => setValue('automationEnabled', value)}
              disabled={save.isPending}
              label="Avisos automáticos"
              description="Apagado por defecto. Al activarlo, el sistema empieza a planificar y enviar avisos según las reglas de abajo."
            />
            <Toggle
              checked={automationDryRun}
              onChange={(value) => setValue('automationDryRun', value)}
              disabled={save.isPending}
              label="Modo prueba (no envía)"
              description="Activado por defecto. Los avisos se planifican y se ven en Envíos, pero no se envían de verdad."
            />
          </section>

          <section className="border-border grid gap-4 rounded-xl border bg-white p-5 md:p-6">
            <h2 className="text-ink text-sm font-semibold">
              Reglas de envío
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Zona horaria (IANA)"
                placeholder="America/Santo_Domingo"
                disabled={save.isPending}
                {...register('timezone')}
                error={errors.timezone?.message}
              />
              <TextField
                label="Días antes del aviso"
                type="number"
                min="0"
                max="365"
                step="1"
                disabled={save.isPending}
                {...register('noticeLeadDays', { valueAsNumber: true })}
                error={errors.noticeLeadDays?.message}
              />
              <TextField
                label="Número de intentos"
                type="number"
                min="1"
                max="10"
                step="1"
                disabled={save.isPending}
                {...register('maxNoticeAttempts', { valueAsNumber: true })}
                error={errors.maxNoticeAttempts?.message}
              />
              <TextField
                label="Espera entre intentos (horas)"
                type="number"
                min="1"
                max="336"
                step="1"
                disabled={save.isPending}
                {...register('retryAfterHours', { valueAsNumber: true })}
                error={errors.retryAfterHours?.message}
              />
              <TextField
                label="Ventana horaria: apertura"
                type="time"
                disabled={save.isPending}
                {...register('noticeWindowStart')}
                error={errors.noticeWindowStart?.message}
              />
              <TextField
                label="Ventana horaria: cierre"
                type="time"
                disabled={save.isPending}
                {...register('noticeWindowEnd')}
              />
            </div>
          </section>

          <section className="border-border grid gap-3 rounded-xl border bg-white p-5 md:p-6">
            <h2 className="text-ink text-sm font-semibold">
              Pacientes sin consentimiento
            </h2>
            <Toggle
              checked={watch('autoCallTaskWithoutConsent')}
              onChange={(value) =>
                setValue('autoCallTaskWithoutConsent', value)
              }
              disabled={save.isPending}
              label="Crear tarea de llamada"
              description="Si está apagado, un paciente sin consentimiento no genera ninguna acción automática."
            />
          </section>

          {save.isError && (
            <p role="alert" className="text-sm text-red-700">
              {save.error.message}
            </p>
          )}
          {saved && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
            >
              <CheckCircle2 className="size-4" />
              Automatización guardada.
            </p>
          )}

          <FormActions>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={save.isPending}
            >
              {save.isPending ? 'Guardando…' : 'Guardar automatización'}
            </Button>
          </FormActions>
        </form>
      )}

      <div className="mt-6"><AutomationRules /></div>
      <WhatsAppAccountCard />
      <TelegramBotCard />
      <section className="mt-8 border-t border-red-100 pt-6">
        <h2 className="text-ink flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="size-4 text-red-700" />
          Zona de emergencia
        </h2>
        <p className="text-muted mt-1 max-w-2xl text-sm">
          Apaga los avisos automáticos de inmediato para toda la
          organización. Úsalo si algo salió mal y necesitas parar ahora.
        </p>
        <Button
          type="button"
          variant="danger"
          className="mt-3"
          onClick={() => setKillDialogOpen(true)}
        >
          <Power className="size-4" />
          Detener todos los envíos
        </Button>
      </section>

      {killDialogOpen && (
        <Dialog
          title="Detener todos los envíos"
          description="Esto apaga la automatización para toda la organización de inmediato."
          onClose={() => setKillDialogOpen(false)}
        >
          <p className="text-ink text-sm">
            ¿Seguro que quieres detener todos los avisos automáticos ahora?
            Podrás volver a activarlos cuando quieras desde esta misma
            página.
          </p>
          {killSwitch.isError && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              No pudimos detener los envíos. {killSwitch.error.message}
            </p>
          )}
          <FormActions>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setKillDialogOpen(false)}
              disabled={killSwitch.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              className="w-full sm:w-auto"
              disabled={killSwitch.isPending}
              onClick={() => killSwitch.mutate()}
            >
              {killSwitch.isPending ? 'Deteniendo…' : 'Sí, detener todo'}
            </Button>
          </FormActions>
        </Dialog>
      )}
    </div>
  )
}
