/** Rows requested per page by every table; the first request is page 1. */
export const PAGE_ROWS = 15

/** Builds a query string, skipping empty values. */
export function pageQuery(
  params: Record<string, string | number | undefined | null>,
) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '')
      search.set(key, String(value))
  }
  return search.toString()
}
