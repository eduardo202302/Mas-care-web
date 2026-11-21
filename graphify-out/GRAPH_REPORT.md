# Graph Report - max-care-web  (2026-11-17)

## Corpus Check
- 348 files · ~347,238 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 3298 nodes · 10823 edges · 126 communities (123 shown, 3 thin omitted)
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
- api-types.ts
- treatments.ts
- PatientForm.tsx
- cn
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- MedicationsPage.tsx
- live-browser.js
- Button
- phase2-board.spec.ts
- Build & Dev Scripts
- CompanyRelationsPanel.tsx
- HealthConditionsPage.tsx
- TypeScript Root Config
- api
- useCan
- DashboardPage.tsx
- documentRefForElement
- TreatmentDetailPage.tsx
- optimize.md
- Responsive Design
- connectSSE
- TemplatesPage.tsx
- zod
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- CompanyDetailPage.tsx
- showToast
- new-work.md
- PatientInfoPackPanel.tsx
- scheduleAcceptCleanup
- generate.md
- captureElementToBlob
- live.md
- Design System: MAS CARE
- MedicalSpecialtiesPage.tsx
- initGlobalBar
- LabelEditor.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- LabelEditor
- The Toolkit
- router.tsx
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- MedicationForm.tsx
- TasksPage.tsx
- actOnAgentTarget
- TreatmentsPage.tsx
- LabelSheet.tsx
- animate.md
- Handle `generate`
- Generate Report
- ThresholdsPage.tsx
- PatientQuickCreateDialog.tsx
- New visual work
- bolder.md
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton
- BoardPage.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- PatientPrintView.tsx
- Product
- PropertiesPage.tsx
- clarify.md
- Nielsen's 10 Heuristics
- PatientsPage.tsx
- polish.md
- quieter.md
- onAnnotDown
- Persuade and Experience
- Generate Combined Critique Report
- Init flow
- Common Cognitive Load Violations
- iOS platform
- Shape
- DoctorsPage.tsx
- xlsx-table.ts
- Android platform
- Generate Report
- Persona-Based Design Testing
- MenuOrderTable.tsx
- CompaniesPage.tsx
- BranchesPage.tsx
- SKILL.md
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- UsersPage.tsx
- Cognitive Load Assessment
- Impeccable Finish Reviewer
- Impeccable Manual Edit Applier
- live-browser-ignores.js
- TaskFormDialog.tsx
- Diagnostic Scan
- react-router-dom
- CompanyForm.tsx
- api-types.ts
- transfers.ts
- Impeccable Documenter
- DeliveryDialog.tsx
- Heuristics Scoring Guide
- Impeccable Documenter
- RolesPage.tsx
- PatientDetailPage.tsx
- App.tsx
- BoardFilters.tsx
- AppLayout.tsx
- Region map
- Operate mode depth (and Read notes)
- LabelTemplateFormDialog.tsx
- Responsive Design
- adapt.native.md
- Visualize: Direction Comps & Asset Production

## God Nodes (most connected - your core abstractions)
1. `api()` - 229 edges
2. `Button` - 215 edges
3. `Dialog()` - 141 edges
4. `react` - 140 edges
5. `lucide-react` - 129 edges
6. `@tanstack/react-query` - 118 edges
7. `useCan()` - 95 edges
8. `cn()` - 94 edges
9. `FormActions()` - 90 edges
10. `TextField` - 80 edges

## Surprising Connections (you probably didn't know these)
- `Filtros` --references--> `q()`  [INFERRED]
  docs/phase2-web.md → .github/skills/impeccable/scripts/modern-screenshot.umd.js
- `Named Rules` --references--> `StatusChip()`  [INFERRED]
  DESIGN.md → components/StatusChip.tsx
- `Header` --references--> `Dialog()`  [INFERRED]
  filtroAvanzadoDesing.md → components/ui/Dialog.tsx
- `Layout Adaptation Techniques` --references--> `clamp()`  [INFERRED]
  .github/skills/impeccable/reference/adapt.md → features/settings/LabelTemplateFormDialog.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → features/settings/StockMarkDialog.tsx

## Import Cycles
- None detected.

## Communities (126 total, 3 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.06
Nodes (42): Accesibilidad, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Incidencias, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida (+34 more)

### Community 2 - "operations.ts"
Cohesion: 0.08
Nodes (27): activityLabelFor(), activityLabels, autoImportMapping(), DashboardContact, humanizeActivityType(), importAliases, ImportPreview, ImportResult (+19 more)

### Community 3 - "api-types.ts"
Cohesion: 0.07
Nodes (26): @testing-library/react, @testing-library/user-event, vitest, Call, card(), pipeline, setup(), counts (+18 more)

### Community 4 - "treatments.ts"
Cohesion: 0.05
Nodes (70): CoverageSection(), MedicationImage(), elapsedLabel(), decode(), DoseFrequencyRow(), encode(), MINUTES, TimePicker12h() (+62 more)

### Community 5 - "PatientForm.tsx"
Cohesion: 0.12
Nodes (26): addressText(), BranchOption, normalizeCustom(), PatientForm(), commitPending(), submit(), PatientTab, PendingCondition (+18 more)

### Community 6 - "cn"
Cohesion: 0.06
Nodes (46): ConsolidatedDashboardPage, BranchTag(), DragHandle(), DragHandleProps, KanbanColumn, KanbanColumnView(), KanbanMove, SortableCard() (+38 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, better-auth@^1.4.5, class-variance-authority@^0.7.1, clsx@^2.1.1, @dnd-kit/sortable@^10.0.0, @googlemaps/js-api-loader@^2.1.3, graphify@^1.0.0, @hookform/resolvers@^5.2.2 (+17 more)

### Community 8 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 9 - "CI/CD Pipeline"
Cohesion: 0.12
Nodes (15): jobs, verify, name, run, uses, with, True, pull_request (+7 more)

### Community 10 - "package.json"
Cohesion: 0.05
Nodes (53): devDependencies, dotenv@^17.2.3, eslint@^9.39.1, eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0 (+45 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "MedicationsPage.tsx"
Cohesion: 0.14
Nodes (15): MedicationsPage, ConfirmDialog(), PurgeDialog(), ArchivedFilter, archivedOptions, contains(), DEFAULT_ARCHIVED, distinctOptions() (+7 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "Button"
Cohesion: 0.05
Nodes (69): Checklist for any new modal, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, Cambios de API necesarios, AddressMapDialog(), applyCoordinates() (+61 more)

### Community 16 - "phase2-board.spec.ts"
Cohesion: 0.09
Nodes (19): suffix, suffix, ensureLimitedRole(), LimitedRole, names, permissions, createPatient(), createTreatment() (+11 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "CompanyRelationsPanel.tsx"
Cohesion: 0.12
Nodes (20): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealCreateForm() (+12 more)

### Community 19 - "HealthConditionsPage.tsx"
Cohesion: 0.07
Nodes (39): AvisosPage, HealthConditionsPage, ActiveFilterChip, ActiveFilterChips(), AdvancedFilterButton(), distinctOptions(), filterControlClass, FilterField() (+31 more)

### Community 22 - "api"
Cohesion: 0.06
Nodes (66): react, @tanstack/react-query, ActivityList, API_URL, ExportButton(), Format, devLink, Option (+58 more)

### Community 23 - "useCan"
Cohesion: 0.11
Nodes (38): NewDoctorButton(), AddConditionDialog(), ConditionLink, ConditionLinkList, ConditionRowContent(), ConditionStatus, PatientConditionsPanel(), AddDoctorDialog() (+30 more)

### Community 24 - "DashboardPage.tsx"
Cohesion: 0.16
Nodes (12): DashboardPage, BranchFilter(), cardIcons, DashboardPage(), useActiveBranch(), DashboardCardKey, dashboardCardKeys, dashboardCardMeta (+4 more)

### Community 25 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 26 - "TreatmentDetailPage.tsx"
Cohesion: 0.08
Nodes (29): ActivityHistory(), authorName(), PropertiesDialog(), RecordActionsMenu(), PatientAutomationPanel(), PauseDialog(), useSetAutomationPaused(), addressText() (+21 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "Responsive Design"
Cohesion: 0.22
Nodes (9): Detect Input Method, Not Just Screen Size, Layout Adaptation Patterns, Mobile-First: Write It Right, Picture Element for Art Direction, Responsive Design, Responsive Images: Get It Right, Safe Areas: Handle the Notch, srcset with Width Descriptors (+1 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "TemplatesPage.tsx"
Cohesion: 0.13
Nodes (14): LabelTemplatesTab(), BranchList, TemplateFormDialog(), variables, WaFields, AlertTemplatesTab(), BranchList, channelMeta (+6 more)

### Community 31 - "zod"
Cohesion: 0.07
Nodes (24): zod, isValidPhone(), isValidRnc(), RNC_INPUT_MAX_LENGTH, AutomationSettingsFormValues, automationSettingsSchema, timeOfDay, BranchFormValues (+16 more)

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
Cohesion: 0.12
Nodes (17): CompanyDetailPage, InfoFact(), BehaviorMenu(), BranchList, CompanyDetail, CompanyDetailPage(), activateCompany(), goTo() (+9 more)

### Community 36 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 37 - "new-work.md"
Cohesion: 0.06
Nodes (28): Recommended Actions, Craft (deprecated alias), Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift (+20 more)

### Community 38 - "PatientInfoPackPanel.tsx"
Cohesion: 0.11
Nodes (33): Do:, Do's and Don'ts, Don't:, ChipsPage, StatusLabel, statusLabels, StatusChip(), styles (+25 more)

### Community 39 - "scheduleAcceptCleanup"
Cohesion: 0.31
Nodes (11): acceptedDomAlreadyClean(), clearHandledWrapperReloadStamp(), deferredRecoverySuperseded(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), handledWrapperReloadKey(), reloadAfterMissingAcceptedDom(), restoreAcceptedDomFromSnapshot() (+3 more)

### Community 40 - "generate.md"
Cohesion: 0.15
Nodes (11): Step 1: Parse the request, Step 2: Reuse the page, then start, Step 3: Generate, Step 4: Accept and close, append-arrays, append-string, Config drift, Consent prompt (use this phrasing) (+3 more)

### Community 41 - "captureElementToBlob"
Cohesion: 0.14
Nodes (19): averageRgb01(), captureAndEmit(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01(), dominantRgb01(), findBackdropAncestor() (+11 more)

### Community 42 - "live.md"
Cohesion: 0.08
Nodes (22): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Cleanup (+14 more)

### Community 43 - "Design System: MAS CARE"
Cohesion: 0.05
Nodes (39): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+31 more)

### Community 44 - "MedicalSpecialtiesPage.tsx"
Cohesion: 0.12
Nodes (15): react-dom, MedicalSpecialtiesPage, FilterBarRow(), MoreBubble(), TruncatedText(), ActiveFilter, activeOptions, DEFAULT_ACTIVE (+7 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "LabelEditor.tsx"
Cohesion: 0.18
Nodes (14): DEFAULT_LABEL_SIZE, EMPTY_VALUE_TEXT, LABEL_VARIABLE_GROUPS, LABEL_VARIABLE_LABELS, LabelValues, LabelVariableGroup, NewElementInput, displayNumber() (+6 more)

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

### Community 52 - "router.tsx"
Cohesion: 0.06
Nodes (32): AccessPage, AutomationSettingsPage, BoardPage, DoctorDetailPage, ForgotPasswordPage, IncidentsPage, MedicalCentersPage, MenuPage (+24 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "MedicationForm.tsx"
Cohesion: 0.10
Nodes (33): GaugeProgress(), attachmentsFailedMessage(), createMedicationFromForm(), CardOverlay(), isImage(), Item, MedicationAttachments(), addFiles() (+25 more)

### Community 56 - "TasksPage.tsx"
Cohesion: 0.21
Nodes (12): TasksPage, statusClasses(), TasksPage(), isTaskOverdue(), Task, taskDueLabel(), TaskFilter, taskFilterLabels (+4 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "TreatmentsPage.tsx"
Cohesion: 0.11
Nodes (20): BranchList, columns, contains(), derivedOptions, DerivedStatusFilter, DoctorPickerList, emptyFilters, lastPurchaseAt() (+12 more)

### Community 59 - "LabelSheet.tsx"
Cohesion: 0.27
Nodes (10): labelDims(), labelElementStyle(), labelElementText(), labelSizeChoice, LabelPrintDialog(), pickDefaultTemplate(), toDesign(), LabelPrint() (+2 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+8 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "ThresholdsPage.tsx"
Cohesion: 0.27
Nodes (9): AutomationSettings, NoticeTimingCard(), Settings, ThresholdsPage(), NoticeTimingFormValues, noticeTimingSchema, ThresholdsFormValues, thresholdsSchema (+1 more)

### Community 64 - "PatientQuickCreateDialog.tsx"
Cohesion: 0.42
Nodes (6): createPatientFromForm(), buildPatientCreateBody(), PatientCreateResult, PatientQuickCreateDialog(), useAccessibleBranches(), PatientFormValues

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "bolder.md"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "Skeleton"
Cohesion: 0.08
Nodes (64): recharts, ReportsIndexPage, Skeleton(), PanelSkeleton(), PatientDetailSkeleton(), DefinitionHelp(), API_URL, buildExportUrl() (+56 more)

### Community 69 - "BoardPage.tsx"
Cohesion: 0.05
Nodes (86): EmptyState(), appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn() (+78 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.18
Nodes (10): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+2 more)

### Community 73 - "PatientPrintView.tsx"
Cohesion: 0.17
Nodes (15): printDialog(), conditionStatusLabels, ActivityList, CaregiverList, ConditionLink, DoctorLink, Fields(), PatientPrintView() (+7 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "PropertiesPage.tsx"
Cohesion: 0.11
Nodes (28): PropertiesPage, CustomFields(), CustomPropertyFilter(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), Draft (+20 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "PatientsPage.tsx"
Cohesion: 0.10
Nodes (19): activeFilterCount(), ArchivedFilter, archivedOptions, BranchList, columnFilterCount(), columnSortField, contains(), dateFilterLabels (+11 more)

### Community 79 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 80 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 81 - "onAnnotDown"
Cohesion: 0.24
Nodes (15): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), finalizeEditingPin(), initAnnotOverlay(), localCoords(), onAnnotDown() (+7 more)

### Community 82 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

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

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "DoctorsPage.tsx"
Cohesion: 0.08
Nodes (36): DoctorsPage, PageHeader(), StatusDraftContext, StatusDraftProvider(), useStatusDraft(), StatusToggle(), Doctor, DoctorDetail (+28 more)

### Community 91 - "xlsx-table.ts"
Cohesion: 0.33
Nodes (8): buildXlsx(), columnName(), crc32(), crcTable, downloadTableXlsx(), encoder, escapeXml(), zip()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "MenuOrderTable.tsx"
Cohesion: 0.24
Nodes (14): @dnd-kit/core@^6.3.1, @dnd-kit/utilities@^3.2.2, @dnd-kit/core, @dnd-kit/utilities, ChildRow(), columns, DragHandle(), FixedRow() (+6 more)

### Community 96 - "CompaniesPage.tsx"
Cohesion: 0.09
Nodes (25): CompaniesPage, ExportEntity, ExportFilters, BranchList, TableToolbarActions(), columnHeaders, CompaniesPage(), closeForm() (+17 more)

### Community 97 - "BranchesPage.tsx"
Cohesion: 0.12
Nodes (16): BranchesPage, addressFields, addressText(), addressValues(), ArchivedFilter, archivedOptions, BranchAddressDetails, BranchesPage() (+8 more)

### Community 99 - "SKILL.md"
Cohesion: 0.07
Nodes (23): Craft floor, Refuse, Verify, Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich (+15 more)

### Community 100 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 101 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 102 - "UsersPage.tsx"
Cohesion: 0.12
Nodes (20): UsersPage, RowActions(), MedicationPatientsDialog(), BranchesCell(), BranchList, emptyFilters, isUserActive(), queryString() (+12 more)

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

### Community 107 - "TaskFormDialog.tsx"
Cohesion: 0.14
Nodes (14): pad(), PatientList, TaskFormDialog(), TaskTreatmentOption, todayStartInput(), toLocalInput(), UserList, taskPriorities (+6 more)

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 110 - "react-router-dom"
Cohesion: 0.16
Nodes (13): react-router-dom@^7.9.5, react-router-dom, NotFoundPage(), RequireAuth(), RequireRoute(), mockMe(), pacientes, renderAt() (+5 more)

### Community 111 - "CompanyForm.tsx"
Cohesion: 0.17
Nodes (17): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, meResponse(), renderForm() (+9 more)

### Community 112 - "api-types.ts"
Cohesion: 0.06
Nodes (68): Grouping content with `ModalSection`, @hookform/resolvers, react-hook-form, AddressMapPicker(), FormFields(), FormFooter(), ModalSection(), SectionsContext (+60 more)

### Community 113 - "transfers.ts"
Cohesion: 0.18
Nodes (10): GlobalTransferList, PatientTransferList, Transfer, TransferGlobalRow, TransferHistoryRow, TransferInput, TransferListFilters, TransferPending (+2 more)

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "DeliveryDialog.tsx"
Cohesion: 0.29
Nodes (10): DeliveryDialog(), Pickup, pickupOptions, DeliveryResult, Treatment, formatDateOnly(), prescriptionState, todayDateOnly() (+2 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 121 - "RolesPage.tsx"
Cohesion: 0.10
Nodes (34): RolesPage, TransfersPage, DataTable(), Pagination(), AdvancedFilterDialog(), TableSkeleton(), distinctOptions(), emptyFilters (+26 more)

### Community 122 - "PatientDetailPage.tsx"
Cohesion: 0.08
Nodes (27): lucide-react, PropertyGroup, RecordAction, NoticeDialog(), DoctorQuickCreateDialog(), buttonLabels, channelLabels, ConversationDialog() (+19 more)

### Community 124 - "App.tsx"
Cohesion: 0.27
Nodes (9): App(), router, ToastProvider(), clear(), Field, installRequiredHints(), isField(), onEdit() (+1 more)

### Community 126 - "BoardFilters.tsx"
Cohesion: 0.10
Nodes (16): Active-filter chips (outside the dialog), Advanced filter design system, Body: field grid, Checklist for a new advanced-filter panel, Every field gets the same leading-icon badge, Footer, Header, Shared control class (+8 more)

### Community 129 - "AppLayout.tsx"
Cohesion: 0.12
Nodes (23): SidebarGroup(), SidebarLink(), SidebarNav(), fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree() (+15 more)

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 134 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 136 - "LabelTemplateFormDialog.tsx"
Cohesion: 0.15
Nodes (20): Breakpoints: Content-Driven, Text Overflow & Wrapping, formatInches(), LABEL_SIZES, LabelDesign, LabelVariablePalette(), BranchList, clamp() (+12 more)

### Community 137 - "Responsive Design"
Cohesion: 0.12
Nodes (15): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Navigation Adaptation (+7 more)

### Community 138 - "adapt.native.md"
Cohesion: 0.25
Nodes (7): Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 142 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `api-types.ts` to `IncidentsPage.tsx`, `AppLayout.tsx`, `api-types.ts`, `treatments.ts`, `PatientForm.tsx`, `cn`, `operations.ts`, `MedicationsPage.tsx`, `Button`, `CompanyRelationsPanel.tsx`, `HealthConditionsPage.tsx`, `api`, `useCan`, `TreatmentDetailPage.tsx`, `CompanyDetailPage.tsx`, `PatientInfoPackPanel.tsx`, `MedicalSpecialtiesPage.tsx`, `Impeccable Asset Producer`, `router.tsx`, `MedicationForm.tsx`, `ThresholdsPage.tsx`, `PatientQuickCreateDialog.tsx`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `Skeleton`, `BoardPage.tsx`, `PatientsPage.tsx`, `DoctorsPage.tsx`, `CompaniesPage.tsx`, `BranchesPage.tsx`, `UsersPage.tsx`, `CompanyForm.tsx`, `transfers.ts`, `DeliveryDialog.tsx`, `RolesPage.tsx`, `PatientDetailPage.tsx`?**
  _High betweenness centrality (0.432) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `api-types.ts`?**
  _High betweenness centrality (0.423) - this node is a cross-community bridge._
- **Should `IncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05505279034690799 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `SKILL.md`, `new-work.md`, `generate.md`, `initGlobalBar`, `live-browser.js`, `handleManualEditActivity`, `onAnnotDown`, `Init flow`, `connectSSE`?**
  _High betweenness centrality (0.310) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07816091954022988 - nodes in this community are weakly interconnected._