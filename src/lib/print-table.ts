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
  imageUrl,
}: {
  company?: string
  branch?: string
  user?: string
  title: string
  headers: string[]
  rows: string[][]
  /** Imagen que se imprime sola en una hoja aparte, después de la tabla. */
  imageUrl?: string
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
    @page { margin: 0 }
    body { margin: 0; font-family: 'Noto Sans', 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact }
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
    .meta .v { color: #374151 }
    table.data { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #d9d9d9; border-radius: 6px }
    .data th, .data td { border-left: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; padding: 4px 6px; text-align: left; vertical-align: top }
    .data th:not(:last-child), .data td:not(:last-child) { width: 1%; white-space: nowrap }
    .data th:first-child, .data td:first-child { border-left: 0 }
    .data tbody tr:last-child td { border-bottom: 0 }
    .data th { background: #c8c8c8; color: #1f2937; font-weight: 700; border-bottom: 0; border-left-color: #d9d9d9 }
    .data th:first-child { border-top-left-radius: 5px }
    .data th:last-child { border-top-right-radius: 5px }
    .data tbody tr:last-child td:first-child { border-bottom-left-radius: 5px }
    .data tbody tr:last-child td:last-child { border-bottom-right-radius: 5px }
    .data tr { page-break-inside: avoid }
    .data thead { display: table-header-group }
    .img-page { break-before: page; height: 95vh; display: flex; align-items: center; justify-content: center; padding: 12mm; box-sizing: border-box }
    .img-page img { max-width: 100%; max-height: 100%; object-fit: contain }
  </style></head><body><table class="frame"><thead><tr><td>${header}</td></tr></thead><tbody><tr><td><table class="data"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></td></tr></tbody><tfoot><tr><td></td></tr></tfoot></table>${imageUrl ? `<div class="img-page"><img src="${escapeHtml(imageUrl)}"></div>` : ''}</body></html>`)
  doc.close()
  win.addEventListener('afterprint', () => frame.remove(), { once: true })
  const run = () => {
    win.focus()
    win.print()
  }
  const img = doc.querySelector('img')
  if (img && !img.complete) {
    img.onload = run
    img.onerror = run
  } else window.setTimeout(run, 100)
}
