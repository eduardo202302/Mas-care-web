import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Dialog } from './Dialog'

afterEach(cleanup)

it('no propaga el submit de un formulario del diálogo al formulario que lo contiene', () => {
  const outer = vi.fn((event: { preventDefault: () => void }) =>
    event.preventDefault(),
  )
  const inner = vi.fn((event: { preventDefault: () => void }) =>
    event.preventDefault(),
  )
  render(
    <QueryClientProvider client={new QueryClient()}>
      <form onSubmit={outer}>
        <Dialog title="Cambiar Dosis" onClose={() => {}}>
          <form aria-label="interno" onSubmit={inner}>
            <button type="submit">Guardar</button>
          </form>
        </Dialog>
      </form>
    </QueryClientProvider>,
  )
  fireEvent.submit(screen.getByRole('form', { name: 'interno' }))
  expect(inner).toHaveBeenCalledTimes(1)
  expect(outer).not.toHaveBeenCalled()
})
