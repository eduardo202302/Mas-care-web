# Graph Report - max-care-web  (2026-10-29)

## Corpus Check
- 263 files · ~255,251 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .exe 1)

## Summary
- 2519 nodes · 7133 edges · 116 communities (111 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 137 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8dbdf47`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- reports.ts
- router.tsx
- operations.ts
- lucide-react
- CompanyForm
- IncidentDialogs.tsx
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
- ProfilePage.tsx
- API Code Generation
- TypeScript Root Config
- PatientDetailPage.tsx
- lib/menu.ts
- IncidentsPage.tsx
- KanbanBoard.tsx
- phase2-board.spec.ts
- api-types.ts
- UserForm.tsx
- connectSSE
- setLiveState
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
- captureElementToBlob
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- onAnnotDown
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
- ConsolidatedDashboardPage.tsx
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
- Toast.tsx
- adapt.native.md
- Android platform
- doctor.md
- Persona-Based Design Testing
- Extract Flow
- App.tsx
- bolder.md
- BoardFilters
- TreatmentForm.tsx
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- Generate Report
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- IncidentCard.tsx
- Diagnostic Scan
- Persuade and Experience
- Visualize: Direction Comps & Asset Production
- @testing-library/jest-dom
- RegisterPage.tsx
- Impeccable Documenter
- Heuristics Scoring Guide
- cn

## God Nodes (most connected - your core abstractions)
1. `Button` - 157 edges
2. `api()` - 152 edges
3. `react` - 91 edges
4. `@tanstack/react-query` - 82 edges
5. `Dialog()` - 82 edges
6. `lucide-react` - 72 edges
7. `Skeleton()` - 61 edges
8. `cn()` - 53 edges
9. `useCan()` - 48 edges
10. `FormActions()` - 46 edges

## Surprising Connections (you probably didn't know these)
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Neutral` --references--> `AppLayout()`  [INFERRED]
  DESIGN.md → src/components/layout/AppLayout.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx
- `Footer` --references--> `FormActions()`  [INFERRED]
  designModal.md → src/components/ui/FormActions.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (116 total, 5 thin omitted)

### Community 0 - "reports.ts"
Cohesion: 0.14
Nodes (24): ReportsIndexPage, presetFromFilters(), ReportFilterBar(), apply(), setPreset(), toggleBranch(), useReportFilters(), update() (+16 more)

### Community 1 - "router.tsx"
Cohesion: 0.06
Nodes (32): AccessPage, AutomationSettingsPage, BoardPage, BranchesPage, CompaniesPage, ConsolidatedDashboardPage, DashboardPage, ForgotPasswordPage (+24 more)

### Community 2 - "operations.ts"
Cohesion: 0.07
Nodes (31): activityDetail(), autoImportMapping(), DashboardCardKey, dashboardCardKeys, dashboardCardMeta, DashboardContact, DashboardListResponse, DashboardResponse (+23 more)

### Community 3 - "lucide-react"
Cohesion: 0.09
Nodes (33): lucide-react, DataTable(), RowActions(), EmptyState(), Pagination(), TableSkeleton(), BranchesPage(), BranchList (+25 more)

### Community 4 - "CompanyForm"
Cohesion: 0.24
Nodes (13): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, renderForm(), companyFormSchema (+5 more)

### Community 5 - "IncidentDialogs.tsx"
Cohesion: 0.22
Nodes (13): Fields inside a section, useToast(), AssignIncidentDialog(), IncidentDetailDialog(), ResolveIncidentDialog(), UserList, IncidentFormDialog(), IncidentsPage() (+5 more)

### Community 6 - "Button"
Cohesion: 0.06
Nodes (69): react, @tanstack/react-query, API_URL, ExportButton(), ExportEntity, ExportFilters, Format, Button (+61 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (26): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, graphify@^1.0.0 (+18 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.12
Nodes (15): jobs, verify, name, run, uses, with, True, pull_request (+7 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (33): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @tailwindcss/vite@^4.1.16 (+25 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "vitest"
Cohesion: 0.08
Nodes (22): @testing-library/react@^16.3.0, @testing-library/user-event@^14.6.1, @testing-library/react, @testing-library/user-event, vitest, Call, card(), pipeline (+14 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "generate.md"
Cohesion: 0.15
Nodes (11): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, append-arrays, append-string, Config drift, Consent prompt (use this phrasing) (+3 more)

### Community 16 - "Playwright E2E Tests"
Cohesion: 0.12
Nodes (8): suffix, suffix, getMe(), json(), suffix, suffix, @playwright/test@^1.56.1, @playwright/test

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "ProfilePage.tsx"
Cohesion: 0.21
Nodes (9): ProfilePage, ChangePassword(), Profile, ProfilePage(), baseProfile, changePassword, sendVerificationEmail, setup() (+1 more)

### Community 22 - "PatientDetailPage.tsx"
Cohesion: 0.09
Nodes (31): PropertiesDialog(), PropertyGroup, RecordAction, RecordActionsMenu(), PatientAutomationPanel(), PauseDialog(), useSetAutomationPaused(), activityDialogTitle (+23 more)

### Community 23 - "lib/menu.ts"
Cohesion: 0.16
Nodes (15): NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), alwaysAllowedPaths, buildMenuTree(), byOrder() (+7 more)

### Community 24 - "IncidentsPage.tsx"
Cohesion: 0.18
Nodes (14): BranchList, PatientList, UserList, UserList, Incident, incidentColumnLabels, incidentColumns, IncidentFilters (+6 more)

### Community 25 - "KanbanBoard.tsx"
Cohesion: 0.19
Nodes (10): Incidencias, Árbol de `features/board` y `features/incidents`, DragHandleProps, KanbanBoard(), columnFor(), handleDragEnd(), KanbanColumn, KanbanColumnView() (+2 more)

### Community 26 - "phase2-board.spec.ts"
Cohesion: 0.33
Nodes (6): createPatient(), createTreatment(), getMe(), json(), localDate(), suffix

### Community 27 - "api-types.ts"
Cohesion: 0.13
Nodes (20): BranchFilter(), BranchList, BranchList, Option, cardIcons, DashboardPage(), PatientList, TaskFormDialog() (+12 more)

### Community 28 - "UserForm.tsx"
Cohesion: 0.12
Nodes (19): BranchOption, generatePassword(), generatePin(), Props, RoleOption, UserForm(), BranchList, queryString() (+11 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 31 - "http.ts"
Cohesion: 0.07
Nodes (46): zod@^4.1.12, @hookform/resolvers, react-hook-form, zod, FormActions(), Props, TextField, AutomationSettings (+38 more)

### Community 32 - "el"
Cohesion: 0.07
Nodes (57): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+49 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.05
Nodes (78): Accesibilidad, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida, Rutas y menú (+70 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.09
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+41 more)

### Community 35 - "PatientsPage.tsx"
Cohesion: 0.06
Nodes (30): Entity, Field, FIELDS, ImportButton(), norm(), Preview, RowError, CompanyPreview (+22 more)

### Community 36 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 37 - "new-work.md"
Cohesion: 0.06
Nodes (29): Recommended Actions, Craft (deprecated alias), Impeccable Documenter, Input Contract, Output Contract, Workflow, Apply, Live-mode signature params (+21 more)

### Community 38 - "Skeleton"
Cohesion: 0.16
Nodes (33): recharts, Skeleton(), DefinitionHelp(), API_URL, buildExportUrl(), ExportButton(), handleExport(), separatorLabels (+25 more)

### Community 39 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 40 - "CycleTable.tsx"
Cohesion: 0.13
Nodes (31): CycleTable(), actionLabels, BatchAction, BatchBar(), CheckList(), Chip(), ColumnPicker(), Named (+23 more)

### Community 41 - "RoleForm.tsx"
Cohesion: 0.22
Nodes (14): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), Props (+6 more)

### Community 42 - "live.md"
Cohesion: 0.08
Nodes (22): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Cleanup (+14 more)

### Community 43 - "Design System: MAS CARE"
Cohesion: 0.08
Nodes (25): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+17 more)

### Community 44 - "Responsive Design"
Cohesion: 0.08
Nodes (25): Assess Adaptation Challenge, Breakpoints: Content-Driven, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns (+17 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "PropertiesPage.tsx"
Cohesion: 0.12
Nodes (27): CustomFields(), CustomPropertyFilter(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), Draft, entityLabels (+19 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

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

### Community 52 - "captureElementToBlob"
Cohesion: 0.14
Nodes (19): averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01(), dominantRgb01(), findBackdropAncestor() (+11 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "onAnnotDown"
Cohesion: 0.24
Nodes (15): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), finalizeEditingPin(), initAnnotOverlay(), localCoords(), onAnnotDown() (+7 more)

### Community 56 - "TransferDialog.tsx"
Cohesion: 0.14
Nodes (16): Branch, TransferDialog(), updateFilters(), GlobalTransferList, isTransferPending(), PatientTransferList, Transfer, transferFiltersToSearch() (+8 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "BoardFilters"
Cohesion: 0.23
Nodes (6): BoardFilters(), branchLabel(), chipValue(), derivedLabel(), medicationLabel(), userLabel()

### Community 59 - "treatments.ts"
Cohesion: 0.14
Nodes (24): DashboardTreatmentRow(), remainingText(), copy, TreatmentActionDialog(), TreatmentActionType, ActiveTreatmentsPanel(), TreatmentList(), DashboardRow (+16 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.06
Nodes (29): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+21 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "board.ts"
Cohesion: 0.22
Nodes (9): boardQueryKey(), boardQueryString(), BoardResponse, cycleTableQueryKey(), DerivedStatus, derivedStatusLabels, derivedStatusOptions, emptyBoardFilters (+1 more)

### Community 64 - "pipeline.ts"
Cohesion: 0.22
Nodes (12): Cambios de API necesarios, StagePicker(), setup(), stages, BoardCard, columnOfStatus(), effectiveStage(), Pipeline (+4 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "NewCycleDialog.tsx"
Cohesion: 0.20
Nodes (7): cyclePriorityOptions, cycleTypeOptions, Eligible, NewCycleDialog(), stageOptions, BoardColumnKey, boardColumns

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "AvisosPage.tsx"
Cohesion: 0.18
Nodes (12): AvisosPage, channelLabels, errorLabels, explainError(), OutboxPage, OutboxRow, OutboxStatus, Queue() (+4 more)

### Community 69 - "BoardPage.tsx"
Cohesion: 0.12
Nodes (18): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+10 more)

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
Cohesion: 0.15
Nodes (15): Do:, Do's and Don'ts, Don't:, ChipsPage, BranchTag(), StatusLabel, statusLabels, StatusChip() (+7 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "ConsolidatedDashboardPage.tsx"
Cohesion: 0.29
Nodes (9): BranchRow, BranchRowCells(), ConsolidatedDashboardPage(), ConsolidatedResponse, CounterCell(), counterKeys, counterLabels, StockAgeCell() (+1 more)

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
Cohesion: 0.26
Nodes (8): react-router-dom, RequireAuth(), chunkErrorHints, getCopy(), isChunkLoadError(), RouteError(), AppShellSkeleton(), authClient

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

### Community 90 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): ToastContext, ToastContextValue, ToastItem, ToastTone, toneIcons, toneStyles

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
Cohesion: 0.32
Nodes (5): react-dom@^19.2.0, react-dom, App(), router, ToastProvider()

### Community 97 - "bolder.md"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 98 - "BoardFilters"
Cohesion: 0.13
Nodes (17): Body: `ModalSection`, Checklist for a new sectioned modal, Footer, Header, Modal design system, Title Case rule, Tones, Active-filter chips (outside the dialog) (+9 more)

### Community 99 - "TreatmentForm.tsx"
Cohesion: 0.17
Nodes (13): submit(), BranchOption, serverFields, TreatmentForm(), chooseMedication(), submit(), UserOption, isEmpty() (+5 more)

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

### Community 107 - "IncidentCard.tsx"
Cohesion: 0.53
Nodes (4): DragHandle(), IncidentCard(), IncidentCardMenu(), formatDateTime()

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

### Community 110 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 112 - "RegisterPage.tsx"
Cohesion: 0.17
Nodes (15): PasswordField, Props, AccessPage(), AuthFrame(), CompanyBadge(), FieldErrors, RegisterBody, RegisterPage() (+7 more)

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 120 - "cn"
Cohesion: 0.23
Nodes (12): AppLayout(), linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), WorkspaceSelector(), activateOrganization(), renderOption() (+4 more)

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 879 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `http.ts` to `reports.ts`, `operations.ts`, `lucide-react`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `PatientsPage.tsx`, `Button`, `Skeleton`, `TreatmentForm.tsx`, `RoleForm.tsx`, `ConsolidatedDashboardPage.tsx`, `Impeccable Asset Producer`, `PatientDetailPage.tsx`, `lib/menu.ts`, `IncidentsPage.tsx`, `TransferDialog.tsx`, `treatments.ts`, `UserForm.tsx`, `board.ts`?**
  _High betweenness centrality (0.449) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for a new sectioned modal` and `Header`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `reports.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14039408866995073 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `http.ts`?**
  _High betweenness centrality (0.438) - this node is a cross-community bridge._
- **Should `router.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06386554621848739 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `initGlobalBar`, `live-browser.js`, `generate.md`, `handleManualEditActivity`, `connectSSE`, `SKILL.md`, `Init flow`, `onAnnotDown`, `doctor.md`?**
  _High betweenness centrality (0.352) - this node is a cross-community bridge._