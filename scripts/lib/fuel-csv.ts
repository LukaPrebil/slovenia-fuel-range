import { parse } from 'csv-parse/sync'

export const FUEL_SOURCE_URL =
  'https://www.gov.si/teme/cene-naftnih-derivatov/element/162094/izvoz.csv'

export type FuelPrices = {
  validFrom: string
  validTo: string
  bencin: number
  dizel: number
  sourceUrl: string
}

const PERIOD = /^od\s+(\d{1,2})\.\s*(\d{1,2})\.\s*do\s+(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * The export states the year once, at the end of the period, so a window that
 * crosses new year runs from December of the previous year.
 */
export function parsePeriod(text: string): { validFrom: string; validTo: string } {
  const match = PERIOD.exec(text.trim())
  if (!match) {
    throw new Error(`Cannot read the price period: ${JSON.stringify(text)}`)
  }
  const fromDay = Number(match[1])
  const fromMonth = Number(match[2])
  const toDay = Number(match[3])
  const toMonth = Number(match[4])
  const toYear = Number(match[5])
  const fromYear = fromMonth > toMonth ? toYear - 1 : toYear
  if (fromMonth < 1 || fromMonth > 12 || toMonth < 1 || toMonth > 12) {
    throw new Error(`Month out of range in the price period: ${JSON.stringify(text)}`)
  }
  return { validFrom: iso(fromYear, fromMonth, fromDay), validTo: iso(toYear, toMonth, toDay) }
}

function toPrice(value: string | undefined, name: string): number {
  const price = Number((value ?? '').replace(',', '.'))
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Cannot read the ${name} price: ${JSON.stringify(value)}`)
  }
  return price
}

/**
 * The gov.si export is a full history, newest window first, with a BOM and a
 * trailing space in the first header. Only the current window matters here.
 */
export function parseFuelCsv(text: string): FuelPrices {
  const rows: Record<string, string>[] = parse(text.replace(/^\uFEFF/, ''), {
    columns: (header: string[]) => header.map((name) => name.trim()),
    skip_empty_lines: true,
    trim: true,
  })
  const current = rows[0]
  if (!current) {
    throw new Error('The fuel export has no rows')
  }
  const period = parsePeriod(current['Datum veljavnosti'] ?? '')
  return {
    ...period,
    bencin: toPrice(current['Maloprodajna cena NMB 95 (evro/liter)'], 'petrol'),
    dizel: toPrice(current['Maloprodajna cena dizel goriva (evro/liter)'], 'diesel'),
    sourceUrl: FUEL_SOURCE_URL,
  }
}
