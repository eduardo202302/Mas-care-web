import { createContext, useContext, useState, type ReactNode } from 'react'

const StatusDraftContext = createContext(false)

/**
 * Borrador del interruptor Activo/Inactivo de un formulario: el cambio no se
 * aplica hasta que el usuario pulsa Guardar. `changed` es verdadero cuando el
 * borrador difiere del estado actual del registro.
 */
export function useStatusDraft(current: boolean) {
  const [draft, setDraft] = useState<boolean | null>(null)
  return {
    value: draft ?? current,
    changed: draft !== null && draft !== current,
    set: (next: boolean) => setDraft(next === current ? null : next),
    reset: () => setDraft(null),
  }
}

/** Envuelve el diálogo (y su formulario) para que Guardar se habilite al cambiar solo el interruptor. */
export function StatusDraftProvider({
  changed,
  children,
}: {
  changed: boolean
  children: ReactNode
}) {
  return (
    <StatusDraftContext.Provider value={changed}>
      {children}
    </StatusDraftContext.Provider>
  )
}

/** Los formularios lo suman a su `unchanged`: hay un cambio de estado pendiente de guardar. */
export function useStatusDraftChanged() {
  return useContext(StatusDraftContext)
}
