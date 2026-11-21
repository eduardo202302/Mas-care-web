# Graph Report - max-care-web  (2026-11-13)

## Corpus Check
- 337 files · ~341,487 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 3, .log 3, .example 1)

## Summary
- 3244 nodes · 10388 edges · 146 communities (141 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `472bb9de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- setLiveState
- IncidentsPage.tsx
- operations.ts
- api
- RolesPage.tsx
- UserForm.tsx
- TreatmentForm.tsx
- Runtime Dependencies
- TypeScript App Config
- CI/CD Pipeline
- package.json
- Component Aliases Config
- TypeScript Node Config
- react
- live-browser.js
- PropertiesPage.tsx
- phase2-board.spec.ts
- Build & Dev Scripts
- CompanyRelationsPanel.tsx
- API Code Generation
- TypeScript Root Config
- treatments.ts
- useCan
- RouteError.tsx
- documentRefForElement
- LabelPrintDialog.tsx
- optimize.md
- TemplatesPage.tsx
- connectSSE
- MedicalCentersPage.tsx
- BranchForm.tsx
- el
- modern-screenshot.umd.js
- syncPageChatFocus
- LabelEditor.tsx
- showToast
- new-work.md
- PatientDetailPage.tsx
- scheduleAcceptCleanup
- Max Care Web – Fase 0
- captureElementToBlob
- live.md
- Design System: MAS CARE
- api
- initGlobalBar
- PatientInfoPackPanel.tsx
- handleManualEditActivity
- onboard.md
- Impeccable Asset Producer
- LabelEditor
- The Toolkit
- PageHeader
- createLiveBrowserDomHelpers
- createLiveBrowserSessionState
- MedicationForm.tsx
- api-types.ts
- actOnAgentTarget
- TreatmentsPage.tsx
- patient.ts
- animate.md
- Handle `generate`
- Generate Report
- RoleForm.tsx
- TransfersPage.tsx
- New visual work
- MedicationForm.tsx
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- Skeleton
- BoardPage.tsx
- critique.md
- Simplify the Design
- Hardening Dimensions
- PageHeader
- Product
- custom-properties-core.ts
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
- MenuPage.tsx
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
- DoctorDetailPage.tsx
- AvisosPage.tsx
- Impeccable Documenter
- Dialog
- Heuristics Scoring Guide
- Impeccable Documenter
- StatusChip
- adapt.native.md
- DeliveryDialog.tsx
- KanbanBoard.tsx
- doctor.md
- Extract Flow
- App.tsx
- vite.config.ts
- BoardFilters.tsx
- bolder.md
- BranchesPage.tsx
- ResetPasswordPage.tsx
- Visualize: Direction Comps & Asset Production
- Region map
- Persuade and Experience
- phase2-board.spec.ts
- IncidentCard.tsx
- Diagnostic Scan
- LabelTemplateFormDialog.tsx
- adapt.md
- zod
- auth-client.ts
- Tables & server pagination design system
- Modal design system
- Operate
- Read
- Command guidance
- Dialog

## God Nodes (most connected - your core abstractions)
1. `api()` - 222 edges
2. `Button` - 211 edges
3. `react` - 137 edges
4. `Dialog()` - 131 edges
5. `lucide-react` - 124 edges
6. `@tanstack/react-query` - 114 edges
7. `FormActions()` - 94 edges
8. `useCan()` - 92 edges
9. `cn()` - 90 edges
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
- `Other behavior baked into `Dialog`` --references--> `Dialog()`  [INFERRED]
  desingModal.md → src/components/ui/Dialog.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **API integration chain: gen:api → api-types.ts → max-care-api** — readme_gen_api, readme_api_types, readme_max_care_api [EXTRACTED 1.00]
- **SPA Bootstrap: index.html → main.tsx mounts into #root** — index_html_entry, index_html_main_tsx, index_html_root_div [EXTRACTED 1.00]

## Communities (146 total, 5 thin omitted)

### Community 0 - "setLiveState"
Cohesion: 0.09
Nodes (67): abortSvelteComponentInjection(), applyEditing(), beginNewLiveConfiguration(), buildLocatorForLeaf(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup() (+59 more)

### Community 1 - "IncidentsPage.tsx"
Cohesion: 0.12
Nodes (22): IncidentsPage, IncidentDetailDialog(), emptyExtra, extraLabels, IncidentExtraFilters, IncidentsPage(), updateFilters(), incidentsPath() (+14 more)

### Community 2 - "operations.ts"
Cohesion: 0.05
Nodes (44): activityDetail(), activityLabelFor(), activityLabels, autoImportMapping(), DashboardCardKey, dashboardCardKeys, dashboardCardMeta, DashboardContact (+36 more)

### Community 3 - "api"
Cohesion: 0.14
Nodes (18): RegisterPage, AccessPage(), submit(), AuthFrame(), readRememberedEmail(), writeRememberedEmail(), CompanyBadge(), CompanyPreview (+10 more)

### Community 4 - "RolesPage.tsx"
Cohesion: 0.10
Nodes (29): DataTable(), RowActions(), Pagination(), TableSkeleton(), activeOptions, ConditionFilters, ConditionList, ConditionQuery (+21 more)

### Community 5 - "UserForm.tsx"
Cohesion: 0.17
Nodes (12): BranchOption, generatePassword(), generatePin(), Props, RoleOption, branches, renderForm(), roles (+4 more)

### Community 6 - "TreatmentForm.tsx"
Cohesion: 0.10
Nodes (26): CustomFields(), Field(), toLocalInput(), MedicationImage(), elapsedLabel(), BranchList, DoctorPickerList, TreatmentListResponse (+18 more)

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
Nodes (34): devDependencies, eslint@^9.39.1, jsdom@^27.1.0, openapi-typescript@^7.10.1, prettier@^3.6.2, prettier-plugin-tailwindcss@^0.7.1, tailwindcss@^4.1.16, @testing-library/jest-dom@^6.9.1 (+26 more)

### Community 11 - "Component Aliases Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 13 - "react"
Cohesion: 0.06
Nodes (62): lucide-react, react, AddressMapDialog(), applyCoordinates(), AddressMapValue, componentValue(), DEFAULT_CENTER, fillFromGeocoderResult() (+54 more)

### Community 14 - "live-browser.js"
Cohesion: 0.03
Nodes (139): applyGlobalBarLabelState(), applyLiveBarPreference(), applyParamDefaults(), applyParamValue(), applyPlaceholderSizingStyles(), applySavedParamValues(), bindEditBadgeProxy(), bufferToBase64() (+131 more)

### Community 15 - "PropertiesPage.tsx"
Cohesion: 0.12
Nodes (21): @tanstack/react-query, CustomPropertyFilter(), Entity, Field, FIELDS, ImportButton(), norm(), Preview (+13 more)

### Community 16 - "phase2-board.spec.ts"
Cohesion: 0.21
Nodes (8): ensureLimitedRole(), LimitedRole, names, permissions, createUser(), getMe(), json(), suffix

### Community 17 - "Build & Dev Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, format, format:check, gen:api, lint, preview (+4 more)

### Community 18 - "CompanyRelationsPanel.tsx"
Cohesion: 0.11
Nodes (20): CollapsibleSection(), CompanyContact, CompanyRelationsPanel(), ContactCard(), Deal, DealCard(), DealCreateBody, DealList (+12 more)

### Community 22 - "treatments.ts"
Cohesion: 0.06
Nodes (53): decode(), DoseFrequencyRow(), encode(), MINUTES, TimePicker12h(), addDaysToDateString(), API_URL, DoctorList (+45 more)

### Community 23 - "useCan"
Cohesion: 0.13
Nodes (32): TabItem, Tabs(), ConditionRowContent(), ConditionStatus, PatientConditionsPanel(), AddDoctorDialog(), doctorOptionLabel(), DoctorRowContent() (+24 more)

### Community 24 - "RouteError.tsx"
Cohesion: 0.53
Nodes (4): chunkErrorHints, getCopy(), isChunkLoadError(), RouteError()

### Community 25 - "documentRefForElement"
Cohesion: 0.06
Nodes (39): addManualContextText(), canRestoreManualEditElement(), collectEditableTextRows(), visit(), collectManualContextPieces(), walk(), contextElementForManualEdit(), copyEditContainerContext() (+31 more)

### Community 26 - "LabelPrintDialog.tsx"
Cohesion: 0.30
Nodes (12): LabelDesign, labelDims(), labelElementStyle(), labelElementText(), LabelPrintDialog(), pickDefaultTemplate(), toDesign(), LabelPrint() (+4 more)

### Community 27 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), Interaction to Next Paint (INP < 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 28 - "TemplatesPage.tsx"
Cohesion: 0.15
Nodes (15): BranchTag(), EmptyState(), BranchList, LabelTemplatesTab(), TemplateFormDialog(), AlertTemplatesTab(), BranchList, channelMeta (+7 more)

### Community 29 - "connectSSE"
Cohesion: 0.06
Nodes (83): applyPlaceholderDimensions(), applySavedSessionMeta(), buildParamsPanel(), checkpointPayload(), clampVariantIndex(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+75 more)

### Community 30 - "MedicalCentersPage.tsx"
Cohesion: 0.15
Nodes (13): ActiveFilterChips(), addressText(), CenterFilters, centerTypeOptions, emptyFilters, MedicalCenterList, MedicalCenterQuery, MedicalCentersPage() (+5 more)

### Community 31 - "BranchForm.tsx"
Cohesion: 0.14
Nodes (15): AddressMapPicker(), BranchForm(), BranchTab, fieldKeys, Props, addressText(), formKey(), PatientCaregiversPanel() (+7 more)

### Community 32 - "el"
Cohesion: 0.07
Nodes (57): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+49 more)

### Community 33 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 34 - "syncPageChatFocus"
Cohesion: 0.09
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), buildSteerQueueHint(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat() (+41 more)

### Community 35 - "LabelEditor.tsx"
Cohesion: 0.15
Nodes (16): DEFAULT_LABEL_SIZE, EMPTY_VALUE_TEXT, LABEL_SIZES, LABEL_VARIABLE_GROUPS, labelSizeChoice, LabelValues, LabelVariableGroup, NewElementInput (+8 more)

### Community 36 - "showToast"
Cohesion: 0.09
Nodes (34): abandonForeignSession(), abandonSupersededGo(), applyOriginalAttrsToSvelteAnchor(), clearMountErrorCard(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), describeMountFailure(), detectDevServerBase() (+26 more)

### Community 37 - "new-work.md"
Cohesion: 0.09
Nodes (22): Assess Adaptation Challenge, Implement & Verify, Recommended Actions, Recommended Actions, Craft (deprecated alias), Apply, Live-mode signature params, Set the spatial thesis (+14 more)

### Community 38 - "PatientDetailPage.tsx"
Cohesion: 0.06
Nodes (50): ActivityHistory(), ActivityList, authorName(), customPropertyGroups(), CustomValuesView(), PropertiesDialog(), PropertyGroup, RecordAction (+42 more)

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
Nodes (25): Accent / Alert, Buttons, Cards / Containers, Chips, Colors, Components, Design System: MAS CARE, Dialogs (+17 more)

### Community 44 - "api"
Cohesion: 0.07
Nodes (42): StagesPage, Button, AutomationRule, AutomationRules(), EnrollAutomationButton(), paramField, rulesQueryKey, useAutomationRules() (+34 more)

### Community 45 - "initGlobalBar"
Cohesion: 0.13
Nodes (24): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), detectPageTheme(), ensureAgentPollTooltip(), ensureSpinKeyframes(), hideAgentPollTooltip() (+16 more)

### Community 46 - "PatientInfoPackPanel.tsx"
Cohesion: 0.17
Nodes (23): CaregiverList, conditionStatusLabels, ConditionLink, conditionTone, derivedLabels, derivedTone, DoctorLink, Empty() (+15 more)

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

### Community 52 - "PageHeader"
Cohesion: 0.15
Nodes (11): AdvancedFilterButton(), PageHeader(), activeOptions, DEFAULT_ACTIVE, emptyFilters, MedicalSpecialtiesPage(), queryString(), SpecialtyFilters (+3 more)

### Community 53 - "createLiveBrowserDomHelpers"
Cohesion: 0.16
Nodes (15): createLiveBrowserDomHelpers(), activeElementDeep(), cloneWithoutChrome(), copyTextViaSelection(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal() (+7 more)

### Community 54 - "createLiveBrowserSessionState"
Cohesion: 0.19
Nodes (17): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+9 more)

### Community 55 - "MedicationForm.tsx"
Cohesion: 0.12
Nodes (27): GaugeProgress(), CardOverlay(), isImage(), Item, MedicationAttachments(), addFiles(), RemovingGauge(), Thumb() (+19 more)

### Community 56 - "api-types.ts"
Cohesion: 0.19
Nodes (12): AutomationSettings, NoticeTimingCard(), Settings, ThresholdsPage(), $defs, operations, webhooks, NoticeTimingFormValues (+4 more)

### Community 57 - "actOnAgentTarget"
Cohesion: 0.29
Nodes (17): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+9 more)

### Community 58 - "TreatmentsPage.tsx"
Cohesion: 0.11
Nodes (22): BranchList, columns, contains(), derivedOptions, DerivedStatusFilter, DoctorPickerList, emptyFilters, lastPurchaseAt() (+14 more)

### Community 59 - "patient.ts"
Cohesion: 0.22
Nodes (10): DOCUMENT_INPUT_MAX_LENGTH, hasValidCedulaCheckDigit(), isValidDocument(), birthDateField, birthDateRule(), documentField, documentRule(), patientCreateSchema (+2 more)

### Community 60 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 61 - "Handle `generate`"
Cohesion: 0.12
Nodes (17): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0-4 per variant), 8. Signal done (+9 more)

### Community 62 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Implementation Integrity Verdict, Patterns & Systemic Issues, Positive Findings

### Community 63 - "RoleForm.tsx"
Cohesion: 0.08
Nodes (37): ChildRow(), columns, DragHandle(), FixedRow(), Group(), ItemRow(), MenuOrderTable(), Node (+29 more)

### Community 64 - "TransfersPage.tsx"
Cohesion: 0.10
Nodes (21): BranchList, contains(), emptyExtra, ExtraFilters, extraLabels, norm(), transferColumns, TransferDraft (+13 more)

### Community 65 - "New visual work"
Cohesion: 0.14
Nodes (14): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Both paths (+6 more)

### Community 66 - "MedicationForm.tsx"
Cohesion: 0.15
Nodes (16): Grouping content with `ModalSection`, @hookform/resolvers, react-hook-form, FormFields(), FormFooter(), HealthConditionForm(), MedicalSpecialtyForm(), StagedAttachment (+8 more)

### Community 67 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.08
Nodes (23): Component translation rules, Narrative mapping, Pitfalls, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Seed mode, Step 1: Find the design assets, Step 1: Route through new-work's workshop (+15 more)

### Community 68 - "Skeleton"
Cohesion: 0.05
Nodes (78): @testing-library/user-event@^14.6.1, recharts, @testing-library/react, @testing-library/user-event, vitest, ReportsIndexPage, Call, card() (+70 more)

### Community 69 - "BoardPage.tsx"
Cohesion: 0.04
Nodes (92): appendColumnPage(), boardPath(), cloneBoard(), CycleExpectedOnResponse, CycleMoveResponse, fetchBoard(), fetchBoardColumn(), insertCard() (+84 more)

### Community 70 - "critique.md"
Cohesion: 0.17
Nodes (11): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Deliver the Report, Hard Invariants, Persist the Snapshot (+3 more)

### Community 71 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 72 - "Hardening Dimensions"
Cohesion: 0.18
Nodes (10): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+2 more)

### Community 73 - "PageHeader"
Cohesion: 0.13
Nodes (20): ActiveFilterChip, AdvancedFilterDialog(), distinctOptions(), filterControlClass, FilterField(), FilterFieldIcon(), FilterSegmented(), FilterSelect() (+12 more)

### Community 74 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 75 - "custom-properties-core.ts"
Cohesion: 0.19
Nodes (13): commitPending(), submit(), submit(), checkValue(), isDate(), isDateTime(), isEmpty(), PropertyDef (+5 more)

### Community 76 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 77 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 78 - "PatientsPage.tsx"
Cohesion: 0.11
Nodes (20): buildPatientCreateBody(), PatientCreateResult, activeFilterCount(), BranchList, columnFilterCount(), columnSortField, contains(), dateFilterLabels (+12 more)

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

### Community 88 - "eslint.config.js"
Cohesion: 0.15
Nodes (12): eslint-config-prettier@^10.1.8, @eslint/js@^9.39.1, eslint-plugin-react-hooks@^5.2.0, eslint-plugin-react-refresh@^0.4.24, globals@^16.5.0, typescript-eslint@^8.46.3, eslint-config-prettier, @eslint/js (+4 more)

### Community 89 - "Shape"
Cohesion: 0.25
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 90 - "DoctorsPage.tsx"
Cohesion: 0.15
Nodes (13): FilterBarRow(), activeOptions, DEFAULT_ACTIVE, DoctorFilters, DoctorList, DoctorQuery, DoctorsPage(), DoctorWithLinks (+5 more)

### Community 91 - "xlsx-table.ts"
Cohesion: 0.33
Nodes (8): buildXlsx(), columnName(), crc32(), crcTable, downloadTableXlsx(), encoder, escapeXml(), zip()

### Community 92 - "Android platform"
Cohesion: 0.25
Nodes (8): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Verifying the build

### Community 93 - "react-router-dom"
Cohesion: 0.39
Nodes (6): react-router-dom, NotFoundPage(), RequireRoute(), mockMe(), pacientes, renderAt()

### Community 94 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 95 - "MenuPage.tsx"
Cohesion: 0.19
Nodes (10): emptyValues, MenuItemForm(), ParentOption, Props, SelectField(), MenuList, MenuPage(), toBody() (+2 more)

### Community 96 - "CompaniesPage.tsx"
Cohesion: 0.12
Nodes (15): columnHeaders, CompaniesPage(), Company, CompanyFilters, CompanyList, CompanyQuery, CompanyStatusFilter, CompanyTextKey (+7 more)

### Community 97 - "@playwright/test"
Cohesion: 0.20
Nodes (5): suffix, suffix, suffix, @playwright/test@^1.56.1, @playwright/test

### Community 98 - "Generate Report"
Cohesion: 0.29
Nodes (7): Audit Health Score, Detailed Findings by Severity, Executive Summary, Generate Report, Patterns & Systemic Issues, Platform Conformance Verdict, Positive Findings

### Community 99 - "Operate mode depth (and Read notes)"
Cohesion: 0.10
Nodes (18): Craft floor, Refuse, Verify, Constraints, Failure modes, Flow, /impeccable hooks, Routing (+10 more)

### Community 100 - "Impeccable Finish Reviewer"
Cohesion: 0.29
Nodes (6): Checks, in order, Disposition, Impeccable Finish Reviewer, Input Contract, Output Contract, Verdict Pass

### Community 101 - "Impeccable Manual Edit Applier"
Cohesion: 0.29
Nodes (6): Checks, Entry Atomicity, Impeccable Manual Edit Applier, Input Contract, Output Contract, Workflow

### Community 102 - "MedicalCenterForm.tsx"
Cohesion: 0.23
Nodes (9): addressText(), MedicalCenterForm(), isValidRnc(), maskRncInput(), RNC_INPUT_MAX_LENGTH, MedicalCenterFormValues, medicalCenterSchema, medicalCenterTypeLabels (+1 more)

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
Cohesion: 0.08
Nodes (42): BranchFilter(), AppLayout(), devLink, linkClass(), SidebarGroup(), SidebarLink(), SidebarNav(), normalize() (+34 more)

### Community 108 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (VoiceOver / TalkBack), 2. Performance, 3. Appearance & Theming, 4. Platform Conformance (CRITICAL), 5. Adaptivity, Diagnostic Scan

### Community 109 - "PatientPrintView.tsx"
Cohesion: 0.23
Nodes (12): printDialog(), PrintFrame(), ActivityList, CaregiverList, ConditionLink, DoctorLink, Fields(), PatientPrintView() (+4 more)

### Community 110 - "router.tsx"
Cohesion: 0.06
Nodes (30): AccessPage, AutomationSettingsPage, BoardPage, BranchesPage, CompaniesPage, CompanyDetailPage, ConsolidatedDashboardPage, DashboardPage (+22 more)

### Community 111 - "CompanyForm.tsx"
Cohesion: 0.14
Nodes (18): CompanyForm(), handleLogoFile(), submit(), imageFileToLogo(), Props, statusLabels, meResponse(), renderForm() (+10 more)

### Community 112 - "DoctorDetailPage.tsx"
Cohesion: 0.06
Nodes (40): DoctorDetailPage, InfoCard(), InfoFact(), ActivityRow(), CompanyActivity, CompanyActivityCreateBody, CompanyActivityList, CompanyActivityPanel() (+32 more)

### Community 113 - "AvisosPage.tsx"
Cohesion: 0.12
Nodes (23): AvisosPage, ExportEntity, BranchList, TableToolbarActions(), AvisosPage(), channelLabels, contains(), emptyFilters (+15 more)

### Community 114 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 115 - "Dialog"
Cohesion: 0.13
Nodes (13): ConfirmDialog(), archivedOptions, contains(), DEFAULT_ARCHIVED, distinctOptions(), emptyFilters, MedicationFilters, MedicationList (+5 more)

### Community 116 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 117 - "Impeccable Documenter"
Cohesion: 0.40
Nodes (4): Impeccable Documenter, Input Contract, Output Contract, Workflow

### Community 118 - "StatusChip"
Cohesion: 0.21
Nodes (12): Do:, Do's and Don'ts, Don't:, ChipsPage, StatusLabel, statusLabels, StatusChip(), styles (+4 more)

### Community 119 - "adapt.native.md"
Cohesion: 0.40
Nodes (5): Adaptation Strategies, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app)

### Community 120 - "DeliveryDialog.tsx"
Cohesion: 0.30
Nodes (10): DeliveryDialog(), Pickup, pickupOptions, DeliveryResult, newIdempotencyKey(), Treatment, formatDateOnly(), prescriptionState (+2 more)

### Community 121 - "KanbanBoard.tsx"
Cohesion: 0.19
Nodes (10): Incidencias, Árbol de `features/board` y `features/incidents`, DragHandleProps, KanbanBoard(), columnFor(), handleDragEnd(), KanbanColumn, KanbanColumnView() (+2 more)

### Community 122 - "doctor.md"
Cohesion: 0.25
Nodes (7): Monorepo notes, Opting out of the boot check, Step 1: Run the pass, Step 2: Act by severity, Step 3: Deprecated fields are binding, Step 4: Do not overclaim on truth drift, What this owns, and what it does not

### Community 123 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

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
Nodes (14): addressFields, addressText(), addressValues(), BranchAddressDetails, BranchesPage(), BranchFilters, BranchList, BranchTextKey (+6 more)

### Community 129 - "ResetPasswordPage.tsx"
Cohesion: 0.36
Nodes (6): ResetPasswordPage, PasswordField, Props, ResetPasswordPage(), submit(), validatePasswords()

### Community 130 - "Visualize: Direction Comps & Asset Production"
Cohesion: 0.33
Nodes (5): After approval: the comp becomes a spec, Generate three compositional options, One approval point, Plates and provenance, Visualize: Direction Comps & Asset Production

### Community 131 - "Region map"
Cohesion: 0.40
Nodes (4): Containment, Painted material, Region map, What varies independently

### Community 132 - "Persuade and Experience"
Cohesion: 0.50
Nodes (3): Comps, Directions, Persuade and Experience

### Community 133 - "phase2-board.spec.ts"
Cohesion: 0.33
Nodes (6): createPatient(), createTreatment(), getMe(), json(), localDate(), suffix

### Community 134 - "IncidentCard.tsx"
Cohesion: 0.43
Nodes (5): DragHandle(), IncidentCard(), IncidentCardMenu(), incidentTypeLabels, formatDateTime()

### Community 135 - "Diagnostic Scan"
Cohesion: 0.33
Nodes (6): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Diagnostic Scan

### Community 136 - "LabelTemplateFormDialog.tsx"
Cohesion: 0.14
Nodes (23): Breakpoints: Content-Driven, Text Overflow & Wrapping, formatInches(), LABEL_VARIABLE_LABELS, LabelVariablePalette(), BranchList, clamp(), headerControl (+15 more)

### Community 137 - "adapt.md"
Cohesion: 0.08
Nodes (24): Assess Adaptation Challenge, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns, Layout Adaptation Techniques (+16 more)

### Community 138 - "zod"
Cohesion: 0.33
Nodes (5): zod@^4.1.12, zod, AutomationSettingsFormValues, automationSettingsSchema, timeOfDay

### Community 140 - "Tables & server pagination design system"
Cohesion: 0.22
Nodes (8): Board page layout tweaks that came with this pass, Branch-first ordering, Checklist for a new server-paged table, Footer layout: pagination left, page-size right, Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`, Pagination contract (page + rows, not cursors), Tables & server pagination design system, Where the footer lives

### Community 141 - "Modal design system"
Cohesion: 0.40
Nodes (4): Modal design system, Other behavior baked into `Dialog`, Structure and exact classes, The component

### Community 142 - "Operate"
Cohesion: 0.50
Nodes (3): Comps, Directions, Operate

### Community 143 - "Read"
Cohesion: 0.50
Nodes (3): Comps, Directions, Read

### Community 144 - "Command guidance"
Cohesion: 0.50
Nodes (3): Command guidance, No-argument routing: the context-aware menu, Workflow questions

### Community 145 - "Dialog"
Cohesion: 0.09
Nodes (35): Checklist for any new modal, API_URL, ExportButton(), ExportFilters, Format, Dialog(), FormActions(), ToastContext (+27 more)

## Knowledge Gaps
- **3 isolated node(s):** `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1137 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `components` connect `BranchesPage.tsx` to `IncidentsPage.tsx`, `operations.ts`, `RolesPage.tsx`, `TreatmentForm.tsx`, `react`, `Dialog`, `CompanyRelationsPanel.tsx`, `treatments.ts`, `useCan`, `MedicalCentersPage.tsx`, `PatientDetailPage.tsx`, `api`, `PatientInfoPackPanel.tsx`, `Impeccable Asset Producer`, `PageHeader`, `MedicationForm.tsx`, `api-types.ts`, `RoleForm.tsx`, `TransfersPage.tsx`, `MedicationForm.tsx`, `Scan mode (approach C: auto-extract, then confirm descriptive language)`, `Skeleton`, `BoardPage.tsx`, `PageHeader`, `PatientsPage.tsx`, `DoctorsPage.tsx`, `CompaniesPage.tsx`, `MedicalCenterForm.tsx`, `cn`, `CompanyForm.tsx`, `DoctorDetailPage.tsx`, `Dialog`, `DeliveryDialog.tsx`?**
  _High betweenness centrality (0.407) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dialog()` (e.g. with `Checklist for any new modal` and `Modal design system`) actually correct?**
  _`Dialog()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `src/main.tsx (app bootstrap module)`, `src/lib/api-types.ts (generated API types)`, `Better Auth (authentication client)` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `setLiveState` be split into smaller, more focused modules?**
  _Cohesion score 0.09226594301221167 - nodes in this community are weakly interconnected._
- **Why does `Pitfalls` connect `Scan mode (approach C: auto-extract, then confirm descriptive language)` to `BranchesPage.tsx`?**
  _High betweenness centrality (0.399) - this node is a cross-community bridge._
- **Should `IncidentsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1206896551724138 - nodes in this community are weakly interconnected._
- **Why does `init()` connect `setLiveState` to `el`, `syncPageChatFocus`, `new-work.md`, `live.md`, `initGlobalBar`, `live-browser.js`, `handleManualEditActivity`, `onAnnotDown`, `Init flow`, `doctor.md`, `connectSSE`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._