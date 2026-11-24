# Graph Report - max-care-web  (2026-11-24)

## Corpus Check
- 362 files · ~356,993 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 3394 nodes · 11500 edges · 147 communities (141 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 158 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b88a097`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- setLiveState
- DeliveryDialog.tsx
- operations.ts
- @testing-library/user-event
- Dialog
- router.tsx
- board.ts
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- DoctorsPage.tsx
- live-browser.js
- UserForm.tsx
- phase2-board.spec.ts
- Build & Dev Scripts
- MedicationForm.tsx
- HealthConditionsPage.tsx
- TypeScript Root Config
- PatientPrintView.tsx
- PatientForm.tsx
- reports.ts
- documentRefForElement
- BranchesPage.tsx
- optimize.md
- lucide-react
- connectSSE
- MedicalCentersPage.tsx
- DoctorForm.tsx
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- CompanyDetailPage.tsx
- showToast
- new-work.md
- TreatmentsPage.tsx
- scheduleAcceptCleanup
- CompanyActivityPanel.tsx
- captureElementToBlob
- live.md
- Design System: MAS CARE
- CompanyDetailPage
- initGlobalBar
- TreatmentForm.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- LabelEditor
- The Toolkit
- CycleCard.tsx
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- MedicationForm.tsx
- MedicalCenterForm.tsx
- actOnAgentTarget
- Fase 2 web · Tablero Kanban, existencias e incidencias
- LabelSheet.tsx
- animate.md
- Handle `generate`
- Generate Report
- TasksPage.tsx
- MedicalSpecialtiesPage.tsx
- New visual work
- permissions.ts
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton
- IncidentsPage.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- BoardPage
- Product
- custom-properties-core.ts
- clarify.md
- Nielsen's 10 Heuristics
- PatientsPage.tsx
- polish.md
- quieter.md
- onAnnotDown
- @tanstack/react-query
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- BoardPage.tsx
- Shape
- CompaniesPage.tsx
- xlsx-table.ts
- Android platform
- Generate Report
- Persona-Based Design Testing
- cn
- Tables & server pagination design system
- BoardFilters.tsx
- LabelPrintDialog.tsx
- Operate mode depth (and Read notes)
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- TextField
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- k
- Diagnostic Scan
- api
- RouteError.tsx
- vite.config.ts
- CompanyForm.tsx
- PatientDetailPage.tsx
- Impeccable Documenter
- TextField
- Heuristics Scoring Guide
- Impeccable Documenter
- patient.ts
- Implement Adaptations
- CycleTable.tsx
- RolesPage.tsx
- StagesPage.tsx
- dotenv
- createMedication.ts
- L
- BoardFilters.tsx
- RequireRoute.tsx
- CompanyRelationsPanel.tsx
- RoleForm.tsx
- adapt.md
- ReportChart.tsx
- AppLayout.tsx
- MAS CARE Web
- SKILL.md
- Responsive Design
- LabelTemplateFormDialog.tsx
- qt
- WorkspaceSelector
- CycleTable.test.tsx
- Adaptation Strategies
- q
- Visualize: Direction Comps & Asset Production
- Operate
- MedicationItemsEditor
- ExportButton.test.tsx
- Region map

## God Nodes (most connected - your core abstractions)
1. `api()` - 244 edges
2. `Button` - 224 edges
3. `Dialog()` - 152 edges
4. `react` - 149 edges
5. `lucide-react` - 139 edges
6. `@tanstack/react-query` - 124 edges
7. `Select` - 120 edges
8. `useCan()` - 103 edges
9. `cn()` - 102 edges
10. `FormActions()` - 96 edges

## Surprising Connections (you probably didn't know these)
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → src/components/StatusChip.tsx
- `Board page layout tweaks that came with this pass` --references--> `AppLayout()`  [INFERRED]
  tablasYPaginacionDesign.md → src/components/layout/AppLayout.tsx
- `Layout Adaptation Techniques` --references--> `clamp()`  [INFERRED]
  .github/skills/impeccable/reference/adapt.md → src/features/settings/LabelTemplateFormDialog.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx
- `Assemble and review` --references--> `components`  [INFERRED]
  .github/skills/impeccable/reference/component-review.md → src/lib/api-types.ts

## Import Cycles
- None detected.

## Communities (147 total, 6 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 1 - "DeliveryDialog.tsx"
Cohesion: 0.22
Nodes (12): ButtonIcon(), CycleCloseDialog(), Origin, DeliveryDialog(), Pickup, pickupOptions, DeliveryResult, Treatment (+4 more)

### Community 2 - "operations.ts"
Cohesion: 0.05
Nodes (52): DashboardPage, cardIcons, DashboardPage(), pad(), PatientList, TaskTreatmentOption, todayStartInput(), toLocalInput() (+44 more)

### Community 3 - "@testing-library/user-event"
Cohesion: 0.13
Nodes (13): @testing-library/user-event, stages, meResponse(), renderForm(), Call, row(), setup(), pipeline (+5 more)

### Community 4 - "Dialog"
Cohesion: 0.05
Nodes (62): Checklist for any new modal, Grouping content with `ModalSection`, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, Active-filter chips (outside the dialog), Advanced filter design system (+54 more)

### Community 5 - "router.tsx"
Cohesion: 0.06
Nodes (36): RequireAuth(), AccessPage, AutomationSettingsPage, BoardPage, BranchesPage, ChipsPage, CompaniesPage, DoctorDetailPage (+28 more)

### Community 6 - "board.ts"
Cohesion: 0.09
Nodes (28): StockPage, boardPath(), CycleExpectedOnResponse, CycleMoveResponse, editCycle(), fetchBoard(), StockMarkInput, MedicationList (+20 more)

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
Nodes (47): devDependencies, eslint@^9.39.1, eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, jsdom@^27.1.0 (+39 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "DoctorsPage.tsx"
Cohesion: 0.06
Nodes (54): RowActions(), InfoFact(), PageHeader(), PurgeDialog(), StatusDraftContext, StatusDraftProvider(), useStatusDraft(), StatusToggle() (+46 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "UserForm.tsx"
Cohesion: 0.08
Nodes (26): BranchTab, fieldKeys, Props, addressText(), Caregiver, formKey(), PatientCaregiversPanel(), openEdit() (+18 more)

### Community 16 - "phase2-board.spec.ts"
Cohesion: 0.09
Nodes (19): suffix, suffix, ensureLimitedRole(), LimitedRole, names, permissions, createPatient(), createTreatment() (+11 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "MedicationForm.tsx"
Cohesion: 0.18
Nodes (10): FormFooter(), DoseUnitsDialog(), errorText(), MedicationForm(), MedicationPhotoViewer(), printImage(), useBlobUrl(), DOSE_UNITS_KEY (+2 more)

### Community 19 - "HealthConditionsPage.tsx"
Cohesion: 0.05
Nodes (62): AvisosPage, ActiveFilterChip, ActiveFilterChips(), AdvancedFilterButton(), AdvancedFilterDialog(), distinctOptions(), FilterBarRow(), filterControlClass (+54 more)

### Community 22 - "PatientPrintView.tsx"
Cohesion: 0.13
Nodes (21): ActivityHistory(), ActivityList, authorName(), EmptyState(), printDialog(), PrintFrame(), conditionStatusLabels, ActivityList (+13 more)

### Community 23 - "PatientForm.tsx"
Cohesion: 0.10
Nodes (46): ConditionLink, ConditionLinkList, ConditionRowContent(), ConditionStatus, PatientConditionsPanel(), AddDoctorDialog(), DoctorLink, DoctorLinkList (+38 more)

### Community 24 - "reports.ts"
Cohesion: 0.14
Nodes (22): ReportsIndexPage, presetFromFilters(), setDraftPreset(), useReportFilters(), update(), reportIcons, ReportsIndexPage(), dateRangeForPreset() (+14 more)

### Community 25 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 26 - "BranchesPage.tsx"
Cohesion: 0.11
Nodes (20): addressFields, addressText(), addressValues(), ArchivedFilter, archivedOptions, BranchAddressDetails, BranchesPage(), BranchFilters (+12 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "lucide-react"
Cohesion: 0.09
Nodes (27): lucide-react, react-dom, Entity, Field, FIELDS, Preview, RowError, Props (+19 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "MedicalCentersPage.tsx"
Cohesion: 0.13
Nodes (16): ActiveFilter, activeLabels, addressText(), CenterFilters, centerTypeOptions, emptyFilters, MedicalCenterList, MedicalCenterQuery (+8 more)

### Community 31 - "DoctorForm.tsx"
Cohesion: 0.10
Nodes (19): zod, useDialogDirty(), MultiSelect(), MultiSelectOption, PanelPosition, AddButton(), DoctorForm(), DoctorRecord (+11 more)

### Community 32 - "el"
Cohesion: 0.07
Nodes (57): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+49 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.17
Nodes (21): be(), Ct(), dt(), Et(), ft(), ht(), It(), J() (+13 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.09
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+41 more)

### Community 35 - "CompanyDetailPage.tsx"
Cohesion: 0.19
Nodes (12): CompanyDetailPage, BranchList, CompanyDetail, DEFAULT_PROPERTY_KEYS, PROPERTY_CATALOG, PROPERTY_GROUP_ORDER, PropertyDef, PropertyGroup (+4 more)

### Community 36 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 37 - "new-work.md"
Cohesion: 0.06
Nodes (34): Assess Adaptation Challenge, Implement & Verify, Recommended Actions, Craft (deprecated alias), Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity (+26 more)

### Community 38 - "TreatmentsPage.tsx"
Cohesion: 0.10
Nodes (27): API_URL, ExportButton(), ExportEntity, ExportFilters, Format, BranchList, TableToolbarActions(), BranchList (+19 more)

### Community 39 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 40 - "CompanyActivityPanel.tsx"
Cohesion: 0.16
Nodes (16): InfoCard(), TabItem, Tabs(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel() (+8 more)

### Community 41 - "captureElementToBlob"
Cohesion: 0.14
Nodes (19): averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01(), dominantRgb01(), findBackdropAncestor() (+11 more)

### Community 42 - "live.md"
Cohesion: 0.06
Nodes (33): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Step 1: Parse the request (+25 more)

### Community 43 - "Design System: MAS CARE"
Cohesion: 0.08
Nodes (24): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+16 more)

### Community 44 - "CompanyDetailPage"
Cohesion: 0.24
Nodes (7): BehaviorMenu(), CompanyDetailPage(), activateCompany(), goTo(), openAddPatient(), loadVisibleProperties(), QuickAction()

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "TreatmentForm.tsx"
Cohesion: 0.05
Nodes (83): CoverageSection(), ReadOnlyValue(), NewDoctorButton(), decode(), DoseFrequencyRow(), encode(), MINUTES, TimePicker12h() (+75 more)

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
Cohesion: 0.19
Nodes (17): createElement(), isLabelVariableKey(), nextElementId(), displayNumber(), LabelEditor(), addElement(), duplicateSelected(), onElementPointerDown() (+9 more)

### Community 51 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 52 - "CycleCard.tsx"
Cohesion: 0.15
Nodes (14): Do:, Do's and Don'ts, Don't:, StatusLabel, statusLabels, StatusChip(), styles, CycleCard() (+6 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "MedicationForm.tsx"
Cohesion: 0.15
Nodes (24): GaugeProgress(), CardOverlay(), isImage(), Item, MedicationAttachments(), addFiles(), RemovingGauge(), Thumb() (+16 more)

### Community 56 - "MedicalCenterForm.tsx"
Cohesion: 0.14
Nodes (17): AddressMapDialog(), applyCoordinates(), AddressMapPicker(), AddressMapValue, componentValue(), DEFAULT_CENTER, fillFromGeocoderResult(), loadGoogleMapsLibraries() (+9 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "Fase 2 web · Tablero Kanban, existencias e incidencias"
Cohesion: 0.14
Nodes (15): Accesibilidad, Cambios de API necesarios, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida (+7 more)

### Community 59 - "LabelSheet.tsx"
Cohesion: 0.16
Nodes (14): DEFAULT_LABEL_SIZE, EMPTY_VALUE_TEXT, LABEL_SIZES, LABEL_VARIABLE_GROUPS, LABEL_VARIABLE_LABELS, labelSizeChoice, LabelValues, LabelVariableGroup (+6 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+8 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "TasksPage.tsx"
Cohesion: 0.14
Nodes (22): TasksPage, DetailTab, Field(), TaskDetailDialog(), nowInput(), pad(), TaskRescheduleDialog(), statusClasses() (+14 more)

### Community 64 - "MedicalSpecialtiesPage.tsx"
Cohesion: 0.14
Nodes (14): Cloud(), MoreBubble(), OverflowTooltip(), TruncatedText(), ActiveFilter, activeOptions, DEFAULT_ACTIVE, emptyFilters (+6 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "permissions.ts"
Cohesion: 0.14
Nodes (15): ConsolidatedDashboardPage, BranchFilter(), PrintHeader(), BranchRow, BranchRowCells(), ConsolidatedDashboardPage(), ConsolidatedResponse, CounterCell() (+7 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "Skeleton"
Cohesion: 0.20
Nodes (29): Skeleton(), PanelSkeleton(), PatientDetailSkeleton(), DefinitionHelp(), API_URL, buildExportUrl(), ExportButton(), handleExport() (+21 more)

### Community 69 - "IncidentsPage.tsx"
Cohesion: 0.05
Nodes (56): App(), router, DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), KanbanMove, SortableCard() (+48 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.18
Nodes (10): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+2 more)

### Community 73 - "BoardPage"
Cohesion: 0.16
Nodes (18): appendColumnPage(), cardById(), cloneBoard(), fetchBoardColumn(), insertCard(), lanesOf(), moveCardInBoard(), moveCycle() (+10 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "custom-properties-core.ts"
Cohesion: 0.12
Nodes (29): CustomFields(), CustomPropertyFilter(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), Draft, entityLabels (+21 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "PatientsPage.tsx"
Cohesion: 0.07
Nodes (45): BranchTag(), StatusBadge(), createPatientFromForm(), PatientQuickCreateDialog(), activeFilterCount(), ArchivedFilter, archivedOptions, BranchList (+37 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "onAnnotDown"
Cohesion: 0.24
Nodes (15): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), finalizeEditingPin(), initAnnotOverlay(), localCoords(), onAnnotDown() (+7 more)

### Community 82 - "@tanstack/react-query"
Cohesion: 0.12
Nodes (14): @tanstack/react-query, @testing-library/react, vitest, counts, row, Call, baseProfile, changePassword (+6 more)

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

### Community 88 - "BoardPage.tsx"
Cohesion: 0.22
Nodes (12): DateRange, DateRangeFilter(), pad(), Preset, presetRange(), PRESETS, toDateInput(), CycleOutcome (+4 more)

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "CompaniesPage.tsx"
Cohesion: 0.12
Nodes (17): SearchField(), columnHeaders, CompaniesPage(), closeForm(), submit(), Company, CompanyFilters, CompanyList (+9 more)

### Community 91 - "xlsx-table.ts"
Cohesion: 0.36
Nodes (7): buildXlsx(), columnName(), crc32(), crcTable, encoder, escapeXml(), zip()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "cn"
Cohesion: 0.36
Nodes (12): FilterSegmented(), ChildRow(), columns, DragHandle(), FixedRow(), Group(), ItemRow(), MenuOrderTable() (+4 more)

### Community 96 - "Tables & server pagination design system"
Cohesion: 0.22
Nodes (8): Board page layout tweaks that came with this pass, Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 97 - "BoardFilters.tsx"
Cohesion: 0.21
Nodes (11): filterChipLabel, MedicationList, UserList, cycleColumnFilterCount(), CycleColumnFilters, emptyCycleColumnFilters, nextActionLabels, norm() (+3 more)

### Community 98 - "LabelPrintDialog.tsx"
Cohesion: 0.33
Nodes (11): LabelDesign, labelDims(), labelElementStyle(), labelElementText(), LabelPrintDialog(), pickDefaultTemplate(), toDesign(), LabelPrint() (+3 more)

### Community 99 - "Operate mode depth (and Read notes)"
Cohesion: 0.10
Nodes (18): Craft floor, Refuse, Verify, Constraints, Failure modes, Flow, /impeccable hooks, Routing (+10 more)

### Community 100 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 101 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 102 - "TextField"
Cohesion: 0.11
Nodes (24): @hookform/resolvers, react-hook-form, useStatusDraftChanged(), TextField, emptyValues, MenuItemForm(), ParentOption, Props (+16 more)

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

### Community 107 - "k"
Cohesion: 0.26
Nodes (12): ae(), er(), fe(), jt(), k(), Kt(), P(), tr() (+4 more)

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "api"
Cohesion: 0.07
Nodes (46): Button, ForgotPasswordPage(), submit(), submit(), AutomationRule, AutomationRules(), EnrollAutomationButton(), paramField (+38 more)

### Community 110 - "RouteError.tsx"
Cohesion: 0.53
Nodes (4): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 111 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

### Community 112 - "CompanyForm.tsx"
Cohesion: 0.15
Nodes (16): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, CopyLinkButton(), LinkField() (+8 more)

### Community 113 - "PatientDetailPage.tsx"
Cohesion: 0.07
Nodes (63): Ampliaciones recientes, react-router-dom, PropertiesDialog(), PropertyGroup, RecordAction, RecordActionsMenu(), PatientAutomationPanel(), useSetAutomationPaused() (+55 more)

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "TextField"
Cohesion: 0.11
Nodes (28): react, Option, OrganizationList, PasswordField, Props, Props, AccessPage(), submit() (+20 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "patient.ts"
Cohesion: 0.23
Nodes (9): DOCUMENT_INPUT_MAX_LENGTH, isValidDocument(), birthDateField, birthDateRule(), documentField, documentRule(), patientCreateSchema, patientSchema (+1 more)

### Community 119 - "Implement Adaptations"
Cohesion: 0.33
Nodes (6): Content Adaptation, Implement Adaptations, Layout Adaptation Techniques, Navigation Adaptation, Responsive Breakpoints, Touch Adaptation

### Community 120 - "CycleTable.tsx"
Cohesion: 0.19
Nodes (17): matchesCycleColumnFilters(), columnSortField, CycleTable(), defaultColumnKeys, localDateOnly(), BoardFilters, isOpenCycle(), formatCustomValue() (+9 more)

### Community 121 - "RolesPage.tsx"
Cohesion: 0.08
Nodes (39): DataTable(), Pagination(), TableSkeleton(), distinctOptions(), emptyFilters, kindOptions, roleColumns, RoleDto (+31 more)

### Community 122 - "StagesPage.tsx"
Cohesion: 0.32
Nodes (10): StagePicker(), setup(), columnOfStatus(), defaultStageOfColumn(), effectiveStage(), Pipeline, pipelineQueryKey, PipelineStage (+2 more)

### Community 124 - "createMedication.ts"
Cohesion: 0.31
Nodes (8): attachmentsFailedMessage(), createMedicationFromForm(), StagedAttachment, MedicationQuickCreateDialog(), setPrimaryMedicationAttachment(), uploadMedicationAttachment(), MedicationFormValues, medicationSchema

### Community 125 - "L"
Cohesion: 0.27
Nodes (10): bt(), Ce(), s(), Ee(), L(), l(), u(), Rt() (+2 more)

### Community 126 - "BoardFilters.tsx"
Cohesion: 0.13
Nodes (11): Body: field grid, Every field gets the same leading-icon badge, Shared control class, BoardFilters(), branchLabel(), chipValue(), derivedLabel(), medicationLabel() (+3 more)

### Community 127 - "RequireRoute.tsx"
Cohesion: 0.31
Nodes (7): NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), isPathAllowed(), matches()

### Community 128 - "CompanyRelationsPanel.tsx"
Cohesion: 0.14
Nodes (18): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealList (+10 more)

### Community 129 - "RoleForm.tsx"
Cohesion: 0.22
Nodes (11): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), MenuItemDto (+3 more)

### Community 130 - "adapt.md"
Cohesion: 0.20
Nodes (9): Assess Adaptation Challenge, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Mobile Adaptation (Desktop → Mobile), Plan Adaptation Strategy, Print Adaptation (Screen → Print), Reference Material, Tablet Adaptation (Hybrid Approach) (+1 more)

### Community 131 - "ReportChart.tsx"
Cohesion: 0.47
Nodes (4): recharts, ChartSeries, chartSeriesPalette, seriesColor()

### Community 132 - "AppLayout.tsx"
Cohesion: 0.18
Nodes (15): Neutral, AppLayout(), devLink, linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), alwaysAllowedPaths (+7 more)

### Community 133 - "MAS CARE Web"
Cohesion: 0.22
Nodes (7): Arranque local, Comandos, MAS CARE Web, Pantallas, Pendientes conocidos, Publicación, Requisitos

### Community 134 - "SKILL.md"
Cohesion: 0.10
Nodes (15): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns (+7 more)

### Community 135 - "Responsive Design"
Cohesion: 0.22
Nodes (9): Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch, srcset with Width Descriptors (+1 more)

### Community 136 - "LabelTemplateFormDialog.tsx"
Cohesion: 0.15
Nodes (20): Breakpoints: Content-Driven, Text Overflow & Wrapping, formatInches(), LabelVariablePalette(), BranchList, clamp(), headerControl, LabelTemplateFormDialog() (+12 more)

### Community 137 - "qt"
Cohesion: 0.31
Nodes (9): de(), Ie(), Lt(), Mt(), oe(), Ot(), qt(), Re() (+1 more)

### Community 138 - "WorkspaceSelector"
Cohesion: 0.38
Nodes (5): normalize(), WorkspaceSelector(), activateOrganization(), renderOption(), selectWorkspace()

### Community 139 - "CycleTable.test.tsx"
Cohesion: 0.40
Nodes (4): Call, card(), pipeline, setup()

### Community 140 - "Adaptation Strategies"
Cohesion: 0.40
Nodes (5): Adaptation Strategies, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 141 - "q"
Cohesion: 0.50
Nodes (4): Filtros, _e(), Gt(), q()

### Community 142 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 143 - "Operate"
Cohesion: 0.50
Nodes (3): Comps, Directions, Operate

### Community 146 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `PatientsPage.tsx` to `CompanyRelationsPanel.tsx`, `DeliveryDialog.tsx`, `operations.ts`, `@testing-library/user-event`, `Dialog`, `AppLayout.tsx`, `board.ts`, `DoctorsPage.tsx`, `ExportButton.test.tsx`, `MedicationForm.tsx`, `HealthConditionsPage.tsx`, `PatientForm.tsx`, `reports.ts`, `BranchesPage.tsx`, `lucide-react`, `MedicalCentersPage.tsx`, `DoctorForm.tsx`, `CompanyDetailPage.tsx`, `CompanyActivityPanel.tsx`, `TreatmentForm.tsx`, `Impeccable Asset Producer`, `MedicationForm.tsx`, `MedicalCenterForm.tsx`, `MedicalSpecialtiesPage.tsx`, `permissions.ts`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `IncidentsPage.tsx`, `@tanstack/react-query`, `CompaniesPage.tsx`, `TextField`, `api`, `PatientDetailPage.tsx`, `TextField`, `RolesPage.tsx`, `createMedication.ts`?**
  _High betweenness centrality (0.425) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `PatientsPage.tsx`?**
  _High betweenness centrality (0.416) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04824561403508772 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `new-work.md`, `live.md`, `initGlobalBar`, `live-browser.js`, `handleManualEditActivity`, `onAnnotDown`, `Init flow`, `connectSSE`?**
  _High betweenness centrality (0.307) - this node is a cross-community bridge._
- **Should `@testing-library/user-event` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._