# Graph Report - max-care-web  (2026-11-06)

## Corpus Check
- 305 files · ~310,649 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 2931 nodes · 9143 edges · 139 communities (132 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 138 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97942e33`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- setLiveState
- IncidentsPage.tsx
- operations.ts
- treatments.ts
- TreatmentsPage.tsx
- vitest
- BranchesPage.tsx
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
- api
- API Code Generation
- TypeScript Root Config
- CompanyRelationsPanel.tsx
- TasksPage.tsx
- lucide-react
- FormActions
- captureElementToBlob
- optimize.md
- CompanyForm.tsx
- connectSSE
- StagesPage.tsx
- TreatmentsPage
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- BranchesPage
- documentRefForElement
- new-work.md
- CompanyActivityPanel.tsx
- showToast
- eslint.config.js
- PatientsPage.tsx
- live.md
- StatusChip
- Responsive Design
- initGlobalBar
- PatientForm.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- BoardFilters.tsx
- The Toolkit
- ConsolidatedDashboardPage.tsx
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- buildExportUrl
- Fase 2 web · Tablero Kanban, existencias e incidencias
- actOnAgentTarget
- BoardFilters
- TreatmentForm.tsx
- animate.md
- Handle `generate`
- Generate Report
- onAnnotDown
- PageHeader
- New visual work
- SKILL.md
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- ReportPage.tsx
- CycleTable.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- router.tsx
- Product
- WorkspaceSelector.tsx
- clarify.md
- Nielsen's 10 Heuristics
- UserForm.tsx
- polish.md
- quieter.md
- scheduleAcceptCleanup
- PatientInfoPackPanel.tsx
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- Extract Flow
- Shape
- cn
- KanbanBoard.tsx
- Android platform
- k
- Persona-Based Design Testing
- Max Care Web – Fase 0
- UsersPage.tsx
- react
- StatusChip
- MenuPermissionTree.tsx
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- phase2-board.spec.ts
- Diagnostic Scan
- board.ts
- TransfersPage.tsx
- L
- react
- doctor.md
- Impeccable Documenter
- MenuPage.tsx
- Heuristics Scoring Guide
- Impeccable Documenter
- Operate mode depth (and Read notes)
- PropertiesPage.tsx
- vite.config.ts
- qt
- StockPage.tsx
- activityDetail
- Toast.tsx
- ReportChart.tsx
- JobsPage.tsx
- Components
- DashboardPage.tsx
- Tables & server pagination design system
- Visualize: Direction Comps & Asset Production
- Region map
- Read
- Modal design system
- Adaptation Strategies
- CycleCardMenu
- q
- Persuade and Experience
- printTable

## God Nodes (most connected - your core abstractions)
1. `api()` - 204 edges
2. `Button` - 201 edges
3. `Dialog()` - 127 edges
4. `react` - 120 edges
5. `lucide-react` - 111 edges
6. `@tanstack/react-query` - 105 edges
7. `FormActions()` - 93 edges
8. `useCan()` - 84 edges
9. `TextField` - 80 edges
10. `ModalSection()` - 75 edges

## Surprising Connections (you probably didn't know these)
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Neutral` --references--> `AppLayout()`  [INFERRED]
  DESIGN.md → src/components/layout/AppLayout.tsx
- `Board page layout tweaks that came with this pass` --references--> `AppLayout()`  [INFERRED]
  tablasYPaginacionDesign.md → src/components/layout/AppLayout.tsx
- `Other behavior baked into `Dialog`` --references--> `Dialog()`  [INFERRED]
  desingModal.md → src/components/ui/Dialog.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (139 total, 7 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.16
Nodes (16): IncidentDetailDialog(), IncidentsPage(), updateFilters(), incidentsPath(), UserList, paths, incidentColumnLabels, incidentColumns (+8 more)

### Community 2 - "operations.ts"
Cohesion: 0.06
Nodes (32): activityLabelFor(), activityLabels, DashboardContact, DeliveryResult, humanizeActivityType(), importAliases, ImportPreview, ImportResult (+24 more)

### Community 3 - "treatments.ts"
Cohesion: 0.09
Nodes (28): decode(), encode(), MINUTES, TimePicker12h(), activityLabels, computeDailyTimesFromInterval(), coveragePreview(), dateFormatter (+20 more)

### Community 4 - "TreatmentsPage.tsx"
Cohesion: 0.08
Nodes (39): AvisosPage, ActiveFilterChip, ActiveFilterChips(), AdvancedFilterButton(), AdvancedFilterDialog(), FilterBarRow(), filterControlClass, FilterField() (+31 more)

### Community 5 - "vitest"
Cohesion: 0.07
Nodes (23): @testing-library/react, @testing-library/user-event, vitest, Call, card(), pipeline, setup(), counts (+15 more)

### Community 6 - "BranchesPage.tsx"
Cohesion: 0.07
Nodes (46): DataTable(), RowActions(), Pagination(), FilterSegmented(), TableSkeleton(), BranchAddressDetails, BranchList, CompaniesPage() (+38 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @googlemaps/js-api-loader@^2.1.3, graphify@^1.0.0, @hookform/resolvers@^5.2.2, lucide-react@^0.552.0 (+15 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.12
Nodes (15): jobs, verify, name, run, uses, with, True, pull_request (+7 more)

### Community 10 - "package.json"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @testing-library/jest-dom@^6.9.1 (+27 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "reports.ts"
Cohesion: 0.14
Nodes (22): ReportsIndexPage, presetFromFilters(), setDraftPreset(), useReportFilters(), update(), reportIcons, ReportsIndexPage(), dateRangeForPreset() (+14 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "BoardPage.tsx"
Cohesion: 0.13
Nodes (22): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+14 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.12
Nodes (8): suffix, suffix, getMe(), json(), suffix, suffix, @playwright/test@^1.56.1, @playwright/test

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "api"
Cohesion: 0.06
Nodes (78): ActivityHistory(), ActivityList, authorName(), customPropertyGroups(), CustomValuesView(), PropertiesDialog(), PropertyGroup, RecordAction (+70 more)

### Community 22 - "CompanyRelationsPanel.tsx"
Cohesion: 0.09
Nodes (26): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealCreateForm() (+18 more)

### Community 23 - "TasksPage.tsx"
Cohesion: 0.22
Nodes (11): TasksPage, BranchFilter(), BranchList, statusClasses(), TasksPage(), isTaskOverdue(), Task, TaskFilter (+3 more)

### Community 24 - "lucide-react"
Cohesion: 0.06
Nodes (55): Grouping content with `ModalSection`, Checklist for a new advanced-filter panel, @hookform/resolvers, lucide-react, react-hook-form, AddressMapDialog(), applyCoordinates(), AddressMapPicker() (+47 more)

### Community 25 - "FormActions"
Cohesion: 0.08
Nodes (35): FormActions(), useToast(), ButtonIcon(), CycleCloseDialog(), Origin, cyclePriorityOptions, cycleTypeOptions, Eligible (+27 more)

### Community 26 - "captureElementToBlob"
Cohesion: 0.14
Nodes (19): averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01(), dominantRgb01(), findBackdropAncestor() (+11 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "CompanyForm.tsx"
Cohesion: 0.09
Nodes (30): CompanyDetailPage, BehaviorMenu(), CompanyDetail, CompanyDetailPage(), DEFAULT_PROPERTY_KEYS, loadVisibleProperties(), PROPERTY_CATALOG, PROPERTY_GROUP_ORDER (+22 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "StagesPage.tsx"
Cohesion: 0.16
Nodes (16): StagesPage, StagePicker(), setup(), stages, columns, isNew(), StagesPage(), BoardCard (+8 more)

### Community 31 - "TreatmentsPage"
Cohesion: 0.24
Nodes (17): CycleCard(), nextActionFor(), DashboardTreatmentRow(), remainingText(), ActiveTreatmentsPanel(), TreatmentList(), queryString(), TreatmentsPage() (+9 more)

### Community 32 - "el"
Cohesion: 0.07
Nodes (57): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+49 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.17
Nodes (21): be(), Ct(), dt(), Et(), ft(), ht(), It(), J() (+13 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.09
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+41 more)

### Community 35 - "BranchesPage"
Cohesion: 0.25
Nodes (4): addressText(), addressValues(), BranchesPage(), toAddressDetails()

### Community 36 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 37 - "new-work.md"
Cohesion: 0.09
Nodes (20): Assess Adaptation Challenge, Implement & Verify, Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments (+12 more)

### Community 38 - "CompanyActivityPanel.tsx"
Cohesion: 0.18
Nodes (14): ActivityCreateForm(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel(), CompanyActivityType, EmptyState() (+6 more)

### Community 39 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 40 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 41 - "PatientsPage.tsx"
Cohesion: 0.07
Nodes (31): CustomPropertyFilter(), API_URL, ExportButton(), ExportEntity, ExportFilters, Format, ImportButton(), norm() (+23 more)

### Community 42 - "live.md"
Cohesion: 0.06
Nodes (33): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Step 1: Parse the request (+25 more)

### Community 43 - "StatusChip"
Cohesion: 0.11
Nodes (18): Accent / Alert, Colors, Design System: MAS CARE, Elevation & Depth, Hierarchy, Layout, Named Rules, Named Rules (+10 more)

### Community 44 - "Responsive Design"
Cohesion: 0.08
Nodes (25): Assess Adaptation Challenge, Breakpoints: Content-Driven, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns (+17 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "PatientForm.tsx"
Cohesion: 0.07
Nodes (34): DoctorDetailPage, InfoCard(), InfoFact(), Doctor, DoctorDetail, DoctorDetailPage(), DoctorPatientLink, DoctorPatientList (+26 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 48 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.10
Nodes (18): Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract, Output Contract, Review handoff, The job, Act on the receipt (+10 more)

### Community 50 - "BoardFilters.tsx"
Cohesion: 0.13
Nodes (13): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Every field gets the same leading-icon badge, Footer, Header, Shared control class, FieldIcon() (+5 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "ConsolidatedDashboardPage.tsx"
Cohesion: 0.17
Nodes (17): react-router-dom, NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), ConsolidatedDashboardPage, BranchRow (+9 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 56 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.14
Nodes (15): Accesibilidad, Cambios de API necesarios, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida (+7 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "BoardFilters"
Cohesion: 0.23
Nodes (6): BoardFilters(), branchLabel(), chipValue(), derivedLabel(), medicationLabel(), userLabel()

### Community 59 - "TreatmentForm.tsx"
Cohesion: 0.07
Nodes (48): DeliveryDialog(), Pickup, pickupOptions, BranchList, DoctorPickerList, MedicationList, TreatmentListResponse, UserList (+40 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "onAnnotDown"
Cohesion: 0.24
Nodes (15): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), finalizeEditingPin(), initAnnotOverlay(), localCoords(), onAnnotDown() (+7 more)

### Community 64 - "PageHeader"
Cohesion: 0.18
Nodes (13): ChipsPage, BranchTag(), DragHandle(), PageHeader(), ChipsPage(), IncidentCard(), IncidentCardMenu(), BranchList (+5 more)

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
Cohesion: 0.18
Nodes (29): EmptyState(), DefinitionHelp(), API_URL, ExportButton(), separatorLabels, MetricCard(), SimpleMetricCard(), ReportChart() (+21 more)

### Community 69 - "CycleTable.tsx"
Cohesion: 0.15
Nodes (25): CycleTable(), actionLabels, BatchAction, BatchBar(), CheckList(), Chip(), ColumnPicker(), Named (+17 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 73 - "router.tsx"
Cohesion: 0.07
Nodes (28): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError(), AccessPage, AutomationSettingsPage, BoardPage, BranchesPage (+20 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "WorkspaceSelector.tsx"
Cohesion: 0.57
Nodes (3): RequireAuth(), AppShellSkeleton(), authClient

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "UserForm.tsx"
Cohesion: 0.09
Nodes (22): zod, BranchOption, generatePassword(), generatePin(), Props, RoleOption, branches, renderForm() (+14 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 82 - "PatientInfoPackPanel.tsx"
Cohesion: 0.21
Nodes (11): addressText(), CaregiverList, conditionStatusLabels, ConditionLink, conditionTone, derivedLabels, derivedTone, DoctorLink (+3 more)

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

### Community 90 - "cn"
Cohesion: 0.24
Nodes (12): AppLayout(), linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), BranchList, Option, WorkspaceSelector() (+4 more)

### Community 91 - "KanbanBoard.tsx"
Cohesion: 0.17
Nodes (11): @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, DragHandleProps, KanbanColumn (+3 more)

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "k"
Cohesion: 0.26
Nodes (12): ae(), er(), fe(), jt(), k(), Kt(), P(), tr() (+4 more)

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "Max Care Web – Fase 0"
Cohesion: 0.18
Nodes (13): index.html – SPA entry point, src/main.tsx (app bootstrap module), #root mount point, src/lib/api-types.ts (generated API types), Better Auth (authentication client), Docker + Nginx deployment, pnpm gen:api – OpenAPI type generation, max-care-api (backend dependency) (+5 more)

### Community 96 - "UsersPage.tsx"
Cohesion: 0.16
Nodes (13): PatientList, PatientPicker(), PickerPatient, useDebounced(), BranchList, queryString(), UserDetail(), UserDetailSkeleton() (+5 more)

### Community 97 - "react"
Cohesion: 0.05
Nodes (53): react, @tanstack/react-query, Entity, Field, FIELDS, Preview, RowError, Props (+45 more)

### Community 98 - "StatusChip"
Cohesion: 0.31
Nodes (7): Do:, Do's and Don'ts, Don't:, StatusLabel, statusLabels, StatusChip(), styles

### Community 99 - "MenuPermissionTree.tsx"
Cohesion: 0.13
Nodes (22): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), Props (+14 more)

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

### Community 107 - "phase2-board.spec.ts"
Cohesion: 0.33
Nodes (6): createPatient(), createTreatment(), getMe(), json(), localDate(), suffix

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "board.ts"
Cohesion: 0.19
Nodes (15): columnSortField, boardQueryString(), BoardResponse, CycleStatus, cycleStatusLabels, cycleTableQueryKey(), CycleTableResponse, derivedStatusLabels (+7 more)

### Community 110 - "TransfersPage.tsx"
Cohesion: 0.18
Nodes (10): GlobalTransferList, PatientTransferList, Transfer, TransferGlobalRow, TransferHistoryRow, TransferInput, TransferListFilters, TransferPending (+2 more)

### Community 111 - "L"
Cohesion: 0.27
Nodes (10): bt(), Ce(), s(), Ee(), L(), l(), u(), Rt() (+2 more)

### Community 112 - "react"
Cohesion: 0.11
Nodes (22): ProfilePage, ResetPasswordPage, PasswordField, Props, AccessPage(), AuthFrame(), CompanyBadge(), CompanyPreview (+14 more)

### Community 113 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "MenuPage.tsx"
Cohesion: 0.24
Nodes (6): MenuPage, MenuList, MenuPage(), toBody(), menuItemFormSchema, MenuItemFormValues

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
Nodes (27): PropertiesPage, CustomFields(), Field(), toLocalInput(), Draft, entityLabels, PropertiesPage(), PropertyDialog() (+19 more)

### Community 120 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 121 - "qt"
Cohesion: 0.31
Nodes (9): de(), Ie(), Lt(), Mt(), oe(), Ot(), qt(), Re() (+1 more)

### Community 122 - "StockPage.tsx"
Cohesion: 0.32
Nodes (7): StockPage, setStockMark(), MedicationList, StockMarkList, StockPage(), StockLevel, formatDateTime()

### Community 123 - "activityDetail"
Cohesion: 0.33
Nodes (6): activityDetail(), autoImportMapping(), describeScheduleMetadata(), formatChanges(), normalizeImportKey(), resolveImportField()

### Community 124 - "Toast.tsx"
Cohesion: 0.16
Nodes (11): react-dom@^19.2.0, react-dom, App(), router, ToastContext, ToastContextValue, ToastItem, ToastProvider() (+3 more)

### Community 125 - "ReportChart.tsx"
Cohesion: 0.47
Nodes (4): recharts, ChartSeries, chartSeriesPalette, seriesColor()

### Community 126 - "JobsPage.tsx"
Cohesion: 0.31
Nodes (8): JobsPage, Skeleton(), Job, JobsPage(), State(), when(), PanelSkeleton(), PatientDetailSkeleton()

### Community 127 - "Components"
Cohesion: 0.29
Nodes (7): Buttons, Cards / Containers, Chips, Components, Dialogs, Inputs / Fields, Navigation

### Community 128 - "DashboardPage.tsx"
Cohesion: 0.20
Nodes (9): DashboardPage, cardIcons, DashboardCardKey, dashboardCardKeys, dashboardCardMeta, DashboardListResponse, DashboardResponse, DashboardRow (+1 more)

### Community 129 - "Tables & server pagination design system"
Cohesion: 0.22
Nodes (8): Board page layout tweaks that came with this pass, Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 130 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 132 - "Read"
Cohesion: 0.50
Nodes (3): Comps, Directions, Read

### Community 133 - "Modal design system"
Cohesion: 0.33
Nodes (5): Checklist for any new modal, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component

### Community 134 - "Adaptation Strategies"
Cohesion: 0.40
Nodes (5): Adaptation Strategies, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 136 - "q"
Cohesion: 0.50
Nodes (4): Filtros, _e(), Gt(), q()

### Community 137 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1062 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `PatientsPage.tsx` to `IncidentsPage.tsx`, `operations.ts`, `treatments.ts`, `vitest`, `BranchesPage.tsx`, `reports.ts`, `api`, `CompanyRelationsPanel.tsx`, `lucide-react`, `FormActions`, `CompanyForm.tsx`, `CompanyActivityPanel.tsx`, `PatientForm.tsx`, `Impeccable Asset Producer`, `ConsolidatedDashboardPage.tsx`, `TreatmentForm.tsx`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `PatientInfoPackPanel.tsx`, `UsersPage.tsx`, `react`, `MenuPermissionTree.tsx`, `board.ts`, `TransfersPage.tsx`?**
  _High betweenness centrality (0.439) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `PatientsPage.tsx`?**
  _High betweenness centrality (0.427) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `SKILL.md`, `live.md`, `initGlobalBar`, `live-browser.js`, `handleManualEditActivity`, `doctor.md`, `Init flow`, `connectSSE`, `onAnnotDown`?**
  _High betweenness centrality (0.325) - this node is a cross-community bridge._