import { useEffect, useMemo, useState } from 'react'
import { ExportButton } from '@/components/ExportButton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  PackageCheck,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { usePipeline } from '@/lib/pipeline'
import { NewCycleDialog } from './NewCycleDialog'
import { CycleCloseDialog, type CycleOutcome } from './CycleCloseDialog'
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
  moveCardInBoard,
  moveCycle,
} from './board-api'
import { BoardFilters as BoardFilterBar } from './BoardFilters'
import {
  BoardNoticeDialog,
  ChangeExpectedDateDialog,
  StockOutDialog,
} from './BoardDialogs'
import { CycleCard } from './CycleCard'
import { CycleTable } from './CycleTable'
import {
  emptyCycleColumnFilters,
  type CycleColumnFilters,
} from './cycleColumnFilters'
import { IncidentFormDialog } from '@/features/incidents/IncidentFormDialog'
import { StockMarkDialog } from '@/features/settings/StockMarkDialog'

export default function BoardPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: me } = useMe()
  const { data: pipeline } = usePipeline()
  const [columnFilters, setColumnFilters] = useState<CycleColumnFilters>(
    emptyCycleColumnFilters,
  )
  const [newCycleFor, setNewCycleFor] = useState<BoardColumnKey | 'top' | null>(
    null,
  )
  const canCreateCycle = useCan('treatments:write')
  const boardView = useUiStore((state) => state.boardView)
  const setBoardView = useUiStore((state) => state.setBoardView)
  const [tableControlsSlot, setTableControlsSlot] =
    useState<HTMLDivElement | null>(null)

  const canMove = useCan('cycle:move')
  const canEditDate = useCan('cycle:edit-date')
  const canWrite = useCan('treatments:write')
  const canCreateIncident = useCan('incident:create')
  const canMarkStock = useCan('stock:mark')

  const filters = useMemo(
    () => boardFiltersFromSearch(searchParams),
    [searchParams],
  )
  const privileged = me?.allBranches === true
  const branches = me?.branches ?? []
  const lockedBranch =
    !privileged && branches.length === 1 ? branches[0]?.id : undefined
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

  const [loadingColumn, setLoadingColumn] = useState<BoardColumnKey | null>(
    null,
  )
  const [noticeCard, setNoticeCard] = useState<BoardCard | null>(null)
  const [closing, setClosing] = useState<{
    card: BoardCard
    outcome: CycleOutcome
  } | null>(null)
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
        toast.push(
          'Alguien movió esta tarjeta. Actualizamos el tablero.',
          'warning',
        )
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
        toast.push(
          'Se creó una incidencia por falta de existencias.',
          'warning',
        )
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
      toast.push(
        error instanceof Error
          ? error.message
          : 'No pudimos cargar más tarjetas.',
        'error',
      )
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
            ? 'Los ciclos cerrados no se mueven: la entrega o el no retiro ya quedó registrado. Para continuar el tratamiento usa «Nueva Reposición».'
            : undefined,
        emptyText:
          key === 'closed'
            ? 'Aún no hay entregas recientes.'
            : 'Sin tarjetas en esta columna.',
        hasMore: Boolean(column && column.count > column.cards.length),
        loadingMore: loadingColumn === key,
        onLoadMore: () => void loadMore(key),
      }
    })
  }, [board.data, loadingColumn, pipeline])

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
    <div className="animate-in -mt-4 flex h-full min-h-0 flex-col">
      <PageHeader
        title="Tablero de Reposiciones"
        subtitle="Mueve cada ciclo por avisar, avisado, confirmado y preparado. La columna de entregados no admite arrastre."
      />

      <nav
        role="tablist"
        aria-label="Vista del tablero"
        className="border-border mb-3 flex shrink-0 items-center justify-between gap-2 border-b"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'board'}
            onClick={() => setView('board')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition ${
              view === 'board'
                ? 'border-tealmax text-petroleo'
                : 'text-muted hover:text-ink border-transparent'
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
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition ${
              view === 'table'
                ? 'border-tealmax text-petroleo'
                : 'text-muted hover:text-ink border-transparent'
            }`}
          >
            <List className="size-3.5" />
            Tabla
          </button>
        </div>
        <div
          ref={setTableControlsSlot}
          className="flex items-center gap-2 pb-2"
        />
      </nav>

      <BoardFilterBar
        filters={filters}
        onChange={updateFilters}
        branchOptions={branches}
        branchLocked={Boolean(lockedBranch)}
        privileged={privileged}
        meId={me?.user.id}
        columnFilters={view === 'table' ? columnFilters : undefined}
        onColumnFiltersChange={view === 'table' ? setColumnFilters : undefined}
        rightActions={
          <div className="flex items-center gap-2">
            {view === 'table' && (
              <ExportButton
                entity="cycles"
                filters={{ branchId: effectiveFilters.branch_id }}
              />
            )}
            {canCreateCycle && (
              <Button
                type="button"
                variant="primary"
                onClick={() => setNewCycleFor('top')}
              >
                <PackageCheck className="size-4" />
                Nueva Reposición
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
              <RefreshCw
                className={`size-4 ${board.isFetching ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        }
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

      {/* Only the table view is height-constrained so its body scrolls internally; the kanban view keeps growing with the page. */}
      <div className={view === 'table' ? 'min-h-0 flex-1' : undefined}>
        {view === 'table' ? (
          <CycleTable
            filters={effectiveFilters}
            columnFilters={columnFilters}
            canMove={canMove}
            canWrite={canWrite}
            onBoardFiltersChange={updateFilters}
            onMove={(card, to) => moveFromMenu(card, to)}
            onOpenCard={(card) => navigate(`/pacientes/${card.patient.id}`)}
            controlsSlot={tableControlsSlot}
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
                  <Skeleton
                    key={cardIndex}
                    className="mt-3 h-40 w-full rounded-xl"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : board.data &&
          board.data.totals.open + board.data.totals.closed === 0 ? (
          <EmptyState
            title="El tablero está vacío"
            description="Cuando haya ciclos de reposición para esta sucursal, aparecerán aquí."
          />
        ) : (
          <KanbanBoard<BoardCard>
            columns={columns}
            getId={(card) => card.cycle_id}
            getLabel={(card) =>
              `${card.patient.nombre}, ${card.medication.nombre}`
            }
            canDragItem={(card, columnKey) =>
              canMove && columnKey !== 'closed' && isOpenCycle(card)
            }
            onMove={handleMove}
            testIdPrefix="board"
            ariaLabel="Tablero de Reposiciones"
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
                onDeliver={() => setClosing({ card, outcome: 'delivered' })}
                onNotPickedUp={() =>
                  setClosing({ card, outcome: 'not_picked_up' })
                }
                onChangeDate={() => setDateCard(card)}
                onCreateIncident={() => setIncidentCard(card)}
                onMoveTo={(to) => moveFromMenu(card, to)}
                onUpdateStock={() => setStockCard(card)}
              />
            )}
          />
        )}
      </div>

      {!canMove && view === 'board' && board.data && (
        <p className="text-muted mt-2 flex items-center gap-2 text-xs">
          <TriangleAlert className="size-3.5" />
          Tu rol permite consultar el tablero, pero no mover tarjetas.
        </p>
      )}

      {noticeCard && (
        <BoardNoticeDialog
          card={noticeCard}
          onClose={() => setNoticeCard(null)}
        />
      )}
      {closing && (
        <CycleCloseDialog
          card={closing.card}
          outcome={closing.outcome}
          onClose={() => setClosing(null)}
          onCompleted={async () => {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['board'] }),
              queryClient.invalidateQueries({ queryKey: ['cycles'] }),
              queryClient.invalidateQueries({ queryKey: ['patients'] }),
              queryClient.invalidateQueries({ queryKey: ['treatments'] }),
              queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
            ])
            void board.refetch()
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
