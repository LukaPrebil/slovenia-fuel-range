import type { CatalogueEntry } from '../../src/lib/types.ts'
import type { RawCatalogueRow, RawSheet } from './arso-xlsx.ts'
import { ARSO_SOURCE_URL } from './arso-xlsx.ts'

export type { CatalogueEntry }

/**
 * One file has one source and one edition, so provenance is stored once at the
 * top instead of on 3000 rows. The validator enforces both fields.
 */
export type CatalogueFile = {
  sourceUrl: string
  asOf: string
  entries: CatalogueEntry[]
}

/**
 * Fuel codes are the sheet's own vocabulary. A plug-in hybrid carries an
 * electric figure next to its fuel figure and is left out on purpose: its
 * official consumption is between 240 % and 500 % below what it burns.
 */
export function mapPowertrain(row: RawCatalogueRow): CatalogueEntry['powertrain'] | null {
  const hasElectric = row.electric !== null
  switch (row.fuelCode) {
    case 'bencin':
      return 'bencin'
    case 'dizel':
      return 'dizel'
    case 'EE':
      return 'elektrika'
    case 'bencin/EE':
    case 'dizel/EE':
      return hasElectric ? null : 'hibrid'
    default:
      return null
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function buildCatalogue(sheet: RawSheet): CatalogueFile {
  const entries = new Map<string, CatalogueEntry>()
  for (const row of sheet.rows) {
    const powertrain = mapPowertrain(row)
    if (!powertrain) {
      continue
    }
    const electric = powertrain === 'elektrika'
    const quantity = electric ? row.electric : row.fuel
    if (!quantity || quantity.value <= 0) {
      continue
    }
    const entry: CatalogueEntry = {
      brand: row.brand,
      model: row.model,
      powertrain,
      consumption: round(quantity.value),
      unit: electric ? 'kWh/100km' : 'l/100km',
    }
    const key = `${entry.brand}|${entry.model}|${entry.powertrain}|${entry.consumption}`
    if (!entries.has(key)) {
      entries.set(key, entry)
    }
  }
  const sorted = [...entries.values()].sort(
    (left, right) =>
      left.brand.localeCompare(right.brand, 'sl') ||
      left.model.localeCompare(right.model, 'sl') ||
      left.powertrain.localeCompare(right.powertrain) ||
      left.consumption - right.consumption,
  )
  return { sourceUrl: ARSO_SOURCE_URL, asOf: sheet.asOf, entries: sorted }
}
