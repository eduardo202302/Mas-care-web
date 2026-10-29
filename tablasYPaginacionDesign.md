# Tables & server pagination design system

Reusable contract for every server-backed table in the app: how rows are
sorted (branch-first), how the footer looks (pagination left, page-size
right), and how page/row-size changes talk to the API. Introduced while
migrating the cycles table (`src/features/board/CycleTable.tsx`) off its old
cursor-based "Cargar más" pattern and onto the same offset-paged contract the
patients list (`src/features/patients/PatientsPage.tsx`) already used. Both
are now the reference implementations; any new table (treatments, incidents,
tasks, transfers, reports…) should follow this pattern instead of inventing
cursor pagination, infinite scroll, or a one-off footer.

## Branch-first ordering

Every table that can span more than one sucursal always sorts by branch
first, then by whatever the user picked (or the table's own default sort).
This lets a multi-branch user read one sucursal at a time instead of having
rows from different branches interleaved.

Backend (`Nueva carpeta/src/modules/board/service.ts`):

```ts
function tableOrder(sort?: string[]): Prisma.RefillCycleOrderByWithRelationInput[] {
  const rest: Prisma.RefillCycleOrderByWithRelationInput[] = !sort?.length ? tableOrderBy : [...sort.map((part) => {
    const [field, dir] = part.split(':') as [string, 'asc' | 'desc'];
    return sortMap[field]!(dir);
  }), { id: 'asc' as const }];
  return [{ branchId: 'asc' as const }, ...rest];
}
```

Same convention in `Nueva carpeta/src/modules/patients/router.ts`'s
`patientOrder()`: `{ primaryBranchId: 'asc' }` is always the first entry,
whether or not the user picked a sort.

- Branch-first is **not** user-configurable and is **not** exposed as a sort
  field — it is always prepended server-side, so a client can't accidentally
  drop it.
- This only applies to the *table* views. The kanban board
  (`/api/v1/board`, `/api/v1/board/columns/:status`) keeps its own ordering
  (`cardOrderBy`/`tableOrderBy` used by the board, untouched) — the board
  groups by column/stage, not by a flat row order, so branch-first grouping
  doesn't apply there.
- The column order follows the same idea: every `ColumnDef[]` for a
  server-paged table puts `{ key: 'branch', label: 'Sucursal' }` first
  (see `cycleColumns` in `src/lib/cycle-table.ts` and `patientColumns` in
  `PatientsPage.tsx`). Branch is the first thing the eye should find in both
  the data's order and its visual column.

## Pagination contract (page + rows, not cursors)

Every table list endpoint speaks the same three query params and response
shape, built on the shared backend helper
`Nueva carpeta/src/infra/pagination.ts`:

```ts
// request:  ?page=1&rows=15&...filters
// response: { data: T[], total: number, page: number, rows: number }
```

- `page` is 1-based, defaults to `1`.
- `rows` defaults to `15` (`DEFAULT_ROWS` backend-side,
  `PAGE_ROWS` in `src/lib/paging.ts` frontend-side) and is user-selectable
  from `20, 30, 40, 50` (`PAGE_ROWS_OPTIONS` in `src/lib/paging.ts`).
- The response always includes `total`, so the client can compute page count
  and show "Página X de Y" without a second request.
- A route adopts this contract by spreading `...pagingFields` into its query
  schema and calling `paginate()` instead of hand-rolling cursor math:

```ts
// Nueva carpeta/src/schemas/board.ts
export const cycleListQuery = z.object({
  ...boardFilterFields,
  ...cycleTableFields,
  status: z.enum(refillCycleStatuses).optional(),
  ...pagingFields,
}).strict();
```

```ts
// Nueva carpeta/src/modules/board/service.ts
export async function tableData(tenant: Tenant, query: z.infer<typeof cycleListQuery>) {
  return withTenant(tenant.organizationId, async (tx) => {
    // ...build `where`...
    const result = await paginate(
      query,
      (args) => tx.refillCycle.findMany({ where, orderBy: tableOrder(query.sort), take: args.take, skip: args.skip }),
      () => tx.refillCycle.count({ where }),
    );
    const data = await presentCycleCards(tx, result.data, settings, today);
    return { status: query.status ?? null, data, total: result.total, page: result.page, rows: result.rows };
  });
}
```

- This is strictly for **table** endpoints. The kanban board's
  `/api/v1/board/columns/:status` keeps its own cursor+`next_cursor`
  "load more" contract — a column is an open-ended feed the user scrolls,
  not a page-numbered table, so cursor pagination is still the right fit
  there and was intentionally left untouched.

## Frontend: `useQuery` with `page`/`rows` state, not `useInfiniteQuery`

A paged table owns two pieces of state and rebuilds its query key from them,
so **every** page change or rows-per-page change becomes a fresh request —
no client-side slicing of an already-fetched list:

```tsx
const [page, setPage] = useState(1)
const [rows, setRows] = useState(PAGE_ROWS)

const params = () => {
  const search = boardFiltersToSearch(filters)
  tableFiltersToSearch(tableFilters, sort, search)
  search.set('page', String(page))
  search.set('rows', String(rows))
  return search
}
const table = useQuery({
  queryKey: ['cycles', params().toString()],
  queryFn: () => api<CycleTableResponse>(`/api/v1/cycles?${params().toString()}`),
})
```

- **Any** filter, search, or sort change must also reset `page` to `1`
  (a stale page number from a narrower result set would 404/empty-page).
  In `CycleTable.tsx` this is centralized in one `setFiltersAndResetPage()`
  helper used by every filter-mutating call site, plus a small `useEffect`
  that resets the page whenever the parent-controlled board filters change:

  ```tsx
  const setFiltersAndResetPage = (next: TableFilters) => {
    setTableFilters(next)
    setPage(1)
  }
  const boardFiltersKey = boardFiltersToSearch(filters).toString()
  useEffect(() => setPage(1), [boardFiltersKey])
  ```

- Changing the rows-per-page selector resets `page` to `1` too (the old
  page number is almost certainly out of range for a new page size):

  ```tsx
  onRowsChange={(next) => { setRows(next); setPage(1) }}
  ```
- Because `page`/`rows` are part of the TanStack Query key, every change to
  either naturally triggers a new network request — there is no manual
  `refetch()` or client-side pagination to maintain.

## Footer layout: pagination left, page-size right

The `<Pagination>` component (`src/components/Pagination.tsx`) is the one
footer every paged table renders, always, even when there's only one page —
so the rows-per-page selector stays reachable:

```tsx
<Pagination
  page={page}
  rows={rows}
  total={total}
  onChange={setPage}
  onRowsChange={(next) => { setRows(next); setPage(1) }}
  disabled={table.isFetching}
/>
```

Layout: `justify-between` — prev/next buttons plus the
"`{from}–{to} de {total} · Página {page} de {pages}`" count sit on the
**left**; the rows-per-page `<select>` (`15/20/30/40/50`) sits on the
**right**. This matches the brief literally: pagination (forward/back) and
page count on the left, rows-shown control on the right.

`onRowsChange` is optional — pass nothing to render a plain prev/next
footer without a page-size selector (e.g. a small lookup list that is
always paginated at a fixed size).

### Where the footer lives

The footer renders **inside** the table's own bordered card, right after
the rows (or the empty state) — never as a separate floating element below
it — so it visually reads as the table's own footer, not an unrelated
control bar.

- `CycleTable.tsx` renders its own `<section className="border-border ... rounded-xl border bg-white">`, so `<Pagination>` is simply its last child.
- The generic `<DataTable>` (`src/components/DataTable.tsx`), used by
  Patients, Branches, Users, Roles, etc., gained an optional `footer?: ReactNode`
  prop for exactly this: it's rendered inside the same bordered card, after
  the `<table>` (or after the `EmptyState`, when there are no rows):

  ```tsx
  <DataTable
    columns={...}
    rows={tableRows}
    footer={
      <Pagination page={page} rows={rows} total={total} onChange={setPage}
        onRowsChange={(next) => { setRows(next); setPage(1) }} />
    }
  />
  ```

## Board page layout tweaks that came with this pass

- `BoardPage.tsx`'s root wrapper got `-mt-4` so "Operación diaria" sits
  closer to the top of the content area without touching the shared
  `AppLayout`'s `py-8` (which every other page still needs).
- The board subtitle ("Mueve cada ciclo por avisar…") dropped `max-w-2xl`
  and gained `whitespace-nowrap`, so it always renders on one line instead
  of wrapping at narrower widths.

## Checklist for a new server-paged table

1. Backend: spread `...pagingFields` into the route's query schema, call
   `paginate()`, and return `{ data, total, page, rows }` — not a
   hand-rolled cursor.
2. Backend: make the `orderBy` always prepend the branch field
   (`{ branchId: 'asc' }` / `{ primaryBranchId: 'asc' }`) ahead of any
   user-chosen sort, unless the table is intentionally single-branch-scoped.
3. Frontend column list: put the branch column first.
4. Frontend data hook: `useQuery` keyed on every filter *and* `page`/`rows`
   — never `useInfiniteQuery` for a page-numbered table.
5. Every filter/search/sort setter that isn't `page` or `rows` itself must
   also reset `page` to `1`.
6. Rows-per-page changes reset `page` to `1`.
7. Render `<Pagination>` inside the table's own card as its last child
   (directly, or via `<DataTable footer={...}>`), always — not conditionally
   hidden on a single page.
8. Default `rows` to `PAGE_ROWS` (15); offer `PAGE_ROWS_OPTIONS`
   (15/20/30/40/50) when the table lets the user change it.
