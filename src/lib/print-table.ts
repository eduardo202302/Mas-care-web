const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Imprime una tabla de texto en un iframe aparte, sin depender del layout de la página. */
export function printTable({
  company,
  branch,
  title,
  subtitle,
  headers,
  rows,
}: {
  company?: string
  branch?: string
  title: string
  subtitle?: string
  headers: string[]
  rows: string[][]
}) {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  const win = frame.contentWindow
  if (!doc || !win) {
    frame.remove()
    return
  }
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
    )
    .join('')
  doc.open()
  doc.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page { size: landscape; margin: 12mm }
    body { font-family: Arial, sans-serif; color: #1f2937; font-size: 10px }
    .org { font-size: 13px; font-weight: 700; margin: 0 }
    .branch { margin: 0 0 8px; color: #374151 }
    h1 { font-size: 16px; margin: 0 0 2px }
    p { margin: 0 0 10px; color: #6b7280 }
    table { width: 100%; border-collapse: collapse }
    th, td { border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; vertical-align: top }
    th { background: #f3f4f6; font-weight: 600 }
    tr { page-break-inside: avoid }
    thead { display: table-header-group }
  </style></head><body>${company ? `<p class="org">${escapeHtml(company)}</p>` : ''}${branch ? `<p class="branch">Sucursal: ${escapeHtml(branch)}</p>` : ''}<h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle ?? '')}</p><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`)
  doc.close()
  win.addEventListener('afterprint', () => frame.remove(), { once: true })
  win.focus()
  window.setTimeout(() => win.print(), 100)
}
