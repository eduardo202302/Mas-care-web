import { createContext } from 'react'

/** Hueco al pie del diálogo donde `FormActions` coloca sus botones, fuera del área con scroll. */
export const DialogFooterContext = createContext<HTMLElement | null>(null)

/** Id del <form> al que envían los botones de submit que viven en el pie (fuera del <form> en el DOM). */
export const FormOwnerContext = createContext<string | undefined>(undefined)
