# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: owners and administrators of pharmacy chains, who supervise several branches, configure the system (roles, menu, thresholds, automation) and read consolidated panels and reports. Day-to-day staff (pharmacist, operator, read-only) also use it at the counter; their roles exist in the product but were not named as the primary audience.

## Product Purpose
MAS CARE manages pharmacies that follow patients on continuous-use treatments. It tracks each treatment's coverage and refill cycle so the pharmacy sees who is about to run out of medication and acts before they do. Success: fewer patients left without medication, less manual follow-up.

## Positioning
Refill tracking: coverage is computed per treatment, a derived status (vence pronto, vencido, próxima reposición) drives a Kanban board and a dashboard, and notices are prepared ahead of the end of coverage. A generic pharmacy system or spreadsheet does not model the refill cycle.

## Operating Context
Spanish-language web app (Dominican Republic defaults: timezone America/Santo_Domingo, country code DO). Multi-organization, multi-branch, with role-based menu and permissions served by the API. Notices go through WhatsApp and Telegram with consent, a time window and retries; the app does not send automatically unless automation is enabled.

## Capabilities and Constraints
- Screens: dashboard (`/inicio`, `/panel-global`), Kanban board (`/tablero`), patients, medications, incidents, tasks, transfers, reports, companies, notices (`/avisos`), settings (users, branches, templates, time parameters, roles, menu, stock, stages, properties, automation).
- Stack: React 19, Vite, TanStack Query, React Hook Form, Zod, Tailwind 4, pnpm; consumes `max-care-api` (repo name kept; product name is MAS CARE).
- Tenant isolation by organization and branch; the API is the source of truth for status calculation, menu and permissions.
- Open decision: no visual direction, no native app (web only).

## Brand Commitments
Name: MAS CARE (uppercase, in the UI and API texts). Existing UI uses the `HeartPulse` mark and the petroleo/tealmax/cuidado color tokens; not confirmed as binding.

## Evidence on Hand
Working code and a Spanish README in the repo; demo seed data only. No testimonials, customers, benchmarks or pricing exist; do not fabricate them.

## Product Principles
- Surface what needs action today first: overdue and due-soon treatments before everything else.
- Status comes from the API's rules, never recomputed differently in the UI.
- Respect consent and time windows: the product prepares notices, people decide to send unless automation is on.
- One organization's data never appears in another's.

## Accessibility & Inclusion
Desktop and mobile web; target WCAG AA (contrast, keyboard operation, labels). Interface language is Spanish.
