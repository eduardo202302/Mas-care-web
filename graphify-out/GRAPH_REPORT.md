# Graph Report - max-care-web  (2026-11-12)

## Corpus Check
- 330 files · ~337,304 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 3205 nodes · 10112 edges · 150 communities (144 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 152 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc78f577`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- setLiveState
- IncidentsPage.tsx
- operations.ts
- Button
- CompanyDetailPage.tsx
- @testing-library/react
- k
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- MenuOrderTable.tsx
- live-browser.js
- PropertiesPage.tsx
- phase2-board.spec.ts
- Build & Dev Scripts
- DashboardPage.tsx
- API Code Generation
- TypeScript Root Config
- CompanyDetailPage.tsx
- MedicationsPage.tsx
- ModalSection
- documentRefForElement
- router.tsx
- optimize.md
- TransfersPage.tsx
- connectSSE
- StagesPage.tsx
- CompanyForm.tsx
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- LabelEditor.tsx
- showToast
- new-work.md
- treatments.ts
- scheduleAcceptCleanup
- Max Care Web – Fase 0
- captureElementToBlob
- live.md
- Design System: MAS CARE
- L
- initGlobalBar
- patient.ts
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- LabelEditor
- The Toolkit
- react-router-dom
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- MedicationForm.tsx
- UsersPage.tsx
- actOnAgentTarget
- cn
- api
- animate.md
- Handle `generate`
- Generate Report
- zod
- RolesPage.tsx
- New visual work
- HealthConditionsPage.tsx
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton
- CycleTable.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- qt
- Product
- board.ts
- clarify.md
- Nielsen's 10 Heuristics
- PatientsPage.tsx
- polish.md
- quieter.md
- onAnnotDown
- Fase 2 web · Tablero Kanban, existencias e incidencias
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- TreatmentsPage.tsx
- Shape
- DoctorsPage.tsx
- xlsx-table.ts
- Android platform
- MenuPermissionTree.tsx
- Persona-Based Design Testing
- AvisosPage.tsx
- CompaniesPage.tsx
- Responsive Design
- Generate Report
- SKILL.md
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- eslint.config.js
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- formatPhone
- Diagnostic Scan
- bolder.md
- UserForm.tsx
- board.ts
- reports.ts
- vitest
- Impeccable Documenter
- generate.md
- Heuristics Scoring Guide
- Impeccable Documenter
- Modal design system
- BoardFilters.tsx
- StatusChip
- RouteError.tsx
- react
- TemplatesPage.tsx
- Toast.tsx
- vite.config.ts
- BoardFilters.tsx
- PatientForm.tsx
- BranchesPage.tsx
- react-router-dom
- Visualize: Direction Comps & Asset Production
- Region map
- q
- TreatmentsPage
- PatientInfoPackPanel.tsx
- StagesPage.tsx
- LabelTemplateFormDialog.tsx
- ProfilePage.tsx
- medicalCenter.ts
- cn
- Tables & server pagination design system
- Responsive Design
- Operate mode depth (and Read notes)
- WorkspaceSelector.tsx
- Colors
- PatientDetailSkeleton.tsx
- CycleTable.test.tsx
- @testing-library/jest-dom
- Adaptation Strategies
- Persuade and Experience

## God Nodes (most connected - your core abstractions)
1. `api()` - 216 edges
2. `Button` - 212 edges
3. `Dialog()` - 135 edges
4. `react` - 133 edges
5. `lucide-react` - 122 edges
6. `@tanstack/react-query` - 112 edges
7. `FormActions()` - 94 edges
8. `cn()` - 90 edges
9. `useCan()` - 88 edges
10. `TextField` - 82 edges

## Surprising Connections (you probably didn't know these)
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Other behavior baked into `Dialog`` --references--> `Dialog()`  [INFERRED]
  desingModal.md → src/components/ui/Dialog.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → src/components/ui/Dialog.tsx
- `Layout Adaptation Techniques` --references--> `clamp()`  [INFERRED]
  .github/skills/impeccable/reference/adapt.md → src/features/settings/LabelTemplateFormDialog.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (150 total, 6 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.12
Nodes (22): FilterBarRow(), IncidentDetailDialog(), emptyExtra, extraLabels, IncidentExtraFilters, IncidentsPage(), updateFilters(), incidentsPath() (+14 more)

### Community 2 - "operations.ts"
Cohesion: 0.05
Nodes (49): TasksPage, statusClasses(), TasksPage(), activityDetail(), activityLabelFor(), activityLabels, activityTitleFor(), autoImportMapping() (+41 more)

### Community 3 - "Button"
Cohesion: 0.06
Nodes (75): ActivityHistory(), ExportButton(), PropertiesDialog(), PropertyGroup, RecordAction, RecordActionsMenu(), Button, Dialog() (+67 more)

### Community 4 - "CompanyDetailPage.tsx"
Cohesion: 0.13
Nodes (20): CompanyDetailPage, InfoFact(), BehaviorMenu(), BranchList, CompanyDetail, CompanyDetailPage(), activateCompany(), goTo() (+12 more)

### Community 5 - "@testing-library/react"
Cohesion: 0.14
Nodes (11): @testing-library/user-event@^14.6.1, @testing-library/react, @testing-library/user-event, counts, row, Call, row(), setup() (+3 more)

### Community 6 - "k"
Cohesion: 0.26
Nodes (12): ae(), er(), fe(), jt(), k(), Kt(), P(), tr() (+4 more)

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
Cohesion: 0.08
Nodes (32): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @testing-library/react@^16.3.0 (+24 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "MenuOrderTable.tsx"
Cohesion: 0.24
Nodes (12): ChildRow(), columns, DragHandle(), FixedRow(), Group(), ItemRow(), MenuOrderTable(), Node (+4 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "PropertiesPage.tsx"
Cohesion: 0.08
Nodes (34): CustomFields(), CustomPropertyFilter(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), Entity, Field (+26 more)

### Community 16 - "phase2-board.spec.ts"
Cohesion: 0.09
Nodes (19): suffix, suffix, ensureLimitedRole(), LimitedRole, names, permissions, createPatient(), createTreatment() (+11 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "DashboardPage.tsx"
Cohesion: 0.13
Nodes (16): DashboardPage, BranchFilter(), cardIcons, DashboardPage(), useActiveBranch(), DashboardCardKey, dashboardCardKeys, dashboardCardMeta (+8 more)

### Community 22 - "CompanyDetailPage.tsx"
Cohesion: 0.11
Nodes (20): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealList (+12 more)

### Community 23 - "MedicationsPage.tsx"
Cohesion: 0.13
Nodes (12): ConfirmDialog(), archivedOptions, contains(), DEFAULT_ARCHIVED, distinctOptions(), emptyFilters, MedicationFilters, MedicationList (+4 more)

### Community 24 - "ModalSection"
Cohesion: 0.07
Nodes (52): Grouping content with `ModalSection`, @hookform/resolvers, react-hook-form, AddressMapDialog(), applyCoordinates(), AddressMapPicker(), AddressMapValue, componentValue() (+44 more)

### Community 25 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 26 - "router.tsx"
Cohesion: 0.08
Nodes (24): AutomationSettingsPage, BoardPage, BranchesPage, CompaniesPage, DoctorDetailPage, DoctorsPage, ForgotPasswordPage, HealthConditionsPage (+16 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "TransfersPage.tsx"
Cohesion: 0.11
Nodes (29): DataTable(), Pagination(), TableSkeleton(), PatientTransfersPanel(), BranchList, contains(), emptyExtra, ExtraFilters (+21 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "StagesPage.tsx"
Cohesion: 0.29
Nodes (9): StagePicker(), setup(), stages, BoardCard, columnOfStatus(), effectiveStage(), PipelineStage, stagesOfColumn() (+1 more)

### Community 31 - "CompanyForm.tsx"
Cohesion: 0.13
Nodes (16): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), meResponse(), renderForm(), CopyLinkButton(), LinkField() (+8 more)

### Community 32 - "el"
Cohesion: 0.07
Nodes (57): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+49 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.17
Nodes (21): be(), Ct(), dt(), Et(), ft(), ht(), It(), J() (+13 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.09
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+41 more)

### Community 35 - "LabelEditor.tsx"
Cohesion: 0.15
Nodes (22): DEFAULT_LABEL_SIZE, EMPTY_VALUE_TEXT, LABEL_VARIABLE_GROUPS, LABEL_VARIABLE_LABELS, LabelDesign, labelDims(), labelElementStyle(), labelElementText() (+14 more)

### Community 36 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 37 - "new-work.md"
Cohesion: 0.06
Nodes (28): Recommended Actions, Craft (deprecated alias), Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift (+20 more)

### Community 38 - "treatments.ts"
Cohesion: 0.04
Nodes (81): DeliveryDialog(), Pickup, pickupOptions, BranchList, DoctorPickerList, MedicationList, PatientTreatmentsPanel(), TreatmentListResponse (+73 more)

### Community 39 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 40 - "Max Care Web – Fase 0"
Cohesion: 0.18
Nodes (13): index.html – SPA entry point, src/main.tsx (app bootstrap module), #root mount point, src/lib/api-types.ts (generated API types), Better Auth (authentication client), Docker + Nginx deployment, pnpm gen:api – OpenAPI type generation, max-care-api (backend dependency) (+5 more)

### Community 41 - "captureElementToBlob"
Cohesion: 0.14
Nodes (19): averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01(), dominantRgb01(), findBackdropAncestor() (+11 more)

### Community 42 - "live.md"
Cohesion: 0.08
Nodes (22): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Cleanup (+14 more)

### Community 43 - "Design System: MAS CARE"
Cohesion: 0.11
Nodes (17): Buttons, Cards / Containers, Chips, Components, Design System: MAS CARE, Dialogs, Elevation & Depth, Hierarchy (+9 more)

### Community 44 - "L"
Cohesion: 0.27
Nodes (10): bt(), Ce(), s(), Ee(), L(), l(), u(), Rt() (+2 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "patient.ts"
Cohesion: 0.20
Nodes (10): DOCUMENT_INPUT_MAX_LENGTH, hasValidCedulaCheckDigit(), isValidDocument(), birthDateField, birthDateRule(), documentField, documentRule(), patientCreateSchema (+2 more)

### Community 47 - "handleManualEditActivity"
Cohesion: 0.19
Nodes (24): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+16 more)

### Community 48 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 49 - "Impeccable Asset Producer"
Cohesion: 0.10
Nodes (18): Core Rule, Decision Comps, Impeccable Asset Producer, Input Contract, Output Contract, Review handoff, The job, Act on the receipt (+10 more)

### Community 50 - "LabelEditor"
Cohesion: 0.20
Nodes (16): createElement(), isLabelVariableKey(), nextElementId(), LabelEditor(), addElement(), duplicateSelected(), onElementPointerDown(), onKeyDown() (+8 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "react-router-dom"
Cohesion: 0.20
Nodes (12): AccessPage, RegisterPage, AccessPage(), AuthFrame(), CompanyBadge(), CompanyPreview, FieldErrors, RegisterBody (+4 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "MedicationForm.tsx"
Cohesion: 0.12
Nodes (29): GaugeProgress(), CardOverlay(), isImage(), Item, MedicationAttachments(), addFiles(), RemovingGauge(), StagedAttachment (+21 more)

### Community 56 - "UsersPage.tsx"
Cohesion: 0.14
Nodes (15): distinctOptions(), filterControlClass, FilterField(), FilterFieldIcon(), FilterSegmented(), FilterSelect(), BranchesCell(), BranchList (+7 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "cn"
Cohesion: 0.11
Nodes (28): ConsolidatedDashboardPage, BranchTag(), DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), KanbanMove, SortableCard() (+20 more)

### Community 59 - "api"
Cohesion: 0.08
Nodes (40): BranchList, Option, ForgotPasswordPage(), submit(), AutomationRule, AutomationRules(), EnrollAutomationButton(), paramField (+32 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "zod"
Cohesion: 0.11
Nodes (15): zod@^4.1.12, zod, isValidPhone(), AutomationSettingsFormValues, automationSettingsSchema, timeOfDay, BranchFormValues, branchSchema (+7 more)

### Community 64 - "RolesPage.tsx"
Cohesion: 0.07
Nodes (36): RowActions(), ActiveFilterChip, AdvancedFilterDialog(), addressText(), CenterFilters, centerTypeOptions, emptyFilters, MedicalCenterList (+28 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "HealthConditionsPage.tsx"
Cohesion: 0.13
Nodes (13): ExportEntity, BranchList, TableToolbarActions(), activeOptions, ConditionFilters, ConditionList, ConditionQuery, DEFAULT_ACTIVE (+5 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "Skeleton"
Cohesion: 0.23
Nodes (26): Skeleton(), DefinitionHelp(), API_URL, buildExportUrl(), ExportButton(), handleExport(), separatorLabels, MetricCard() (+18 more)

### Community 69 - "CycleTable.tsx"
Cohesion: 0.15
Nodes (28): matchesCycleColumnFilters(), columnSortField, CycleTable(), actionLabels, BatchAction, BatchBar(), CheckList(), Chip() (+20 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.18
Nodes (10): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+2 more)

### Community 73 - "qt"
Cohesion: 0.31
Nodes (9): de(), Ie(), Lt(), Mt(), oe(), Ot(), qt(), Re() (+1 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "board.ts"
Cohesion: 0.12
Nodes (22): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+14 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "PatientsPage.tsx"
Cohesion: 0.12
Nodes (17): activeFilterCount(), BranchList, columnFilterCount(), columnSortField, contains(), dateFilterLabels, distinctOptions(), emptyColumnFilters (+9 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "onAnnotDown"
Cohesion: 0.24
Nodes (15): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), finalizeEditingPin(), initAnnotOverlay(), localCoords(), onAnnotDown() (+7 more)

### Community 82 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.14
Nodes (15): Accesibilidad, Cambios de API necesarios, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida (+7 more)

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

### Community 88 - "TreatmentsPage.tsx"
Cohesion: 0.11
Nodes (18): TreatmentsPage, PickerPatient, BranchList, columns, contains(), derivedOptions, DerivedStatusFilter, DoctorPickerList (+10 more)

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "DoctorsPage.tsx"
Cohesion: 0.15
Nodes (12): ActiveFilterChips(), activeOptions, DEFAULT_ACTIVE, DoctorFilters, DoctorList, DoctorQuery, DoctorsPage(), DoctorWithLinks (+4 more)

### Community 91 - "xlsx-table.ts"
Cohesion: 0.33
Nodes (8): buildXlsx(), columnName(), crc32(), crcTable, downloadTableXlsx(), encoder, escapeXml(), zip()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "MenuPermissionTree.tsx"
Cohesion: 0.12
Nodes (21): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), alwaysAllowedPaths (+13 more)

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "AvisosPage.tsx"
Cohesion: 0.13
Nodes (21): AvisosPage, AdvancedFilterButton(), AvisosPage(), channelLabels, contains(), emptyFilters, errorLabels, explainError() (+13 more)

### Community 96 - "CompaniesPage.tsx"
Cohesion: 0.12
Nodes (14): columnHeaders, CompaniesPage(), Company, CompanyFilters, CompanyList, CompanyQuery, CompanyStatusFilter, CompanyTextKey (+6 more)

### Community 97 - "Responsive Design"
Cohesion: 0.12
Nodes (15): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Navigation Adaptation (+7 more)

### Community 98 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 99 - "SKILL.md"
Cohesion: 0.07
Nodes (23): Craft floor, Refuse, Verify, Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich (+15 more)

### Community 100 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 101 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 102 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

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

### Community 107 - "formatPhone"
Cohesion: 0.18
Nodes (13): NewCycleDialog(), clearTreatment(), selectPatient(), selectTreatment(), elapsedLabel(), MedicationPatient, MedicationPatientsDialog(), PatientList (+5 more)

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "bolder.md"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 110 - "UserForm.tsx"
Cohesion: 0.17
Nodes (12): BranchOption, generatePassword(), generatePin(), Props, RoleOption, branches, renderForm(), roles (+4 more)

### Community 111 - "board.ts"
Cohesion: 0.14
Nodes (15): StockPage, MedicationList, StockMarkList, boardQueryKey(), boardQueryString(), BoardResponse, cycleTableQueryKey(), CycleTableResponse (+7 more)

### Community 112 - "reports.ts"
Cohesion: 0.12
Nodes (26): ReportsIndexPage, presetFromFilters(), ReportFilterBar(), apply(), removeChip(), setDraftPreset(), useReportFilters(), update() (+18 more)

### Community 113 - "vitest"
Cohesion: 0.27
Nodes (6): vitest, meResponse(), renderWithMe(), allPermissionActions, PermissionGroup, permissionGroups

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "generate.md"
Cohesion: 0.15
Nodes (11): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, append-arrays, append-string, Config drift, Consent prompt (use this phrasing) (+3 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "Modal design system"
Cohesion: 0.33
Nodes (5): Checklist for any new modal, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component

### Community 119 - "BoardFilters.tsx"
Cohesion: 0.21
Nodes (11): filterChipLabel, MedicationList, UserList, cycleColumnFilterCount(), CycleColumnFilters, emptyCycleColumnFilters, nextActionLabels, norm() (+3 more)

### Community 120 - "StatusChip"
Cohesion: 0.29
Nodes (8): Do:, Do's and Don'ts, Don't:, ChipsPage, StatusLabel, statusLabels, StatusChip(), styles

### Community 121 - "RouteError.tsx"
Cohesion: 0.53
Nodes (4): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 122 - "react"
Cohesion: 0.05
Nodes (57): lucide-react, react, @tanstack/react-query, ActivityList, authorName(), API_URL, ExportFilters, Format (+49 more)

### Community 123 - "TemplatesPage.tsx"
Cohesion: 0.13
Nodes (17): recharts, TemplatesPage, EmptyState(), ChartSeries, chartSeriesPalette, seriesColor(), LabelTemplatesTab(), AlertTemplatesTab() (+9 more)

### Community 124 - "Toast.tsx"
Cohesion: 0.13
Nodes (17): react-dom@^19.2.0, react-dom, App(), router, ToastContext, ToastContextValue, ToastItem, ToastProvider() (+9 more)

### Community 125 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 126 - "BoardFilters.tsx"
Cohesion: 0.10
Nodes (16): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Checklist for a new advanced-filter panel, Every field gets the same leading-icon badge, Footer, Header, Shared control class (+8 more)

### Community 127 - "PatientForm.tsx"
Cohesion: 0.05
Nodes (51): InfoCard(), TabItem, Tabs(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel() (+43 more)

### Community 128 - "BranchesPage.tsx"
Cohesion: 0.14
Nodes (13): addressFields, addressText(), addressValues(), BranchAddressDetails, BranchesPage(), BranchFilters, BranchList, BranchTextKey (+5 more)

### Community 129 - "react-router-dom"
Cohesion: 0.35
Nodes (8): react-router-dom, NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), PrintHeader(), useMe()

### Community 130 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 132 - "q"
Cohesion: 0.50
Nodes (4): Filtros, _e(), Gt(), q()

### Community 133 - "TreatmentsPage"
Cohesion: 0.27
Nodes (9): lastPurchaseAt(), TreatmentsPage(), printList(), escapeHtml(), printTable(), daysRemainingLabel(), elapsedSinceLabel(), formatPurchaseDateTime() (+1 more)

### Community 134 - "PatientInfoPackPanel.tsx"
Cohesion: 0.27
Nodes (14): DashboardTreatmentRow(), remainingText(), addPending(), Empty(), Fact(), PatientInfoPackPanel(), chooseMedication(), ActiveTreatmentsPanel() (+6 more)

### Community 135 - "StagesPage.tsx"
Cohesion: 0.22
Nodes (8): StagesPage, columns, isNew(), StagesPage(), pipeline, boardColumnLabels, Pipeline, pipelineQueryKey

### Community 136 - "LabelTemplateFormDialog.tsx"
Cohesion: 0.15
Nodes (20): Breakpoints: Content-Driven, Text Overflow & Wrapping, formatInches(), LABEL_SIZES, LabelVariablePalette(), BranchList, clamp(), headerControl (+12 more)

### Community 137 - "ProfilePage.tsx"
Cohesion: 0.15
Nodes (14): ProfilePage, PasswordField, Props, ResetPasswordPage(), submit(), validatePasswords(), ChangePassword(), Profile (+6 more)

### Community 138 - "medicalCenter.ts"
Cohesion: 0.22
Nodes (6): isValidRnc(), RNC_INPUT_MAX_LENGTH, MedicalCenterFormValues, medicalCenterSchema, medicalCenterTypeLabels, medicalCenterTypes

### Community 139 - "cn"
Cohesion: 0.20
Nodes (12): Neutral, AppLayout(), devLink, linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), WorkspaceSelector() (+4 more)

### Community 140 - "Tables & server pagination design system"
Cohesion: 0.25
Nodes (7): Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 141 - "Responsive Design"
Cohesion: 0.22
Nodes (9): Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch, srcset with Width Descriptors (+1 more)

### Community 142 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 143 - "WorkspaceSelector.tsx"
Cohesion: 0.57
Nodes (3): RequireAuth(), AppShellSkeleton(), authClient

### Community 144 - "Colors"
Cohesion: 0.29
Nodes (7): Accent / Alert, Colors, Named Rules, Primary, Secondary, Status (semantic, not brand tokens), Tertiary

### Community 146 - "CycleTable.test.tsx"
Cohesion: 0.40
Nodes (4): Call, card(), pipeline, setup()

### Community 149 - "Adaptation Strategies"
Cohesion: 0.25
Nodes (7): Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 150 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1149 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `ModalSection` to `BranchesPage.tsx`, `IncidentsPage.tsx`, `operations.ts`, `Button`, `CompanyDetailPage.tsx`, `CompanyDetailPage.tsx`, `MedicationsPage.tsx`, `TransfersPage.tsx`, `CompanyForm.tsx`, `treatments.ts`, `Impeccable Asset Producer`, `MedicationForm.tsx`, `UsersPage.tsx`, `cn`, `api`, `RolesPage.tsx`, `HealthConditionsPage.tsx`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `PatientsPage.tsx`, `DoctorsPage.tsx`, `MenuPermissionTree.tsx`, `CompaniesPage.tsx`, `formatPhone`, `board.ts`, `reports.ts`, `vitest`, `react`, `PatientForm.tsx`?**
  _High betweenness centrality (0.419) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `ModalSection`?**
  _High betweenness centrality (0.398) - this node is a cross-community bridge._
- **Should `IncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1206896551724138 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `SKILL.md`, `new-work.md`, `initGlobalBar`, `live-browser.js`, `handleManualEditActivity`, `onAnnotDown`, `generate.md`, `Init flow`, `connectSSE`?**
  _High betweenness centrality (0.315) - this node is a cross-community bridge._