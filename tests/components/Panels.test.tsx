import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChartPanel } from '../../src/components/ChartPanel.tsx'
import { curatedRows, defaultPrices } from '../../src/data/load.ts'
import { markersFor, panelRows, toChartRow } from '../../src/lib/chart.ts'
import { barWidthPercent } from '../../src/lib/calc.ts'
import { formatKm } from '../../src/lib/format.ts'

const rows = curatedRows.map((row) =>
  toChartRow(row, { prices: defaultPrices, realWorld: false, annualKm: 15000 }),
)

function renderPanel(panel: 'A' | 'B') {
  const panelRowList = panelRows(rows, panel)
  return {
    panels: render(
      <ChartPanel
        panel={panel}
        title="Test"
        subtitle="Test"
        rows={panelRowList}
        markers={markersFor(true)}
        language="sl"
      />,
    ),
    panelRowList,
  }
}

describe('the two panels', () => {
  it('renders every curated row of the panel', () => {
    const { panels } = renderPanel('A')
    expect(within(panels.container).getAllByTestId('chart-row')).toHaveLength(31)
    expect(screen.getByTestId('panel-A')).toBeInTheDocument()
  })

  it('sorts rows longest bar first', () => {
    const { panels, panelRowList } = renderPanel('B')
    const km = panelRowList.map((row) => row.km)
    expect(km).toEqual([...km].sort((left, right) => right - left))
    const printed = within(panels.container)
      .getAllByTestId('chart-row')
      .map((row) => row.textContent ?? '')
    expect(printed[0]).toContain(formatKm(panelRowList[0]!.km))
  })

  it('sizes each bar from its km value', () => {
    const { panels, panelRowList } = renderPanel('A')
    const bars = within(panels.container).getAllByTestId('bar')
    expect(bars).toHaveLength(panelRowList.length)
    bars.forEach((bar, index) => {
      expect(bar.style.width).toBe(`${barWidthPercent(panelRowList[index]!.km)}%`)
    })
  })

  it('prints numbers that match an independent recomputation from the CSV', () => {
    const { panels, panelRowList } = renderPanel('A')
    const printed = within(panels.container)
      .getAllByTestId('chart-row')
      .map((row) => row.textContent ?? '')
    panelRowList.forEach((row, index) => {
      const price =
        row.powertrain === 'elektrika' ? 0.1807 : row.powertrain === 'dizel' ? 1.935 : 1.627
      const consumption =
        curatedRows.find((source) => source.model === row.model && source.variant === row.variant)!
          .consumption *
        (curatedRows.find((s) => s.model === row.model && s.variant === row.variant)!.basis ===
        'nedc'
          ? 1.21
          : 1)
      const km = 10000 / (price * consumption)
      expect(printed[index]).toContain(`${formatKm(km)} km`)
    })
  })

  it('shows a public-charging ghost only on electric rows', () => {
    const { panels } = renderPanel('A')
    const ghosts = within(panels.container).queryAllByTestId('ghost')
    const electricRows = rows.filter((row) => row.panel === 'A' && row.powertrain === 'elektrika')
    expect(ghosts).toHaveLength(electricRows.length)
    expect(electricRows.length).toBeGreaterThan(0)
  })

  it('draws the chart as HTML, with no svg or canvas', () => {
    const { panels } = renderPanel('A')
    expect(panels.container.querySelector('svg')).toBeNull()
    expect(panels.container.querySelector('canvas')).toBeNull()
  })
})
