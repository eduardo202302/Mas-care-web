# Graph Report - max-care-web  (2026-11-16)

## Corpus Check
- 344 files · ~342,818 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 3261 nodes · 10479 edges · 148 communities (144 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `472bb9de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- setLiveState
- IncidentsPage.tsx
- operations.ts
- vitest
- RolesPage.tsx
- UserForm.tsx
- treatments.ts
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- lucide-react
- live-browser.js
- reports.ts
- phase2-board.spec.ts
- Build & Dev Scripts
- CompanyRelationsPanel.tsx
- API Code Generation
- TypeScript Root Config
- AccessPage.tsx
- useCan
- CycleTable.tsx
- documentRefForElement
- LabelPrintDialog.tsx
- optimize.md
- Skeleton
- connectSSE
- PageHeader
- zod
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- CompanyDetailPage.tsx
- showToast
- new-work.md
- PatientDetailPage.tsx
- scheduleAcceptCleanup
- Max Care Web – Fase 0
- captureElementToBlob
- live.md
- Design System: MAS CARE
- Button
- initGlobalBar
- LabelEditor.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- LabelEditor
- The Toolkit
- PageHeader
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- MedicationForm.tsx
- StagesPage.tsx
- actOnAgentTarget
- TreatmentsPage.tsx
- patient.ts
- animate.md
- Handle `generate`
- Generate Report
- MenuPermissionTree.tsx
- TransfersPage.tsx
- New visual work
- ConsolidatedDashboardPage.tsx
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton.tsx
- BoardPage.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- UsersPage.tsx
- Product
- CycleTable
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
- eslint.config.js
- Shape
- DoctorsPage.tsx
- xlsx-table.ts
- Android platform
- react-router-dom
- Persona-Based Design Testing
- cn
- CompaniesPage.tsx
- @playwright/test
- Generate Report
- Operate mode depth (and Read notes)
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- MedicalCenterForm.tsx
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- cn
- Diagnostic Scan
- PatientPrintView.tsx
- router.tsx
- CompanyForm.tsx
- CompanyActivityPanel.tsx
- AvisosPage.tsx
- Impeccable Documenter
- Dialog
- Heuristics Scoring Guide
- Impeccable Documenter
- CycleCard.tsx
- DashboardPage.tsx
- TasksPage.tsx
- TaskFormDialog.tsx
- ImportButton.tsx
- generate.md
- App.tsx
- vite.config.ts
- BoardFilters.tsx
- bolder.md
- BranchesPage.tsx
- lib/menu.ts
- Visualize: Direction Comps & Asset Production
- Region map
- Responsive Design
- phase2-board.spec.ts
- Operate mode depth (and Read notes)
- formatInches
- LabelTemplateFormDialog.tsx
- adapt.md
- zod
- auth-client.ts
- Tables & server pagination design system
- adapt.native.md
- StagesPage.tsx
- NoticeDialog.tsx
- createPatient.ts
- BoardDialogs.tsx
- NewCycleDialog
- Persuade and Experience

## God Nodes (most connected - your core abstractions)
1. `api()` - 225 edges
2. `Button` - 213 edges
3. `react` - 139 edges
4. `Dialog()` - 137 edges
5. `lucide-react` - 129 edges
6. `@tanstack/react-query` - 117 edges
7. `useCan()` - 95 edges
8. `FormActions()` - 94 edges
9. `cn()` - 92 edges
10. `TextField` - 80 edges

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

## Communities (148 total, 4 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.12
Nodes (23): IncidentDetailDialog(), ResolveIncidentDialog(), emptyExtra, extraLabels, IncidentExtraFilters, IncidentsPage(), updateFilters(), incidentsPath() (+15 more)

### Community 2 - "operations.ts"
Cohesion: 0.08
Nodes (27): activityDetail(), activityLabels, autoImportMapping(), DashboardContact, DeliveryResult, describeScheduleMetadata(), formatChanges(), importAliases (+19 more)

### Community 3 - "vitest"
Cohesion: 0.08
Nodes (23): @testing-library/user-event@^14.6.1, @testing-library/react, @testing-library/user-event, vitest, Call, card(), pipeline, setup() (+15 more)

### Community 4 - "RolesPage.tsx"
Cohesion: 0.10
Nodes (28): RolesPage, DataTable(), Pagination(), TableSkeleton(), distinctOptions(), emptyFilters, kindOptions, roleColumns (+20 more)

### Community 5 - "UserForm.tsx"
Cohesion: 0.22
Nodes (6): generatePassword(), generatePin(), branches, renderForm(), roles, UserForm()

### Community 6 - "treatments.ts"
Cohesion: 0.05
Nodes (77): DeliveryDialog(), Pickup, pickupOptions, NewDoctorButton(), decode(), DoseFrequencyRow(), encode(), MINUTES (+69 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @googlemaps/js-api-loader@^2.1.3, graphify@^1.0.0, @hookform/resolvers@^5.2.2, lucide-react@^0.552.0 (+16 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.12
Nodes (15): jobs, verify, name, run, uses, with, True, pull_request (+7 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (34): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @testing-library/jest-dom@^6.9.1 (+26 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "lucide-react"
Cohesion: 0.05
Nodes (78): Grouping content with `ModalSection`, @hookform/resolvers, lucide-react, react, react-hook-form, AddressMapDialog(), applyCoordinates(), AddressMapPicker() (+70 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "reports.ts"
Cohesion: 0.14
Nodes (22): ReportsIndexPage, presetFromFilters(), setDraftPreset(), useReportFilters(), update(), reportIcons, ReportsIndexPage(), dateRangeForPreset() (+14 more)

### Community 16 - "phase2-board.spec.ts"
Cohesion: 0.21
Nodes (8): ensureLimitedRole(), LimitedRole, names, permissions, createUser(), getMe(), json(), suffix

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "CompanyRelationsPanel.tsx"
Cohesion: 0.12
Nodes (21): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealCreateForm() (+13 more)

### Community 22 - "AccessPage.tsx"
Cohesion: 0.17
Nodes (18): PasswordField, Props, AccessPage(), submit(), AuthFrame(), readRememberedEmail(), writeRememberedEmail(), CompanyBadge() (+10 more)

### Community 23 - "useCan"
Cohesion: 0.08
Nodes (52): MoreBubble(), ForgotPasswordPage(), submit(), AddConditionDialog(), ConditionLink, ConditionLinkList, ConditionRowContent(), ConditionStatus (+44 more)

### Community 24 - "CycleTable.tsx"
Cohesion: 0.10
Nodes (40): filterChipLabel, MedicationList, UserList, cycleColumnFilterCount(), CycleColumnFilters, emptyCycleColumnFilters, matchesCycleColumnFilters(), nextActionLabels (+32 more)

### Community 25 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 26 - "LabelPrintDialog.tsx"
Cohesion: 0.26
Nodes (12): LabelDesign, labelDims(), labelElementStyle(), labelElementText(), labelSizeChoice, LabelPrintDialog(), pickDefaultTemplate(), toDesign() (+4 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "Skeleton"
Cohesion: 0.23
Nodes (11): recharts, EmptyState(), Skeleton(), PanelSkeleton(), PatientDetailSkeleton(), ChartSeries, chartSeriesPalette, ReportChart() (+3 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "PageHeader"
Cohesion: 0.10
Nodes (20): MedicalCentersPage, RowActions(), PageHeader(), addressText(), CenterFilters, centerTypeOptions, emptyFilters, MedicalCenterList (+12 more)

### Community 31 - "zod"
Cohesion: 0.13
Nodes (14): zod, isValidPhone(), BranchFormValues, branchSchema, DoctorBaseFormValues, doctorSchema, LICENSE_NUMBER_LENGTH, menuItemFormSchema (+6 more)

### Community 32 - "el"
Cohesion: 0.07
Nodes (57): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+49 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.09
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+41 more)

### Community 35 - "CompanyDetailPage.tsx"
Cohesion: 0.14
Nodes (17): CompanyDetailPage, InfoFact(), BehaviorMenu(), BranchList, CompanyDetail, CompanyDetailPage(), activateCompany(), goTo() (+9 more)

### Community 36 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 37 - "new-work.md"
Cohesion: 0.06
Nodes (28): Recommended Actions, Craft (deprecated alias), Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift (+20 more)

### Community 38 - "PatientDetailPage.tsx"
Cohesion: 0.05
Nodes (74): ActivityHistory(), ActivityList, authorName(), CustomFields(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput() (+66 more)

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
Cohesion: 0.08
Nodes (25): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+17 more)

### Community 44 - "Button"
Cohesion: 0.05
Nodes (72): Checklist for any new modal, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, @tanstack/react-query, DoctorDetailPage, Button (+64 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "LabelEditor.tsx"
Cohesion: 0.20
Nodes (14): EMPTY_VALUE_TEXT, isLabelVariableKey(), LABEL_VARIABLE_GROUPS, LABEL_VARIABLE_LABELS, LabelValues, LabelVariableGroup, NewElementInput, displayNumber() (+6 more)

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
Nodes (16): createElement(), nextElementId(), LabelEditor(), addElement(), duplicateSelected(), onElementPointerDown(), onKeyDown(), onPaperDrop() (+8 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "PageHeader"
Cohesion: 0.13
Nodes (15): MedicalSpecialtiesPage, activeOptions, DEFAULT_ACTIVE, emptyFilters, MedicalSpecialtiesPage(), queryString(), SpecialtyFilters, SpecialtyList (+7 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "MedicationForm.tsx"
Cohesion: 0.10
Nodes (33): react-dom, GaugeProgress(), createMedicationFromForm(), CardOverlay(), isImage(), Item, MedicationAttachments(), addFiles() (+25 more)

### Community 56 - "StagesPage.tsx"
Cohesion: 0.26
Nodes (10): Cambios de API necesarios, StagePicker(), setup(), stages, BoardCard, columnOfStatus(), effectiveStage(), PipelineStage (+2 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "TreatmentsPage.tsx"
Cohesion: 0.09
Nodes (33): TreatmentsPage, API_URL, ExportButton(), ExportEntity, ExportFilters, Format, BranchList, TableToolbarActions() (+25 more)

### Community 59 - "patient.ts"
Cohesion: 0.22
Nodes (10): DOCUMENT_INPUT_MAX_LENGTH, hasValidCedulaCheckDigit(), isValidDocument(), birthDateField, birthDateRule(), documentField, documentRule(), patientCreateSchema (+2 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+8 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "MenuPermissionTree.tsx"
Cohesion: 0.24
Nodes (11): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), menuIcon() (+3 more)

### Community 64 - "TransfersPage.tsx"
Cohesion: 0.10
Nodes (24): TransfersPage, BranchList, contains(), emptyExtra, ExtraFilters, extraLabels, norm(), transferColumns (+16 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "ConsolidatedDashboardPage.tsx"
Cohesion: 0.17
Nodes (13): ConsolidatedDashboardPage, BranchRow, BranchRowCells(), ConsolidatedDashboardPage(), ConsolidatedResponse, CounterCell(), counterKeys, counterLabels (+5 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "Skeleton.tsx"
Cohesion: 0.21
Nodes (26): DefinitionHelp(), API_URL, buildExportUrl(), ExportButton(), handleExport(), separatorLabels, MetricCard(), SimpleMetricCard() (+18 more)

### Community 69 - "BoardPage.tsx"
Cohesion: 0.08
Nodes (38): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+30 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.18
Nodes (10): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+2 more)

### Community 73 - "UsersPage.tsx"
Cohesion: 0.08
Nodes (32): ActiveFilterChip, AdvancedFilterButton(), AdvancedFilterDialog(), distinctOptions(), FilterBarRow(), filterControlClass, FilterField(), FilterFieldIcon() (+24 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "CycleTable"
Cohesion: 0.12
Nodes (21): PropertiesPage, Draft, entityLabels, PropertiesPage(), PropertyDialog(), slug(), checkValue(), isDate() (+13 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "PatientsPage.tsx"
Cohesion: 0.11
Nodes (19): PatientsPage, CustomPropertyFilter(), activeFilterCount(), BranchList, columnFilterCount(), columnSortField, contains(), dateFilterLabels (+11 more)

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
Cohesion: 0.15
Nodes (14): Accesibilidad, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida, Rutas y menú (+6 more)

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

### Community 88 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "DoctorsPage.tsx"
Cohesion: 0.12
Nodes (18): DoctorsPage, DoctorDetailPage(), syncDoctorMedicalCenters(), syncDoctorSpecialties(), activeOptions, DEFAULT_ACTIVE, DoctorFilters, DoctorList (+10 more)

### Community 91 - "xlsx-table.ts"
Cohesion: 0.33
Nodes (8): buildXlsx(), columnName(), crc32(), crcTable, downloadTableXlsx(), encoder, escapeXml(), zip()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "react-router-dom"
Cohesion: 0.48
Nodes (5): react-router-dom, chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "cn"
Cohesion: 0.12
Nodes (26): @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, DragHandle(), DragHandleProps (+18 more)

### Community 96 - "CompaniesPage.tsx"
Cohesion: 0.11
Nodes (16): CompaniesPage, columnHeaders, CompaniesPage(), Company, CompanyFilters, CompanyList, CompanyQuery, CompanyStatusFilter (+8 more)

### Community 97 - "@playwright/test"
Cohesion: 0.20
Nodes (5): suffix, suffix, suffix, @playwright/test@^1.56.1, @playwright/test

### Community 98 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 99 - "Operate mode depth (and Read notes)"
Cohesion: 0.07
Nodes (23): Craft floor, Refuse, Verify, Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich (+15 more)

### Community 100 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 101 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 102 - "MedicalCenterForm.tsx"
Cohesion: 0.22
Nodes (6): isValidRnc(), RNC_INPUT_MAX_LENGTH, MedicalCenterFormValues, medicalCenterSchema, medicalCenterTypeLabels, medicalCenterTypes

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

### Community 107 - "cn"
Cohesion: 0.18
Nodes (13): AppLayout(), devLink, linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), normalize(), Option (+5 more)

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "PatientPrintView.tsx"
Cohesion: 0.16
Nodes (16): printDialog(), PrintFrame(), PrintHeader(), conditionStatusLabels, ActivityList, CaregiverList, ConditionLink, DoctorLink (+8 more)

### Community 110 - "router.tsx"
Cohesion: 0.09
Nodes (27): NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), AccessPage, AutomationSettingsPage, BoardPage (+19 more)

### Community 111 - "CompanyForm.tsx"
Cohesion: 0.14
Nodes (15): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), meResponse(), renderForm(), LinkField(), companyFormSchema (+7 more)

### Community 112 - "CompanyActivityPanel.tsx"
Cohesion: 0.18
Nodes (14): ActivityCreateForm(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel(), CompanyActivityType, EmptyState() (+6 more)

### Community 113 - "AvisosPage.tsx"
Cohesion: 0.13
Nodes (21): AvisosPage, ActiveFilterChips(), AvisosPage(), channelLabels, contains(), emptyFilters, errorLabels, explainError() (+13 more)

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "Dialog"
Cohesion: 0.12
Nodes (13): MedicationsPage, attachmentsFailedMessage(), archivedOptions, contains(), DEFAULT_ARCHIVED, distinctOptions(), emptyFilters, MedicationFilters (+5 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "CycleCard.tsx"
Cohesion: 0.14
Nodes (19): Do:, Do's and Don'ts, Don't:, BranchTag(), StatusLabel, statusLabels, StatusChip(), styles (+11 more)

### Community 119 - "DashboardPage.tsx"
Cohesion: 0.16
Nodes (12): DashboardPage, cardIcons, DashboardPage(), counts, row, DashboardCardKey, dashboardCardKeys, dashboardCardMeta (+4 more)

### Community 120 - "TasksPage.tsx"
Cohesion: 0.17
Nodes (12): TasksPage, BranchFilter(), statusClasses(), TasksPage(), isTaskOverdue(), Task, TaskFilter, taskFilterLabels (+4 more)

### Community 121 - "TaskFormDialog.tsx"
Cohesion: 0.16
Nodes (13): pad(), PatientList, TaskTreatmentOption, todayStartInput(), toLocalInput(), UserList, taskPriorities, TaskPriority (+5 more)

### Community 122 - "ImportButton.tsx"
Cohesion: 0.22
Nodes (7): Entity, Field, FIELDS, ImportButton(), norm(), Preview, RowError

### Community 123 - "generate.md"
Cohesion: 0.15
Nodes (11): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, append-arrays, append-string, Config drift, Consent prompt (use this phrasing) (+3 more)

### Community 124 - "App.tsx"
Cohesion: 0.27
Nodes (9): App(), router, ToastProvider(), clear(), Field, installRequiredHints(), isField(), onEdit() (+1 more)

### Community 125 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 126 - "BoardFilters.tsx"
Cohesion: 0.10
Nodes (16): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Checklist for a new advanced-filter panel, Every field gets the same leading-icon badge, Footer, Header, Shared control class (+8 more)

### Community 127 - "bolder.md"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 128 - "BranchesPage.tsx"
Cohesion: 0.14
Nodes (15): ConfirmDialog(), addressFields, addressText(), addressValues(), BranchAddressDetails, BranchesPage(), BranchFilters, BranchList (+7 more)

### Community 129 - "lib/menu.ts"
Cohesion: 0.24
Nodes (9): alwaysAllowedPaths, buildMenuTree(), byOrder(), isPathAllowed(), matches(), MeMenuItem, menuIcons, MenuNode (+1 more)

### Community 130 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 132 - "Responsive Design"
Cohesion: 0.22
Nodes (9): Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch, srcset with Width Descriptors (+1 more)

### Community 133 - "phase2-board.spec.ts"
Cohesion: 0.33
Nodes (6): createPatient(), createTreatment(), getMe(), json(), localDate(), suffix

### Community 134 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 135 - "formatInches"
Cohesion: 0.36
Nodes (8): Breakpoints: Content-Driven, Text Overflow & Wrapping, formatInches(), clamp(), changeSize(), commitCustomSize(), round2(), scaleElements()

### Community 136 - "LabelTemplateFormDialog.tsx"
Cohesion: 0.16
Nodes (17): DEFAULT_LABEL_SIZE, LABEL_SIZES, LabelVariablePalette(), BranchList, headerControl, LabelTemplateFormDialog(), MedicationList, PreviewStatus() (+9 more)

### Community 137 - "adapt.md"
Cohesion: 0.12
Nodes (15): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Navigation Adaptation (+7 more)

### Community 138 - "zod"
Cohesion: 0.50
Nodes (3): AutomationSettingsFormValues, automationSettingsSchema, timeOfDay

### Community 139 - "auth-client.ts"
Cohesion: 0.57
Nodes (3): RequireAuth(), AppShellSkeleton(), authClient

### Community 140 - "Tables & server pagination design system"
Cohesion: 0.22
Nodes (8): Board page layout tweaks that came with this pass, Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 141 - "adapt.native.md"
Cohesion: 0.25
Nodes (7): Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 142 - "StagesPage.tsx"
Cohesion: 0.33
Nodes (6): StagesPage, columns, isNew(), StagesPage(), Pipeline, pipelineQueryKey

### Community 143 - "NoticeDialog.tsx"
Cohesion: 0.33
Nodes (5): NoticeDialog(), MessageChannel, noticeChannelFor(), NoticePreview, NoticeTarget

### Community 144 - "createPatient.ts"
Cohesion: 0.60
Nodes (4): createPatientFromForm(), buildPatientCreateBody(), PatientCreateResult, PatientFormValues

### Community 145 - "BoardDialogs.tsx"
Cohesion: 0.13
Nodes (20): Existencias, ToastContext, ToastContextValue, ToastItem, ToastTone, toneIcons, toneStyles, useToast() (+12 more)

### Community 146 - "NewCycleDialog"
Cohesion: 0.60
Nodes (4): NewCycleDialog(), clearTreatment(), selectPatient(), selectTreatment()

### Community 147 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1143 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `Button` to `BranchesPage.tsx`, `IncidentsPage.tsx`, `lib/menu.ts`, `vitest`, `RolesPage.tsx`, `operations.ts`, `treatments.ts`, `lucide-react`, `reports.ts`, `createPatient.ts`, `BoardDialogs.tsx`, `CompanyRelationsPanel.tsx`, `useCan`, `PageHeader`, `CompanyDetailPage.tsx`, `PatientDetailPage.tsx`, `Impeccable Asset Producer`, `PageHeader`, `MedicationForm.tsx`, `TransfersPage.tsx`, `ConsolidatedDashboardPage.tsx`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `BoardPage.tsx`, `UsersPage.tsx`, `PatientsPage.tsx`, `DoctorsPage.tsx`, `CompaniesPage.tsx`, `router.tsx`, `CompanyForm.tsx`, `CompanyActivityPanel.tsx`, `Dialog`?**
  _High betweenness centrality (0.423) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `Button`?**
  _High betweenness centrality (0.414) - this node is a cross-community bridge._
- **Should `IncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `Operate mode depth (and Read notes)`, `new-work.md`, `initGlobalBar`, `live-browser.js`, `handleManualEditActivity`, `onAnnotDown`, `Init flow`, `generate.md`, `connectSSE`?**
  _High betweenness centrality (0.307) - this node is a cross-community bridge._