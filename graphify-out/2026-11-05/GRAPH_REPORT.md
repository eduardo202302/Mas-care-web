# Graph Report - max-care-web  (2026-11-05)

## Corpus Check
- 302 files · ~305,742 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 2886 nodes · 8929 edges · 132 communities (125 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 138 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97942e33`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UsersPage.tsx
- IncidentsPage.tsx
- operations.ts
- AvisosPage.tsx
- reports.ts
- vitest
- UsersPage.tsx
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- onAnnotDown
- live-browser.js
- BoardPage.tsx
- Playwright E2E Tests
- Build & Dev Scripts
- api
- API Code Generation
- TypeScript Root Config
- board.ts
- setLiveState
- zod
- useCan
- PropertiesPage.tsx
- optimize.md
- CompanyForm.tsx
- connectSSE
- StagesPage.tsx
- ProfilePage.tsx
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- components
- documentRefForElement
- new-work.md
- captureElementToBlob
- showToast
- DeliveryDialog.tsx
- PatientsPage.tsx
- live.md
- StatusChip
- Responsive Design
- initGlobalBar
- PatientForm.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- CompanyRelationsPanel.tsx
- The Toolkit
- BranchesPage.tsx
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- ActivityHistory.tsx
- Fase 2 web · Tablero Kanban, existencias e incidencias
- actOnAgentTarget
- BoardFilters
- DoseTracking.tsx
- animate.md
- Handle `generate`
- Generate Report
- Fase 2 web · Tablero Kanban, existencias e incidencias
- New visual work
- SKILL.md
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton
- CycleTable.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- router.tsx
- Product
- CycleTable.tsx
- clarify.md
- Nielsen's 10 Heuristics
- Button
- polish.md
- quieter.md
- scheduleAcceptCleanup
- Max Care Web – Fase 0
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- Extract Flow
- Shape
- FilterBar.tsx
- JobsPage.tsx
- Android platform
- CompanyDetailPage.tsx
- Persona-Based Design Testing
- PageHeader
- cn
- BranchTag
- eslint.config.js
- adapt.native.md
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- Operate mode depth (and Read notes)
- Diagnostic Scan
- Region map
- TransfersPage.tsx
- phase2-board.spec.ts
- RegisterPage.tsx
- doctor.md
- Impeccable Documenter
- Visualize: Direction Comps & Asset Production
- Heuristics Scoring Guide
- Impeccable Documenter
- treatments.ts
- CompaniesPage
- vite.config.ts
- useUiStore
- auth-client.ts
- Toast.tsx
- App.tsx
- CycleTable.test.tsx
- MedicationsPage
- @testing-library/jest-dom
- PatientDetailSkeleton.tsx
- Tables & server pagination design system
- ModalSection
- Persuade and Experience
- Read

## God Nodes (most connected - your core abstractions)
1. `Button` - 197 edges
2. `api()` - 197 edges
3. `Dialog()` - 124 edges
4. `react` - 118 edges
5. `lucide-react` - 109 edges
6. `@tanstack/react-query` - 103 edges
7. `FormActions()` - 93 edges
8. `useCan()` - 82 edges
9. `TextField` - 80 edges
10. `ModalSection()` - 73 edges

## Surprising Connections (you probably didn't know these)
- `Filtros` --references--> `q()`  [INFERRED]
  docs/phase2-web.md → .github/skills/impeccable/scripts/modern-screenshot.umd.js
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Other behavior baked into `Dialog`` --references--> `Dialog()`  [INFERRED]
  desingModal.md → src/components/ui/Dialog.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (132 total, 7 thin omitted)

### Community 0 - "UsersPage.tsx"
Cohesion: 0.17
Nodes (10): UsersPage, BranchList, queryString(), UserDetail(), UserDetailSkeleton(), UserList, UserQuery, UsersPage() (+2 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.15
Nodes (21): useToast(), AssignIncidentDialog(), IncidentDetailDialog(), ResolveIncidentDialog(), UserList, IncidentsPage(), updateFilters(), incidentsPath() (+13 more)

### Community 2 - "operations.ts"
Cohesion: 0.05
Nodes (56): DashboardPage, TasksPage, cardIcons, DashboardTreatmentRow(), remainingText(), PatientList, TaskTreatmentOption, UserList (+48 more)

### Community 3 - "AvisosPage.tsx"
Cohesion: 0.14
Nodes (19): AvisosPage, AdvancedFilterButton(), AdvancedFilterDialog(), AvisosPage(), channelLabels, errorLabels, explainError(), OutboxPage (+11 more)

### Community 4 - "reports.ts"
Cohesion: 0.17
Nodes (15): ReportsIndexPage, useReportFilters(), update(), reportIcons, ReportsIndexPage(), isReportType(), MAX_RANGE_MONTHS, reportDescriptions (+7 more)

### Community 5 - "vitest"
Cohesion: 0.10
Nodes (16): @testing-library/user-event@^14.6.1, @testing-library/react, @testing-library/user-event, vitest, chunkErrorHints, getCopy(), isChunkLoadError(), RouteError() (+8 more)

### Community 6 - "UsersPage.tsx"
Cohesion: 0.09
Nodes (44): DataTable(), RowActions(), Pagination(), ActiveFilterChip, FilterBarRow(), FilterSegmented(), TableSkeleton(), BranchAddressDetails (+36 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, better-auth@^1.4.5, clsx@^2.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @googlemaps/js-api-loader@^2.1.3, graphify@^1.0.0 (+19 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.12
Nodes (15): jobs, verify, name, run, uses, with, True, pull_request (+7 more)

### Community 10 - "package.json"
Cohesion: 0.07
Nodes (36): class-variance-authority@^0.7.1, react-dom@^19.2.0, devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1 (+28 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "onAnnotDown"
Cohesion: 0.24
Nodes (15): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), finalizeEditingPin(), initAnnotOverlay(), localCoords(), onAnnotDown() (+7 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "BoardPage.tsx"
Cohesion: 0.11
Nodes (25): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+17 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.12
Nodes (8): suffix, suffix, getMe(), json(), suffix, suffix, @playwright/test@^1.56.1, @playwright/test

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "api"
Cohesion: 0.06
Nodes (55): lucide-react, react, @tanstack/react-query, API_URL, ExportEntity, ExportFilters, Format, Props (+47 more)

### Community 22 - "board.ts"
Cohesion: 0.16
Nodes (13): filterChipLabel, MedicationList, UserList, boardFiltersToSearch(), boardQueryString(), BoardResponse, cycleTableQueryKey(), CycleTableResponse (+5 more)

### Community 23 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 24 - "zod"
Cohesion: 0.05
Nodes (29): zod, fullAccess, GrantMap, generatePassword(), generatePin(), branches, renderForm(), roles (+21 more)

### Community 25 - "useCan"
Cohesion: 0.13
Nodes (19): @hookform/resolvers, react-hook-form, Entity, Field, FIELDS, ImportButton(), norm(), Preview (+11 more)

### Community 26 - "PropertiesPage.tsx"
Cohesion: 0.13
Nodes (22): Draft, entityLabels, PropertiesPage(), PropertyDialog(), slug(), submit(), checkValue(), isDate() (+14 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "CompanyForm.tsx"
Cohesion: 0.17
Nodes (17): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, meResponse(), renderForm() (+9 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "StagesPage.tsx"
Cohesion: 0.17
Nodes (15): StagesPage, StagePicker(), setup(), stages, columns, isNew(), StagesPage(), boardColumnLabels (+7 more)

### Community 31 - "ProfilePage.tsx"
Cohesion: 0.14
Nodes (15): ProfilePage, ResetPasswordPage, PasswordField, Props, ResetPasswordPage(), submit(), validatePasswords(), ChangePassword() (+7 more)

### Community 32 - "el"
Cohesion: 0.07
Nodes (57): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+49 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.09
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+41 more)

### Community 35 - "components"
Cohesion: 0.06
Nodes (39): InfoCard(), InfoFact(), cyclePriorityOptions, cycleTypeOptions, Eligible, Patient, stageOptions, Doctor (+31 more)

### Community 36 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 37 - "new-work.md"
Cohesion: 0.09
Nodes (20): Assess Adaptation Challenge, Implement & Verify, Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments (+12 more)

### Community 38 - "captureElementToBlob"
Cohesion: 0.14
Nodes (19): averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01(), dominantRgb01(), findBackdropAncestor() (+11 more)

### Community 39 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 40 - "DeliveryDialog.tsx"
Cohesion: 0.50
Nodes (6): DeliveryDialog(), Pickup, pickupOptions, formatDateOnly(), prescriptionState, todayDateOnly()

### Community 41 - "PatientsPage.tsx"
Cohesion: 0.08
Nodes (25): TemplatesPage, BranchTag(), CustomPropertyFilter(), ConfirmDialog(), SortEditor(), activeFilterCount(), BranchList, columnSortField (+17 more)

### Community 42 - "live.md"
Cohesion: 0.06
Nodes (33): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Step 1: Parse the request (+25 more)

### Community 43 - "StatusChip"
Cohesion: 0.08
Nodes (24): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+16 more)

### Community 44 - "Responsive Design"
Cohesion: 0.08
Nodes (25): Assess Adaptation Challenge, Breakpoints: Content-Driven, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns (+17 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "PatientForm.tsx"
Cohesion: 0.06
Nodes (43): AddressMapDialog(), applyCoordinates(), AddressMapPicker(), AddressMapValue, componentValue(), DEFAULT_CENTER, fillFromGeocoderResult(), loadGoogleMapsLibraries() (+35 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 48 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.10
Nodes (18): Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract, Output Contract, Review handoff, The job, Act on the receipt (+10 more)

### Community 50 - "CompanyRelationsPanel.tsx"
Cohesion: 0.11
Nodes (20): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealList (+12 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "BranchesPage.tsx"
Cohesion: 0.15
Nodes (7): addressText(), addressValues(), BranchesPage(), toAddressDetails(), $defs, operations, webhooks

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "ActivityHistory.tsx"
Cohesion: 0.18
Nodes (12): recharts, ActivityHistory(), ActivityList, authorName(), EmptyState(), ChartSeries, chartSeriesPalette, seriesColor() (+4 more)

### Community 56 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.13
Nodes (16): Accesibilidad, Cambios de API necesarios, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`) (+8 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "BoardFilters"
Cohesion: 0.11
Nodes (15): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Checklist for a new advanced-filter panel, Every field gets the same leading-icon badge, Footer, Header, Shared control class (+7 more)

### Community 59 - "DoseTracking.tsx"
Cohesion: 0.11
Nodes (26): decode(), DoseFrequencyRow(), encode(), MINUTES, TimePicker12h(), addDaysToDateString(), API_URL, DoseLog (+18 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.21
Nodes (10): DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), KanbanMove, SortableCard(), IncidentCard(), IncidentCardMenu() (+2 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "SKILL.md"
Cohesion: 0.08
Nodes (21): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Craft floor, Refuse, Verify (+13 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "Skeleton"
Cohesion: 0.23
Nodes (26): Skeleton(), DefinitionHelp(), API_URL, buildExportUrl(), ExportButton(), handleExport(), separatorLabels, MetricCard() (+18 more)

### Community 69 - "CycleTable.tsx"
Cohesion: 0.17
Nodes (20): actionLabels, BatchAction, CheckList(), Chip(), Named, SavedViewsBar(), TableFilterPanel(), BoardFilters (+12 more)

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
Cohesion: 0.09
Nodes (22): AutomationSettingsPage, BoardPage, BranchesPage, CompaniesPage, DoctorDetailPage, DoctorsPage, ForgotPasswordPage, HealthConditionsPage (+14 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "CycleTable.tsx"
Cohesion: 0.19
Nodes (13): CycleCard(), CycleCardMenu(), MenuButton(), nextActionFor(), columnSortField, BoardCard, CycleStatus, cycleStatusLabels (+5 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "Button"
Cohesion: 0.09
Nodes (54): ExportButton(), Button, Dialog(), FormActions(), TextAreaField, TextField, ForgotPasswordPage(), submit() (+46 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 82 - "Max Care Web – Fase 0"
Cohesion: 0.18
Nodes (13): index.html – SPA entry point, src/main.tsx (app bootstrap module), #root mount point, src/lib/api-types.ts (generated API types), Better Auth (authentication client), Docker + Nginx deployment, pnpm gen:api – OpenAPI type generation, max-care-api (backend dependency) (+5 more)

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

### Community 90 - "FilterBar.tsx"
Cohesion: 0.18
Nodes (15): ActiveFilterChips(), filterControlClass, FilterField(), FilterFieldIcon(), presetFromFilters(), ReportFilterBar(), apply(), removeChip() (+7 more)

### Community 91 - "JobsPage.tsx"
Cohesion: 0.43
Nodes (5): JobsPage, Job, JobsPage(), State(), when()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "CompanyDetailPage.tsx"
Cohesion: 0.18
Nodes (12): CompanyDetailPage, BehaviorMenu(), CompanyDetail, CompanyDetailPage(), DEFAULT_PROPERTY_KEYS, loadVisibleProperties(), PROPERTY_CATALOG, PROPERTY_GROUP_ORDER (+4 more)

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "PageHeader"
Cohesion: 0.16
Nodes (15): ConsolidatedDashboardPage, StockPage, PageHeader(), BranchRow, BranchRowCells(), ConsolidatedDashboardPage(), ConsolidatedResponse, CounterCell() (+7 more)

### Community 96 - "cn"
Cohesion: 0.09
Nodes (40): Neutral, react-router-dom, NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), AppLayout() (+32 more)

### Community 97 - "BranchTag"
Cohesion: 0.27
Nodes (9): Do:, Do's and Don'ts, Don't:, ChipsPage, StatusLabel, statusLabels, StatusChip(), styles (+1 more)

### Community 98 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 99 - "adapt.native.md"
Cohesion: 0.40
Nodes (5): Adaptation Strategies, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

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

### Community 107 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 110 - "TransfersPage.tsx"
Cohesion: 0.15
Nodes (14): TransfersPage(), updateFilters(), GlobalTransferList, PatientTransferList, Transfer, transferFiltersFromSearch(), transferFiltersToSearch(), TransferGlobalRow (+6 more)

### Community 111 - "phase2-board.spec.ts"
Cohesion: 0.33
Nodes (6): createPatient(), createTreatment(), getMe(), json(), localDate(), suffix

### Community 112 - "RegisterPage.tsx"
Cohesion: 0.17
Nodes (13): AccessPage, RegisterPage, AccessPage(), AuthFrame(), CompanyBadge(), CompanyPreview, FieldErrors, RegisterBody (+5 more)

### Community 113 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "treatments.ts"
Cohesion: 0.05
Nodes (87): CustomFields(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), PropertiesDialog(), PropertyGroup, RecordAction (+79 more)

### Community 119 - "CompaniesPage"
Cohesion: 0.22
Nodes (4): CompaniesPage(), queryString(), statusBadge(), CopyLinkButton()

### Community 120 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 121 - "useUiStore"
Cohesion: 0.32
Nodes (6): BranchFilter(), BranchList, BoardView, ReportCsvSeparator, UiState, useUiStore

### Community 122 - "auth-client.ts"
Cohesion: 0.57
Nodes (3): RequireAuth(), AppShellSkeleton(), authClient

### Community 123 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): ToastContext, ToastContextValue, ToastItem, ToastTone, toneIcons, toneStyles

### Community 124 - "App.tsx"
Cohesion: 0.47
Nodes (3): App(), router, ToastProvider()

### Community 125 - "CycleTable.test.tsx"
Cohesion: 0.28
Nodes (7): CycleTable(), Call, card(), pipeline, setup(), ColumnPicker(), tableFiltersToSearch()

### Community 129 - "Tables & server pagination design system"
Cohesion: 0.25
Nodes (7): Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 133 - "ModalSection"
Cohesion: 0.08
Nodes (31): Checklist for any new modal, Grouping content with `ModalSection`, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, FormFields(), FormFooter() (+23 more)

### Community 134 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

### Community 135 - "Read"
Cohesion: 0.50
Nodes (3): Comps, Directions, Read

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1042 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `components` to `UsersPage.tsx`, `IncidentsPage.tsx`, `operations.ts`, `reports.ts`, `ModalSection`, `UsersPage.tsx`, `vitest`, `api`, `board.ts`, `useCan`, `CompanyForm.tsx`, `DeliveryDialog.tsx`, `PatientsPage.tsx`, `PatientForm.tsx`, `Impeccable Asset Producer`, `CompanyRelationsPanel.tsx`, `BranchesPage.tsx`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `Button`, `CompanyDetailPage.tsx`, `PageHeader`, `cn`, `TransfersPage.tsx`, `treatments.ts`?**
  _High betweenness centrality (0.421) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `IncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1477832512315271 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `components`?**
  _High betweenness centrality (0.410) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.049667178699436765 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `SKILL.md`, `live.md`, `onAnnotDown`, `live-browser.js`, `handleManualEditActivity`, `initGlobalBar`, `doctor.md`, `Init flow`, `connectSSE`?**
  _High betweenness centrality (0.324) - this node is a cross-community bridge._