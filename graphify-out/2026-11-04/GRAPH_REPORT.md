# Graph Report - max-care-web  (2026-11-04)

## Corpus Check
- 301 files · ~300,340 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 2846 nodes · 8817 edges · 126 communities (122 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97942e33`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- medicationName
- IncidentsPage.tsx
- operations.ts
- RegisterPage.tsx
- reports.ts
- vitest
- PatientsPage.tsx
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- DashboardPage.tsx
- live-browser.js
- CompanyDetailPage.tsx
- Playwright E2E Tests
- Build & Dev Scripts
- AvisosPage.tsx
- API Code Generation
- TypeScript Root Config
- cn
- setLiveState
- MenuPage.tsx
- Fase 2 web · Tablero Kanban, existencias e incidencias
- router.tsx
- optimize.md
- UsersPage
- connectSSE
- BranchesPage.tsx
- StatusChip
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- board.ts
- normalizeManualContextText
- new-work.md
- captureElementToBlob
- mountSvelteComponentVariant
- CycleTable.tsx
- BranchTag
- live.md
- Design System: MAS CARE
- Responsive Design
- initGlobalBar
- custom-properties.ts
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- api
- The Toolkit
- Max Care Web – Fase 0
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- TreatmentDetailPage.tsx
- PatientForm.tsx
- actOnAgentTarget
- BoardFilters
- AdvancedFilter.tsx
- animate.md
- Handle `generate`
- Generate Report
- Dialog
- StagesPage.tsx
- New visual work
- SKILL.md
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton
- BoardPage.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- AppLayout.tsx
- Product
- TextField
- clarify.md
- Nielsen's 10 Heuristics
- TasksPage.tsx
- polish.md
- quieter.md
- scheduleAcceptCleanup
- document.md
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- TemplatesPage.tsx
- Shape
- Operate mode depth (and Read notes)
- vitest
- Android platform
- TaskFormDialog.tsx
- Persona-Based Design Testing
- Extract Flow
- reports/components/ExportButton.tsx
- Advanced filter design system
- treatments.ts
- Region map
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- Tables & server pagination design system
- Diagnostic Scan
- Components
- DoctorForm.tsx
- Responsive Design
- http.ts
- Visualize: Direction Comps & Asset Production
- Impeccable Documenter
- CompanyActivityPanel.tsx
- Heuristics Scoring Guide
- Impeccable Documenter
- medicalCenter.ts
- Toast.tsx
- vite.config.ts
- EmptyState
- PatientDetailPage.tsx
- doctor.md
- enableInlineEdit
- zod

## God Nodes (most connected - your core abstractions)
1. `api()` - 195 edges
2. `Button` - 193 edges
3. `Dialog()` - 124 edges
4. `react` - 117 edges
5. `lucide-react` - 108 edges
6. `@tanstack/react-query` - 102 edges
7. `FormActions()` - 93 edges
8. `useCan()` - 82 edges
9. `TextField` - 78 edges
10. `ModalSection()` - 73 edges

## Surprising Connections (you probably didn't know these)
- `Filtros` --references--> `q()`  [INFERRED]
  docs/phase2-web.md → .github/skills/impeccable/scripts/modern-screenshot.umd.js
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Neutral` --references--> `AppLayout()`  [INFERRED]
  DESIGN.md → src/components/layout/AppLayout.tsx
- `Board page layout tweaks that came with this pass` --references--> `AppLayout()`  [INFERRED]
  tablasYPaginacionDesign.md → src/components/layout/AppLayout.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (126 total, 4 thin omitted)

### Community 0 - "medicationName"
Cohesion: 0.24
Nodes (12): addPending(), resetForm(), Empty(), Fact(), PatientInfoPackPanel(), PatientTreatmentsPanel(), chooseMedication(), TreatmentList() (+4 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.14
Nodes (19): IncidentsPage, KanbanMove, IncidentDetailDialog(), IncidentsPage(), updateFilters(), incidentsPath(), UserList, Incident (+11 more)

### Community 2 - "operations.ts"
Cohesion: 0.10
Nodes (22): activityDetail(), activityLabelFor(), activityLabels, autoImportMapping(), DashboardContact, DeliveryResult, humanizeActivityType(), importAliases (+14 more)

### Community 3 - "RegisterPage.tsx"
Cohesion: 0.16
Nodes (16): PasswordField, Props, AccessPage(), AuthFrame(), CompanyBadge(), CompanyPreview, FieldErrors, RegisterBody (+8 more)

### Community 4 - "reports.ts"
Cohesion: 0.12
Nodes (26): ReportsIndexPage, filterControlClass, presetFromFilters(), ReportFilterBar(), apply(), removeChip(), setDraftPreset(), useReportFilters() (+18 more)

### Community 5 - "vitest"
Cohesion: 0.09
Nodes (20): @testing-library/react@^16.3.0, @testing-library/user-event@^14.6.1, vitest@^3.2.4, @testing-library/react, @testing-library/user-event, vitest, Call, card() (+12 more)

### Community 6 - "PatientsPage.tsx"
Cohesion: 0.11
Nodes (14): PatientsPage, SortEditor(), activeFilterCount(), BranchList, columnSortField, dateFilterLabels, patientColumns, PatientCreateResult (+6 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @googlemaps/js-api-loader@^2.1.3 (+20 more)

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

### Community 13 - "DashboardPage.tsx"
Cohesion: 0.22
Nodes (8): cardIcons, DashboardCardKey, dashboardCardKeys, dashboardCardMeta, DashboardListResponse, DashboardResponse, DashboardRow, noticeTargetFromDashboardRow()

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (138): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+130 more)

### Community 15 - "CompanyDetailPage.tsx"
Cohesion: 0.05
Nodes (51): CompanyDetailPage, InfoFact(), BehaviorMenu(), CompanyDetail, CompanyDetailPage(), DEFAULT_PROPERTY_KEYS, loadVisibleProperties(), PROPERTY_CATALOG (+43 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.09
Nodes (14): suffix, suffix, createPatient(), createTreatment(), getMe(), json(), localDate(), suffix (+6 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "AvisosPage.tsx"
Cohesion: 0.13
Nodes (22): AvisosPage, ActiveFilterChips(), AdvancedFilterButton(), AdvancedFilterDialog(), FilterField(), FilterFieldIcon(), AvisosPage(), channelLabels (+14 more)

### Community 22 - "cn"
Cohesion: 0.12
Nodes (22): ConsolidatedDashboardPage, BranchTag(), DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), SortableCard(), CycleCardMenu() (+14 more)

### Community 23 - "setLiveState"
Cohesion: 0.10
Nodes (65): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildInsertPlaceholderSnapshotFromDom(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure() (+57 more)

### Community 24 - "MenuPage.tsx"
Cohesion: 0.09
Nodes (30): MenuPage, RowActions(), emptyValues, MenuItemForm(), ParentOption, Props, SelectField(), MenuList (+22 more)

### Community 25 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.13
Nodes (16): Accesibilidad, Cambios de API necesarios, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`) (+8 more)

### Community 26 - "router.tsx"
Cohesion: 0.07
Nodes (37): react-router-dom, NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), chunkErrorHints, getCopy() (+29 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "UsersPage"
Cohesion: 0.29
Nodes (3): queryString(), UserDetailSkeleton(), UsersPage()

### Community 29 - "connectSSE"
Cohesion: 0.05
Nodes (96): abandonForeignSession(), abandonSupersededGo(), applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), captureAndEmit(), checkpointPayload(), clampVariantIndex() (+88 more)

### Community 30 - "BranchesPage.tsx"
Cohesion: 0.07
Nodes (41): DataTable(), Pagination(), addressText(), addressValues(), BranchAddressDetails, BranchesPage(), BranchList, toAddressDetails() (+33 more)

### Community 31 - "StatusChip"
Cohesion: 0.30
Nodes (11): Do:, Do's and Don'ts, Don't:, StatusChip(), CycleCard(), nextActionFor(), DashboardTreatmentRow(), remainingText() (+3 more)

### Community 32 - "el"
Cohesion: 0.08
Nodes (54): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+46 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.08
Nodes (51): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+43 more)

### Community 35 - "board.ts"
Cohesion: 0.16
Nodes (13): filterChipLabel, MedicationList, UserList, BoardFilters, boardQueryString(), BoardResponse, CycleStatus, cycleTableQueryKey() (+5 more)

### Community 36 - "normalizeManualContextText"
Cohesion: 0.12
Nodes (20): addManualContextText(), canRestoreManualEditElement(), collectManualContextPieces(), walk(), contextElementForManualEdit(), cssIdent(), directMixedTextRestoreNodes(), findManualEditRestoreElement() (+12 more)

### Community 37 - "new-work.md"
Cohesion: 0.07
Nodes (24): Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments, Verify, Visitor mode (+16 more)

### Community 38 - "captureElementToBlob"
Cohesion: 0.09
Nodes (34): averageRgb01(), beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader() (+26 more)

### Community 39 - "mountSvelteComponentVariant"
Cohesion: 0.16
Nodes (22): applyOriginalAttrsToSvelteAnchor(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase(), elementMatchesOriginalMarkup(), findInsertAnchorInDom(), findLiveElementForOriginalMarkup() (+14 more)

### Community 40 - "CycleTable.tsx"
Cohesion: 0.12
Nodes (32): CustomPropertyFilter(), columnSortField, CycleTable(), actionLabels, BatchAction, BatchBar(), CheckList(), Chip() (+24 more)

### Community 41 - "BranchTag"
Cohesion: 0.36
Nodes (5): ChipsPage, StatusLabel, statusLabels, styles, ChipsPage()

### Community 42 - "live.md"
Cohesion: 0.06
Nodes (33): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Step 1: Parse the request (+25 more)

### Community 43 - "Design System: MAS CARE"
Cohesion: 0.11
Nodes (18): Accent / Alert, Colors, Design System: MAS CARE, Elevation & Depth, Hierarchy, Layout, Named Rules, Named Rules (+10 more)

### Community 44 - "Responsive Design"
Cohesion: 0.08
Nodes (22): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Adaptation Strategies (+14 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.10
Nodes (35): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), buildDesignHeader(), designPanelCss(), detectPageTheme(), ensureAgentPollTooltip() (+27 more)

### Community 46 - "custom-properties.ts"
Cohesion: 0.24
Nodes (9): checkValue(), isDate(), isDateTime(), isEmpty(), PropertyDef, propertyEntities, propertyKeyPattern, propertyTypes (+1 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.17
Nodes (26): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+18 more)

### Community 48 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.10
Nodes (18): Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract, Output Contract, Review handoff, The job, Act on the receipt (+10 more)

### Community 50 - "api"
Cohesion: 0.09
Nodes (39): @tanstack/react-query, ExportButton(), Button, PageHeader(), ForgotPasswordPage(), submit(), AutomationRules(), EnrollAutomationButton() (+31 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "Max Care Web – Fase 0"
Cohesion: 0.18
Nodes (13): index.html – SPA entry point, src/main.tsx (app bootstrap module), #root mount point, src/lib/api-types.ts (generated API types), Better Auth (authentication client), Docker + Nginx deployment, pnpm gen:api – OpenAPI type generation, max-care-api (backend dependency) (+5 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.14
Nodes (18): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), own() (+10 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "TreatmentDetailPage.tsx"
Cohesion: 0.06
Nodes (53): ActivityHistory(), ActivityList, authorName(), CustomFields(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput() (+45 more)

### Community 56 - "PatientForm.tsx"
Cohesion: 0.08
Nodes (26): syncDoctorMedicalCenters(), syncDoctorSpecialties(), PatientConditionsPanel(), PatientDoctorsPanel(), addressText(), BranchList, BranchOption, ConditionStatus (+18 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.26
Nodes (18): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+10 more)

### Community 58 - "BoardFilters"
Cohesion: 0.23
Nodes (6): BoardFilters(), branchLabel(), chipValue(), derivedLabel(), medicationLabel(), userLabel()

### Community 59 - "AdvancedFilter.tsx"
Cohesion: 0.09
Nodes (11): ActiveFilterChip, FilterBarRow(), FilterSegmented(), DoctorsPage(), queryString(), HealthConditionsPage(), queryString(), MedicalSpecialtiesPage() (+3 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "Dialog"
Cohesion: 0.06
Nodes (52): Checklist for any new modal, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, AddressMapDialog(), applyCoordinates(), AddressMapValue (+44 more)

### Community 64 - "StagesPage.tsx"
Cohesion: 0.16
Nodes (16): StagesPage, StagePicker(), setup(), stages, columns, isNew(), StagesPage(), BoardCard (+8 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "SKILL.md"
Cohesion: 0.13
Nodes (12): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Command guidance, No-argument routing: the context-aware menu, Workflow questions (+4 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.15
Nodes (13): Component translation rules, Narrative mapping, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Step 1: Find the design assets, Step 2: Auto-extract what can be auto-extracted, Step 2b: Stage the frontmatter, Step 3: Ask the user for qualitative language (+5 more)

### Community 68 - "Skeleton"
Cohesion: 0.21
Nodes (24): Skeleton(), TableSkeleton(), PanelSkeleton(), PatientDetailSkeleton(), DefinitionHelp(), ExportButton(), MetricCard(), SimpleMetricCard() (+16 more)

### Community 69 - "BoardPage.tsx"
Cohesion: 0.12
Nodes (24): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+16 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 73 - "AppLayout.tsx"
Cohesion: 0.16
Nodes (14): RequireAuth(), AppLayout(), linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), AppShellSkeleton(), BranchList (+6 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "TextField"
Cohesion: 0.07
Nodes (50): Grouping content with `ModalSection`, @hookform/resolvers, react-hook-form, AddressMapPicker(), FormFields(), FormFooter(), ModalSection(), ModalSectionTone (+42 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "TasksPage.tsx"
Cohesion: 0.20
Nodes (13): TasksPage, BranchFilter(), statusClasses(), TasksPage(), isTaskOverdue(), Task, taskDueLabel(), TaskFilter (+5 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 82 - "document.md"
Cohesion: 0.18
Nodes (10): Pitfalls, Seed mode, Step 1: Route through new-work's workshop, Step 2: Write seed DESIGN.md, Step 3: Confirm, Style guidelines, The frontmatter: token schema, The markdown body: eight sections (canonical order) (+2 more)

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

### Community 88 - "TemplatesPage.tsx"
Cohesion: 0.20
Nodes (9): TemplatesPage, BranchList, channelMeta, WaInfo, waStatusLabels, useActiveBranch(), MessageChannel, MessageTemplate (+1 more)

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "Operate mode depth (and Read notes)"
Cohesion: 0.10
Nodes (18): Craft floor, Refuse, Verify, Constraints, Failure modes, Flow, /impeccable hooks, Routing (+10 more)

### Community 91 - "vitest"
Cohesion: 0.43
Nodes (5): JobsPage, Job, JobsPage(), State(), when()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "TaskFormDialog.tsx"
Cohesion: 0.18
Nodes (10): PatientList, TaskTreatmentOption, UserList, taskPriorities, TaskPriority, taskPriorityLabels, taskReminderOptions, TaskType (+2 more)

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 96 - "reports/components/ExportButton.tsx"
Cohesion: 0.19
Nodes (10): API_URL, buildExportUrl(), handleExport(), separatorLabels, meResponse(), renderWithMe(), BoardView, ReportCsvSeparator (+2 more)

### Community 97 - "Advanced filter design system"
Cohesion: 0.22
Nodes (9): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Checklist for a new advanced-filter panel, Every field gets the same leading-icon badge, Footer, Header, Shared control class (+1 more)

### Community 98 - "treatments.ts"
Cohesion: 0.24
Nodes (8): activityLabels, coveragePreview(), dateFormatter, derivedLabels, formatQuantity(), parseDateOnly(), quantityFormatter, treatmentPauta()

### Community 99 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

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

### Community 107 - "Tables & server pagination design system"
Cohesion: 0.22
Nodes (8): Board page layout tweaks that came with this pass, Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "Components"
Cohesion: 0.29
Nodes (7): Buttons, Cards / Containers, Chips, Components, Dialogs, Inputs / Fields, Navigation

### Community 110 - "DoctorForm.tsx"
Cohesion: 0.09
Nodes (20): Doctor, DoctorDetail, DoctorPatientLink, DoctorPatientList, MedicalCenterLink, MedicalCenterList, SpecialtyLink, SpecialtyList (+12 more)

### Community 111 - "Responsive Design"
Cohesion: 0.20
Nodes (10): Breakpoints: Content-Driven, Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch (+2 more)

### Community 112 - "http.ts"
Cohesion: 0.06
Nodes (44): BranchList, cyclePriorityOptions, cycleTypeOptions, Eligible, Patient, stageOptions, DoctorList, DoctorQuery (+36 more)

### Community 113 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "CompanyActivityPanel.tsx"
Cohesion: 0.17
Nodes (14): InfoCard(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel(), CompanyActivityType, EmptyState() (+6 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "medicalCenter.ts"
Cohesion: 0.33
Nodes (4): MedicalCenterFormValues, medicalCenterSchema, medicalCenterTypeLabels, medicalCenterTypes

### Community 119 - "Toast.tsx"
Cohesion: 0.16
Nodes (11): react-dom@^19.2.0, react-dom, App(), router, ToastContext, ToastContextValue, ToastItem, ToastProvider() (+3 more)

### Community 120 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 121 - "EmptyState"
Cohesion: 0.29
Nodes (8): recharts, EmptyState(), ChartSeries, chartSeriesPalette, seriesColor(), ReportPage(), TreatmentsFlowReport(), isReportType()

### Community 122 - "PatientDetailPage.tsx"
Cohesion: 0.06
Nodes (47): lucide-react, react, API_URL, ExportEntity, ExportFilters, Format, Entity, Field (+39 more)

### Community 123 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 124 - "enableInlineEdit"
Cohesion: 0.40
Nodes (5): collectEditableTextRows(), visit(), enableInlineEdit(), onInlineInput(), wrapMixedContentTextNodes()

### Community 131 - "zod"
Cohesion: 0.07
Nodes (28): zod@^4.1.12, zod, BranchOption, generatePassword(), generatePin(), Props, RoleOption, branches (+20 more)

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1032 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `http.ts` to `IncidentsPage.tsx`, `operations.ts`, `reports.ts`, `vitest`, `PatientsPage.tsx`, `CompanyDetailPage.tsx`, `cn`, `MenuPage.tsx`, `BranchesPage.tsx`, `board.ts`, `Impeccable Asset Producer`, `api`, `TreatmentDetailPage.tsx`, `PatientForm.tsx`, `Dialog`, `TextField`, `document.md`, `reports/components/ExportButton.tsx`, `treatments.ts`, `DoctorForm.tsx`, `CompanyActivityPanel.tsx`, `PatientDetailPage.tsx`?**
  _High betweenness centrality (0.436) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `IncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13538461538461538 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `document.md` to `http.ts`?**
  _High betweenness centrality (0.429) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `initGlobalBar` to `syncPageChatFocus`, `SKILL.md`, `captureElementToBlob`, `live.md`, `live-browser.js`, `handleManualEditActivity`, `Init flow`, `createLiveBrowserDomHelpers`, `setLiveState`, `doctor.md`, `connectSSE`?**
  _High betweenness centrality (0.331) - this node is a cross-community bridge._