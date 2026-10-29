import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'
import { useCan, useMe } from '@/lib/permissions'
import type { components } from '@/lib/api-types'
import { NoticeTimingCard } from './NoticeTimingCard'
import { thresholdsSchema, type ThresholdsFormValues } from '@/schemas/settings'

type Settings = components['schemas']['Settings']

export default function ThresholdsPage() {
  const queryClient = useQueryClient()
  const canRead = useCan('settings:read')
  const canWrite = useCan('settings:write')
  const { isLoading: meLoading } = useMe()
  const [saved, setSaved] = useState(false)
  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: () => api<Settings>('/api/v1/settings'),
    enabled: canRead,
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ThresholdsFormValues>({
    resolver: zodResolver(thresholdsSchema),
    defaultValues: {
      dueSoonDays: 0,
      upcomingDays: 0,
      prescriptionWarningDays: 0,
    },
  })
  useEffect(() => {
    if (!settings.data) return
    reset({
      dueSoonDays: settings.data.due_soon_days,
      upcomingDays: settings.data.upcoming_days,
      prescriptionWarningDays: settings.data.prescription_warning_days,
    })
  }, [reset, settings.data])
  const save = useMutation({
    mutationFn: (values: ThresholdsFormValues) => {
      const body: components['schemas']['SettingsPatch'] = {
        due_soon_days: values.dueSoonDays,
        upcoming_days: values.upcomingDays,
        prescription_warning_days: values.prescriptionWarningDays,
      }
      return api<Settings>('/api/v1/settings', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data)
      setSaved(true)
    },
  })

  if (meLoading)
    return (
      <div className="grid gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="mt-4 h-72 w-full rounded-xl" />
      </div>
    )
  if (!canRead)
    return (
      <div className="animate-in">
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
          Parámetros de tiempo
        </h1>
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          No tienes permiso para ver la configuración de parámetros de tiempo.
        </p>
      </div>
    )

  return (
    <div className="animate-in">
      <div className="mb-7">
        <p className="text-tealmax mb-2 text-sm font-medium">Ajustes</p>
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
          Parámetros de tiempo
        </h1>
        <p className="text-muted mt-2 max-w-2xl text-sm leading-6">
          Define con cuánta anticipación se muestran las alertas de reposición y
          de receta. Los estados se calculan en la API con estos valores.
        </p>
      </div>
      <section className="border-border rounded-xl border bg-white p-5 md:p-6">
        {settings.isLoading ? (
          <div
            role="status"
            aria-busy="true"
            aria-label="Cargando parámetros…"
            className="grid gap-4 sm:grid-cols-3"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="grid gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        ) : settings.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            No pudimos cargar los parámetros. {settings.error.message}
          </p>
        ) : (
          <form
            className="grid gap-5"
            onSubmit={handleSubmit((values) => {
              setSaved(false)
              save.mutate(values)
            })}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Días para «Vence pronto»"
                type="number"
                min="0"
                max="365"
                step="1"
                required
                disabled={!canWrite || save.isPending}
                {...register('dueSoonDays', { valueAsNumber: true })}
                error={errors.dueSoonDays?.message}
              />
              <TextField
                label="Días para «Próxima reposición»"
                type="number"
                min="0"
                max="365"
                step="1"
                required
                disabled={!canWrite || save.isPending}
                {...register('upcomingDays', { valueAsNumber: true })}
                error={errors.upcomingDays?.message}
              />
              <TextField
                label="Días de aviso de receta"
                type="number"
                min="0"
                max="365"
                step="1"
                required
                disabled={!canWrite || save.isPending}
                {...register('prescriptionWarningDays', {
                  valueAsNumber: true,
                })}
                error={errors.prescriptionWarningDays?.message}
              />
            </div>
            <ul className="text-muted grid gap-2 text-xs leading-5">
              <li>
                <span className="text-ink font-medium">Vence pronto:</span> se
                muestra cuando faltan estos días o menos para el fin de
                cobertura.
              </li>
              <li>
                <span className="text-ink font-medium">
                  Próxima reposición:
                </span>{' '}
                debe ser mayor que el umbral de vencimiento próximo.
              </li>
              <li>
                <span className="text-ink font-medium">Aviso de receta:</span>{' '}
                activa «Receta por renovar» cuando el vencimiento está dentro de
                este plazo.
              </li>
            </ul>
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
                Parámetros guardados.
              </p>
            )}
            {canWrite ? (
              <FormActions>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full sm:w-auto"
                  disabled={save.isPending}
                >
                  {save.isPending ? 'Guardando…' : 'Guardar parámetros'}
                </Button>
              </FormActions>
            ) : (
              <p className="text-muted text-sm">
                Tu rol permite consultar los parámetros, pero no modificarlos.
              </p>
            )}
          </form>
        )}
      </section>
      <NoticeTimingCard />
    </div>
  )
}
