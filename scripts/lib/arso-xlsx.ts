import readXlsxFile from 'read-excel-file/node'

export const ARSO_SOURCE_URL =
  'https://www.gov.si/assets/organi-v-sestavi/ARSO/Podnebne-spremembe/Avtomobili/Seznam-modelov-novih-osebnih-avtomobilov-v-RS-WLTPm.xlsx'

const BRAND_HEADER = 'Znamka motornega vozila kategorije M1'
const FUEL_CODE_HEADER = 'Vrsta goriva'
const MODEL_HEADER = 'Model'
const FUEL_COMBINED_HEADER = 'kombinirana'
const ELECTRIC_HEADER = 'Poraba električne energije***'

/** A WLTP figure given as a range because of wheel or trim options. */
export type Quantity = { value: number; range: [number, number] | null }

const SL_MONTHS = [
  'januar',
  'februar',
  'marec',
  'april',
  'maj',
  'junij',
  'julij',
  'avgust',
  'september',
  'oktober',
  'november',
  'december',
]

export type RawCatalogueRow = {
  brand: string
  model: string
  fuelCode: string
  fuel: Quantity | null
  electric: Quantity | null
}

export type RawSheet = {
  asOf: string
  rows: RawCatalogueRow[]
}

function toNumber(text: string): number | null {
  const normalised = text.replace(/\s/g, '').replace(',', '.')
  const value = Number(normalised)
  return Number.isFinite(value) ? value : null
}

/**
 * Cells arrive as numbers, as comma decimals, as ranges like "5,5-5,8", or as a
 * dash. A range becomes its midpoint, which is the only single figure the sheet
 * supports without inventing precision.
 */
export function parseQuantity(value: string | number | null): Quantity | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { value, range: null } : null
  }
  if (value === null) {
    return null
  }
  const text = value.trim()
  if (text === '' || text === '-') {
    return null
  }
  const range = /^([\d.,]+)\s*[-–]\s*([\d.,]+)$/.exec(text)
  if (range) {
    const low = toNumber(range[1] ?? '')
    const high = toNumber(range[2] ?? '')
    if (low === null || high === null || high < low) {
      return null
    }
    return { value: (low + high) / 2, range: [low, high] }
  }
  const single = toNumber(text)
  return single === null ? null : { value: single, range: null }
}

/**
 * The electricity column is labelled Wh/km but about one row in twenty carries
 * kWh/100 km instead, so the unit is decided by the value, not the header.
 */
export function normaliseElectricKwh(quantity: Quantity | null): Quantity | null {
  if (!quantity) {
    return null
  }
  const scale = quantity.value > 50 ? 10 : 1
  return {
    value: quantity.value / scale,
    range: quantity.range ? [quantity.range[0] / scale, quantity.range[1] / scale] : null,
  }
}

export function readAsOf(title: string): string {
  const match = /([a-zčšž]+)\s+(\d{4})/i.exec(title)
  if (!match) {
    throw new Error(`Cannot read the month from the sheet title: ${JSON.stringify(title)}`)
  }
  const monthName = (match[1] ?? '').toLowerCase()
  const month = SL_MONTHS.findIndex((name) => name === monthName)
  if (month === -1) {
    throw new Error(`Unknown Slovenian month in the sheet title: ${JSON.stringify(title)}`)
  }
  return `${match[2]}-${String(month + 1).padStart(2, '0')}`
}

function columnIndex(header: (string | number | null)[], name: string, from = 0): number {
  const index = header.findIndex(
    (cell, position) => position >= from && String(cell ?? '').trim() === name,
  )
  if (index === -1) {
    throw new Error(`The sheet has no column named ${JSON.stringify(name)}`)
  }
  return index
}

export async function parseArsoXlsx(source: string | Buffer): Promise<RawSheet> {
  const sheets = (await readXlsxFile(source)) as unknown as {
    sheet: string
    data: (string | number | null)[][]
  }[]
  const data = sheets[0]?.data
  if (!data || data.length === 0) {
    throw new Error('The ARSO sheet is empty')
  }
  const headerRow = data.findIndex((row) =>
    row.some((cell) => String(cell ?? '').trim() === BRAND_HEADER),
  )
  if (headerRow === -1) {
    throw new Error('The ARSO sheet has no header row')
  }
  const header = data[headerRow] ?? []
  const brandAt = columnIndex(header, BRAND_HEADER)
  const fuelAt = columnIndex(header, FUEL_CODE_HEADER)
  const modelAt = columnIndex(header, MODEL_HEADER)
  const combinedAt = columnIndex(header, FUEL_COMBINED_HEADER)
  const electricAt = columnIndex(header, ELECTRIC_HEADER)

  const rows: RawCatalogueRow[] = []
  for (const row of data.slice(headerRow + 1)) {
    const brand = String(row[brandAt] ?? '').trim()
    const fuelCode = String(row[fuelAt] ?? '').trim()
    const model = String(row[modelAt] ?? '').trim()
    if (!brand || !fuelCode || !model) {
      continue
    }
    rows.push({
      brand,
      model,
      fuelCode,
      fuel: parseQuantity(row[combinedAt] ?? null),
      electric: normaliseElectricKwh(parseQuantity(row[electricAt] ?? null)),
    })
  }

  return { asOf: readAsOf(String(data[0]?.[0] ?? '')), rows }
}
