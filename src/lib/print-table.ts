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
  user,
  title,
  headers,
  rows,
}: {
  company?: string
  branch?: string
  user?: string
  title: string
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
  const stamp = new Date().toLocaleString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const meta = (label: string, value: string) =>
    `<div><b>${label}:</b> <span class="v">${escapeHtml(value)}</span></div>`
  const header = `<div class="hdr"><div class="center">${company ? `<div class="org">${escapeHtml(company)}</div>` : ''}<div class="ttl">${escapeHtml(title)}</div></div><div class="meta"><div>${branch ? meta('Sucursal', branch) : ''}${user ? meta('Usuario', user) : ''}${meta('Fecha', stamp)}</div><div><b>Total de filas:</b> <span class="v">${rows.length}</span></div></div></div>`
  doc.open()
  doc.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page { size: landscape; margin: 0 }
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2937; font-size: 10px }
    .frame { width: 100%; border-collapse: collapse }
    .frame > thead > tr > td { padding: 12mm 12mm 0 }
    .frame > tbody > tr > td { padding: 0 12mm }
    .frame > tfoot > tr > td { height: 12mm }
    .frame > thead { display: table-header-group }
    .frame > tfoot { display: table-footer-group }
    .hdr { margin-bottom: 8px }
    .center { text-align: center; margin-bottom: 10px }
    .org { font-size: 20px; font-weight: 700; color: #111827 }
    .ttl { font-size: 13px; color: #6b7280 }
    .meta { display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px }
    .meta .v { color: #1e3a5f }
    table.data { width: 100%; border-collapse: collapse }
    .data th, .data td { border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; vertical-align: top }
    .data th { background: #f3f4f6; font-weight: 600 }
    .data tr { page-break-inside: avoid }
    .data thead { display: table-header-group }
  </style></head><body><table class="frame"><thead><tr><td>${header}</td></tr></thead><tbody><tr><td><table class="data"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></td></tr></tbody><tfoot><tr><td></td></tr></tfoot></table></body></html>`)
  doc.close()
  win.addEventListener('afterprint', () => frame.remove(), { once: true })
  win.focus()
  window.setTimeout(() => win.print(), 100)
}
