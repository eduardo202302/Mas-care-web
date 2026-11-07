import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/cn'
import { Button } from './Button'

/** Encabezado que solo aparece al imprimir: empresa, fecha actual y quién imprime. */
function PrintHeader({ title }: { title: string }) {
  const organization = authClient.useActiveOrganization().data
  const user = authClient.useSession().data?.user
  const now = new Date()
  const day = new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(now)
  const hour12 = now.getHours() % 12 || 12
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const today = `${day} ${hour12}:${minutes} ${now.getHours() < 12 ? 'AM' : 'PM'}`
  return (
    <div className="mb-4 border-b border-slate-300 pb-3">
      <p className="text-lg font-bold">{organization?.name ?? 'Empresa'}</p>
      <p className="text-sm">{title}</p>
      <p className="mt-1 text-xs">
        Fecha: {today} · Impreso por: {user?.name || user?.email || '—'}
      </p>
    </div>
  )
}

/**
 * En pantalla es un contenedor normal; al imprimir es una tabla cuyo `thead`
 * el navegador repite en cada página. Deben ser etiquetas de tabla reales:
 * con `div` + `display: table-header-group` Chrome no lo repite.
 */
function PrintFrame({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <table className="block w-full print:table">
      <thead className="hidden print:table-header-group">
        <tr className="print:table-row">
          <td className="print:table-cell print:px-[12mm] print:pt-[12mm]">
            <PrintHeader title={title} />
          </td>
        </tr>
      </thead>
      <tbody className="block print:table-row-group">
        <tr className="block print:table-row">
          <td className="block print:table-cell print:px-[12mm]">{children}</td>
        </tr>
      </tbody>
      <tfoot className="hidden print:table-footer-group">
        <tr className="print:table-row">
          <td className="h-[12mm] print:table-cell" />
        </tr>
      </tfoot>
    </table>
  )
}

function printDialog() {
  // Con margen de página en 0 el navegador no escribe su propia línea
  // (fecha/título arriba, URL abajo); los márgenes los pone <PrintFrame>.
  const pageStyle = document.createElement('style')
  pageStyle.textContent = '@page { margin: 0 }'
  document.head.appendChild(pageStyle)
  document.body.classList.add('printing-dialog')
  window.addEventListener(
    'afterprint',
    () => {
      document.body.classList.remove('printing-dialog')
      pageStyle.remove()
    },
    { once: true },
  )
  window.print()
}

export function Dialog({
  title,
  titleAside,
  description,
  icon,
  dense = false,
  compactHeader = false,
  printable = false,
  onClose,
  children,
  size = 'md',
  bodyClassName,
}: {
  title: string
  /** Texto destacado a la derecha del título. */
  titleAside?: string
  description?: string
  icon?: ReactNode
  dense?: boolean
  compactHeader?: boolean
  /** Muestra un botón de imprimir en el encabezado y un encabezado de impresión. */
  printable?: boolean
  onClose: () => void
  children: ReactNode
  size?: 'md' | 'lg' | 'xl'
  bodyClassName?: string
}) {
  const compact = dense || compactHeader
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
      role="presentation"
      data-print-dialog={printable ? '' : undefined}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`animate-in border-border flex w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl ${dense ? '' : 'max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]'} ${size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`}
      >
        <header
          className={`border-border flex shrink-0 items-start justify-between gap-4 border-b ${compact ? 'px-5 py-3' : 'px-6 py-5'}`}
        >
          <div className={`flex items-start ${compact ? 'gap-3' : 'gap-4'}`}>
            {icon && (
              <div
                className={`bg-modulos text-cuidado flex shrink-0 items-center justify-center rounded-2xl ${compact ? 'size-10 rounded-xl' : 'size-14'}`}
              >
                {icon}
              </div>
            )}
            <div>
              <h2
                id={titleId}
                className={`font-display text-petroleo font-bold ${compact ? 'text-lg' : 'text-xl'}`}
              >
                {title}
                {titleAside && (
                  <span className="text-cuidado ml-2 font-semibold">
                    · {titleAside}
                  </span>
                )}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className={`text-muted text-sm ${compact ? 'mt-0.5' : 'mt-1'}`}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {printable && (
              <Button
                type="button"
                variant="ghost"
                aria-label="Imprimir formulario"
                title="Imprimir formulario"
                className="size-9 shrink-0 px-0"
                onClick={printDialog}
              >
                <Printer className="size-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              aria-label="Cerrar"
              className="size-9 shrink-0 px-0"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>
        <div
          className={cn(
            'min-h-0 flex-1',
            dense ? 'px-5 pt-2 pb-4' : 'app-scroll overflow-y-auto px-6 py-5',
            bodyClassName,
          )}
        >
          {printable ? (
            <PrintFrame title={title}>{children}</PrintFrame>
          ) : (
            children
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}
