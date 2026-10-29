# Advanced filter design system

Reusable visual pattern for "Filtro Avanzado" dialogs — the panel opened from
a board/table/list's filter trigger button to combine several filter criteria
at once. Introduced with the board's filter panel
(`src/features/board/BoardFilters.tsx`), which is the reference
implementation. Every other advanced-filter panel in the app (patients,
treatments, incidents, tasks, transfers, reports, etc.) should follow this
same pattern instead of inventing its own layout.

This is a sibling document to `designModal.md` (the create/edit dialog
pattern) — they share the base `Dialog` header, label convention, and field
classes, but an advanced-filter panel is flatter: no `ModalSection` color
bands, just a plain field grid, because a filter panel is a single group of
peer criteria, not several distinct record sections.

## Header

Same as `designModal.md`: `Dialog` with an `icon` prop (mint square,
`size-14 rounded-2xl bg-modulos text-cuidado`), Title Case title, and a
one-line description explaining what the filters do.

```tsx
<Dialog
  title="Filtro Avanzado"
  description="Combina estos criterios para acotar el tablero."
  icon={<Filter className="size-6" />}
  onClose={() => setPanelOpen(false)}
  size="lg"
>
```

- Icon is the funnel glyph (`Filter` from `lucide-react`), `size-6`, no tone
  override — same inherited `text-cuidado` as every other dialog icon.
- Title is always literally "Filtro Avanzado" — this is one feature (one
  filter panel pattern), not a per-page title.

## Body: field grid

No `ModalSection` — fields sit directly in a two-column grid:

```tsx
<div className="grid gap-3 sm:grid-cols-2">
  {/* one <label> per filter criterion */}
</div>
```

Each field is a `<label className="grid gap-1.5">` with the same label span
used everywhere else in the app:
`<span className="text-ink text-sm font-medium">Sucursal</span>`.

### Every field gets the same leading-icon badge

Every field in the panel — picklists and date inputs alike — gets the same
colored leading-icon badge inside the control, via the shared `FieldIcon`
wrapper. Don't give date fields a plain muted icon while picklists get a
badge: the mismatch reads as an inconsistency, not an intentional distinction.

```tsx
function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="bg-modulos text-cuidado pointer-events-none absolute top-1/2 left-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md">
      {children}
    </span>
  )
}
```

```tsx
<span className="relative block">
  <FieldIcon>
    <Building2 className="size-4" />
  </FieldIcon>
  <select className={`${controlClass} pl-11`}>…</select>
</span>
```

- Badge is always `bg-modulos`/`text-cuidado` (mint) — one consistent tone
  for every field in a filter panel, not per-field tones. A filter panel is a
  flat list of peer criteria with no identity/choice/time distinction to
  signal, unlike a create/edit modal's sections.
- Icon picked by meaning, reusing existing `lucide-react` glyphs already in
  the app: `Building2` (sucursal/branch), `User` (responsable), `Pill`
  (medicamento), `Tag` (estado/categoría), `CalendarDays` (date range).
  Add new icons only when no existing one fits.
- `pl-11` on the control makes room for the `size-7` badge at `left-1.5` —
  applies to `<select>` and `<input type="date">` alike.
- Always include a neutral "all" option first on `<select>` fields
  (`Todas las sucursales`, `Todos`) — a filter field's empty state means
  "no constraint," unlike a create-form select where empty means "not yet
  chosen."

### Shared control class

```ts
const controlClass =
  'border-border focus:border-tealmax h-10 w-full min-w-0 truncate rounded-lg border bg-white px-3 text-sm outline-none'
```

`w-full min-w-0 truncate` is load-bearing for the same reason documented in
`designModal.md`: a `<select>` left unconstrained can size to its longest
option and desync from its grid row's other fields.

## Footer

Three actions, not two — this is the one place an advanced-filter panel's
footer differs from a create/edit modal's `FormActions`:

```tsx
<div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
  <Button
    disabled={!hasFilters}
    onClick={() => onChange({})}
    className="gap-1.5 hover:border-red-200 hover:bg-red-50 hover:text-red-800"
  >
    <Trash2 className="size-3.5" />
    Limpiar filtros
  </Button>
  <div className="flex items-center gap-2">
    <Button
      className="hover:border-red-200 hover:bg-red-50 hover:text-red-800"
      onClick={() => setPanelOpen(false)}
    >
      Cancelar
    </Button>
    <Button
      variant="primary"
      className="hover:bg-emerald-700 gap-1.5"
      onClick={() => setPanelOpen(false)}
    >
      <Check className="size-3.5" />
      Aplicar filtros
    </Button>
  </div>
</div>
```

- `Limpiar filtros` (default/secondary `Button`, `Trash2` icon) sits alone on
  the left, disabled when no filter is active (`!hasFilters`), and hovers red
  (`hover:border-red-200 hover:bg-red-50 hover:text-red-800`) — same
  destructive-hover treatment as `Cancelar`, since clearing filters discards
  the current selection. It resets by calling `onChange({})`, not by clearing
  each field's local state — filters are lifted state owned by the parent
  page.
- `Cancelar` and `Aplicar filtros` are grouped on the right, same order and
  hover-color convention as `designModal.md`'s footer: `Cancelar` hovers red
  (`hover:border-red-200 hover:bg-red-50 hover:text-red-800`), the primary
  action hovers `emerald-700` (not the literal `cuidado` token — fails WCAG
  AA contrast on white text) and carries a `Check` icon.
- Fields never call the page's `onChange` directly — they write to a local
  `draft` state (`useState<Filters>(filters)`), seeded from the current
  applied `filters` whenever the panel opens (reseed in the trigger button's
  `onClick`, not via an effect). Only `Aplicar filtros` commits:
  `onChange(draft)` then closes. `Cancelar` just closes without calling
  `onChange` — the draft is discarded, and reseeding on next open guarantees
  it never leaks a stale edit. This is deliberate: nothing in the list behind
  the dialog should move until the user confirms, the opposite of
  `BoardFilters`' search box and "Asignados a mí" toggle, which stay live
  (debounced) because they sit outside this panel.
- `Limpiar filtros` is the one exception that still commits immediately
  (`setDraft({}); onChange({})`) rather than waiting for "Aplicar filtros" —
  it's already an explicit, standalone click, not an incidental field change,
  so there's no extra "did you mean it" step to add. It stays open afterward
  so the user can see the now-empty fields. Its disabled condition checks
  both the draft and the applied filters
  (`disabled={!hasFilters && !draftHasFilters}`), so it's enabled whenever
  there's either an applied filter or an unsaved pick to clear.
- Don't wrap this panel's body in a `<form onSubmit>` — there's one explicit
  commit button, not a submit event to catch.
- On narrow screens the group stacks (`flex-col-reverse`) so the primary
  "Aplicar filtros" lands within thumb reach at the top, `Limpiar filtros`
  at the bottom — same mobile-ordering intent as `FormActions`.

## Active-filter chips (outside the dialog)

Not part of the dialog itself, but the convention that goes with it: once
the panel is closed, active criteria surface as removable chips next to the
trigger button —
`border-border text-ink hover:bg-surface flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-medium`,
each with an `X` icon that clears just that one filter. Keep this chip row
whenever a page adopts this filter panel, so users can see and remove active
criteria without reopening the dialog.

## Checklist for a new advanced-filter panel

1. Trigger button: `SlidersHorizontal` icon, label "Filtro Avanzado", shows
   `variant="primary"` once any filter is active, with an active-count
   suffix `(${n})`.
2. `Dialog` with `icon={<Filter className="size-6" />}`, title literally
   "Filtro Avanzado", description stating what the filters narrow down.
3. Flat `grid gap-3 sm:grid-cols-2` — no `ModalSection` bands.
4. Every field — picklists and date inputs alike — gets the mint `FieldIcon`
   badge + `pl-11`. Every select's first option is a neutral "all" choice.
5. Shared `controlClass` with `w-full min-w-0 truncate`.
6. Footer: `Limpiar filtros` (left, disabled when no filter active, red
   hover) + `Cancelar`/`Aplicar filtros` (right, red/green hover per
   `designModal.md`).
7. Keep the removable-chip row next to the trigger button in sync with
   active filters.
