# Modal design system

One modal component for the entire app: `src/components/ui/Dialog.tsx`. Every
create/edit form, confirmation, and picker — including the ones on the
kanban board (`tablero`) — renders through this same component. There is no
separate "board modal" design; the board's dialogs
(`src/features/board/BoardDialogs.tsx`, `NewCycleDialog.tsx`) already use
`Dialog`, and so do 40+ other feature modals (doctors, patients, medications,
roles, users, incidents, tasks, companies, branches…). This doc exists so
that stays true going forward: **any new modal in any module must be built
on `<Dialog>`, never a bespoke overlay.**

## The component

```tsx
import { Dialog } from '@/components/ui/Dialog'

<Dialog
  title="Nuevo médico"
  description="Datos de contacto y colegiatura del médico."
  onClose={closeForm}
  size="lg" // omit for the default 'md'
>
  <DoctorForm ... />
</Dialog>
```

Props: `title` (required), `description?`, `icon?` (ReactNode shown in a
rounded square left of the title), `onClose` (required — called on the ✕
button and on backdrop click), `size?: 'md' | 'lg'` (defaults to `'md'`),
`children`.

## Structure and exact classes

**Overlay** — full-viewport backdrop, portal-rendered to `document.body`,
closes on click outside the panel:

```tsx
<div
  className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
  role="presentation"
  onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
>
```

**Panel** — white card, rounded, capped height so it never exceeds the
viewport (the body scrolls internally instead):

```tsx
<section
  role="dialog" aria-modal="true"
  className={`animate-in border-border flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`}
>
```

- `size="md"` (default) → `max-w-xl` (28rem). Use for simple forms (doctor,
  specialty, medical center, health condition, condition link…).
- `size="lg"` → `max-w-3xl` (48rem). Use when the form has two columns or
  several sections (treatment form, doctor form with specialty/center
  pickers, task/incident forms).

**Header** — bottom border, optional icon, title + description, close
button pinned top-right:

```tsx
<header className="border-border flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5">
  <div className="flex items-start gap-4">
    {icon && (
      <div className="bg-modulos text-cuidado flex size-14 shrink-0 items-center justify-center rounded-2xl">
        {icon}
      </div>
    )}
    <div>
      <h2 className="font-display text-petroleo text-xl font-bold">{title}</h2>
      {description && <p className="text-muted mt-1 text-sm">{description}</p>}
    </div>
  </div>
  <Button type="button" variant="ghost" aria-label="Cerrar" className="size-9 shrink-0 px-0" onClick={onClose}>
    <X className="size-4" />
  </Button>
</header>
```

**Body** — scrolls independently from the header, `px-6 py-5`:

```tsx
<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
  {children}
</div>
```

There is no built-in footer slot — forms put their own action row at the
bottom of `children` using `<FormActions>` (`src/components/ui/FormActions.tsx`),
which sticks to the bottom, right-aligns buttons on desktop, and stacks them
full-width on mobile:

```tsx
<FormActions className="sm:col-span-2">
  <Button type="button" onClick={onCancel}>Cancelar</Button>
  <Button type="submit" variant="primary" disabled={submitting}>
    {submitting ? 'Guardando…' : 'Guardar'}
  </Button>
</FormActions>
```

## Other behavior baked into `Dialog`

- Locks `document.body` scroll while open, restores it on unmount.
- Click on the backdrop (not the panel) closes it; click inside the panel
  does not.
- `animate-in` class on the panel for the open transition.
- Fully portal-based (`createPortal(..., document.body)`), so it always
  renders above the app shell regardless of where it's mounted in the tree.

## Grouping content with `ModalSection`

For any modal whose body has more than a couple of fields (or distinct
sub-topics), group the content into `ModalSection` blocks instead of a flat
field list — this is the "Nuevo Ciclo" look (`src/features/board/NewCycleDialog.tsx`)
and is also used by `CompanyForm.tsx`, `DoctorForm.tsx`, `MedicalCenterForm.tsx`,
`MedicalSpecialtyForm.tsx`, `HealthConditionForm.tsx`,
`PatientDoctorsPanel.tsx`/`PatientConditionsPanel.tsx`'s add dialogs, and
`DoctorDetailPage.tsx`'s "Agregar especialidad"/"Agregar centro médico" dialogs.

```tsx
import { ModalSection } from '@/components/ui/ModalSection'

<ModalSection icon={<User className="size-4" />} title="Datos del médico" tone="mint">
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {/* fields */}
  </div>
</ModalSection>
```

- Each section is a bordered, rounded card: a tinted header row (icon + title)
  over a `bg-surface` body (`src/components/ui/ModalSection.tsx`).
- Three tones, alternate them across consecutive sections (mint → sky → amber
  → mint…): `mint` (`bg-modulos`/`text-cuidado`), `sky` (`bg-sky-50`/`text-sky-600`),
  `amber` (`bg-amber-50`/`text-amber-600`). All section titles render `text-petroleo`.
- One icon per section, matching its semantic content (e.g. `Stethoscope` for
  specialties, `Building2` for medical centers, `MapPin` for location,
  `CalendarDays` for date-ish details).
- Inside a section, lay fields out as `grid grid-cols-1 gap-3 sm:grid-cols-2`
  (or a plain `grid gap-1.5` stack if the section only holds one field group).
- Use a single section for a small/simple form (e.g. name + description in
  `MedicalSpecialtyForm`/`HealthConditionForm`); split into multiple sections
  when the form has clearly distinct sub-topics (contact info vs. location vs.
  general data, as in `MedicalCenterForm`).
- The form's outer element becomes `<form className="grid gap-5">` (no more
  `sm:grid-cols-2` on the form itself — that column split now lives inside
  each `ModalSection`). Root server-error `<p>` and `<FormActions>` stay
  outside/after all `ModalSection`s, same as before.

## Checklist for any new modal

1. Import `Dialog` from `@/components/ui/Dialog` — never hand-roll a
   `fixed inset-0` overlay.
2. Pick `size="md"` for a single-column form, `size="lg"` for anything wider
   (multi-column, tabs, pickers).
3. Put the form's own submit/cancel buttons in `<FormActions>` inside the
   dialog body — `Dialog` has no footer prop.
4. Pass `icon` only when the entity has an obvious one (optional, not
   required for consistency).
5. Don't restyle the overlay, panel, header, or close button per-feature —
   if a module's modal looks different, that's a bug to fix in the feature
   file, not a reason to add a variant to `Dialog`.
6. If the body has more than a couple of fields, group them into
   `ModalSection` blocks (see above) instead of a flat field grid.
