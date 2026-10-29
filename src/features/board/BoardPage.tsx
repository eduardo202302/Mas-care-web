import { useEffect, useMemo, useState } from 'react'
import { ExportButton } from '@/components/ExportButton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { usePipeline } from '@/lib/pipeline'
import { NewCycleDialog } from './NewCycleDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { KanbanBoard, type KanbanMove } from '@/components/kanban/KanbanBoard'
import { ApiError } from '@/lib/http'
import { useCan, useMe } from '@/lib/permissions'
import {
  boardColumnLabels,
  boardColumns,
  boardFiltersFromSearch,
  boardQueryKey,
  isOpenCycle,
  type BoardCard,
  type BoardColumnKey,
  type BoardData,
  type BoardFilters,
  type CycleStatus,
} from '@/lib/board'
import { useUiStore, type BoardView } from '@/stores/ui-store'
import {
  appendColumnPage,
  fetchBoard,
  fetchBoardColumn,
  markNotPickedUp,
  moveCardInBoard,
  moveCycle,
} from './board-api'
import { BoardFilters as BoardFilterBar } from './BoardFilters'
import { BoardNoticeDialog, ChangeExpectedDateDialog, StockOutDialog } from './BoardDialogs'
import { CycleCard } from './CycleCard'
import { CycleTable } from './CycleTable'
import { IncidentFormDialog } from '@/features/incidents/IncidentFormDialog'
import { StockMarkDialog } from '@/features/settings/StockMarkDialog'
import { DeliveryDialog } from '@/features/dashboard/DeliveryDialog'

export default function BoardPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: me } = useMe()
  const { data: pipeline } = usePipeline()
  const [newCycleFor, setNewCycleFor] = useState<BoardColumnKey | 'top' | null>(null)
  const canCreateCycle = useCan('treatments:write')
  const boardView = useUiStore((state) => state.boardView)
  const setBoardView = useUiStore((state) => state.setBoardView)

  const canMove = useCan('cycle:move')
  const canEditDate = useCan('cycle:edit-date')
  const canWrite = useCan('treatments:write')
  const canCreateIncident = useCan('incident:create')
  const canMarkStock = useCan('stock:mark')

  const filters = useMemo(
    () => boardFiltersFromSearch(searchParams),
    [searchParams],
  )
  const privileged = me?.role === 'owner' || me?.role === 'admin'
  const branches = me?.branches ?? []
  const lockedBranch = !privileged && branches.length === 1 ? branches[0]?.id : undefined
  const defaultBranch =
    !privileged && branches.length > 0 ? branches[0]?.id : undefined
  const effectiveFilters = useMemo<BoardFilters>(
    () => ({
      ...filters,
      branch_id: filters.branch_id ?? lockedBranch ?? defaultBranch,
    }),
    [defaultBranch, filters, lockedBranch],
  )
  const branchReady =
    Boolean(me) &&
    (privileged || branches.length === 0 || Boolean(effectiveFilters.branch_id))

  const view: BoardView =
    searchParams.get('view') === 'tabla'
      ? 'table'
      : searchParams.get('view') === 'tablero'
        ? 'board'
        : boardView

  useEffect(() => {
    const wanted = lockedBranch ?? defaultBranch
    if (!me || privileged || !wanted || searchParams.get('branch_id')) return
    const next = new URLSearchParams(searchParams)
    next.set('branch_id', wanted)
    setSearchParams(next, { replace: true })
  }, [
    defaultBranch,
    lockedBranch,
    me,
    privileged,
    searchParams,
    setSearchParams,
  ])

  const board = useQuery({
    queryKey: boardQueryKey(effectiveFilters),
    queryFn: () => fetchBoard(effectiveFilters),
    enabled: branchReady,
  })

  const [loadingColumn, setLoadingColumn] = useState<BoardColumnKey | null>(null)
  const [noticeCard, setNoticeCard] = useState<BoardCard | null>(null)
  const [deliveryCard, setDeliveryCard] = useState<BoardCard | null>(null)
  const [dateCard, setDateCard] = useState<BoardCard | null>(null)
  const [incidentCard, setIncidentCard] = useState<BoardCard | null>(null)
  const [stockCard, setStockCard] = useState<BoardCard | null>(null)
  const [stockConflict, setStockConflict] = useState<{
    card: BoardCard
    afterId: string | null
    beforeId: string | null
  } | null>(null)

  const move = useMutation({
    mutationFn: (variables: {
      card: BoardCard
      to: CycleStatus
      afterId: string | null
      beforeId: string | null
      confirm?: boolean
    }) =>
      moveCycle(variables.card.cycle_id, {
        to_status: variables.to,
        expected_version: variables.card.version,
        after_id: variables.afterId,
        before_id: variables.beforeId,
        ...(variables.confirm ? { confirm_out_of_stock: true } : {}),
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['board'] })
      const key = boardQueryKey(effectiveFilters)
      const previous = queryClient.getQueryData<BoardData>(key)
      if (previous) {
        queryClient.setQueryData(
          key,
          moveCardInBoard(
            previous,
            variables.card,
            variables.to as BoardColumnKey,
            variables.afterId,
            variables.beforeId,
          ),
        )
      }
      return { previous, key }
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous)
      }
      if (error instanceof ApiError && error.code === 'STOCK_OUT_OF_STOCK') {
        setStockConflict({
          card: variables.card,
          afterId: variables.afterId,
          beforeId: variables.beforeId,
        })
        return
      }
      if (error instanceof ApiError && error.status === 409) {
        toast.push('Alguien movió esta tarjeta. Actualizamos el tablero.', 'warning')
        void queryClient.invalidateQueries({ queryKey: ['board'] })
        return
      }
      toast.push(error.message, 'error')
    },
    onSuccess: (result) => {
      for (const warning of result.warnings ?? []) {
        if (warning.code === 'STOCK_LOW') {
          toast.push('Existencias bajas en esta sucursal.', 'warning')
        }
        if (warning.code === 'STOCK_STALE') {
          toast.push(
            'La marca de existencias tiene más de 7 días. Conviene revisarla.',
            'warning',
          )
        }
      }
      if (result.incident_id) {
        toast.push('Se creó una incidencia por falta de existencias.', 'warning')
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['board'] })
      void queryClient.invalidateQueries({ queryKey: ['cycles'] })
      void queryClient.invalidateQueries({
        queryKey: ['patients', variables.card.patient.id, 'activities'],
      })
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })

  const notPickedUp = useMutation({
    mutationFn: (card: BoardCard) => markNotPickedUp(card.cycle_id),
    onSuccess: async () => {
      toast.push('Ciclo marcado como no retirado.', 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['board'] }),
        queryClient.invalidateQueries({ queryKey: ['cycles'] }),
      ])
    },
    onError: (error) => toast.push(error.message, 'error'),
  })

  function updateFilters(next: BoardFilters) {
    const params = new URLSearchParams(searchParams)
    for (const key of [
      'branch_id',
      'responsible_user_id',
      'medication_id',
      'derived_status',
      'q',
      'expected_from',
      'expected_to',
    ] as const) {
      if (next[key]) params.set(key, next[key]!)
      else params.delete(key)
    }
    setSearchParams(params, { replace: true })
  }

  function setView(next: BoardView) {
    setBoardView(next)
    const params = new URLSearchParams(searchParams)
    params.set('view', next === 'table' ? 'tabla' : 'tablero')
    setSearchParams(params, { replace: true })
  }

  async function loadMore(status: BoardColumnKey) {
    const column = board.data?.columns[status]
    if (!column) return
    const cursor = column.next_cursor ?? column.cards.at(-1)?.cycle_id
    setLoadingColumn(status)
    try {
      const page = await fetchBoardColumn(status, effectiveFilters, cursor)
      queryClient.setQueryData<BoardData>(
        boardQueryKey(effectiveFilters),
        (previous) =>
          previous ? appendColumnPage(previous, status, page) : previous,
      )
    } catch (error) {
      toast.push(error instanceof Error ? error.message : 'No pudimos cargar más tarjetas.', 'error')
    } finally {
      setLoadingColumn(null)
    }
  }

  function handleMove(moveRequest: KanbanMove<BoardCard>) {
    move.mutate({
      card: moveRequest.item,
      to: moveRequest.to as CycleStatus,
      afterId: moveRequest.afterId,
      beforeId: moveRequest.beforeId,
    })
  }

  function moveFromMenu(card: BoardCard, to: CycleStatus) {
    move.mutate({ card, to, afterId: null, beforeId: null })
  }

  const columns = useMemo(() => {
    const data = board.data
    const stages = pipeline?.stages ?? []
    const stageOf = (key: string) => stages.find((s) => s.system_status === key)
    const ordered = stages.length
      ? [...boardColumns].sort(
          (a, b) => (stageOf(a)?.position ?? 99) - (stageOf(b)?.position ?? 99),
        )
      : boardColumns
    return ordered.map((key) => {
      const column = data?.columns[key]
      return {
        key,
        title: stageOf(key)?.name ?? boardColumnLabels[key],
        color: stageOf(key)?.color,
        count: column?.count ?? 0,
        dueLabel: column
          ? `${column.count} en total · ${column.overdue_count ?? 0} vencidas · ${column.due_soon_count ?? 0} vencen en 3 días`
          : undefined,
        cards: column?.cards ?? [],
        droppable: key !== 'closed',
        note:
          key === 'closed'
            ? 'Los ciclos cerrados no se mueven: la entrega o el no retiro ya quedó registrado. Para continuar el tratamiento usa «Nuevo ciclo» en otra columna.'
            : undefined,
        action:
          key !== 'closed' && canCreateCycle ? (
            <button
              type="button"
              aria-label={`Nuevo ciclo en ${stageOf(key)?.name ?? boardColumnLabels[key]}`}
              onClick={() => setNewCycleFor(key)}
              className="text-tealmax text-xs font-semibold hover:underline"
            >
              + Nuevo ciclo
            </button>
          ) : undefined,
        emptyText:
          key === 'closed'
            ? 'Aún no hay entregas recientes.'
            : 'Sin tarjetas en esta columna.',
        hasMore: Boolean(column && column.count > column.cards.length),
        loadingMore: loadingColumn === key,
        onLoadMore: () => void loadMore(key),
      }
    })
  }, [board.data, loadingColumn, pipeline, canCreateCycle])

  if (!me) {
    return (
      <div className="grid gap-4" aria-busy="true">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="animate-in">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-tealmax mb-1 text-sm font-medium">
            Operación diaria
          </p>
          <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">
            Tablero de reposiciones
          </h1>
          <p className="text-muted mt-1 max-w-2xl text-sm">
            Mueve cada ciclo por avisar, avisado, confirmado y preparado. La
            columna de entregados no admite arrastre.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Vista del tablero"
            className="border-border flex rounded-lg border bg-white p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === 'board'}
              onClick={() => setView('board')}
              className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${
                view === 'board'
                  ? 'text-petroleo bg-surface'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <LayoutGrid className="size-3.5" />
              Tablero
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'table'}
              onClick={() => setView('table')}
              className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${
                view === 'table'
                  ? 'text-petroleo bg-surface'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <List className="size-3.5" />
              Tabla
            </button>
          </div>
          {view === 'table' && (
            <ExportButton
              entity="cycles"
              filters={{ branchId: effectiveFilters.branch_id }}
            />
          )}
          {canCreateCycle && (
            <Button type="button" variant="primary" onClick={() => setNewCycleFor('top')}>
              + Crear nuevo
            </Button>
          )}
          <Button
            type="button"
            className="size-10 px-0"
            aria-label="Actualizar tablero"
            onClick={() => {
              void board.refetch()
              void queryClient.invalidateQueries({ queryKey: ['cycles'] })
            }}
            disabled={board.isFetching}
          >
            <RefreshCw className={`size-4 ${board.isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <BoardFilterBar
        filters={filters}
        onChange={updateFilters}
        branchOptions={branches}
        branchLocked={Boolean(lockedBranch)}
        privileged={privileged}
        meId={me?.user.id}
      />

      {board.isError && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <span>No pudimos cargar el tablero. {board.error.message}</span>
          <Button type="button" className="h-8" onClick={() => board.refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {view === 'table' ? (
        <CycleTable
          filters={effectiveFilters}
          canMove={canMove}
          canWrite={canWrite}
          onBoardFiltersChange={updateFilters}
          onMove={(card, to) => moveFromMenu(card, to)}
          onOpenCard={(card) => navigate(`/pacientes/${card.patient.id}`)}
        />
      ) : board.isLoading || !branchReady ? (
        <div
          className="flex gap-4 overflow-hidden"
          role="status"
          aria-busy="true"
          aria-label="Cargando tablero…"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="border-border w-[min(85vw,300px)] shrink-0 rounded-xl border bg-white p-3 xl:w-auto xl:flex-1"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
              {Array.from({ length: 3 }).map((__, cardIndex) => (
                <Skeleton key={cardIndex} className="mt-3 h-40 w-full rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      ) : board.data && board.data.totals.open + board.data.totals.closed === 0 ? (
        <EmptyState
          title="El tablero está vacío"
          description="Cuando haya ciclos de reposición para esta sucursal, aparecerán aquí."
        />
      ) : (
        <KanbanBoard<BoardCard>
          columns={columns}
          getId={(card) => card.cycle_id}
          getLabel={(card) => `${card.patient.nombre}, ${card.medication.nombre}`}
          canDragItem={(card, columnKey) =>
            canMove && columnKey !== 'closed' && isOpenCycle(card)
          }
          onMove={handleMove}
          testIdPrefix="board"
          ariaLabel="Tablero de reposiciones"
          renderCard={(card, options) => (
            <CycleCard
              card={card}
              canMove={canMove}
              canEditDate={canEditDate}
              canWrite={canWrite}
              canCreateIncident={canCreateIncident}
              canMarkStock={canMarkStock}
              dragHandleProps={options.dragHandleProps}
              onNotice={() => setNoticeCard(card)}
              onDeliver={() => setDeliveryCard(card)}
              onNotPickedUp={() => notPickedUp.mutate(card)}
              onChangeDate={() => setDateCard(card)}
              onCreateIncident={() => setIncidentCard(card)}
              onMoveTo={(to) => moveFromMenu(card, to)}
              onUpdateStock={() => setStockCard(card)}
            />
          )}
        />
      )}

      {!canMove && view === 'board' && board.data && (
        <p className="text-muted mt-2 flex items-center gap-2 text-xs">
          <TriangleAlert className="size-3.5" />
          Tu rol permite consultar el tablero, pero no mover tarjetas.
        </p>
      )}

      {noticeCard && (
        <BoardNoticeDialog card={noticeCard} onClose={() => setNoticeCard(null)} />
      )}
      {deliveryCard && (
        <DeliveryDialog
          treatmentId={deliveryCard.treatment_id}
          patientName={deliveryCard.patient.nombre}
          medicationName={deliveryCard.medication.nombre}
          onClose={() => setDeliveryCard(null)}
          onCompleted={() => {
            void queryClient.invalidateQueries({ queryKey: ['board'] })
            void queryClient.invalidateQueries({ queryKey: ['cycles'] })
            void queryClient.invalidateQueries({ queryKey: ['patients'] })
            toast.push('Entrega registrada. El siguiente ciclo ya está en el tablero.', 'success')
          }}
        />
      )}
      {dateCard && (
        <ChangeExpectedDateDialog
          card={dateCard}
          onClose={() => setDateCard(null)}
        />
      )}
      {incidentCard && (
        <IncidentFormDialog
          defaultBranchId={incidentCard.branch.id}
          defaultPatient={{
            id: incidentCard.patient.id,
            fullName: incidentCard.patient.nombre,
          }}
          defaultTreatmentId={incidentCard.treatment_id}
          defaultCycleId={incidentCard.cycle_id}
          onClose={() => setIncidentCard(null)}
          onCreated={() => {
            void queryClient.invalidateQueries({ queryKey: ['incidents'] })
          }}
        />
      )}
      {stockCard && (
        <StockMarkDialog
          branchId={stockCard.branch.id}
          branchName={stockCard.branch.nombre}
          medicationId={stockCard.medication.id}
          medicationName={stockCard.medication.nombre}
          initialLevel={stockCard.stock_level}
          onClose={() => setStockCard(null)}
        />
      )}
      {stockConflict && (
        <StockOutDialog
          card={stockConflict.card}
          saving={move.isPending}
          onCancel={() => setStockConflict(null)}
          onUpdateStock={() => setStockCard(stockConflict.card)}
          onConfirm={() => {
            const pending = stockConflict
            setStockConflict(null)
            move.mutate({
              card: pending.card,
              to: 'prepared',
              afterId: pending.afterId,
              beforeId: pending.beforeId,
              confirm: true,
            })
          }}
        />
      )}
      {newCycleFor && (
        <NewCycleDialog
          initialStatus={newCycleFor === 'top' ? undefined : newCycleFor}
          onClose={() => setNewCycleFor(null)}
        />
      )}
    </div>
  )
}
