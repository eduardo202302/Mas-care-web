# Graph Report - max-care-web  (2026-10-30)

## Corpus Check
- 283 files · ~274,929 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .exe 1)

## Summary
- 2654 nodes · 7749 edges · 119 communities (114 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `823d5a0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- MenuPage.tsx
- router.tsx
- operations.ts
- lucide-react
- CompanyForm
- PatientDetailPage.tsx
- Button
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- vitest
- live-browser.js
- generate.md
- Playwright E2E Tests
- Build & Dev Scripts
- api
- API Code Generation
- TypeScript Root Config
- PatientDetailPage.tsx
- lib/menu.ts
- IncidentsPage.tsx
- cn
- phase2-board.spec.ts
- optimize.md
- UserForm.tsx
- connectSSE
- handleKeyDown
- http.ts
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- PatientsPage.tsx
- documentRefForElement
- new-work.md
- Skeleton
- showToast
- CycleTable.tsx
- RoleForm.tsx
- live.md
- Design System: MAS CARE
- Responsive Design
- initGlobalBar
- PropertiesPage.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- SKILL.md
- The Toolkit
- reports.ts
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- document.md
- TransferDialog.tsx
- actOnAgentTarget
- BoardFilters
- treatments.ts
- animate.md
- Handle `generate`
- Generate Report
- board.ts
- pipeline.ts
- New visual work
- NewCycleDialog.tsx
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- AvisosPage.tsx
- BoardPage.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- eslint.config.js
- Product
- CycleCard.tsx
- clarify.md
- Nielsen's 10 Heuristics
- reports/components/ExportButton.tsx
- polish.md
- quieter.md
- scheduleAcceptCleanup
- react-router-dom
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- Operate mode depth (and Read notes)
- Shape
- StockPage.tsx
- adapt.native.md
- Android platform
- doctor.md
- Persona-Based Design Testing
- Extract Flow
- App.tsx
- bolder.md
- DoctorDetailPage.tsx
- TreatmentForm.tsx
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- RouteError.tsx
- Diagnostic Scan
- Persuade and Experience
- Visualize: Direction Comps & Asset Production
- auth-client.ts
- RegisterPage.tsx
- vite.config.ts
- Impeccable Documenter
- PatientDetailSkeleton.tsx
- Heuristics Scoring Guide
- Impeccable Documenter
- WorkspaceSelector

## God Nodes (most connected - your core abstractions)
1. `Button` - 178 edges
2. `api()` - 173 edges
3. `react` - 100 edges
4. `Dialog()` - 99 edges
5. `@tanstack/react-query` - 91 edges
6. `lucide-react` - 83 edges
7. `Skeleton()` - 67 edges
8. `useCan()` - 66 edges
9. `FormActions()` - 59 edges
10. `TextField` - 56 edges

## Surprising Connections (you probably didn't know these)
- `Where the footer lives` --references--> `EmptyState()`  [INFERRED]
  tablasYPaginacionDesign.md → src/components/EmptyState.tsx
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx
- `Assemble and review` --references--> `components`  [INFERRED]
  .github/skills/impeccable/reference/component-review.md → src/lib/api-types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (119 total, 5 thin omitted)

### Community 0 - "MenuPage.tsx"
Cohesion: 0.11
Nodes (22): BranchList, Option, BranchRow, BranchRowCells(), ConsolidatedDashboardPage(), ConsolidatedResponse, CounterCell(), counterKeys (+14 more)

### Community 1 - "router.tsx"
Cohesion: 0.07
Nodes (26): AccessPage, AutomationSettingsPage, BranchesPage, CompaniesPage, ConsolidatedDashboardPage, DashboardPage, DoctorsPage, ForgotPasswordPage (+18 more)

### Community 2 - "operations.ts"
Cohesion: 0.07
Nodes (37): TasksPage, statusClasses(), TasksPage(), activityDetail(), autoImportMapping(), DashboardCardKey, dashboardCardKeys, dashboardCardMeta (+29 more)

### Community 3 - "lucide-react"
Cohesion: 0.07
Nodes (53): lucide-react, DataTable(), RowActions(), Pagination(), TableSkeleton(), BranchesPage(), BranchList, DoctorList (+45 more)

### Community 4 - "CompanyForm"
Cohesion: 0.18
Nodes (15): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, renderForm(), companyFormSchema (+7 more)

### Community 5 - "PatientDetailPage.tsx"
Cohesion: 0.10
Nodes (22): Tablero de ciclos, DeliveryDialog(), ConversationDialog(), activityDialogTitle, ActivityList, authorName(), BranchList, CaregiverList (+14 more)

### Community 6 - "Button"
Cohesion: 0.05
Nodes (61): Checklist for any new modal, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, react, @tanstack/react-query, API_URL (+53 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, graphify@^1.0.0 (+20 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.12
Nodes (15): jobs, verify, name, run, uses, with, True, pull_request (+7 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (31): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @testing-library/jest-dom@^6.9.1 (+23 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "vitest"
Cohesion: 0.08
Nodes (22): @testing-library/react@^16.3.0, @testing-library/user-event@^14.6.1, @testing-library/react, @testing-library/user-event, vitest, JobsPage, counts, row (+14 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (138): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderDimensions(), applyPlaceholderSizingStyles(), applySavedParamValues(), averageRgb01() (+130 more)

### Community 15 - "generate.md"
Cohesion: 0.15
Nodes (11): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, append-arrays, append-string, Config drift, Consent prompt (use this phrasing) (+3 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.12
Nodes (8): suffix, suffix, getMe(), json(), suffix, suffix, @playwright/test@^1.56.1, @playwright/test

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "api"
Cohesion: 0.08
Nodes (36): BranchFilter(), BranchList, AutomationRule, AutomationRules(), EnrollAutomationButton(), paramField, rulesQueryKey, useAutomationRules() (+28 more)

### Community 22 - "PatientDetailPage.tsx"
Cohesion: 0.19
Nodes (14): PropertiesDialog(), PropertyGroup, RecordAction, RecordActionsMenu(), PatientAutomationPanel(), PauseDialog(), useSetAutomationPaused(), ActivityKind (+6 more)

### Community 23 - "lib/menu.ts"
Cohesion: 0.20
Nodes (14): linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), alwaysAllowedPaths, buildMenuTree(), byOrder(), isPathAllowed() (+6 more)

### Community 24 - "IncidentsPage.tsx"
Cohesion: 0.13
Nodes (21): IncidentsPage, BranchList, IncidentFormDialog(), PatientList, UserList, IncidentsPage(), updateFilters(), incidentsPath() (+13 more)

### Community 25 - "cn"
Cohesion: 0.15
Nodes (14): Incidencias, Árbol de `features/board` y `features/incidents`, DragHandle(), DragHandleProps, KanbanBoard(), columnFor(), handleDragEnd(), KanbanColumn (+6 more)

### Community 26 - "phase2-board.spec.ts"
Cohesion: 0.33
Nodes (6): createPatient(), createTreatment(), getMe(), json(), localDate(), suffix

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "UserForm.tsx"
Cohesion: 0.13
Nodes (16): BranchOption, generatePassword(), generatePin(), Props, RoleOption, branches, renderForm(), roles (+8 more)

### Community 29 - "connectSSE"
Cohesion: 0.05
Nodes (120): abortSvelteComponentInjection(), applySavedSessionMeta(), buildInsertPlaceholderSnapshotFromDom(), buildPickedAnchorSnapshot(), cancelEditing(), cancelEditingToPicking(), captureAndEmit(), checkpointPayload() (+112 more)

### Community 30 - "handleKeyDown"
Cohesion: 0.10
Nodes (41): attachSteerFocusDebug(), attachSteerFocusGuard(), beginNewLiveConfiguration(), cancelInsertConfigure(), clearAnnotations(), clearInsertPicking(), clearSteerFocusRecoverTimer(), exitConfigureToPicking() (+33 more)

### Community 31 - "http.ts"
Cohesion: 0.06
Nodes (52): zod@^4.1.12, @hookform/resolvers, react-hook-form, zod, FormActions(), Props, TextField, CompanyPreview (+44 more)

### Community 32 - "el"
Cohesion: 0.08
Nodes (54): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+46 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.05
Nodes (77): Accesibilidad, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida, Rutas y menú (+69 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.10
Nodes (42): agentHasWorkInFlight(), armPageChatForTyping(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), collapsePageChat(), configureVoiceContext(), expandPageChat() (+34 more)

### Community 35 - "PatientsPage.tsx"
Cohesion: 0.08
Nodes (23): ExportButton(), Entity, Field, FIELDS, ImportButton(), norm(), Preview, RowError (+15 more)

### Community 36 - "documentRefForElement"
Cohesion: 0.07
Nodes (41): addManualContextText(), applyEditing(), buildLocatorForLeaf(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk() (+33 more)

### Community 37 - "new-work.md"
Cohesion: 0.07
Nodes (25): Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments, Verify, Visitor mode (+17 more)

### Community 38 - "Skeleton"
Cohesion: 0.27
Nodes (22): Skeleton(), DefinitionHelp(), ExportButton(), MetricCard(), SimpleMetricCard(), ReportChart(), ReportErrorState(), ReportTable() (+14 more)

### Community 39 - "showToast"
Cohesion: 0.08
Nodes (39): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase(), discardOrphanedSession() (+31 more)

### Community 40 - "CycleTable.tsx"
Cohesion: 0.13
Nodes (30): columnSortField, CycleTable(), Call, card(), pipeline, setup(), actionLabels, BatchAction (+22 more)

### Community 41 - "RoleForm.tsx"
Cohesion: 0.33
Nodes (8): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), MenuItemDto

### Community 42 - "live.md"
Cohesion: 0.08
Nodes (22): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Cleanup (+14 more)

### Community 43 - "Design System: MAS CARE"
Cohesion: 0.08
Nodes (24): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+16 more)

### Community 44 - "Responsive Design"
Cohesion: 0.08
Nodes (25): Assess Adaptation Challenge, Breakpoints: Content-Driven, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns (+17 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.08
Nodes (44): agentStatusText(), barPaletteForTheme(), brandMarkSvg(), buildDesignHeader(), buildParamsPanel(), cursorForInsertAxis(), designPanelCss(), detectPageTheme() (+36 more)

### Community 46 - "PropertiesPage.tsx"
Cohesion: 0.10
Nodes (31): CustomFields(), CustomPropertyFilter(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), submit(), Draft (+23 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.15
Nodes (28): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hasTextRows(), check(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey() (+20 more)

### Community 48 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.10
Nodes (18): Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract, Output Contract, Review handoff, The job, Act on the receipt (+10 more)

### Community 50 - "SKILL.md"
Cohesion: 0.10
Nodes (16): Craft floor, Refuse, Verify, Constraints, Failure modes, Flow, /impeccable hooks, Routing (+8 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "reports.ts"
Cohesion: 0.14
Nodes (25): ReportsIndexPage, presetFromFilters(), ReportFilterBar(), apply(), setPreset(), toggleBranch(), useReportFilters(), update() (+17 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.14
Nodes (18): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), own() (+10 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "document.md"
Cohesion: 0.18
Nodes (10): Pitfalls, Seed mode, Step 1: Route through new-work's workshop, Step 2: Write seed DESIGN.md, Step 3: Confirm, Style guidelines, The frontmatter: token schema, The markdown body: eight sections (canonical order) (+2 more)

### Community 56 - "TransferDialog.tsx"
Cohesion: 0.15
Nodes (15): Branch, TransferDialog(), newIdempotencyKey(), GlobalTransferList, isTransferPending(), PatientTransferList, Transfer, TransferGlobalRow (+7 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "BoardFilters"
Cohesion: 0.11
Nodes (15): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Checklist for a new advanced-filter panel, Every field gets the same leading-icon badge, Footer, Header, Shared control class (+7 more)

### Community 59 - "treatments.ts"
Cohesion: 0.15
Nodes (23): DashboardTreatmentRow(), remainingText(), conditionStatusLabels, ConditionLink, DoctorLink, PatientInfoPackPanel(), ActiveTreatmentsPanel(), TreatmentList() (+15 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "board.ts"
Cohesion: 0.11
Nodes (21): CycleCard(), CycleCardMenu(), MenuButton(), nextActionFor(), BoardColumnData, BoardListResponse, boardQueryKey(), boardQueryString() (+13 more)

### Community 64 - "pipeline.ts"
Cohesion: 0.16
Nodes (16): Cambios de API necesarios, StagesPage, StagePicker(), setup(), stages, columns, isNew(), StagesPage() (+8 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "NewCycleDialog.tsx"
Cohesion: 0.22
Nodes (10): cyclePriorityOptions, cycleTypeOptions, Eligible, NewCycleDialog(), clearTreatment(), selectPatient(), selectTreatment(), Patient (+2 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.15
Nodes (13): Component translation rules, Narrative mapping, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Step 1: Find the design assets, Step 2: Auto-extract what can be auto-extracted, Step 2b: Stage the frontmatter, Step 3: Ask the user for qualitative language (+5 more)

### Community 68 - "AvisosPage.tsx"
Cohesion: 0.11
Nodes (21): recharts, AvisosPage, EmptyState(), AvisosPage(), channelLabels, errorLabels, explainError(), OutboxPage (+13 more)

### Community 69 - "BoardPage.tsx"
Cohesion: 0.14
Nodes (21): BoardPage, appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn() (+13 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 73 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "CycleCard.tsx"
Cohesion: 0.24
Nodes (10): Do:, Do's and Don'ts, Don't:, ChipsPage, BranchTag(), StatusLabel, statusLabels, StatusChip() (+2 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "reports/components/ExportButton.tsx"
Cohesion: 0.24
Nodes (8): API_URL, buildExportUrl(), handleExport(), separatorLabels, BoardView, ReportCsvSeparator, UiState, useUiStore

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 82 - "react-router-dom"
Cohesion: 0.39
Nodes (6): react-router-dom, NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt()

### Community 83 - "Generate Combined Critique Report"
Cohesion: 0.20
Nodes (10): Design Health Score, Design Specificity Verdict, Generate Combined Critique Report, Minor Observations, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider (+2 more)

### Community 84 - "Init flow"
Cohesion: 0.20
Nodes (10): Completion gate, Init flow, Step 1: Load current state, Step 2: Explore the project, Step 3: Interview for product truth, Step 4: Write PRODUCT.md, Step 5: Record workflow defaults, Step 6: Wrap up or resume (+2 more)

### Community 86 - "Common Cognitive Load Violations"
Cohesion: 0.22
Nodes (9): 1. The Wall of Options, 2. The Memory Bridge, 3. The Hidden Navigation, 4. The Jargon Barrier, 5. The Visual Noise Floor, 6. The Inconsistent Pattern, 7. The Multi-Task Demand, 8. The Context Switch (+1 more)

### Community 87 - "iOS platform"
Cohesion: 0.22
Nodes (9): Color & materials, Components & controls, iOS platform, Layout & structure, Motion, The iOS slop test, Touch targets, Typography (+1 more)

### Community 88 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "StockPage.tsx"
Cohesion: 0.16
Nodes (16): StockPage, ToastContext, ToastContextValue, ToastItem, ToastTone, toneIcons, toneStyles, useToast() (+8 more)

### Community 91 - "adapt.native.md"
Cohesion: 0.25
Nodes (7): Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 96 - "App.tsx"
Cohesion: 0.47
Nodes (3): App(), router, ToastProvider()

### Community 97 - "bolder.md"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 98 - "DoctorDetailPage.tsx"
Cohesion: 0.06
Nodes (35): Grouping content with `ModalSection`, DoctorDetailPage, ModalSection(), ModalSectionTone, tones, Doctor, DoctorDetail, DoctorDetailPage() (+27 more)

### Community 99 - "TreatmentForm.tsx"
Cohesion: 0.24
Nodes (8): BranchOption, serverFields, TreatmentForm(), chooseMedication(), UserOption, formatDateValue(), TreatmentFormValues, treatmentSchema

### Community 100 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 101 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 102 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 103 - "Cognitive Load Assessment"
Cohesion: 0.29
Nodes (7): Cognitive Load Assessment, Cognitive Load Checklist, Extraneous Load: Bad Design, Germane Load: Learning Effort, Intrinsic Load: The Task Itself, The Working Memory Rule, Three Types of Cognitive Load

### Community 104 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 105 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 106 - "live-browser-ignores.js"
Cohesion: 0.52
Nodes (6): globToRegex(), matchesScope(), normalizeIgnoreRule(), normalizeIgnoreValue(), pageCandidates(), resolveDetectIgnores()

### Community 107 - "RouteError.tsx"
Cohesion: 0.53
Nodes (4): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

### Community 110 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 111 - "auth-client.ts"
Cohesion: 0.57
Nodes (3): RequireAuth(), AppShellSkeleton(), authClient

### Community 112 - "RegisterPage.tsx"
Cohesion: 0.14
Nodes (18): RegisterPage, PasswordField, Props, AccessPage(), AuthFrame(), CompanyBadge(), ForgotPasswordPage(), submit() (+10 more)

### Community 113 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 120 - "WorkspaceSelector"
Cohesion: 0.13
Nodes (14): Neutral, AppLayout(), WorkspaceSelector(), activateOrganization(), renderOption(), selectWorkspace(), Board page layout tweaks that came with this pass, Branch-first ordering (+6 more)

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 941 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `http.ts` to `MenuPage.tsx`, `operations.ts`, `lucide-react`, `PatientDetailPage.tsx`, `Button`, `vitest`, `api`, `PatientDetailPage.tsx`, `lib/menu.ts`, `IncidentsPage.tsx`, `PatientsPage.tsx`, `Impeccable Asset Producer`, `reports.ts`, `document.md`, `TransferDialog.tsx`, `treatments.ts`, `board.ts`, `NewCycleDialog.tsx`, `DoctorDetailPage.tsx`, `TreatmentForm.tsx`?**
  _High betweenness centrality (0.454) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MenuPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11182795698924732 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `document.md` to `http.ts`?**
  _High betweenness centrality (0.435) - this node is a cross-community bridge._
- **Should `router.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `initGlobalBar` to `live-browser.js`, `generate.md`, `handleManualEditActivity`, `connectSSE`, `SKILL.md`, `Init flow`, `doctor.md`, `handleKeyDown`?**
  _High betweenness centrality (0.349) - this node is a cross-community bridge._