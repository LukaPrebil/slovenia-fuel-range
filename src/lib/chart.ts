import type { EnergyPrices } from './calc.ts'
import { consumptionFor, eurPer100km, kmPer100Eur, priceFor } from './calc.ts'
import type { CuratedRow, PanelId, Powertrain } from './types.ts'

export type ChartRow = {
  key: string
  panel: PanelId
  model: string
  variant: string
  powertrain: Powertrain
  count: number
  consumption: number
  km: number
  eurPer100: number
  /** EV rows also show what public charging costs them. */
  publicKm: number | null
  personal: boolean
}

export type RowOptions = {
  prices: EnergyPrices
  realWorld: boolean
}

export function toChartRow(row: CuratedRow, options: RowOptions): ChartRow {
  const consumption = consumptionFor(row, options.realWorld)
  const price = priceFor(row.powertrain, options.prices)
  return {
    key: `${row.panel}-${row.rank}-${row.model}-${row.variant}`,
    panel: row.panel,
    model: row.model,
    variant: row.variant,
    powertrain: row.powertrain,
    count: row.count,
    consumption,
    km: kmPer100Eur(price, consumption),
    eurPer100: eurPer100km(price, consumption),
    publicKm:
      row.powertrain === 'elektrika'
        ? kmPer100Eur(options.prices.javnoPolnjenje, consumption)
        : null,
    personal: false,
  }
}

/** Bars run longest first inside a panel, whatever the source ranking says. */
export function panelRows(rows: ChartRow[], panel: PanelId): ChartRow[] {
  return rows.filter((row) => row.panel === panel).sort((left, right) => right.km - left.km)
}

/** Road km from Ljubljana, OSRM. */
export const MARKERS = [
  { km: 376, label: 'Dunaj' },
  { km: 756, label: 'Rim' },
  { km: 1250, label: 'Pariz' },
  { km: 2619, label: 'Lizbona' },
] as const

export function markersFor(compact: boolean): { km: number; label: string }[] {
  return MARKERS.filter((marker) => !compact || marker.km >= 1250).map((marker) => ({ ...marker }))
}
