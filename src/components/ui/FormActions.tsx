import {
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { DialogFooterContext, FormOwnerContext } from './dialog-footer'

export function FormActions({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const slot = useContext(DialogFooterContext)
  const generatedId = useId()
  const marker = useRef<HTMLSpanElement>(null)
  const [formId, setFormId] = useState<string>()

  // En un diálogo los botones van al pie, fuera del <form> en el DOM: el botón
  // de guardar envía el formulario por su id (atributo `form`).
  useLayoutEffect(() => {
    const form = marker.current?.closest('form')
    if (!form) return
    if (!form.id) form.id = generatedId
    setFormId(form.id)
  }, [generatedId, slot])

  if (!slot) {
    return (
      <div
        className={cn(
          'border-border sticky -bottom-5 z-10 -mx-6 -mb-5 flex flex-col-reverse gap-2 border-t bg-[#EAF7F0] px-6 py-4 sm:flex-row sm:justify-end',
          className,
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <>
      <span ref={marker} hidden />
      {createPortal(
        <FormOwnerContext.Provider value={formId}>
          <div
            className={cn(
              'border-border flex flex-col-reverse gap-2 border-t bg-[#EAF7F0] px-6 py-4 sm:flex-row sm:justify-end',
              className,
            )}
          >
            {children}
          </div>
        </FormOwnerContext.Provider>,
        slot,
      )}
    </>
  )
}
