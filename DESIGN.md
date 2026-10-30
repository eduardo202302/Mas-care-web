---
name: MAS CARE
description: Refill Command Center for multi-branch pharmacy coverage tracking
colors:
  tealmax: "#0e7c86"
  petroleo: "#0a3d4a"
  cuidado: "#2db88a"
  coral: "#ff8a5b"
  surface: "#f4f9fa"
  modulos: "#def5e3"
  border: "#e3eef0"
  ink: "#173c44"
  muted: "#71878c"
  expired-bg: "#fdecea"
  expired-text: "#8e1b1b"
  expired-border: "#f5b5b0"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.tealmax}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.petroleo}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
  button-coral:
    backgroundColor: "{colors.coral}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 16px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "16px"
  dialog:
    backgroundColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: MAS CARE

## Overview

**Creative North Star: "The Refill Command Center"**

MAS CARE is where a pharmacy watches every patient's medication coverage the way a control room watches a fleet: calm at rest, precise about what needs a human in the next hour. The system stays flat and quiet by default so that the one derived status that actually changes an action — vence pronto, vencido, próxima reposición — is the only thing that visually asserts itself. Nothing is decorative; color, radius, and weight are all spent on legibility and on surfacing what's due.

The mood is calm & trustworthy: deep clinical teal and petrol for structure and action, a single reassurance green held in reserve, and coral/red used narrowly so an overdue patient actually reads as urgent rather than one alert among many. Density is built for staff moving through many patients per shift, but nothing is cramped: borders and whitespace do the organizing, not shadows.

**Key Characteristics:**
- Flat, bordered surfaces at rest; real shadows reserved for things that float above the page (dialogs, menus, toasts).
- One accent (tealmax) carries every primary action and every focus ring — it is never used for decoration.
- Status color is never invented in a component; it always traces back to the API's derived status map.
- Display font (Manrope, bold) only on titles and the wordmark; DM Sans carries all working text.

## Colors

The palette is small and role-locked: two structural darks, one accent, one reserve, one warning, and a narrow set of borrowed Tailwind semantic hues for status chips.

### Primary
- **Deep Clinical Teal** (`#0e7c86`, token `tealmax`): every primary action (primary buttons, focus rings, selected dashboard metric card, active sidebar emphasis via lighter tints). Deepens to Midnight Petrol on hover — never a generic opacity fade.

### Secondary
- **Midnight Petrol** (`#0a3d4a`, token `petroleo`): the sidebar's dark chrome, dialog and section titles (paired with the display font), and the primary button's hover state. This is the brand's structural dark, not a text-gray.

### Tertiary
- **Reassurance Green** (`#2db88a`, token `cuidado`): held in reserve — the HeartPulse wordmark icon and the sidebar scrollbar tint are its only jobs. It never carries a button or a large fill; its rarity is what makes the mark read as "cared for" rather than generic brand-green.

### Accent / Alert
- **Alert Coral** (`#ff8a5b`, token `coral`): the one warm color in the system. Used only for the `coral` button variant and attention accents; never for passive decoration.

### Neutral
- **Surface** (`#f4f9fa`, token `surface`): the page's working white-adjacent background behind white cards.
- **Modules** (`#def5e3`, token `modulos`): the outermost app background (`<body>`/`AppLayout` root), a faint green-tinted neutral — distinct from pure white cards.
- **Border** (`#e3eef0`, token `border`): the one border color used everywhere; nearly every container, input, and divider uses it at 1px.
- **Ink** (`#173c44`, token `ink`): primary text color, a dark teal-black rather than pure black.
- **Muted** (`#71878c`, token `muted`): secondary text, captions, placeholders.

### Status (semantic, not brand tokens)
Borrowed directly from the Tailwind palette, one per derived status, each as a `bg-*-50 / text-*-900 / border-*-200` trio: emerald (Al día), sky (Próxima reposición), amber (Vence pronto), violet (Retiro pendiente), slate (Receta por renovar), and the dedicated `expired-*` trio (Vencido). These never mix with the four brand colors.

### Named Rules
**The One Accent Rule.** Tealmax is the only color allowed to mean "act here." If a second color starts carrying primary actions, the hierarchy has broken.

**The Status-Is-Not-Decoration Rule.** A status color only ever comes from `StatusChip`'s status map (mirroring the API's `derived_status`). No component recomputes or re-interprets status color independently.

## Typography

**Display Font:** Manrope (with sans-serif fallback)
**Body Font:** DM Sans (with sans-serif fallback)

**Character:** A geometric, slightly rounded sans (Manrope) for short, weighty moments — titles, the wordmark — paired with a plainer, highly legible workhorse (DM Sans) for everything a user actually reads at length. The pairing is quiet on purpose: this is an operational tool, not an editorial one.

### Hierarchy
- **Title** (bold, `text-xl`–`text-2xl`, Manrope/`font-display`): dialog titles, the MAS CARE wordmark, page-level section headers (`text-petroleo`).
- **Section heading** (bold, `text-sm`, DM Sans): Kanban column headers, card-group labels — small and dense rather than large.
- **Body** (regular/medium, `text-sm`, DM Sans): form labels, table cells, the bulk of working UI text.
- **Label / Caption** (semibold, `text-xs`–`text-[11px]`, DM Sans): status chips, counts, helper text under headers.

### Named Rules
**The Display-Is-Rare Rule.** Manrope appears only on titles and the wordmark. Everything a user scans quickly — tables, forms, chips — stays in DM Sans so the two fonts never compete for the same job.

## Layout

A fixed 256px (`w-64`) dark sidebar on desktop, off-canvas on mobile behind a hamburger header (`h-[76px]`); main content is capped at `max-w-[1440px]` with `px-5` to `px-10` depending on breakpoint. Density is compact-but-breathable: cards use `p-4`–`p-6`, stacked content uses `gap-3`–`gap-4`. Tables and Kanban columns scroll internally rather than the page growing unbounded. Kanban columns snap-scroll horizontally on mobile (`w-[min(85vw,320px)]`) and flex to fill on wide screens.

## Elevation & Depth

Flat-by-default. Surfaces are distinguished by a 1px border (`border-border`) and a background change (white card vs. `surface`/`modulos` page), not by shadow. `shadow-card` exists but is a near-invisible 4% tint, used only to lift the selected dashboard metric card a notch above its resting border. Real shadows are reserved for things that visually float above the page: dialogs (`shadow-2xl`), dropdown/context menus (`shadow-lg`/`shadow-xl`), and toasts (`shadow-lg`).

### Shadow Vocabulary
- **Card hint** (`box-shadow: 0 2px 8px rgb(10 61 74 / 4%)`, token `shadow-card`): the only shadow allowed on a resting, non-overlay surface.
- **Overlay** (`shadow-lg` / `shadow-xl` / `shadow-2xl`): dialogs, dropdown menus, record-action menus, toasts. Nothing at rest on the page uses these.

### Named Rules
**The Flat-By-Default Rule.** A surface earns a real shadow only by floating above the page (dialog, menu, toast). Everything else reads through its border and background, not its shadow.

## Shapes

Three radius tiers, strictly by role: `rounded-lg` (8px) for anything you click repeatedly — buttons, inputs, sidebar links, kanban empty-slot borders; `rounded-xl` (12px) for containers — cards, sections, tables, kanban columns; `rounded-2xl` (16px) for things that overlay the page — dialogs, the 404/empty full-page panel. Pills (`rounded-full`) are reserved for status chips and small counters. Borders are always 1px and always `border-border` except for explicit semantic exceptions (status chips, danger button, empty-state dashed borders).

## Components

### Buttons
- **Shape:** `rounded-lg` (8px), fixed `h-10`, `px-4`, `text-sm font-semibold`.
- **Primary:** `bg-tealmax` → `hover:bg-petroleo`, white text, `shadow-sm`. The only button variant that should anchor a form or a primary flow.
- **Secondary (default):** white background, `border-border`, `text-ink`, hovers to `bg-surface`. Used for anything not the primary action.
- **Ghost:** transparent, `text-muted` → `hover:text-ink` + `hover:bg-white`. Used for icon-only chrome (close, menu toggle).
- **Danger:** `bg-red-50`/`border-red-200`/`text-red-800` → `hover:bg-red-100`. Destructive actions only.
- **Coral:** `bg-coral` → `hover:bg-coral/90`, white text, `shadow-sm`. A second "do this now" affordance distinct from primary teal — used sparingly.
- **Focus:** `ring-2 ring-tealmax ring-offset-2` on every variant; focus is always teal regardless of button color.

### Chips
- **Style:** `rounded-full`, 1px border, `px-2.5 py-1`, `text-xs font-semibold`.
- **State:** one fixed color trio per derived status (see Colors → Status); never a selected/unselected toggle, purely informational.

### Cards / Containers
- **Corner Style:** `rounded-xl` (12px).
- **Background:** white on the page's tinted neutral background; Kanban columns use a faint `bg-slate-50/80` instead of white to read as a bin, not a card.
- **Shadow Strategy:** none at rest; `shadow-card` only on the selected dashboard metric; `hover:shadow-sm` as a light affordance on interactive metric cards.
- **Border:** always 1px `border-border`; dashed `border-border` for empty states.
- **Internal Padding:** `p-4` (dense lists/filters) to `p-6` (standalone sections).

### Inputs / Fields
- **Style:** `rounded-lg`, `border-border`, white background, `h-10`, `px-3`, `text-sm`, label above in `text-sm font-medium`.
- **Focus:** border shifts to `tealmax` with a `ring-2 ring-tealmax/15` halo — never a glow or shadow.
- **Error:** border shifts to `red-400` (`aria-invalid`), helper text `text-xs text-red-700` below the field.

### Navigation
- **Style:** dark `bg-petroleo` sidebar, `w-64`, links `rounded-lg px-3 py-2.5 text-sm font-medium text-white/70`.
- **Active:** `bg-white/12 text-white`. **Hover:** `bg-white/8 text-white`.
- **Nested groups:** indented, left border `border-white/10`, chevron rotates 180° open.
- **Mobile:** sidebar slides off-canvas (`-translate-x-full`), opened via a `h-[76px]` header with a ghost hamburger button; a `bg-black/30` scrim closes it on outside tap.

### Dialogs
- **Shape:** `rounded-2xl`, `shadow-2xl`, `max-w-xl` (default) or `max-w-3xl` (`size="lg"`).
- **Header:** `border-b border-border`, title in `font-display text-petroleo text-xl font-bold`, close button is the `ghost` button variant.
- **Body:** scrolls independently of the header/footer; page scroll is locked while open.

## Do's and Don'ts

### Do:
- **Do** keep tealmax exclusive to primary actions and focus rings (The One Accent Rule).
- **Do** drive status color only through `StatusChip`'s map, matching the API's `derived_status` (The Status-Is-Not-Decoration Rule).
- **Do** use `shadow-card` (4% tint) at most — never a heavier shadow — on a surface that sits flat on the page.
- **Do** reserve Manrope/`font-display` for titles and the wordmark; everything else is DM Sans.

### Don't:
- **Don't** add `shadow-lg`/`shadow-xl`/`shadow-2xl` to a resting card, section, or table — those are for dialogs, menus, and toasts only.
- **Don't** introduce a second "primary" accent color; coral and danger-red are narrow exceptions, not alternatives to tealmax.
- **Don't** recompute a patient's status color client-side; it must come from the API's derived status, surfaced only through `StatusChip`.
- **Don't** use `cuidado` (reassurance green) for a button or large fill — it is reserved for the wordmark icon and the sidebar scrollbar tint.
