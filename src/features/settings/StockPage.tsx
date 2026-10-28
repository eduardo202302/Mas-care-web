import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PackageSearch, TriangleAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/http'
import { useCan, useMe } from '@/lib/permissions'
import type { paths } from '@/lib/api-types'
import { formatDateTime } from '@/lib/operations'
import {
  stockLevelLabels,
  type StockLevel,
} from '@/lib/board'
import { setStockMark } from '@/features/board/board-api'
import { cn } from '@/lib/cn'

type MedicationList =
  paths['/api/v1/medications']['get']['responses'][200]['content']['application/json']
type StockMarkList =
  paths['/api/v1/stock-marks']['get']['responses'][200]['content']['application/json']

const weekMs = 7 * 24 * 60 * 60 * 1000

export default function StockPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: me } = useMe()
  const canMark = useCan('stock:mark')
  const branches = me?.branches ?? []
  const privileged = me?.role === 'owner' || me?.role === 'admin'
  const [branchId, setBranchId] = useState('')

  useEffect(() => {
    if (branchId || branches.length === 0) return
    setBranchId(branches[0]!.id)
  }, [branchId, branches])

  const medications = useQuery({
    queryKey: ['medications', 'stock-page'],
    queryFn: () =>
      api<MedicationList>('/api/v1/medications?archived=false&limit=100'),
  })
  const marks = useQuery({
    queryKey: ['stock-marks', branchId],
    queryFn: () =>
      api<StockMarkList>(
        `/api/v1/stock-marks?branch_id=${encodeURIComponent(branchId)}`,
      ),
    enabled: Boolean(branchId),
  })

  const [savingId, setSavingId] = useState<string | null>(null)
  const update = useMutation({
    mutationFn: ({
      medicationId,
      level,
    }: {
      medicationId: string
      level: StockLevel
    }) => setStockMark(branchId, medicationId, level),
    onMutate: ({ medicationId }) => setSavingId(medicationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock-marks'] }),
        queryClient.invalidateQueries({ queryKey: ['board'] }),
      ])
      toast.push('Existencias actualizadas.', 'success')
    },
    onError: (error) => toast.push(error.message, 'error'),
    onSettled: () => setSavingId(null),
  })

  const markByMedication = useMemo(
    () => new Map((marks.data?.data ?? []).map((mark) => [mark.medication_id, mark])),
    [marks.data],
  )
  const branch = branches.find((item) => item.id === branchId)

  if (!me) {
    return (
      <div className="grid gap-4" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="animate-in">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-tealmax mb-1 text-sm font-medium">Ajustes</p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Existencias
          </h1>
          <p className="text-muted mt-1 max-w-2xl text-sm">
            Marca manualmente qué medicamentos hay, quedan pocos o no hay en cada
            sucursal. Las marcas con más de 7 días se resaltan en ámbar.
          </p>
        </div>
        <label className="grid gap-1">
          <span className="text-muted text-[11px] font-medium">Sucursal</span>
          <select
            aria-label="Sucursal de existencias"
            value={branchId}
            disabled={!privileged && branches.length === 1}
            onChange={(event) => setBranchId(event.target.value)}
            className="border-border focus:border-tealmax h-10 min-w-52 rounded-lg border bg-white px-3 text-sm outline-none"
          >
            {branches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {branches.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          No hay sucursales disponibles para tu usuario.
        </p>
      )}

      {branch && (
        <section className="border-border shadow-card overflow-hidden rounded-xl border bg-white">
          <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-petroleo font-display text-lg font-bold">
                {branch.name}
              </h2>
              <p className="text-muted mt-0.5 text-xs">
                {marks.data?.data.length ?? 0} medicamentos con marca registrada.
              </p>
            </div>
            {!canMark && (
              <p className="text-muted text-xs">
                Tu rol solo puede consultar las existencias.
              </p>
            )}
          </header>

          {medications.isLoading || marks.isLoading ? (
            <div className="grid gap-3 p-5" aria-busy="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : medications.isError || marks.isError ? (
            <p role="alert" className="p-5 text-sm text-red-700">
              No pudimos cargar las existencias.
            </p>
          ) : (medications.data?.data ?? []).length === 0 ? (
            <p className="text-muted p-5 text-sm">
              No hay medicamentos activos para esta organización.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-surface text-muted text-[11px] tracking-wide uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Medicamento</th>
                    <th className="px-5 py-3 font-semibold">Presentación</th>
                    <th className="px-5 py-3 font-semibold">Existencias</th>
                    <th className="px-5 py-3 font-semibold">Última revisión</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {(medications.data?.data ?? []).map((medication, index) => {
                    const mark = markByMedication.get(medication.id)
                    const stale =
                      mark &&
                      Date.now() - new Date(mark.reviewed_at).getTime() > weekMs
                    return (
                      <tr
                        key={medication.id}
                        className={cn(
                          stale
                            ? 'bg-amber-50/70'
                            : index % 2 === 1
                              ? 'bg-slate-100'
                              : 'bg-white',
                          'hover:bg-surface/40',
                        )}
                      >
                        <td className="px-5 py-3 font-medium">
                          <span className="inline-flex items-center gap-2">
                            <PackageSearch className="text-muted size-4" />
                            {medication.brandName ||
                              medication.genericName ||
                              medication.activeIngredient ||
                              'Medicamento'}
                          </span>
                        </td>
                        <td className="text-muted px-5 py-3">
                          {medication.presentation}
                        </td>
                        <td className="px-5 py-3">
                          <label className="inline-flex items-center gap-2">
                            <span className="sr-only">
                              Existencias de {medication.genericName ?? medication.presentation}
                            </span>
                            <select
                              value={mark?.level ?? ''}
                              disabled={!canMark || savingId === medication.id}
                              onChange={(event) => {
                                const level = event.target.value as StockLevel
                                if (!level) return
                                update.mutate({ medicationId: medication.id, level })
                              }}
                              className="border-border focus:border-tealmax h-8 rounded-lg border bg-white px-2 text-xs outline-none disabled:opacity-60"
                            >
                              <option value="">Sin marca</option>
                              {(Object.keys(stockLevelLabels) as StockLevel[]).map(
                                (level) => (
                                  <option key={level} value={level}>
                                    {stockLevelLabels[level]}
                                  </option>
                                ),
                              )}
                            </select>
                            {savingId === medication.id && (
                              <span className="text-muted text-xs">Guardando…</span>
                            )}
                          </label>
                        </td>
                        <td className="px-5 py-3 text-xs">
                          {mark ? (
                            <span
                              className={
                                stale
                                  ? 'inline-flex items-center gap-1 font-medium text-amber-900'
                                  : 'text-muted'
                              }
                            >
                              {stale && <TriangleAlert className="size-3.5" />}
                              {formatDateTime(mark.reviewed_at)}
                              {stale ? ' · revisar' : ''}
                            </span>
                          ) : (
                            <span className="text-muted">Sin revisar</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
