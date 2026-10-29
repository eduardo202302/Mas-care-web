import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileClock,
  MessageSquareOff,
  PackageOpen,
  RefreshCw,
} from 'lucide-react'
import { BranchFilter } from '@/components/BranchFilter'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useActiveBranch } from '@/lib/active-branch'
import { api } from '@/lib/http'
import { PAGE_ROWS } from '@/lib/paging'
import { useCan } from '@/lib/permissions'
import {
  dashboardCardKeys,
  dashboardCardMeta,
  type DashboardCardKey,
  type DashboardListResponse,
  type DashboardResponse,
  type DashboardRow,
  noticeTargetFromDashboardRow,
} from '@/lib/operations'
import { DashboardTreatmentRow } from './DashboardTreatmentRow'
import { DeliveryDialog } from './DeliveryDialog'
import { NoticeDialog } from './NoticeDialog'

const cardIcons: Record<DashboardCardKey, typeof CalendarDays> = {
  today_refills: CalendarDays,
  due_soon: Clock3,
  overdue: AlarmClock,
  pending_pickups: PackageOpen,
  prescriptions_to_renew: FileClock,
  no_response: MessageSquareOff,
}

export default function DashboardPage() {
  const { branchId: activeBranchId, ready: branchReady } = useActiveBranch()
  const canOperate = useCan('treatments:write')
  const [selectedCard, setSelectedCard] =
    useState<DashboardCardKey>('today_refills')
  const [listOpen, setListOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [noticeRow, setNoticeRow] = useState<DashboardRow | null>(null)
  const [deliveryRow, setDeliveryRow] = useState<DashboardRow | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const dashboard = useQuery({
    queryKey: ['dashboard', activeBranchId ?? 'all'],
    queryFn: () =>
      api<DashboardResponse>(
        `/api/v1/dashboard${activeBranchId ? `?branch_id=${encodeURIComponent(activeBranchId)}` : ''}`,
      ),
    enabled: branchReady,
  })

  const list = useQuery({
    queryKey: [
      'dashboard',
      'list',
      selectedCard,
      activeBranchId ?? 'all',
      page,
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        card: selectedCard,
        page: String(page),
        rows: String(PAGE_ROWS),
      })
      if (activeBranchId) params.set('branch_id', activeBranchId)
      return api<DashboardListResponse>(
        `/api/v1/dashboard/list?${params.toString()}`,
      )
    },
    enabled: dashboard.isSuccess,
  })

  useEffect(() => {
    setPage(1)
  }, [selectedCard, activeBranchId])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 4500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const rows = list.data?.data ?? []
  const counts = dashboard.data?.counts

  const today = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  const selectedMeta = dashboardCardMeta[selectedCard]

  return (
    <div className="animate-in">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-tealmax mb-2 text-sm font-medium capitalize">
            {today}
          </p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Panel del día
          </h1>
          <p className="text-muted mt-2 text-sm">
            Prioriza los avisos, entregas y recetas que necesitan atención hoy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BranchFilter />
          <Button
            type="button"
            aria-label="Actualizar panel"
            className="size-10 px-0"
            onClick={() => {
              void dashboard.refetch()
              void list.refetch()
            }}
            disabled={dashboard.isFetching}
          >
            <RefreshCw
              className={`size-4 ${dashboard.isFetching ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {feedback && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <CheckCircle2 className="size-4" />
          {feedback}
        </p>
      )}
      {dashboard.isError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <span>No pudimos cargar el panel. {dashboard.error.message}</span>
          <Button
            type="button"
            className="h-8"
            onClick={() => dashboard.refetch()}
          >
            Reintentar
          </Button>
        </div>
      )}

      <section
        aria-label="Indicadores del día"
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      >
        {dashboardCardKeys.map((key) => {
          const meta = dashboardCardMeta[key]
          const Icon = cardIcons[key]
          const isSelected = key === selectedCard
          const isOverdue = key === 'overdue'
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedCard(key)}
              className={`group rounded-xl border p-4 text-left transition ${
                isSelected
                  ? 'border-tealmax ring-tealmax/15 shadow-card ring-2'
                  : 'border-border hover:border-tealmax/40 bg-white hover:shadow-sm'
              } ${
                isOverdue && !isSelected
                  ? 'border-expired-border bg-expired-bg/60'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`grid size-9 place-items-center rounded-lg ${
                    isOverdue
                      ? 'bg-expired-bg text-expired-text'
                      : 'bg-surface text-tealmax'
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <ChevronRight
                  className={`size-4 transition ${
                    isSelected
                      ? 'text-tealmax'
                      : 'text-muted/50 group-hover:text-muted'
                  }`}
                />
              </div>
              <p className="text-muted mt-4 text-xs font-medium">
                {meta.short}
              </p>
              <div className="mt-1 h-8">
                {counts ? (
                  <p
                    className={`text-2xl font-bold tracking-tight ${
                      isOverdue && counts[key] > 0
                        ? 'text-expired-text'
                        : 'text-petroleo'
                    }`}
                  >
                    {counts[key]}
                  </p>
                ) : (
                  <Skeleton className="h-8 w-12" />
                )}
              </div>
            </button>
          )
        })}
      </section>

      <section className="border-border shadow-card mt-6 rounded-xl border bg-white">
        <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="text-petroleo font-display text-lg font-bold">
              {selectedMeta.title}
            </h2>
            <p className="text-muted mt-0.5 text-xs">
              {selectedMeta.description}
            </p>
          </div>
          <Button
            type="button"
            className="h-9"
            onClick={() => setListOpen(true)}
            disabled={!dashboard.isSuccess}
          >
            Ver lista completa
            <ChevronRight className="size-4" />
          </Button>
        </header>
        <div className="divide-border divide-y px-5">
          {list.isLoading ? (
            <div className="grid gap-3 py-5" aria-busy="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex justify-between gap-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-9 w-40" />
                </div>
              ))}
            </div>
          ) : list.isError ? (
            <p role="alert" className="py-6 text-sm text-red-700">
              No pudimos cargar la lista. {list.error.message}
            </p>
          ) : rows.length === 0 ? (
            <div className="py-5">
              <EmptyState
                title="Nada pendiente aquí"
                description="Cuando haya pacientes en esta categoría, aparecerán en esta lista."
              />
            </div>
          ) : (
            rows.map((row) => (
              <DashboardTreatmentRow
                key={row.treatment_id}
                row={row}
                canOperate={canOperate}
                onNotice={setNoticeRow}
                onDeliver={setDeliveryRow}
              />
            ))
          )}
        </div>
        <div className="px-5 pb-4">
          <Pagination
            page={page}
            rows={PAGE_ROWS}
            total={list.data?.total ?? 0}
            onChange={setPage}
            disabled={list.isFetching}
          />
        </div>
      </section>

      <p className="text-muted mt-4 text-xs">
        Los avisos por WhatsApp o llamada se registran en el historial del
        paciente. MAS CARE no envía mensajes automáticamente.
      </p>

      {noticeRow && (
        <NoticeDialog
          target={noticeTargetFromDashboardRow(noticeRow)}
          onClose={() => setNoticeRow(null)}
          onLogged={() =>
            setFeedback(`Aviso registrado para ${noticeRow.patient.full_name}.`)
          }
        />
      )}
      {deliveryRow && (
        <DeliveryDialog
          treatmentId={deliveryRow.treatment_id}
          patientName={deliveryRow.patient.full_name}
          medicationName={deliveryRow.medication.name}
          onClose={() => setDeliveryRow(null)}
          onCompleted={(replay) =>
            setFeedback(
              replay
                ? 'Esa entrega ya estaba registrada; no se duplicó.'
                : `Entrega registrada para ${deliveryRow.patient.full_name}.`,
            )
          }
        />
      )}

      {listOpen && (
        <Dialog
          title={selectedMeta.title}
          description={selectedMeta.description}
          onClose={() => setListOpen(false)}
          size="lg"
        >
          {list.isFetching && rows.length === 0 ? (
            <p className="text-muted text-sm">Cargando pacientes…</p>
          ) : rows.length === 0 ? (
            <EmptyState
              title="Sin pacientes en esta categoría"
              description="No hay registros para la sucursal seleccionada."
            />
          ) : (
            <div className="divide-border divide-y">
              {rows.map((row) => (
                <DashboardTreatmentRow
                  key={row.treatment_id}
                  row={row}
                  canOperate={canOperate}
                  onNotice={(next) => {
                    setListOpen(false)
                    setNoticeRow(next)
                  }}
                  onDeliver={(next) => {
                    setListOpen(false)
                    setDeliveryRow(next)
                  }}
                />
              ))}
            </div>
          )}
        </Dialog>
      )}
    </div>
  )
}
