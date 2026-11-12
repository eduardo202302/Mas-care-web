import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/cn'
import { useMe } from '@/lib/permissions'
import { useUiStore } from '@/stores/ui-store'
import { Button } from './Button'
import { DialogSections } from './ModalSection'

/** Encabezado que solo aparece al imprimir: empresa, título, sucursal, quién imprime y fecha. */
function PrintHeader({ title }: { title: string }) {
  const organization = authClient.useActiveOrganization().data
  const user = authClient.useSession().data?.user
  const { data: me } = useMe()
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const branches = me?.branches ?? []
  const branch =
    branches.find((item) => item.id === activeBranchId)?.name ??
    (branches.length > 1 ? 'Todas las Sucursales' : branches[0]?.name)
  const stamp = new Date().toLocaleString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return (
    <div className="mb-4">
      <div className="mb-3 text-center">
        <p className="text-xl font-bold">{organization?.name ?? 'Empresa'}</p>
        <p className="text-sm text-slate-500">{title}</p>
      </div>
      <div className="text-xs">
        {branch && (
          <p>
            <b>Sucursal:</b> {branch}
          </p>
        )}
        <p>
          <b>Usuario:</b> {user?.name || user?.email || '—'}
        </p>
        <p>
          <b>Fecha:</b> {stamp}
        </p>
      </div>
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
  headerContent,
  panelClassName,
  headerClassName,
  footer,
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
  size?: 'md' | 'lg' | 'xl' | 'full'
  bodyClassName?: string
  /** Fila extra bajo el título, dentro del encabezado. */
  headerContent?: ReactNode
  panelClassName?: string
  headerClassName?: string
  /** Barra fija al final del diálogo, fuera del área con scroll. */
  footer?: ReactNode
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
      // React burbuja los eventos del portal hasta el <form> que contiene al
      // diálogo: sin esto, guardar aquí también enviaría el formulario padre.
      onSubmit={(event) => event.stopPropagation()}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          `animate-in border-border flex w-full flex-col overflow-hidden rounded-2xl border bg-[#EAF7F0] shadow-2xl ${size === 'full' ? 'h-[calc(100dvh-2rem)] sm:h-[calc(100dvh-3rem)]' : dense ? '' : 'max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]'} ${size === 'full' ? 'lg:max-w-[75%]' : size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`,
          panelClassName,
        )}
      >
        <header
          className={cn(
            `border-border flex shrink-0 flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b ${compact ? 'px-5 py-3' : 'px-6 py-5'}`,
            headerClassName,
          )}
        >
          <div
            className={`flex min-w-0 flex-1 items-start ${compact ? 'gap-3' : 'gap-4'}`}
          >
            {icon && (
              <div
                className={`bg-modulos text-cuidado flex shrink-0 items-center justify-center rounded-2xl ${compact ? 'size-10 rounded-xl' : 'size-14'}`}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
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
          {headerContent && (
            <div className="order-last w-full">{headerContent}</div>
          )}
        </header>
        <div
          className={cn(
            'min-h-0 flex-1',
            dense ? 'px-5 pt-2 pb-4' : 'app-scroll overflow-y-auto px-6 py-5',
            bodyClassName,
          )}
        >
          <DialogSections>
            {printable ? (
              <PrintFrame title={title}>{children}</PrintFrame>
            ) : (
              children
            )}
          </DialogSections>
        </div>
        {footer && <div className="shrink-0">{footer}</div>}
      </section>
    </div>,
    document.body,
  )
}
