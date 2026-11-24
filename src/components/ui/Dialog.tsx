import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Printer, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/cn'
import { useMe } from '@/lib/permissions'
import { useUiStore } from '@/stores/ui-store'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'
import { DialogFooterContext } from './dialog-footer'
import { DialogSections } from './ModalSection'

/** Encabezado que solo aparece al imprimir: empresa, título, sucursal, quién imprime y fecha. */
export function PrintHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
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
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
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
export function PrintFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <table className="block w-full print:table">
      <thead className="hidden print:table-header-group">
        <tr className="print:table-row">
          <td className="print:table-cell print:px-[12mm] print:pt-[12mm]">
            <PrintHeader title={title} subtitle={subtitle} />
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

export function printDialog() {
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

const DirtyContext = createContext<() => void>(() => undefined)

/** Controles personalizados avisan al diálogo de que el usuario modificó algo. */
export function useDialogDirty() {
  return useContext(DirtyContext)
}

/**
 * Tras enviar un formulario, lleva la vista al primer campo con error. Espera a
 * que la validación termine y a que `ModalSection` abra su tarjeta si estaba
 * contraída; un foco inmediato no funciona sobre un campo oculto.
 */
function revealFirstInvalid(root: HTMLElement) {
  let frames = 0
  const seek = () => {
    const field = root.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (field && field.getClientRects().length > 0) {
      field.scrollIntoView({ block: 'center', behavior: 'smooth' })
      field.focus({ preventScroll: true })
      return
    }
    if (++frames < 30) requestAnimationFrame(seek)
  }
  window.setTimeout(seek, 80)
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
  headerAction,
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
  size?: 'md' | 'lg' | 'xl' | '2xl' | 'full'
  bodyClassName?: string
  /** Fila extra bajo el título, dentro del encabezado. */
  headerContent?: ReactNode
  /** Control a la izquierda de los botones del encabezado (p. ej. interruptor Activo/Inactivo). */
  headerAction?: ReactNode
  panelClassName?: string
  headerClassName?: string
  /** Barra fija al final del diálogo, fuera del área con scroll. */
  footer?: ReactNode
}) {
  const compact = dense || compactHeader
  const [footerSlot, setFooterSlot] = useState<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const dirty = useRef(false)
  const pendingClose = useRef<HTMLElement | null>(null)
  const bypass = useRef(false)
  const [confirmingExit, setConfirmingExit] = useState(false)
  // Solo los diálogos con formulario piden confirmación, y solo si el usuario tocó algo.
  const needsConfirm = () =>
    dirty.current && Boolean(rootRef.current?.querySelector('form'))
  const inside = (node: EventTarget | null) =>
    node instanceof Node && Boolean(rootRef.current?.contains(node))
  function requestClose() {
    if (needsConfirm()) {
      pendingClose.current = null
      setConfirmingExit(true)
    } else onClose()
  }
  function confirmExit() {
    setConfirmingExit(false)
    const button = pendingClose.current
    pendingClose.current = null
    if (!button) return onClose()
    bypass.current = true
    button.click()
    bypass.current = false
  }
  function trackChange(event: { target: EventTarget }) {
    const target = event.target as HTMLElement
    if (!inside(target) || target.closest('[data-no-dirty]')) return
    if ((target as HTMLInputElement).type === 'search') return
    dirty.current = true
  }
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
  return createPortal(
    <DirtyContext.Provider
      value={() => {
        dirty.current = true
      }}
    >
      <div
        ref={rootRef}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:p-6"
        role="presentation"
        data-print-dialog={printable ? '' : undefined}
        // React burbuja los eventos del portal hasta el <form> que contiene al
        // diálogo: sin esto, guardar aquí también enviaría el formulario padre.
        onSubmit={(event) => event.stopPropagation()}
        onSubmitCapture={(event) => revealFirstInvalid(event.currentTarget)}
        onInputCapture={trackChange}
        onChangeCapture={trackChange}
        onClickCapture={(event) => {
          if (bypass.current || !needsConfirm()) return
          const button = (event.target as HTMLElement).closest<HTMLElement>(
            '[data-dialog-close]',
          )
          if (!button || !inside(button)) return
          event.preventDefault()
          event.stopPropagation()
          pendingClose.current = button
          setConfirmingExit(true)
        }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose()
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            `animate-in border-border flex w-full flex-col overflow-hidden rounded-2xl border bg-[#EAF7F0] shadow-2xl ${size === 'full' || !dense ? 'h-[calc(100dvh-2rem)] sm:h-[calc(100dvh-3rem)]' : ''} ${size === 'full' ? 'lg:max-w-[75%]' : size === '2xl' ? 'max-w-7xl' : size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'}`,
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
                  title={titleAside ? `${title} · ${titleAside}` : title}
                  className={`font-display text-petroleo truncate font-bold ${compact ? 'text-lg' : 'text-xl'}`}
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
              {headerAction && <div className="mr-2">{headerAction}</div>}
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
                className="size-9 shrink-0 px-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={requestClose}
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
            <DialogFooterContext.Provider value={footerSlot}>
              <DialogSections>
                {printable ? (
                  <PrintFrame
                    title={titleAside ? `${title} · ${titleAside}` : title}
                    subtitle={description}
                  >
                    {children}
                  </PrintFrame>
                ) : (
                  children
                )}
              </DialogSections>
            </DialogFooterContext.Provider>
          </div>
          {footer && <div className="shrink-0">{footer}</div>}
          <div ref={setFooterSlot} className="shrink-0 empty:hidden" />
        </section>
        {confirmingExit && (
          <ConfirmDialog
            title="Salir Del Formulario"
            description="¿Está seguro de que desea salir del formulario? Tiene cambios pendientes por guardar que se perderán si continúa."
            confirmLabel="Salir"
            confirmPrimary
            onConfirm={confirmExit}
            onClose={() => setConfirmingExit(false)}
          />
        )}
      </div>
    </DirtyContext.Provider>,
    document.body,
  )
}
