# Graph Report - max-care-web  (2026-11-06)

## Corpus Check
- 311 files · ~316,505 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 2997 nodes · 9471 edges · 130 communities (125 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 140 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b0f7f1eb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- setLiveState
- IncidentsPage.tsx
- operations.ts
- treatments.ts
- DashboardPage.tsx
- vitest
- UsersPage.tsx
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- reports.ts
- live-browser.js
- BoardPage.tsx
- Playwright E2E Tests
- Build & Dev Scripts
- Dialog
- API Code Generation
- TypeScript Root Config
- CompanyForm.tsx
- UserForm.tsx
- lucide-react
- CompanyDetailPage.tsx
- WorkspaceSelector
- optimize.md
- MenuOrderTable.tsx
- connectSSE
- StagesPage.tsx
- FormActions
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- cn
- showToast
- new-work.md
- CompanyActivityPanel.tsx
- mountSvelteComponentVariant
- Max Care Web – Fase 0
- PatientsPage.tsx
- live.md
- WorkspaceSelector
- Responsive Design
- initGlobalBar
- TreatmentsPage.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- renderDesignVisual
- The Toolkit
- @tanstack/react-query
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- MedicationForm.tsx
- Fase 2 web · Tablero Kanban, existencias e incidencias
- actOnAgentTarget
- BoardFilters
- treatments.ts
- animate.md
- Handle `generate`
- Generate Report
- CompanyRelationsPanel.tsx
- CycleCard.tsx
- New visual work
- SKILL.md
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- ReportPage.tsx
- CycleTable.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- AvisosPage.tsx
- Product
- RouteError.tsx
- clarify.md
- Nielsen's 10 Heuristics
- TaskFormDialog.tsx
- polish.md
- quieter.md
- onAnnotDown
- board.ts
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- Extract Flow
- Shape
- StatusChip
- xlsx-table.ts
- Android platform
- cn
- Persona-Based Design Testing
- Adaptation Strategies
- ProfilePage.tsx
- api
- Persuade and Experience
- react-router-dom
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- Read
- Diagnostic Scan
- MenuPermissionTree.tsx
- transfers.ts
- auth-client.ts
- RegisterPage.tsx
- PatientCaregiversPanel.tsx
- Impeccable Documenter
- UserForm.tsx
- Heuristics Scoring Guide
- Impeccable Documenter
- Operate mode depth (and Read notes)
- PropertiesPage.tsx
- vite.config.ts
- doctor.md
- IncidentsPage
- activityDetail
- Toast.tsx
- Components
- BranchForm.test.tsx
- NewCycleDialog
- Visualize: Direction Comps & Asset Production
- Region map

## God Nodes (most connected - your core abstractions)
1. `api()` - 211 edges
2. `Button` - 205 edges
3. `Dialog()` - 127 edges
4. `react` - 124 edges
5. `lucide-react` - 115 edges
6. `@tanstack/react-query` - 109 edges
7. `FormActions()` - 93 edges
8. `useCan()` - 86 edges
9. `TextField` - 80 edges
10. `ModalSection()` - 77 edges

## Surprising Connections (you probably didn't know these)
- `Filtros` --references--> `q()`  [INFERRED]
  docs/phase2-web.md → .github/skills/impeccable/scripts/modern-screenshot.umd.js
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Board page layout tweaks that came with this pass` --references--> `AppLayout()`  [INFERRED]
  tablasYPaginacionDesign.md → src/components/layout/AppLayout.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (130 total, 5 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.11
Nodes (52): applyEditing(), beginNewLiveConfiguration(), buildInsertPlaceholderSnapshotFromDom(), buildLocatorForLeaf(), buildPickedAnchorSnapshot(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure() (+44 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.18
Nodes (16): Cambios de API necesarios, IncidentDetailDialog(), ResolveIncidentDialog(), UserList, UserList, Incident, incidentBranchName(), incidentColumnLabels (+8 more)

### Community 2 - "operations.ts"
Cohesion: 0.06
Nodes (35): activityLabelFor(), activityLabels, activityTitleFor(), DashboardCardKey, dashboardCardKeys, dashboardCardMeta, DashboardContact, DashboardListResponse (+27 more)

### Community 3 - "treatments.ts"
Cohesion: 0.07
Nodes (49): RecordAction, addressText(), activityDialogTitle, addressText(), BranchList, DoctorPickerList, MedicationList, Panel() (+41 more)

### Community 4 - "DashboardPage.tsx"
Cohesion: 0.12
Nodes (23): TasksPage, TemplatesPage, BranchFilter(), BranchList, BranchTag(), cardIcons, DashboardPage(), BranchList (+15 more)

### Community 5 - "vitest"
Cohesion: 0.08
Nodes (21): @testing-library/react@^16.3.0, @testing-library/user-event@^14.6.1, vitest@^3.2.4, @testing-library/react, @testing-library/user-event, vitest, Call, card() (+13 more)

### Community 6 - "UsersPage.tsx"
Cohesion: 0.05
Nodes (89): CompaniesPage, DoctorsPage, HealthConditionsPage, MedicationsPage, RolesPage, DataTable(), RowActions(), ExportEntity (+81 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (30): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @googlemaps/js-api-loader@^2.1.3 (+22 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.12
Nodes (15): jobs, verify, name, run, uses, with, True, pull_request (+7 more)

### Community 10 - "package.json"
Cohesion: 0.06
Nodes (44): devDependencies, eslint@^9.39.1, eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, jsdom@^27.1.0 (+36 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "reports.ts"
Cohesion: 0.13
Nodes (25): ReportsIndexPage, presetFromFilters(), ReportFilterBar(), apply(), removeChip(), setDraftPreset(), useReportFilters(), update() (+17 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (130): addManualContextText(), applyGlobalBarLabelState(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), averageRgb01(), bindEditBadgeProxy() (+122 more)

### Community 15 - "BoardPage.tsx"
Cohesion: 0.10
Nodes (28): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+20 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.09
Nodes (14): suffix, suffix, createPatient(), createTreatment(), getMe(), json(), localDate(), suffix (+6 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "Dialog"
Cohesion: 0.06
Nodes (52): Checklist for any new modal, Grouping content with `ModalSection`, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, Checklist for a new advanced-filter panel, ActivityHistory() (+44 more)

### Community 22 - "CompanyForm.tsx"
Cohesion: 0.15
Nodes (18): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, meResponse(), renderForm() (+10 more)

### Community 23 - "UserForm.tsx"
Cohesion: 0.10
Nodes (16): zod@^4.1.12, zod, branches, renderForm(), roles, AutomationSettingsFormValues, automationSettingsSchema, timeOfDay (+8 more)

### Community 24 - "lucide-react"
Cohesion: 0.04
Nodes (83): @hookform/resolvers, lucide-react, react-hook-form, AddressMapDialog(), applyCoordinates(), AddressMapPicker(), AddressMapValue, componentValue() (+75 more)

### Community 25 - "CompanyDetailPage.tsx"
Cohesion: 0.15
Nodes (14): CompanyDetailPage, InfoCard(), InfoFact(), BehaviorMenu(), CompanyDetail, CompanyDetailPage(), DEFAULT_PROPERTY_KEYS, loadVisibleProperties() (+6 more)

### Community 26 - "WorkspaceSelector"
Cohesion: 0.22
Nodes (8): Board page layout tweaks that came with this pass, Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "MenuOrderTable.tsx"
Cohesion: 0.25
Nodes (11): ChildRow(), columns, DragHandle(), Group(), ItemRow(), MenuOrderTable(), Node, reorderedIds() (+3 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (88): abortSvelteComponentInjection(), applyPlaceholderDimensions(), applySavedSessionMeta(), checkpointPayload(), clampVariantIndex(), clearHandled(), clearSession(), closedClipPath() (+80 more)

### Community 30 - "StagesPage.tsx"
Cohesion: 0.25
Nodes (10): StagePicker(), setup(), stages, columnOfStatus(), effectiveStage(), Pipeline, pipelineQueryKey, PipelineStage (+2 more)

### Community 31 - "FormActions"
Cohesion: 0.09
Nodes (31): Entity, Field, FIELDS, ImportButton(), norm(), Preview, RowError, FormActions() (+23 more)

### Community 32 - "el"
Cohesion: 0.08
Nodes (53): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+45 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.07
Nodes (57): agentHasWorkInFlight(), armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+49 more)

### Community 35 - "cn"
Cohesion: 0.23
Nodes (9): DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), KanbanMove, SortableCard(), IncidentCard(), IncidentCardMenu() (+1 more)

### Community 36 - "showToast"
Cohesion: 0.12
Nodes (27): abandonForeignSession(), abandonSupersededGo(), cleanup(), clearMountErrorCard(), clearScrollY(), discardedWrappers(), discardOrphanedSession(), discardStateStyleId() (+19 more)

### Community 37 - "new-work.md"
Cohesion: 0.09
Nodes (20): Assess Adaptation Challenge, Implement & Verify, Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments (+12 more)

### Community 38 - "CompanyActivityPanel.tsx"
Cohesion: 0.17
Nodes (15): TabItem, Tabs(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel(), CompanyActivityType (+7 more)

### Community 39 - "mountSvelteComponentVariant"
Cohesion: 0.10
Nodes (34): acceptedDomAlreadyClean(), applyOriginalAttrsToSvelteAnchor(), clearHandledWrapperReloadStamp(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), cyclingCounterText(), cyclingShownVariant(), deferredRecoverySuperseded() (+26 more)

### Community 40 - "Max Care Web – Fase 0"
Cohesion: 0.18
Nodes (13): index.html – SPA entry point, src/main.tsx (app bootstrap module), #root mount point, src/lib/api-types.ts (generated API types), Better Auth (authentication client), Docker + Nginx deployment, pnpm gen:api – OpenAPI type generation, max-care-api (backend dependency) (+5 more)

### Community 41 - "PatientsPage.tsx"
Cohesion: 0.11
Nodes (15): PatientsPage, SortEditor(), activeFilterCount(), BranchList, columnSortField, dateFilterLabels, patientColumns, PatientCreateResult (+7 more)

### Community 42 - "live.md"
Cohesion: 0.06
Nodes (33): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Step 1: Parse the request (+25 more)

### Community 43 - "WorkspaceSelector"
Cohesion: 0.11
Nodes (17): Accent / Alert, Colors, Design System: MAS CARE, Elevation & Depth, Hierarchy, Layout, Named Rules, Named Rules (+9 more)

### Community 44 - "Responsive Design"
Cohesion: 0.08
Nodes (25): Assess Adaptation Challenge, Breakpoints: Content-Driven, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns (+17 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.09
Nodes (36): agentStatusText(), applyLiveBarPreference(), barPaletteForTheme(), brandMarkSvg(), buildParamsPanel(), cursorForInsertAxis(), detectPageTheme(), stopFocusOutIntoChrome() (+28 more)

### Community 46 - "TreatmentsPage.tsx"
Cohesion: 0.11
Nodes (18): TreatmentsPage, PickerPatient, BranchList, columns, derivedOptions, DerivedStatusFilter, DoctorPickerList, MedicationList (+10 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 48 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.10
Nodes (18): Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract, Output Contract, Review handoff, The job, Act on the receipt (+10 more)

### Community 50 - "renderDesignVisual"
Cohesion: 0.08
Nodes (38): buildCollapsible(), buildDesignHeader(), buildListHtml(), buildRadiiModels(), copyToClipboard(), cssSafe(), designEmptyMessage(), designPanelCss() (+30 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "@tanstack/react-query"
Cohesion: 0.05
Nodes (52): @tanstack/react-query, AccessPage, AutomationSettingsPage, BoardPage, BranchesPage, ConsolidatedDashboardPage, DashboardPage, DoctorDetailPage (+44 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.15
Nodes (17): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), own() (+9 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "MedicationForm.tsx"
Cohesion: 0.15
Nodes (25): isImage(), Item, MedicationAttachments(), addFiles(), StagedAttachment, Thumb(), DOSE_UNIT_SUGGESTIONS, MedicationForm() (+17 more)

### Community 56 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.14
Nodes (15): Accesibilidad, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida (+7 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.24
Nodes (19): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+11 more)

### Community 58 - "BoardFilters"
Cohesion: 0.11
Nodes (14): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Every field gets the same leading-icon badge, Footer, Header, Shared control class, BoardFilters() (+6 more)

### Community 59 - "treatments.ts"
Cohesion: 0.05
Nodes (66): CustomFields(), decode(), DoseFrequencyRow(), encode(), MINUTES, TimePicker12h(), addDaysToDateString(), API_URL (+58 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "CompanyRelationsPanel.tsx"
Cohesion: 0.12
Nodes (19): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealList (+11 more)

### Community 64 - "CycleCard.tsx"
Cohesion: 0.15
Nodes (17): CycleCard(), CycleCardMenu(), MenuButton(), nextActionFor(), columnSortField, CycleTable(), ColumnPicker(), BoardCard (+9 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "SKILL.md"
Cohesion: 0.08
Nodes (21): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Craft floor, Refuse, Verify (+13 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "ReportPage.tsx"
Cohesion: 0.13
Nodes (38): recharts, ActivityList, authorName(), EmptyState(), Skeleton(), PanelSkeleton(), PatientDetailSkeleton(), DefinitionHelp() (+30 more)

### Community 69 - "CycleTable.tsx"
Cohesion: 0.17
Nodes (21): CustomPropertyFilter(), actionLabels, BatchAction, BatchBar(), CheckList(), Chip(), Named, SavedViewsBar() (+13 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 73 - "AvisosPage.tsx"
Cohesion: 0.15
Nodes (14): AvisosPage, filterControlClass, AvisosPage(), channelLabels, errorLabels, explainError(), OutboxPage, OutboxRow (+6 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "RouteError.tsx"
Cohesion: 0.53
Nodes (4): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "TaskFormDialog.tsx"
Cohesion: 0.17
Nodes (11): PatientList, TaskTreatmentOption, UserList, taskPriorities, TaskPriority, taskPriorityLabels, taskReminderOptions, TaskType (+3 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "onAnnotDown"
Cohesion: 0.18
Nodes (18): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clampPlaceholderSize(), finalizeEditingPin(), initAnnotOverlay(), isImeKeydown() (+10 more)

### Community 82 - "board.ts"
Cohesion: 0.14
Nodes (15): filterChipLabel, MedicationList, UserList, BoardFilters, boardQueryKey(), boardQueryString(), BoardResponse, cycleTableQueryKey() (+7 more)

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

### Community 88 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "StatusChip"
Cohesion: 0.21
Nodes (12): Do:, Do's and Don'ts, Don't:, ChipsPage, StatusLabel, statusLabels, StatusChip(), styles (+4 more)

### Community 91 - "xlsx-table.ts"
Cohesion: 0.33
Nodes (8): buildXlsx(), columnName(), crc32(), crcTable, downloadTableXlsx(), encoder, escapeXml(), zip()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "cn"
Cohesion: 0.26
Nodes (12): Neutral, AppLayout(), linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), WorkspaceSelector(), activateOrganization() (+4 more)

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "Adaptation Strategies"
Cohesion: 0.40
Nodes (5): Adaptation Strategies, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 96 - "ProfilePage.tsx"
Cohesion: 0.21
Nodes (9): ProfilePage, ChangePassword(), Profile, ProfilePage(), baseProfile, changePassword, sendVerificationEmail, setup() (+1 more)

### Community 97 - "api"
Cohesion: 0.06
Nodes (59): react, API_URL, ExportButton(), ExportFilters, Format, Button, Props, PrintFrame() (+51 more)

### Community 98 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

### Community 99 - "react-router-dom"
Cohesion: 0.16
Nodes (16): react-router-dom, NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), alwaysAllowedPaths, buildMenuTree() (+8 more)

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

### Community 107 - "Read"
Cohesion: 0.50
Nodes (3): Comps, Directions, Read

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "MenuPermissionTree.tsx"
Cohesion: 0.32
Nodes (9): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), menuIcon() (+1 more)

### Community 110 - "transfers.ts"
Cohesion: 0.13
Nodes (16): TransfersPage, BranchList, transferColumns, updateFilters(), GlobalTransferList, PatientTransferList, Transfer, transferFiltersFromSearch() (+8 more)

### Community 111 - "auth-client.ts"
Cohesion: 0.57
Nodes (3): RequireAuth(), AppShellSkeleton(), authClient

### Community 112 - "RegisterPage.tsx"
Cohesion: 0.19
Nodes (15): PasswordField, Props, AccessPage(), AuthFrame(), CompanyBadge(), CompanyPreview, FieldErrors, RegisterBody (+7 more)

### Community 113 - "PatientCaregiversPanel.tsx"
Cohesion: 0.16
Nodes (12): Caregiver, CaregiverList, PatientCaregiversPanel(), openEdit(), DoctorLink, DoctorLinkList, DoctorList, PatientList (+4 more)

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "UserForm.tsx"
Cohesion: 0.23
Nodes (9): BranchOption, generatePassword(), generatePin(), Props, RoleOption, UserForm(), UserDetail(), roleLabel() (+1 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 119 - "PropertiesPage.tsx"
Cohesion: 0.12
Nodes (24): Field(), toLocalInput(), Draft, entityLabels, PropertiesPage(), PropertyDialog(), slug(), submit() (+16 more)

### Community 120 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 121 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 122 - "IncidentsPage"
Cohesion: 0.36
Nodes (5): IncidentsPage(), updateFilters(), incidentsPath(), incidentFiltersToSearch(), incidentQueryKey()

### Community 123 - "activityDetail"
Cohesion: 0.33
Nodes (6): activityDetail(), autoImportMapping(), describeScheduleMetadata(), formatChanges(), normalizeImportKey(), resolveImportField()

### Community 124 - "Toast.tsx"
Cohesion: 0.19
Nodes (9): App(), router, ToastContext, ToastContextValue, ToastItem, ToastProvider(), ToastTone, toneIcons (+1 more)

### Community 125 - "Components"
Cohesion: 0.29
Nodes (7): Buttons, Cards / Containers, Chips, Components, Dialogs, Inputs / Fields, Navigation

### Community 127 - "NewCycleDialog"
Cohesion: 0.83
Nodes (4): NewCycleDialog(), clearTreatment(), selectPatient(), selectTreatment()

### Community 130 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1088 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `lucide-react` to `IncidentsPage.tsx`, `operations.ts`, `treatments.ts`, `UsersPage.tsx`, `reports.ts`, `BoardPage.tsx`, `Dialog`, `CompanyForm.tsx`, `CompanyDetailPage.tsx`, `FormActions`, `CompanyActivityPanel.tsx`, `PatientsPage.tsx`, `Impeccable Asset Producer`, `@tanstack/react-query`, `MedicationForm.tsx`, `treatments.ts`, `CompanyRelationsPanel.tsx`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `ReportPage.tsx`, `board.ts`, `api`, `react-router-dom`, `transfers.ts`, `PatientCaregiversPanel.tsx`?**
  _High betweenness centrality (0.453) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.1138763197586727 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `lucide-react`?**
  _High betweenness centrality (0.435) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.057057057057057055 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `initGlobalBar` to `setLiveState`, `syncPageChatFocus`, `SKILL.md`, `live.md`, `live-browser.js`, `handleManualEditActivity`, `onAnnotDown`, `renderDesignVisual`, `Init flow`, `doctor.md`, `connectSSE`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._