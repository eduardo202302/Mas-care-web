import { create } from 'zustand'

export type BoardView = 'board' | 'table'
export type ReportCsvSeparator = ',' | ';'

type UiState = {
  sidebarOpen: boolean
  /** null = not chosen yet (auto-pick first branch); 'all' = user chose "Todas". */
  activeBranchId: string | null | 'all'
  boardView: BoardView
  /** Last report type opened from the /informes index, for a "resume" link. UI preference only — never report data. */
  lastReportType: string | null
  /** Preferred CSV separator for report exports. UI preference only. */
  reportCsvSeparator: ReportCsvSeparator
  toggleSidebar: () => void
  setActiveBranchId: (id: string | null | 'all') => void
  setBoardView: (view: BoardView) => void
  setLastReportType: (type: string | null) => void
  setReportCsvSeparator: (separator: ReportCsvSeparator) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeBranchId: null,
  boardView: 'board',
  lastReportType: null,
  reportCsvSeparator: ',',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveBranchId: (activeBranchId) => set({ activeBranchId }),
  setBoardView: (boardView) => set({ boardView }),
  setLastReportType: (lastReportType) => set({ lastReportType }),
  setReportCsvSeparator: (reportCsvSeparator) => set({ reportCsvSeparator }),
}))
