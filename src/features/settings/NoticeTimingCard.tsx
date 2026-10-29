import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import type { components } from '@/lib/api-types'
import {
  noticeTimingSchema,
  type NoticeTimingFormValues,
} from '@/schemas/settings'

type AutomationSettings = components['schemas']['AutomationSettings']

/** Same org-level settings the automation page edits; only the timing fields. */
export function NoticeTimingCard() {
  const queryClient = useQueryClient()
  const canManage = useCan('automation:manage')
  const [saved, setSaved] = useState(false)
  const settings = useQuery({
    queryKey: ['automation-settings', null],
    queryFn: () => api<AutomationSettings>('/api/v1/automation/settings'),
    enabled: canManage,
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoticeTimingFormValues>({
    resolver: zodResolver(noticeTimingSchema),
    defaultValues: {
      noticeLeadDays: 0,
      retryAfterHours: 1,
      noticeWindowStart: '09:00',
      noticeWindowEnd: '18:00',
    },
  })
  useEffect(() => {
    if (!settings.data) return
    reset({
      noticeLeadDays: settings.data.notice_lead_days,
      retryAfterHours: settings.data.retry_after_hours,
      noticeWindowStart: settings.data.notice_window_start,
      noticeWindowEnd: settings.data.notice_window_end,
    })
  }, [reset, settings.data])
  const save = useMutation({
    mutationFn: (values: NoticeTimingFormValues) => {
      const body: components['schemas']['AutomationSettingsPatch'] = {
        notice_lead_days: values.noticeLeadDays,
        retry_after_hours: values.retryAfterHours,
        notice_window_start: values.noticeWindowStart,
        notice_window_end: values.noticeWindowEnd,
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

  if (!canManage || !settings.data) return null

  return (
    <section className="border-border mt-6 rounded-xl border bg-white p-5 md:p-6">
      <h2 className="font-display text-petroleo text-xl font-bold">
        Tiempos de los avisos
      </h2>
      <p className="text-muted mt-1 mb-4 max-w-2xl text-sm leading-6">
        Cuándo se preparan y reenvían los avisos de reposición.
      </p>
      <form
        className="grid gap-5"
        onSubmit={handleSubmit((values) => {
          setSaved(false)
          save.mutate(values)
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Días de anticipación del aviso"
            type="number"
            min="0"
            max="365"
            step="1"
            required
            disabled={save.isPending}
            {...register('noticeLeadDays', { valueAsNumber: true })}
            error={errors.noticeLeadDays?.message}
          />
          <TextField
            label="Horas para reintentar un aviso"
            type="number"
            min="1"
            max="336"
            step="1"
            required
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
            error={errors.noticeWindowEnd?.message}
          />
        </div>
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
            Tiempos guardados.
          </p>
        )}
        <FormActions>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={save.isPending}
          >
            {save.isPending ? 'Guardando…' : 'Guardar tiempos'}
          </Button>
        </FormActions>
      </form>
    </section>
  )
}
