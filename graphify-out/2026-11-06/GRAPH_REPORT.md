# Graph Report - max-care-web  (2026-11-06)

## Corpus Check
- 304 files · ~310,358 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 2927 nodes · 9124 edges · 135 communities (130 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 138 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97942e33`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- handleKeyDown
- IncidentsPage.tsx
- operations.ts
- DoseTracking.tsx
- AvisosPage.tsx
- @testing-library/react
- MedicalCentersPage.tsx
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
- useCan
- RouteError.tsx
- ProfilePage.tsx
- optimize.md
- CompanyForm.tsx
- connectSSE
- StagesPage.tsx
- HealthConditionsPage.tsx
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- api-types.ts
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
- Responsive Design
- The Toolkit
- ConsolidatedDashboardPage.tsx
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- reports/components/ExportButton.tsx
- Fase 2 web · Tablero Kanban, existencias e incidencias
- actOnAgentTarget
- BoardFilters
- treatments.ts
- animate.md
- Handle `generate`
- Generate Report
- TaskFormDialog.tsx
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
- PatientCaregiversPanel.tsx
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- Extract Flow
- Shape
- useMe
- CycleCard.tsx
- Android platform
- CompaniesPage.tsx
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
- CompanyDetailPage.tsx
- Diagnostic Scan
- board.ts
- TransfersPage.tsx
- generate.md
- react
- doctor.md
- Impeccable Documenter
- document.md
- Heuristics Scoring Guide
- Impeccable Documenter
- custom-properties-core.ts
- PatientDetailPage.tsx
- vite.config.ts
- TransferDialog.tsx
- /impeccable hooks
- activityDetail
- App.tsx
- ReportChart.tsx
- JobsPage.tsx
- CycleTable.test.tsx
- DashboardPage.tsx
- Tables & server pagination design system
- Visualize: Direction Comps & Asset Production
- Region map
- Read
- PatientDetailSkeleton.tsx
- activityTitleFor

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
- `Filtros` --references--> `q()`  [INFERRED]
  docs/phase2-web.md → .github/skills/impeccable/scripts/modern-screenshot.umd.js
- `Do:` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Don't:` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (135 total, 5 thin omitted)

### Community 0 - "handleKeyDown"
Cohesion: 0.10
Nodes (41): attachSteerFocusDebug(), attachSteerFocusGuard(), beginNewLiveConfiguration(), cancelInsertConfigure(), clearAnnotations(), clearInsertPicking(), clearSteerFocusRecoverTimer(), exitConfigureToPicking() (+33 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.13
Nodes (20): IncidentsPage, FilterField(), FilterFieldIcon(), IncidentDetailDialog(), ResolveIncidentDialog(), IncidentsPage(), updateFilters(), incidentsPath() (+12 more)

### Community 2 - "operations.ts"
Cohesion: 0.08
Nodes (23): activityLabels, DashboardContact, DeliveryResult, importAliases, ImportPreview, ImportResult, ImportRowError, MessageTemplate (+15 more)

### Community 3 - "DoseTracking.tsx"
Cohesion: 0.05
Nodes (45): DoctorDetailPage, Doctor, DoctorDetail, DoctorPatientLink, DoctorPatientList, MedicalCenterLink, MedicalCenterList, SpecialtyLink (+37 more)

### Community 4 - "AvisosPage.tsx"
Cohesion: 0.12
Nodes (22): AvisosPage, ActivityList, authorName(), EmptyState(), ActiveFilterChips(), AdvancedFilterDialog(), AvisosPage(), channelLabels (+14 more)

### Community 5 - "@testing-library/react"
Cohesion: 0.12
Nodes (10): @testing-library/react@^16.3.0, @testing-library/user-event@^14.6.1, @testing-library/react, @testing-library/user-event, counts, row, Call, pipeline (+2 more)

### Community 6 - "MedicalCentersPage.tsx"
Cohesion: 0.09
Nodes (14): RowActions(), FilterBarRow(), FilterSegmented(), HealthConditionsPage(), queryString(), addressText(), MedicalCenterList, MedicalCenterQuery (+6 more)

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
Cohesion: 0.08
Nodes (33): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @testing-library/jest-dom@^6.9.1 (+25 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "reports.ts"
Cohesion: 0.12
Nodes (27): ReportsIndexPage, AdvancedFilterButton(), presetFromFilters(), ReportFilterBar(), apply(), removeChip(), setDraftPreset(), useReportFilters() (+19 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (138): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderDimensions(), applyPlaceholderSizingStyles(), applySavedParamValues(), averageRgb01() (+130 more)

### Community 15 - "BoardPage.tsx"
Cohesion: 0.11
Nodes (25): BoardPage, ExportButton(), appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard() (+17 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.09
Nodes (14): suffix, suffix, createPatient(), createTreatment(), getMe(), json(), localDate(), suffix (+6 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "api"
Cohesion: 0.06
Nodes (72): Checklist for any new modal, Grouping content with `ModalSection`, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, Checklist for a new advanced-filter panel, BranchFilter() (+64 more)

### Community 22 - "CompanyRelationsPanel.tsx"
Cohesion: 0.12
Nodes (19): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealList (+11 more)

### Community 23 - "TasksPage.tsx"
Cohesion: 0.22
Nodes (8): TasksPage, statusClasses(), isTaskOverdue(), Task, TaskFilter, taskFilterLabels, taskFilters, taskStatusLabel()

### Community 24 - "useCan"
Cohesion: 0.08
Nodes (33): zod@^4.1.12, @hookform/resolvers, react-hook-form, zod, FormFields(), FormFooter(), Tabs(), AutomationSettings (+25 more)

### Community 25 - "RouteError.tsx"
Cohesion: 0.53
Nodes (4): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 26 - "ProfilePage.tsx"
Cohesion: 0.21
Nodes (9): ProfilePage, ChangePassword(), Profile, ProfilePage(), baseProfile, changePassword, sendVerificationEmail, setup() (+1 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "CompanyForm.tsx"
Cohesion: 0.17
Nodes (17): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, meResponse(), renderForm() (+9 more)

### Community 29 - "connectSSE"
Cohesion: 0.05
Nodes (120): abortSvelteComponentInjection(), applySavedSessionMeta(), buildInsertPlaceholderSnapshotFromDom(), buildPickedAnchorSnapshot(), cancelEditing(), cancelEditingToPicking(), captureAndEmit(), checkpointPayload() (+112 more)

### Community 30 - "StagesPage.tsx"
Cohesion: 0.15
Nodes (17): Cambios de API necesarios, StagesPage, StagePicker(), setup(), stages, columns, isNew(), StagesPage() (+9 more)

### Community 31 - "HealthConditionsPage.tsx"
Cohesion: 0.22
Nodes (12): DataTable(), Pagination(), ConditionList, ConditionQuery, SpecialtyList, SpecialtyQuery, RoleDto, RolesPage() (+4 more)

### Community 32 - "el"
Cohesion: 0.08
Nodes (54): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+46 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.10
Nodes (42): agentHasWorkInFlight(), armPageChatForTyping(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), collapsePageChat(), configureVoiceContext(), expandPageChat() (+34 more)

### Community 35 - "api-types.ts"
Cohesion: 0.16
Nodes (11): addressText(), addressValues(), BranchAddressDetails, BranchesPage(), BranchList, toAddressDetails(), components, $defs (+3 more)

### Community 36 - "documentRefForElement"
Cohesion: 0.07
Nodes (41): addManualContextText(), applyEditing(), buildLocatorForLeaf(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk() (+33 more)

### Community 37 - "new-work.md"
Cohesion: 0.08
Nodes (21): Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments, Verify, Visitor mode (+13 more)

### Community 38 - "CompanyActivityPanel.tsx"
Cohesion: 0.15
Nodes (16): InfoCard(), InfoFact(), TabItem, ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel() (+8 more)

### Community 39 - "showToast"
Cohesion: 0.08
Nodes (39): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase(), discardOrphanedSession() (+31 more)

### Community 40 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 41 - "PatientsPage.tsx"
Cohesion: 0.07
Nodes (24): ImportButton(), norm(), ActiveFilterChip, filterControlClass, ConfirmDialog(), SortEditor(), MedicationList, MedicationQuery (+16 more)

### Community 42 - "live.md"
Cohesion: 0.08
Nodes (22): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Cleanup (+14 more)

### Community 43 - "StatusChip"
Cohesion: 0.07
Nodes (27): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+19 more)

### Community 44 - "Responsive Design"
Cohesion: 0.08
Nodes (22): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Adaptation Strategies (+14 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.08
Nodes (44): agentStatusText(), barPaletteForTheme(), brandMarkSvg(), buildDesignHeader(), buildParamsPanel(), cursorForInsertAxis(), designPanelCss(), detectPageTheme() (+36 more)

### Community 46 - "PatientForm.tsx"
Cohesion: 0.09
Nodes (27): addressText(), BranchList, BranchOption, ConditionStatus, cyclePriorityOptions, cycleTypeOptions, DoctorList, HealthConditionList (+19 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.15
Nodes (28): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hasTextRows(), check(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey() (+20 more)

### Community 48 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.10
Nodes (18): Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract, Output Contract, Review handoff, The job, Act on the receipt (+10 more)

### Community 50 - "Responsive Design"
Cohesion: 0.20
Nodes (10): Breakpoints: Content-Driven, Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch (+2 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "ConsolidatedDashboardPage.tsx"
Cohesion: 0.24
Nodes (11): ConsolidatedDashboardPage, TableSkeleton(), BranchRow, BranchRowCells(), ConsolidatedDashboardPage(), ConsolidatedResponse, CounterCell(), counterKeys (+3 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.14
Nodes (18): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), own() (+10 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "reports/components/ExportButton.tsx"
Cohesion: 0.24
Nodes (8): API_URL, buildExportUrl(), handleExport(), separatorLabels, BoardView, ReportCsvSeparator, UiState, useUiStore

### Community 56 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.15
Nodes (14): Accesibilidad, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida (+6 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "BoardFilters"
Cohesion: 0.11
Nodes (14): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Every field gets the same leading-icon badge, Footer, Header, Shared control class, BoardFilters() (+6 more)

### Community 59 - "treatments.ts"
Cohesion: 0.04
Nodes (106): Tablero de ciclos, StatusChip(), cyclePriorityOptions, cycleTypeOptions, Eligible, Patient, stageOptions, DashboardTreatmentRow() (+98 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "TaskFormDialog.tsx"
Cohesion: 0.18
Nodes (10): PatientList, TaskTreatmentOption, UserList, taskPriorities, TaskPriority, taskPriorityLabels, taskReminderOptions, TaskType (+2 more)

### Community 64 - "PageHeader"
Cohesion: 0.15
Nodes (10): PageHeader(), DoctorList, DoctorQuery, DoctorsPage(), DoctorWithLinks, queryString(), BranchList, channelMeta (+2 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "SKILL.md"
Cohesion: 0.07
Nodes (24): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Craft floor, Refuse, Verify (+16 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.15
Nodes (13): Component translation rules, Narrative mapping, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Step 1: Find the design assets, Step 2: Auto-extract what can be auto-extracted, Step 2b: Stage the frontmatter, Step 3: Ask the user for qualitative language (+5 more)

### Community 68 - "ReportPage.tsx"
Cohesion: 0.27
Nodes (22): Skeleton(), DefinitionHelp(), ExportButton(), MetricCard(), SimpleMetricCard(), ReportChart(), ReportErrorState(), ReportTable() (+14 more)

### Community 69 - "CycleTable.tsx"
Cohesion: 0.15
Nodes (28): CustomPropertyFilter(), columnSortField, CycleTable(), actionLabels, BatchAction, BatchBar(), CheckList(), Chip() (+20 more)

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
Cohesion: 0.08
Nodes (25): AccessPage, AutomationSettingsPage, BranchesPage, CompaniesPage, DoctorsPage, ForgotPasswordPage, HealthConditionsPage, MedicalCentersPage (+17 more)

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
Cohesion: 0.17
Nodes (13): BranchOption, generatePassword(), generatePin(), Props, RoleOption, branches, renderForm(), roles (+5 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 82 - "PatientCaregiversPanel.tsx"
Cohesion: 0.14
Nodes (18): AddressMapDialog(), applyCoordinates(), AddressMapPicker(), AddressMapValue, componentValue(), DEFAULT_CENTER, fillFromGeocoderResult(), loadGoogleMapsLibraries() (+10 more)

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

### Community 90 - "useMe"
Cohesion: 0.14
Nodes (21): NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), linkClass(), SidebarGroup(), SidebarLink() (+13 more)

### Community 91 - "CycleCard.tsx"
Cohesion: 0.15
Nodes (13): DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), KanbanMove, SortableCard(), CycleCard(), CycleCardMenu() (+5 more)

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "CompaniesPage.tsx"
Cohesion: 0.16
Nodes (10): CompaniesPage(), Company, CompanyList, CompanyQuery, queryString(), statusBadge(), CopyLinkButton(), applyColumnSort() (+2 more)

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "Max Care Web – Fase 0"
Cohesion: 0.18
Nodes (13): index.html – SPA entry point, src/main.tsx (app bootstrap module), #root mount point, src/lib/api-types.ts (generated API types), Better Auth (authentication client), Docker + Nginx deployment, pnpm gen:api – OpenAPI type generation, max-care-api (backend dependency) (+5 more)

### Community 96 - "UsersPage.tsx"
Cohesion: 0.19
Nodes (9): BranchList, queryString(), UserDetail(), UserDetailSkeleton(), UserList, UserQuery, UsersPage(), roleLabel() (+1 more)

### Community 97 - "react"
Cohesion: 0.05
Nodes (81): lucide-react, react, @tanstack/react-query, BranchList, API_URL, ExportEntity, ExportFilters, Format (+73 more)

### Community 98 - "StatusChip"
Cohesion: 0.31
Nodes (6): ChipsPage, BranchTag(), StatusLabel, statusLabels, styles, ChipsPage()

### Community 99 - "MenuPermissionTree.tsx"
Cohesion: 0.22
Nodes (13): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), Props (+5 more)

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

### Community 107 - "CompanyDetailPage.tsx"
Cohesion: 0.18
Nodes (12): CompanyDetailPage, BehaviorMenu(), CompanyDetail, CompanyDetailPage(), DEFAULT_PROPERTY_KEYS, loadVisibleProperties(), PROPERTY_CATALOG, PROPERTY_GROUP_ORDER (+4 more)

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "board.ts"
Cohesion: 0.14
Nodes (15): filterChipLabel, MedicationList, UserList, boardFiltersToSearch(), boardQueryString(), BoardResponse, cycleTableQueryKey(), CycleTableResponse (+7 more)

### Community 110 - "TransfersPage.tsx"
Cohesion: 0.16
Nodes (16): BranchList, TransfersPage(), updateFilters(), useColumnSort(), GlobalTransferList, PatientTransferList, Transfer, transferFiltersFromSearch() (+8 more)

### Community 111 - "generate.md"
Cohesion: 0.15
Nodes (11): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, append-arrays, append-string, Config drift, Consent prompt (use this phrasing) (+3 more)

### Community 112 - "react"
Cohesion: 0.17
Nodes (16): react-router-dom, PasswordField, Props, AccessPage(), AuthFrame(), CompanyBadge(), CompanyPreview, FieldErrors (+8 more)

### Community 113 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "document.md"
Cohesion: 0.18
Nodes (10): Pitfalls, Seed mode, Step 1: Route through new-work's workshop, Step 2: Write seed DESIGN.md, Step 3: Confirm, Style guidelines, The frontmatter: token schema, The markdown body: eight sections (canonical order) (+2 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "custom-properties-core.ts"
Cohesion: 0.22
Nodes (10): checkValue(), isDate(), isDateTime(), isEmpty(), PropertyDef, propertyEntities, propertyKeyPattern, propertyTypes (+2 more)

### Community 119 - "PatientDetailPage.tsx"
Cohesion: 0.07
Nodes (44): PropertiesPage, ActivityHistory(), CustomFields(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), PropertiesDialog() (+36 more)

### Community 120 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 121 - "TransferDialog.tsx"
Cohesion: 0.36
Nodes (5): Branch, TransferDialog(), newIdempotencyKey(), isTransferPending(), transferWarningLabel()

### Community 122 - "/impeccable hooks"
Cohesion: 0.33
Nodes (6): Constraints, Failure modes, Flow, /impeccable hooks, Routing, Triage findings

### Community 123 - "activityDetail"
Cohesion: 0.33
Nodes (6): activityDetail(), autoImportMapping(), describeScheduleMetadata(), formatChanges(), normalizeImportKey(), resolveImportField()

### Community 124 - "App.tsx"
Cohesion: 0.36
Nodes (4): App(), router, ToastProvider(), queryClient

### Community 125 - "ReportChart.tsx"
Cohesion: 0.47
Nodes (4): recharts, ChartSeries, chartSeriesPalette, seriesColor()

### Community 126 - "JobsPage.tsx"
Cohesion: 0.23
Nodes (8): vitest, JobsPage, Job, JobsPage(), State(), when(), meResponse(), renderWithMe()

### Community 127 - "CycleTable.test.tsx"
Cohesion: 0.40
Nodes (4): Call, card(), pipeline, setup()

### Community 128 - "DashboardPage.tsx"
Cohesion: 0.20
Nodes (9): DashboardPage, cardIcons, DashboardCardKey, dashboardCardKeys, dashboardCardMeta, DashboardListResponse, DashboardResponse, DashboardRow (+1 more)

### Community 129 - "Tables & server pagination design system"
Cohesion: 0.13
Nodes (14): Neutral, AppLayout(), WorkspaceSelector(), activateOrganization(), renderOption(), selectWorkspace(), Board page layout tweaks that came with this pass, Branch-first ordering (+6 more)

### Community 130 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 132 - "Read"
Cohesion: 0.50
Nodes (3): Comps, Directions, Read

### Community 134 - "activityTitleFor"
Cohesion: 0.67
Nodes (3): activityLabelFor(), activityTitleFor(), humanizeActivityType()

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1062 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `api-types.ts` to `IncidentsPage.tsx`, `operations.ts`, `DoseTracking.tsx`, `MedicalCentersPage.tsx`, `reports.ts`, `CompanyRelationsPanel.tsx`, `useCan`, `CompanyForm.tsx`, `HealthConditionsPage.tsx`, `CompanyActivityPanel.tsx`, `PatientsPage.tsx`, `PatientForm.tsx`, `Impeccable Asset Producer`, `ConsolidatedDashboardPage.tsx`, `treatments.ts`, `PageHeader`, `useMe`, `CompaniesPage.tsx`, `UsersPage.tsx`, `react`, `MenuPermissionTree.tsx`, `CompanyDetailPage.tsx`, `board.ts`, `TransfersPage.tsx`, `document.md`, `PatientDetailPage.tsx`, `TransferDialog.tsx`, `JobsPage.tsx`?**
  _High betweenness centrality (0.435) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `handleKeyDown` be split into smaller, more focused modules?**
  _Cohesion score 0.10365853658536585 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `document.md` to `api-types.ts`?**
  _High betweenness centrality (0.423) - this node is a cross-community bridge._
- **Should `IncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1339031339031339 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `initGlobalBar` to `handleKeyDown`, `SKILL.md`, `live-browser.js`, `generate.md`, `handleManualEditActivity`, `doctor.md`, `Init flow`, `connectSSE`?**
  _High betweenness centrality (0.325) - this node is a cross-community bridge._