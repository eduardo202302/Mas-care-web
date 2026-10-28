# Graph Report - max-care-web  (2026-10-26)

## Corpus Check
- 97 files · ~42,422 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .example 1, .conf 1)

## Summary
- 597 nodes · 1676 edges · 28 communities (25 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- treatments.ts
- Clinical Features
- operations.ts
- Loading Skeletons & Users
- BranchesPage.tsx
- Button
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
- CompaniesPage.tsx
- MedicationsPage.tsx
- TasksPage.tsx
- PatientDetailPage.tsx
- DashboardPage.tsx
- TaskFormDialog.tsx

## God Nodes (most connected - your core abstractions)
1. `Button` - 70 edges
2. `api()` - 55 edges
3. `TextField` - 38 edges
4. `react` - 37 edges
5. `lucide-react` - 29 edges
6. `PatientDetailPage()` - 29 edges
7. `@tanstack/react-query` - 28 edges
8. `Dialog()` - 26 edges
9. `useCan()` - 26 edges
10. `Skeleton()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `React Router (SPA routing)` --semantically_similar_to--> `#root mount point`  [INFERRED] [semantically similar]
  README.md → index.html
- `SPA de gestión para farmacias` --semantically_similar_to--> `index.html – SPA entry point`  [INFERRED] [semantically similar]
  README.md → index.html
- `RouteError()` --calls--> `Button`  [EXTRACTED]
  src/app/RouteError.tsx → src/components/ui/Button.tsx
- `BranchFilter()` --calls--> `api()`  [EXTRACTED]
  src/components/BranchFilter.tsx → src/lib/http.ts
- `BranchFilter()` --calls--> `useUiStore`  [EXTRACTED]
  src/components/BranchFilter.tsx → src/stores/ui-store.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (28 total, 3 thin omitted)

### Community 0 - "treatments.ts"
Cohesion: 0.09
Nodes (34): BranchTag(), StatusLabel, statusLabels, StatusChip(), styles, DashboardTreatmentRow(), remainingText(), ChipsPage() (+26 more)

### Community 1 - "Clinical Features"
Cohesion: 0.06
Nodes (40): @testing-library/react@^16.3.0, vitest@^3.2.4, @tanstack/react-query, @testing-library/react, vitest, App(), PatientsPage, router (+32 more)

### Community 2 - "operations.ts"
Cohesion: 0.12
Nodes (18): csvHeaders, emptyMapping(), ImportPatientsPage(), activityDetail(), autoImportMapping(), DashboardContact, importAliases, ImportPreview (+10 more)

### Community 3 - "Loading Skeletons & Users"
Cohesion: 0.10
Nodes (26): DataTable(), EmptyState(), Skeleton(), TableSkeleton(), PanelSkeleton(), PatientDetailSkeleton(), TemplatesPage(), BranchOption (+18 more)

### Community 4 - "BranchesPage.tsx"
Cohesion: 0.11
Nodes (20): ThresholdsPage, AppLayout(), BranchList, WorkspaceSelector(), FormActions(), BranchesPage(), BranchList, BranchForm() (+12 more)

### Community 5 - "Button"
Cohesion: 0.17
Nodes (17): Button, Dialog(), DashboardPage(), DeliveryDialog(), Pickup, pickupOptions, NoticeDialog(), TemplateFormDialog() (+9 more)

### Community 6 - "api"
Cohesion: 0.08
Nodes (42): better-auth@^1.4.5, better-auth, react, react-router-dom, RequireAuth(), chunkErrorHints, getCopy(), isChunkLoadError() (+34 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, graphify@^1.0.0, @hookform/resolvers@^5.2.2, lucide-react@^0.552.0, react@^19.2.0, react-dom@^19.2.0 (+15 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.10
Nodes (19): jobs, verify, name, run, uses, with, True, pull_request (+11 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.10
Nodes (19): devDependencies, eslint@^9.39.1, openapi-typescript@^7.10.1, prettier@^3.6.2, tailwindcss@^4.1.16, @testing-library/jest-dom@^6.9.1, @testing-library/user-event@^14.6.1, @types/node@^24.10.0 (+11 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "package.json"
Cohesion: 0.14
Nodes (13): jsdom@^27.1.0, prettier-plugin-tailwindcss@^0.7.1, @types/react@^19.2.2, vite@^7.1.12, name, packageManager, private, type (+5 more)

### Community 14 - "ESLint Configuration"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 15 - "Entry Point & Docs"
Cohesion: 0.19
Nodes (13): index.html – SPA entry point, src/main.tsx (app bootstrap module), #root mount point, src/lib/api-types.ts (generated API types), Better Auth (authentication client), Docker + Nginx deployment, pnpm gen:api – OpenAPI type generation, max-care-api (backend dependency) (+5 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.20
Nodes (5): suffix, suffix, suffix, @playwright/test@^1.56.1, @playwright/test

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "Vite Build Config"
Cohesion: 0.40
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 22 - "CompaniesPage.tsx"
Cohesion: 0.12
Nodes (23): lucide-react, CompaniesPage(), Company, CompanyDetail(), CompanyList, CompanyQuery, queryString(), statusBadge() (+15 more)

### Community 23 - "MedicationsPage.tsx"
Cohesion: 0.17
Nodes (8): MedicationsPage, MedicationForm(), MedicationList, MedicationQuery, MedicationsPage(), queryString(), MedicationFormValues, medicationSchema

### Community 24 - "TasksPage.tsx"
Cohesion: 0.20
Nodes (12): TasksPage, TaskFormDialog(), statusClasses(), TasksPage(), isTaskOverdue(), Task, taskDueLabel(), TaskFilter (+4 more)

### Community 25 - "PatientDetailPage.tsx"
Cohesion: 0.16
Nodes (10): ActivityList, BranchList, CaregiverList, MedicationList, Panel(), PatientDetailPage(), TreatmentListResponse, UserList (+2 more)

### Community 26 - "DashboardPage.tsx"
Cohesion: 0.20
Nodes (9): DashboardPage, cardIcons, DashboardCardKey, dashboardCardKeys, dashboardCardMeta, DashboardListResponse, DashboardResponse, DashboardRow (+1 more)

### Community 27 - "TaskFormDialog.tsx"
Cohesion: 0.25
Nodes (7): PatientList, TaskTreatmentOption, UserList, TaskType, taskTypeDefaultTitle, taskTypeLabels, taskTypes

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Button` to `treatments.ts`, `Clinical Features`, `operations.ts`, `Loading Skeletons & Users`, `BranchesPage.tsx`, `api`, `CompaniesPage.tsx`, `MedicationsPage.tsx`, `TasksPage.tsx`, `PatientDetailPage.tsx`, `DashboardPage.tsx`, `TaskFormDialog.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `treatments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09468599033816426 - nodes in this community are weakly interconnected._
- **Why does `react` connect `api` to `treatments.ts`, `Clinical Features`, `operations.ts`, `Loading Skeletons & Users`, `BranchesPage.tsx`, `Button`, `Runtime Dependencies`, `package.json`, `CompaniesPage.tsx`, `MedicationsPage.tsx`, `TasksPage.tsx`, `PatientDetailPage.tsx`, `DashboardPage.tsx`, `TaskFormDialog.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Clinical Features` be split into smaller, more focused modules?**
  _Cohesion score 0.056051587301587304 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `CompaniesPage.tsx` to `treatments.ts`, `Clinical Features`, `operations.ts`, `Loading Skeletons & Users`, `BranchesPage.tsx`, `Button`, `api`, `Runtime Dependencies`, `package.json`, `MedicationsPage.tsx`, `TasksPage.tsx`, `PatientDetailPage.tsx`, `DashboardPage.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11692307692307692 - nodes in this community are weakly interconnected._