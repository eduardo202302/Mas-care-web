const MESSAGE_ATTR = 'data-required-hint'

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

function isField(target: EventTarget | null): target is Field {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  )
}

function clear(field: Field) {
  field.style.removeProperty('border-color')
  const next = field.nextElementSibling
  if (next?.hasAttribute(MESSAGE_ATTR)) next.remove()
}

function onInvalid(event: Event) {
  const field = event.target
  if (!isField(field)) return
  // Evita el globo nativo ("Completa este campo") y pinta el error en línea.
  event.preventDefault()
  const text = field.validity.valueMissing
    ? 'Campo requerido.'
    : field.validationMessage
  const existing = field.nextElementSibling
  if (existing?.hasAttribute(MESSAGE_ATTR)) {
    existing.textContent = text
  } else {
    const hint = document.createElement('p')
    hint.setAttribute(MESSAGE_ATTR, '')
    hint.setAttribute('role', 'alert')
    hint.className = 'text-xs text-red-700'
    hint.textContent = text
    field.insertAdjacentElement('afterend', hint)
  }
  field.style.borderColor = '#f87171'
}

function onEdit(event: Event) {
  if (isField(event.target) && event.target.validity.valid) clear(event.target)
}

/**
 * Formularios con `required` nativo: sustituye el globo del navegador por el
 * mensaje "Campo requerido." bajo cada campo vacío. Devuelve la función que
 * desmonta los listeners.
 */
export function installRequiredHints(root: Document = document) {
  root.addEventListener('invalid', onInvalid, true)
  root.addEventListener('input', onEdit, true)
  root.addEventListener('change', onEdit, true)
  return () => {
    root.removeEventListener('invalid', onInvalid, true)
    root.removeEventListener('input', onEdit, true)
    root.removeEventListener('change', onEdit, true)
  }
}
