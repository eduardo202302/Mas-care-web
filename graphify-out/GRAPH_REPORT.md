# Graph Report - max-care-web  (2026-10-28)

## Corpus Check
- 140 files · ~73,437 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .conf 1)

## Summary
- 893 nodes · 2921 edges · 31 communities (27 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- treatments.ts
- http.ts
- operations.ts
- lucide-react
- RoleForm.tsx
- BoardPage.tsx
- api
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- Dev Dependencies
- Component Aliases Config
- TypeScript Node Config
- package.json
- ESLint Configuration
- Entry Point & Docs
- Playwright E2E Tests
- Build & Dev Scripts
- Vite Build Config
- API Code Generation
- TypeScript Root Config
- Button
- cn
- IncidentsPage.tsx
- KanbanBoard.tsx
- StockPage.tsx
- KanbanBoard
- IncidentDialogs.tsx
- IncidentFormDialog.tsx
- @testing-library/jest-dom

## God Nodes (most connected - your core abstractions)
1. `Button` - 106 edges
2. `api()` - 91 edges
3. `react` - 61 edges
4. `lucide-react` - 55 edges
5. `cn()` - 51 edges
6. `Dialog()` - 46 edges
7. `@tanstack/react-query` - 44 edges
8. `TextField` - 44 edges
9. `Skeleton()` - 41 edges
10. `FormActions()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx
- `Permisos en UI (`useCan`)` --references--> `useCan()`  [INFERRED]
  docs/phase2-web.md → src/lib/permissions.ts
- `Tablero de ciclos` --references--> `StatusChip()`  [INFERRED]
  docs/phase2-web.md → src/components/StatusChip.tsx
- `Incidencias` --references--> `KanbanBoard()`  [INFERRED]
  docs/phase2-web.md → src/components/kanban/KanbanBoard.tsx
- `Árbol de `features/board` y `features/incidents`` --references--> `KanbanBoard()`  [INFERRED]
  docs/phase2-web.md → src/components/kanban/KanbanBoard.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (31 total, 4 thin omitted)

### Community 0 - "treatments.ts"
Cohesion: 0.06
Nodes (49): PatientDetailPage, ActivityList, BranchList, CaregiverList, MedicationList, Panel(), PatientIncidentList, TreatmentListResponse (+41 more)

### Community 1 - "http.ts"
Cohesion: 0.14
Nodes (16): @tanstack/react-query, @testing-library/react, vitest, BranchList, AutomationSettings, counts, row, BranchOption (+8 more)

### Community 2 - "operations.ts"
Cohesion: 0.06
Nodes (47): DashboardPage, BranchFilter(), cardIcons, PatientList, TaskTreatmentOption, UserList, statusClasses(), TasksPage() (+39 more)

### Community 3 - "lucide-react"
Cohesion: 0.07
Nodes (52): lucide-react, BranchTag(), DataTable(), RowActions(), EmptyState(), Pagination(), TableSkeleton(), BranchesPage() (+44 more)

### Community 4 - "RoleForm.tsx"
Cohesion: 0.07
Nodes (35): @hookform/resolvers@^5.2.2, react-hook-form@^7.66.0, zod@^4.1.12, @hookform/resolvers, react-hook-form, zod, ThresholdsPage, BranchForm() (+27 more)

### Community 5 - "BoardPage.tsx"
Cohesion: 0.06
Nodes (59): Cambios de API necesarios, ChipsPage, StatusLabel, statusLabels, StatusChip(), styles, appendColumnPage(), boardPath() (+51 more)

### Community 6 - "api"
Cohesion: 0.05
Nodes (54): react, react-router-dom, App(), NotFoundPage(), RequireAuth(), RequireRoute(), mockMe(), pacientes (+46 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, graphify@^1.0.0 (+17 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.10
Nodes (19): jobs, verify, name, run, uses, with, True, pull_request (+11 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, eslint@^9.39.1, openapi-typescript@^7.10.1, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @testing-library/react@^16.3.0, @types/node@^24.10.0, @types/react@^19.2.2 (+11 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "package.json"
Cohesion: 0.14
Nodes (13): jsdom@^27.1.0, prettier@^3.6.2, @testing-library/user-event@^14.6.1, typescript@~5.9.3, name, packageManager, private, type (+5 more)

### Community 14 - "ESLint Configuration"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 15 - "Entry Point & Docs"
Cohesion: 0.09
Nodes (23): Accesibilidad, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida, Rutas y menú (+15 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.13
Nodes (11): suffix, suffix, createPatient(), createTreatment(), getMe(), json(), localDate(), suffix (+3 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "Vite Build Config"
Cohesion: 0.40
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 22 - "Button"
Cohesion: 0.06
Nodes (71): Button, Props, Dialog(), FormActions(), TextField, useToast(), ForgotPasswordPage(), submit() (+63 more)

### Community 23 - "cn"
Cohesion: 0.07
Nodes (50): ConsolidatedDashboardPage, AppLayout(), linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), AutomationBanner(), BranchList (+42 more)

### Community 24 - "IncidentsPage.tsx"
Cohesion: 0.19
Nodes (14): IncidentsPage(), updateFilters(), incidentsPath(), UserList, Incident, incidentColumnLabels, incidentColumns, IncidentFilters (+6 more)

### Community 25 - "KanbanBoard.tsx"
Cohesion: 0.23
Nodes (9): DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), KanbanMove, SortableCard(), IncidentCard(), IncidentCardMenu() (+1 more)

### Community 26 - "StockPage.tsx"
Cohesion: 0.20
Nodes (8): ToastContext, ToastContextValue, ToastItem, ToastTone, toneIcons, toneStyles, MedicationList, StockMarkList

### Community 27 - "KanbanBoard"
Cohesion: 0.40
Nodes (5): Incidencias, Árbol de `features/board` y `features/incidents`, KanbanBoard(), columnFor(), handleDragEnd()

### Community 28 - "IncidentDialogs.tsx"
Cohesion: 0.50
Nodes (4): IncidentDetailDialog(), UserList, incidentBranchName(), incidentTypeLabels

### Community 29 - "IncidentFormDialog.tsx"
Cohesion: 0.40
Nodes (4): BranchList, PatientList, UserList, IncidentType

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 305 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Button` to `treatments.ts`, `http.ts`, `operations.ts`, `lucide-react`, `RoleForm.tsx`, `BoardPage.tsx`, `api`, `cn`, `IncidentsPage.tsx`, `KanbanBoard.tsx`, `IncidentDialogs.tsx`, `IncidentFormDialog.tsx`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `treatments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060109289617486336 - nodes in this community are weakly interconnected._
- **Why does `react` connect `api` to `treatments.ts`, `http.ts`, `operations.ts`, `lucide-react`, `RoleForm.tsx`, `BoardPage.tsx`, `Runtime Dependencies`, `package.json`, `Button`, `cn`, `IncidentsPage.tsx`, `KanbanBoard.tsx`, `StockPage.tsx`, `IncidentDialogs.tsx`, `IncidentFormDialog.tsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `http.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1402116402116402 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `lucide-react` to `treatments.ts`, `http.ts`, `operations.ts`, `RoleForm.tsx`, `BoardPage.tsx`, `api`, `Runtime Dependencies`, `package.json`, `Button`, `cn`, `IncidentsPage.tsx`, `KanbanBoard.tsx`, `StockPage.tsx`, `IncidentDialogs.tsx`, `IncidentFormDialog.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06095791001451379 - nodes in this community are weakly interconnected._