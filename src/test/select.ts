import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

/** El `<select>` nativo oculto que guarda el valor de un `Select`. */
export function nativeSelectOf(control: HTMLElement): HTMLSelectElement {
  const native = control.parentElement?.querySelector('select')
  if (!native) throw new Error('El control no es un Select')
  return native
}

/** Elige una opción por su valor usando la interfaz real: abrir, escribir para filtrar y pulsar. */
export async function chooseOption(
  user: UserEvent,
  control: HTMLElement,
  value: string,
) {
  const option = Array.from(nativeSelectOf(control).options).find(
    (item) => item.value === value,
  )
  if (!option) throw new Error(`No existe la opción con valor "${value}"`)
  const label = (option.textContent ?? '').trim()
  await user.click(control)
  if (label) await user.type(control, label)
  const items = await screen.findAllByRole('option')
  const match = items.find((item) => item.textContent?.trim() === label)
  if (!match) throw new Error(`La lista no muestra "${label}"`)
  await user.click(match)
}
