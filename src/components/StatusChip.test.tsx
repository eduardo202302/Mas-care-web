import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { StatusChip } from './StatusChip'
import { statusLabels } from './status-labels'

afterEach(cleanup)

describe('StatusChip', () => {
  it('renderiza los seis estados', () => {
    render(
      <>
        {statusLabels.map((status) => (
          <StatusChip key={status} status={status} />
        ))}
      </>,
    )
    for (const status of statusLabels)
      expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('solo Vencido usa el estilo rojo', () => {
    render(
      <>
        {statusLabels.map((status) => (
          <StatusChip key={status} status={status} />
        ))}
      </>,
    )
    expect(screen.getByText('Vencido')).toHaveClass('bg-expired-bg')
    for (const status of statusLabels)
      if (status !== 'Vencido')
        expect(screen.getByText(status)).not.toHaveClass('bg-expired-bg')
  })
})
