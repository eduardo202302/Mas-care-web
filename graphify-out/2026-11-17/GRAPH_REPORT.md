# Graph Report - max-care-web  (2026-11-17)

## Corpus Check
- 347 files · ~346,381 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 3291 nodes · 10694 edges · 140 communities (136 shown, 4 thin omitted)
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
- MenuItemForm.tsx
- CompanyActivityPanel.tsx
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
- AvisosPage.tsx
- TypeScript Root Config
- react
- useCan
- CycleTable.tsx
- documentRefForElement
- PatientDetailPage.tsx
- optimize.md
- Responsive Design
- connectSSE
- TemplatesPage.tsx
- PatientCaregiversPanel.tsx
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- CompanyDetailPage.tsx
- showToast
- new-work.md
- PatientInfoPackPanel.tsx
- scheduleAcceptCleanup
- Max Care Web – Fase 0
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
- useCan
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- MedicationForm.tsx
- StagesPage.tsx
- actOnAgentTarget
- TreatmentsPage.tsx
- auth-client.ts
- animate.md
- Handle `generate`
- Generate Report
- RoleForm.tsx
- StockPage.tsx
- New visual work
- board.ts
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton
- BoardPage.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- PatientPrintView.tsx
- Product
- TreatmentDetailPage.tsx
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
- IncidentsPage
- Shape
- DoctorsPage.tsx
- xlsx-table.ts
- Android platform
- Generate Report
- Persona-Based Design Testing
- MenuOrderTable.tsx
- CompaniesPage.tsx
- BranchesPage.tsx
- ProfilePage.tsx
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
- /impeccable hooks
- RouteError.tsx
- CompanyForm.tsx
- TextField
- TransfersPage.tsx
- Impeccable Documenter
- DeliveryDialog.tsx
- Heuristics Scoring Guide
- Impeccable Documenter
- CycleTable.test.tsx
- MedicationPhotoViewer.tsx
- api
- RolesPage.tsx
- lucide-react
- BoardPage.tsx
- App.tsx
- BoardFilters.tsx
- KanbanBoard.tsx
- AppLayout.tsx
- ConsolidatedDashboardPage.tsx
- Region map
- ImportButton.tsx
- Operate mode depth (and Read notes)
- LabelTemplateFormDialog.tsx
- Responsive Design
- adapt.native.md
- IncidentCard.tsx
- WorkspaceSelector
- Visualize: Direction Comps & Asset Production
- vite.config.ts
- dotenv

## God Nodes (most connected - your core abstractions)
1. `api()` - 229 edges
2. `Button` - 215 edges
3. `Dialog()` - 141 edges
4. `react` - 139 edges
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
  DESIGN.md → src/components/StatusChip.tsx
- `Layout Adaptation Techniques` --references--> `clamp()`  [INFERRED]
  .github/skills/impeccable/reference/adapt.md → src/features/settings/LabelTemplateFormDialog.tsx
- `Existencias` --references--> `StockMarkDialog()`  [INFERRED]
  docs/phase2-web.md → src/features/settings/StockMarkDialog.tsx
- `Assemble and review` --references--> `components`  [INFERRED]
  .github/skills/impeccable/reference/component-review.md → src/lib/api-types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (140 total, 4 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.16
Nodes (14): IncidentsPage, emptyExtra, extraLabels, IncidentExtraFilters, UserList, canMoveIncidentTo(), incidentColumnLabels, incidentColumns (+6 more)

### Community 2 - "operations.ts"
Cohesion: 0.04
Nodes (58): DashboardPage, TasksPage, BranchFilter(), cardIcons, DashboardPage(), statusClasses(), TasksPage(), activityDetail() (+50 more)

### Community 3 - "api-types.ts"
Cohesion: 0.09
Nodes (18): @testing-library/react@^16.3.0, @testing-library/user-event@^14.6.1, vitest@^3.2.4, @testing-library/react, @testing-library/user-event, vitest, counts, row (+10 more)

### Community 4 - "treatments.ts"
Cohesion: 0.06
Nodes (51): decode(), DoseFrequencyRow(), encode(), MINUTES, TimePicker12h(), addDaysToDateString(), DoseScheduleCard(), loadFrequencyFromSchedule() (+43 more)

### Community 5 - "MenuItemForm.tsx"
Cohesion: 0.27
Nodes (7): emptyValues, MenuItemForm(), ParentOption, Props, SelectField(), menuItemFormSchema, MenuItemFormValues

### Community 6 - "CompanyActivityPanel.tsx"
Cohesion: 0.17
Nodes (14): InfoCard(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel(), CompanyActivityType, EmptyState() (+6 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, @googlemaps/js-api-loader@^2.1.3, graphify@^1.0.0 (+20 more)

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

### Community 13 - "MedicationsPage.tsx"
Cohesion: 0.12
Nodes (16): MedicationsPage, ConfirmDialog(), PurgeDialog(), attachmentsFailedMessage(), ArchivedFilter, archivedOptions, contains(), DEFAULT_ARCHIVED (+8 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "Button"
Cohesion: 0.05
Nodes (70): Checklist for any new modal, Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component, Active-filter chips (outside the dialog), Advanced filter design system, Checklist for a new advanced-filter panel (+62 more)

### Community 16 - "phase2-board.spec.ts"
Cohesion: 0.09
Nodes (19): suffix, suffix, ensureLimitedRole(), LimitedRole, names, permissions, createPatient(), createTreatment() (+11 more)

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "CompanyRelationsPanel.tsx"
Cohesion: 0.12
Nodes (21): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealCreateForm() (+13 more)

### Community 19 - "AvisosPage.tsx"
Cohesion: 0.11
Nodes (25): AvisosPage, ActiveFilterChips(), FilterBarRow(), AvisosPage(), channelLabels, contains(), emptyFilters, errorLabels (+17 more)

### Community 22 - "react"
Cohesion: 0.11
Nodes (26): react, Props, PasswordField, Props, Props, AccessPage(), submit(), AuthFrame() (+18 more)

### Community 23 - "useCan"
Cohesion: 0.10
Nodes (52): TabItem, Tabs(), NewDoctorButton(), AddConditionDialog(), ConditionLink, ConditionLinkList, ConditionRowContent(), ConditionStatus (+44 more)

### Community 24 - "CycleTable.tsx"
Cohesion: 0.16
Nodes (23): columnSortField, actionLabels, BatchAction, CheckList(), Chip(), ColumnPicker(), Named, SavedViewsBar() (+15 more)

### Community 25 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 26 - "PatientDetailPage.tsx"
Cohesion: 0.09
Nodes (22): PatientDetailPage, Fact(), NewCycleDialog(), treatmentOptionLabel(), NoticeDialog(), activityDialogTitle, addressText(), BranchList (+14 more)

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
Cohesion: 0.16
Nodes (17): ChipsPage, TemplatesPage, BranchTag(), EmptyState(), ChipsPage(), BranchList, LabelTemplatesTab(), AlertTemplatesTab() (+9 more)

### Community 31 - "PatientCaregiversPanel.tsx"
Cohesion: 0.08
Nodes (23): useDialogDirty(), MultiSelect(), MultiSelectOption, PanelPosition, addressText(), Caregiver, formKey(), PatientCaregiversPanel() (+15 more)

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
Cohesion: 0.09
Nodes (30): CompanyDetailPage, InfoFact(), BehaviorMenu(), BranchList, CompanyDetail, CompanyDetailPage(), activateCompany(), goTo() (+22 more)

### Community 36 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 37 - "new-work.md"
Cohesion: 0.06
Nodes (31): Recommended Actions, Craft (deprecated alias), Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift (+23 more)

### Community 38 - "PatientInfoPackPanel.tsx"
Cohesion: 0.11
Nodes (34): Do:, Do's and Don'ts, Don't:, react-router-dom, StatusLabel, statusLabels, StatusChip(), styles (+26 more)

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
Cohesion: 0.06
Nodes (33): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Step 1: Parse the request (+25 more)

### Community 43 - "Design System: MAS CARE"
Cohesion: 0.08
Nodes (24): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+16 more)

### Community 44 - "MedicalSpecialtiesPage.tsx"
Cohesion: 0.14
Nodes (12): MedicalSpecialtiesPage, AdvancedFilterDialog(), ActiveFilter, activeOptions, DEFAULT_ACTIVE, emptyFilters, MedicalSpecialtiesPage(), queryString() (+4 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "LabelEditor.tsx"
Cohesion: 0.15
Nodes (22): DEFAULT_LABEL_SIZE, EMPTY_VALUE_TEXT, LABEL_VARIABLE_GROUPS, LABEL_VARIABLE_LABELS, LabelDesign, labelDims(), labelElementStyle(), labelElementText() (+14 more)

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

### Community 52 - "useCan"
Cohesion: 0.12
Nodes (17): MedicalCentersPage, ActiveFilter, activeLabels, addressText(), CenterFilters, centerTypeOptions, emptyFilters, MedicalCenterList (+9 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "MedicationForm.tsx"
Cohesion: 0.13
Nodes (29): GaugeProgress(), createMedicationFromForm(), CardOverlay(), isImage(), Item, MedicationAttachments(), addFiles(), RemovingGauge() (+21 more)

### Community 56 - "StagesPage.tsx"
Cohesion: 0.16
Nodes (16): StagesPage, StagePicker(), setup(), stages, columns, isNew(), StagesPage(), BoardCard (+8 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "TreatmentsPage.tsx"
Cohesion: 0.11
Nodes (20): BranchList, columns, contains(), derivedOptions, DerivedStatusFilter, DoctorPickerList, emptyFilters, lastPurchaseAt() (+12 more)

### Community 59 - "auth-client.ts"
Cohesion: 0.39
Nodes (5): better-auth@^1.4.5, better-auth, RequireAuth(), AppShellSkeleton(), authClient

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+8 more)

### Community 62 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 63 - "RoleForm.tsx"
Cohesion: 0.15
Nodes (17): fullAccess, GrantMap, setVisible(), Check(), MenuPermissionTree(), renderLeaf(), toggleGroup(), Props (+9 more)

### Community 64 - "StockPage.tsx"
Cohesion: 0.28
Nodes (8): StockPage, setStockMark(), MedicationList, StockMarkList, StockPage(), StockLevel, stockLevelLabels, formatDateTime()

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "board.ts"
Cohesion: 0.13
Nodes (14): CycleCardMenu(), MenuButton(), nextActionFor(), boardQueryString(), BoardResponse, CycleStatus, cycleStatusLabels, cycleTableQueryKey() (+6 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "Skeleton"
Cohesion: 0.08
Nodes (60): recharts, ReportPage, ReportsIndexPage, Skeleton(), DefinitionHelp(), API_URL, buildExportUrl(), ExportButton() (+52 more)

### Community 69 - "BoardPage.tsx"
Cohesion: 0.11
Nodes (26): BoardPage, appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn() (+18 more)

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
Cohesion: 0.13
Nodes (20): ActivityHistory(), ActivityList, authorName(), printDialog(), PrintFrame(), PrintHeader(), conditionStatusLabels, ActivityList (+12 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "TreatmentDetailPage.tsx"
Cohesion: 0.08
Nodes (42): TreatmentDetailPage, CustomFields(), CustomPropertyFilter(), customPropertyGroups(), CustomValuesView(), Field(), toLocalInput(), PropertiesDialog() (+34 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "PatientsPage.tsx"
Cohesion: 0.06
Nodes (43): NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt(), AccessPage, AutomationSettingsPage, BranchesPage (+35 more)

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
Cohesion: 0.17
Nodes (12): Accesibilidad, Cambios de API necesarios, Existencias, Fase 2 web · Tablero Kanban, existencias e incidencias, Filtros, Nota de rendimiento (revisión manual), Permisos en UI (`useCan`), Puerta de salida (+4 more)

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

### Community 88 - "IncidentsPage"
Cohesion: 0.31
Nodes (6): IncidentsPage(), updateFilters(), incidentsPath(), uniqueSorted(), incidentFiltersToSearch(), incidentQueryKey()

### Community 89 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "DoctorsPage.tsx"
Cohesion: 0.07
Nodes (36): react-dom, DoctorsPage, HealthConditionsPage, RowActions(), MoreBubble(), TruncatedText(), PageHeader(), StatusToggle() (+28 more)

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
Cohesion: 0.36
Nodes (12): FilterSegmented(), ChildRow(), columns, DragHandle(), FixedRow(), Group(), ItemRow(), MenuOrderTable() (+4 more)

### Community 96 - "CompaniesPage.tsx"
Cohesion: 0.09
Nodes (23): CompaniesPage, ExportEntity, ExportFilters, BranchList, TableToolbarActions(), columnHeaders, CompaniesPage(), Company (+15 more)

### Community 97 - "BranchesPage.tsx"
Cohesion: 0.13
Nodes (15): addressFields, addressText(), addressValues(), ArchivedFilter, archivedOptions, BranchAddressDetails, BranchesPage(), BranchFilters (+7 more)

### Community 98 - "ProfilePage.tsx"
Cohesion: 0.21
Nodes (9): ProfilePage, ChangePassword(), Profile, ProfilePage(), baseProfile, changePassword, sendVerificationEmail, setup() (+1 more)

### Community 99 - "SKILL.md"
Cohesion: 0.07
Nodes (22): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat, Craft floor, Refuse, Verify (+14 more)

### Community 100 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 101 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 102 - "UsersPage.tsx"
Cohesion: 0.14
Nodes (18): ActiveFilterChip, distinctOptions(), filterControlClass, FilterField(), FilterFieldIcon(), FilterSelect(), BranchesCell(), BranchList (+10 more)

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
Cohesion: 0.25
Nodes (7): pad(), PatientList, TaskFormDialog(), TaskTreatmentOption, todayStartInput(), toLocalInput(), UserList

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "/impeccable hooks"
Cohesion: 0.33
Nodes (6): Constraints, Failure modes, Flow, /impeccable hooks, Routing, Triage findings

### Community 110 - "RouteError.tsx"
Cohesion: 0.53
Nodes (4): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 111 - "CompanyForm.tsx"
Cohesion: 0.14
Nodes (18): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, meResponse(), renderForm() (+10 more)

### Community 112 - "TextField"
Cohesion: 0.07
Nodes (50): Grouping content with `ModalSection`, @hookform/resolvers, react-hook-form, zod, AddressMapPicker(), FormFields(), FormFooter(), ModalSection() (+42 more)

### Community 113 - "TransfersPage.tsx"
Cohesion: 0.10
Nodes (24): TransfersPage, AdvancedFilterButton(), BranchList, contains(), emptyExtra, ExtraFilters, extraLabels, norm() (+16 more)

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "DeliveryDialog.tsx"
Cohesion: 0.21
Nodes (12): DeliveryDialog(), Pickup, pickupOptions, copy, iconOf, TreatmentActionDialog(), formatDateOnly(), prescriptionState (+4 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "CycleTable.test.tsx"
Cohesion: 0.40
Nodes (4): Call, card(), pipeline, setup()

### Community 119 - "MedicationPhotoViewer.tsx"
Cohesion: 0.47
Nodes (3): MedicationPhotoViewer(), printImage(), useBlobUrl()

### Community 120 - "api"
Cohesion: 0.07
Nodes (42): ForgotPasswordPage(), submit(), submit(), AutomationRule, AutomationRules(), EnrollAutomationButton(), paramField, rulesQueryKey (+34 more)

### Community 121 - "RolesPage.tsx"
Cohesion: 0.15
Nodes (18): RolesPage, DataTable(), Pagination(), TableSkeleton(), distinctOptions(), emptyFilters, kindOptions, roleColumns (+10 more)

### Community 122 - "lucide-react"
Cohesion: 0.06
Nodes (52): lucide-react, @tanstack/react-query, Option, OrganizationList, DirtyContext, DialogSections(), SectionsContext, SectionsContextValue (+44 more)

### Community 123 - "BoardPage.tsx"
Cohesion: 0.22
Nodes (11): filterChipLabel, MedicationList, UserList, cycleColumnFilterCount(), CycleColumnFilters, emptyCycleColumnFilters, matchesCycleColumnFilters(), nextActionLabels (+3 more)

### Community 124 - "App.tsx"
Cohesion: 0.27
Nodes (9): App(), router, ToastProvider(), clear(), Field, installRequiredHints(), isField(), onEdit() (+1 more)

### Community 126 - "BoardFilters.tsx"
Cohesion: 0.13
Nodes (11): Body: field grid, Every field gets the same leading-icon badge, Shared control class, BoardFilters(), branchLabel(), chipValue(), derivedLabel(), medicationLabel() (+3 more)

### Community 127 - "KanbanBoard.tsx"
Cohesion: 0.19
Nodes (10): Incidencias, Árbol de `features/board` y `features/incidents`, DragHandleProps, KanbanBoard(), columnFor(), handleDragEnd(), KanbanColumn, KanbanColumnView() (+2 more)

### Community 129 - "AppLayout.tsx"
Cohesion: 0.19
Nodes (15): devLink, linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), alwaysAllowedPaths, buildMenuTree(), byOrder() (+7 more)

### Community 130 - "ConsolidatedDashboardPage.tsx"
Cohesion: 0.25
Nodes (10): ConsolidatedDashboardPage, BranchRow, BranchRowCells(), ConsolidatedDashboardPage(), ConsolidatedResponse, CounterCell(), counterKeys, counterLabels (+2 more)

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 133 - "ImportButton.tsx"
Cohesion: 0.22
Nodes (7): Entity, Field, FIELDS, ImportButton(), norm(), Preview, RowError

### Community 134 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 136 - "LabelTemplateFormDialog.tsx"
Cohesion: 0.15
Nodes (20): Breakpoints: Content-Driven, Text Overflow & Wrapping, formatInches(), LABEL_SIZES, LabelVariablePalette(), BranchList, clamp(), headerControl (+12 more)

### Community 137 - "Responsive Design"
Cohesion: 0.12
Nodes (15): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Techniques, Mobile Adaptation (Desktop → Mobile), Navigation Adaptation (+7 more)

### Community 138 - "adapt.native.md"
Cohesion: 0.25
Nodes (7): Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 139 - "IncidentCard.tsx"
Cohesion: 0.47
Nodes (4): DragHandle(), IncidentCard(), IncidentCardMenu(), incidentTypeLabels

### Community 140 - "WorkspaceSelector"
Cohesion: 0.12
Nodes (15): Neutral, AppLayout(), normalize(), WorkspaceSelector(), activateOrganization(), renderOption(), selectWorkspace(), Board page layout tweaks that came with this pass (+7 more)

### Community 142 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 143 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): @tailwindcss/vite@^4.1.16, @vitejs/plugin-react@^5.0.4, @tailwindcss/vite, @vitejs/plugin-react

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1157 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `lucide-react` to `IncidentsPage.tsx`, `ConsolidatedDashboardPage.tsx`, `api-types.ts`, `AppLayout.tsx`, `operations.ts`, `CompanyActivityPanel.tsx`, `treatments.ts`, `MedicationsPage.tsx`, `Button`, `CompanyRelationsPanel.tsx`, `useCan`, `PatientDetailPage.tsx`, `CompanyDetailPage.tsx`, `PatientInfoPackPanel.tsx`, `MedicalSpecialtiesPage.tsx`, `Impeccable Asset Producer`, `useCan`, `MedicationForm.tsx`, `RoleForm.tsx`, `board.ts`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `Skeleton`, `TreatmentDetailPage.tsx`, `PatientsPage.tsx`, `DoctorsPage.tsx`, `CompaniesPage.tsx`, `BranchesPage.tsx`, `UsersPage.tsx`, `CompanyForm.tsx`, `TextField`, `TransfersPage.tsx`, `DeliveryDialog.tsx`, `api`, `RolesPage.tsx`?**
  _High betweenness centrality (0.439) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `lucide-react`?**
  _High betweenness centrality (0.417) - this node is a cross-community bridge._
- **Should `operations.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.044755244755244755 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `SKILL.md`, `new-work.md`, `live.md`, `initGlobalBar`, `live-browser.js`, `handleManualEditActivity`, `onAnnotDown`, `Init flow`, `connectSSE`?**
  _High betweenness centrality (0.312) - this node is a cross-community bridge._