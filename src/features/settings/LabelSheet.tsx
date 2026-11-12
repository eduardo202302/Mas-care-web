import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import {
  labelDims,
  labelElementStyle,
  labelElementText,
  type LabelDesign,
  type LabelValues,
} from './labelConfig'

/** Una etiqueta ya resuelta, con su tamaño físico real en pulgadas. */
export function LabelSheet({
  design,
  values,
  className,
}: {
  design: LabelDesign
  values: LabelValues | null
  className?: string
}) {
  const [w, h] = labelDims(design.widthIn, design.heightIn, design.orientation)
  return (
    <div
      className={cn('label-print-sheet relative bg-white', className)}
      style={{ width: `${w}in`, height: `${h}in`, overflow: 'hidden' }}
    >
      {design.elements.map((element) => (
        <div
          key={element.id}
          className="absolute leading-tight whitespace-pre-wrap"
          style={labelElementStyle(element)}
        >
          {labelElementText(element, values, 'print').text}
        </div>
      ))}
    </div>
  )
}

/**
 * Imprime solo la etiqueta: se monta directo en `<body>` (ahí `styles.css`
 * oculta todo lo demás al imprimir) y fija `@page` al tamaño real en pulgadas,
 * sin márgenes. En el diálogo de impresión del navegador la escala debe quedar
 * al 100 % (los navegadores no permiten forzarlo desde CSS).
 */
export function LabelPrint({
  design,
  values,
  onDone,
}: {
  design: LabelDesign
  values: LabelValues | null
  onDone: () => void
}) {
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const [w, h] = labelDims(design.widthIn, design.heightIn, design.orientation)

  useEffect(() => {
    const finish = () => doneRef.current()
    window.addEventListener('afterprint', finish, { once: true })
    const timer = window.setTimeout(() => window.print(), 50)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('afterprint', finish)
    }
  }, [])

  return createPortal(
    <div
      className="label-print-portal"
      style={{ width: `${w}in`, height: `${h}in` }}
    >
      <style>{`@page { size: ${w}in ${h}in; margin: 0; }`}</style>
      <LabelSheet design={design} values={values} />
    </div>,
    document.body,
  )
}
