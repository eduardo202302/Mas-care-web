import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MetricCard } from './MetricCard'

afterEach(() => cleanup())

describe('MetricCard', () => {
  it('muestra "Sin datos" cuando percentage es null, nunca 0% ni 100%', () => {
    render(
      <MetricCard
        label="Adherencia global"
        numerator={0}
        denominator={0}
        percentage={null}
      />,
    )
    expect(screen.getByText('Sin datos')).toBeInTheDocument()
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
    expect(screen.queryByText('100%')).not.toBeInTheDocument()
  })

  it('muestra el porcentaje real y el numerador/denominador cuando hay datos', () => {
    render(
      <MetricCard
        label="Adherencia global"
        numerator={174}
        denominator={200}
        percentage={87}
      />,
    )
    expect(screen.getByText(/87%/)).toBeInTheDocument()
    expect(screen.getByText(/174 de 200/)).toBeInTheDocument()
  })
})
