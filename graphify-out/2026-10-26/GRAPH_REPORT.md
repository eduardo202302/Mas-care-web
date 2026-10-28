# Graph Report - max-care-web  (2026-10-26)

## Corpus Check
- Corpus is ~37,265 words - fits in a single context window. You may not need a graph.

## Summary
- 544 nodes · 1471 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI Components & Dashboard
- Clinical Features
- Layout & Navigation
- Loading Skeletons & Users
- Status Labels & Testing
- App Bootstrap & Query
- Auth Guards & Error Handling
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- Dev Dependencies
- Component Aliases Config
- TypeScript Node Config
- Package Metadata
- ESLint Configuration
- Entry Point & Docs
- Playwright E2E Tests
- Build & Dev Scripts
- Vite Build Config
- API Code Generation
- TypeScript Root Config

## God Nodes (most connected - your core abstractions)
1. `Button` - 56 edges
2. `api()` - 41 edges
3. `react` - 30 edges
4. `TextField` - 30 edges
5. `PatientDetailPage()` - 29 edges
6. `@tanstack/react-query` - 27 edges
7. `lucide-react` - 25 edges
8. `Dialog()` - 24 edges
9. `useCan()` - 24 edges
10. `Skeleton()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `SPA de gestión para farmacias` --semantically_similar_to--> `index.html – SPA entry point`  [INFERRED] [semantically similar]
  README.md → index.html
- `React Router (SPA routing)` --semantically_similar_to--> `#root mount point`  [INFERRED] [semantically similar]
  README.md → index.html
- `RequireAuth()` --calls--> `AppShellSkeleton()`  [EXTRACTED]
  src/app/RequireAuth.tsx → src/components/layout/AppShellSkeleton.tsx
- `RouteError()` --calls--> `Button`  [EXTRACTED]
  src/app/RouteError.tsx → src/components/ui/Button.tsx
- `BranchFilter()` --calls--> `api()`  [EXTRACTED]
  src/components/BranchFilter.tsx → src/lib/http.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]

## Communities (22 total, 3 thin omitted)

### Community 0 - "UI Components & Dashboard"
Cohesion: 0.06
Nodes (63): StatusChip(), Button, Dialog(), cardIcons, DashboardPage(), counts, row, DashboardTreatmentRow() (+55 more)

### Community 1 - "Clinical Features"
Cohesion: 0.06
Nodes (38): MedicationsPage, PatientsPage, ThresholdsPage, FormActions(), MedicationForm(), MedicationList, MedicationQuery, MedicationsPage() (+30 more)

### Community 2 - "Layout & Navigation"
Cohesion: 0.06
Nodes (47): lucide-react, ImportPatientsPage, BranchFilter(), BranchList, AppLayout(), BranchList, WorkspaceSelector(), csvHeaders (+39 more)

### Community 3 - "Loading Skeletons & Users"
Cohesion: 0.10
Nodes (24): UsersPage, AppShellSkeleton(), Skeleton(), TableSkeleton(), PanelSkeleton(), PatientDetailSkeleton(), BranchOption, generatePassword() (+16 more)

### Community 4 - "Status Labels & Testing"
Cohesion: 0.11
Nodes (17): @testing-library/react@^16.3.0, @testing-library/react, ChipsPage, BranchTag(), StatusLabel, statusLabels, styles, Props (+9 more)

### Community 5 - "App Bootstrap & Query"
Cohesion: 0.12
Nodes (19): react-dom@^19.2.0, react, react-dom, @tanstack/react-query, App(), router, TemplatesPage, DataTable() (+11 more)

### Community 6 - "Auth Guards & Error Handling"
Cohesion: 0.15
Nodes (19): react-router-dom, RequireAuth(), chunkErrorHints, getCopy(), isChunkLoadError(), RouteError(), AccessPage, BranchesPage (+11 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, graphify@^1.0.0, @hookform/resolvers@^5.2.2, lucide-react@^0.552.0, react@^19.2.0 (+15 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.10
Nodes (19): jobs, verify, name, run, uses, with, True, pull_request (+11 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.10
Nodes (19): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier-plugin-tailwindcss@^0.7.1, @testing-library/jest-dom@^6.9.1, @testing-library/user-event@^14.6.1, @types/react@^19.2.2 (+11 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "Package Metadata"
Cohesion: 0.14
Nodes (13): prettier@^3.6.2, tailwindcss@^4.1.16, @types/node@^24.10.0, typescript@~5.9.3, name, packageManager, private, type (+5 more)

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
Cohesion: 0.29
Nodes (6): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, vitest@^3.2.4, @tailwindcss/vite, @vitejs/plugin-react, vitest

## Knowledge Gaps
- **3 isolated node(s):** `Better Auth (authentication client)`, `src/lib/api-types.ts (generated API types)`, `src/main.tsx (app bootstrap module)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 202 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App Bootstrap & Query` to `UI Components & Dashboard`, `Clinical Features`, `Layout & Navigation`, `Loading Skeletons & Users`, `Status Labels & Testing`, `Auth Guards & Error Handling`, `Runtime Dependencies`, `Package Metadata`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `Better Auth (authentication client)`, `src/lib/api-types.ts (generated API types)`, `src/main.tsx (app bootstrap module)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components & Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.05994710549515134 - nodes in this community are weakly interconnected._
- **Why does `Button` connect `UI Components & Dashboard` to `Clinical Features`, `Layout & Navigation`, `Loading Skeletons & Users`, `Status Labels & Testing`, `App Bootstrap & Query`, `Auth Guards & Error Handling`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `Clinical Features` be split into smaller, more focused modules?**
  _Cohesion score 0.06377204884667571 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Layout & Navigation` to `UI Components & Dashboard`, `Clinical Features`, `Loading Skeletons & Users`, `Status Labels & Testing`, `App Bootstrap & Query`, `Auth Guards & Error Handling`, `Runtime Dependencies`, `Package Metadata`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `Layout & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._