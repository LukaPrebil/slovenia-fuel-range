import { readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { POWERTRAINS } from '../src/lib/types.ts'

const MAX_RAW_BYTES = 500 * 1024
const MAX_GZIP_BYTES = 150 * 1024
const MIN_CATALOGUE_ENTRIES = 3000

const failures: string[] = []

function fail(message: string): void {
  failures.push(message)
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

type FuelPrices = {
  validFrom: string
  validTo: string
  bencin: number
  dizel: number
  sourceUrl: string
}

type CatalogueEntry = {
  brand: string
  model: string
  powertrain: string
  consumption: number
  unit: string
}

type CatalogueFile = {
  sourceUrl: string
  asOf: string
  entries: CatalogueEntry[]
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const ISO_MONTH = /^\d{4}-\d{2}$/

function checkPrices(): FuelPrices {
  const { fuel } = readJson<{ fuel: FuelPrices }>('data/prices.json')
  if (!ISO_DATE.test(fuel.validFrom) || !ISO_DATE.test(fuel.validTo)) {
    fail(`prices: the validity window is not ISO dated (${fuel.validFrom} .. ${fuel.validTo})`)
  }
  if (fuel.validFrom >= fuel.validTo) {
    fail(`prices: the window ends before it starts (${fuel.validFrom} .. ${fuel.validTo})`)
  }
  for (const field of ['bencin', 'dizel'] as const) {
    if (!(fuel[field] > 0)) {
      fail(`prices: ${field} is not a positive number (${fuel[field]})`)
    }
  }
  if (!fuel.sourceUrl.startsWith('https://')) {
    fail(`prices: sourceUrl is not https (${fuel.sourceUrl})`)
  }
  return fuel
}

function checkCatalogue(): CatalogueFile {
  const catalogue = readJson<CatalogueFile>('data/catalogue.json')
  if (!catalogue.sourceUrl.startsWith('https://')) {
    fail('catalogue: sourceUrl is not https')
  }
  if (!ISO_MONTH.test(catalogue.asOf)) {
    fail(`catalogue: asOf is not a month (${catalogue.asOf})`)
  }
  if (catalogue.entries.length < MIN_CATALOGUE_ENTRIES) {
    fail(
      `catalogue: ${catalogue.entries.length} entries, expected at least ${MIN_CATALOGUE_ENTRIES}`,
    )
  }
  const seen = new Set<string>()
  for (const [index, entry] of catalogue.entries.entries()) {
    if (!entry.brand || !entry.model) {
      fail(`catalogue: entry ${index} has no brand or model`)
    }
    if (!POWERTRAINS.includes(entry.powertrain as never)) {
      fail(`catalogue: entry ${index} has an unknown powertrain (${entry.powertrain})`)
    }
    if (!(entry.consumption > 0)) {
      fail(`catalogue: entry ${index} has a non-positive consumption (${entry.consumption})`)
    }
    const expectedUnit = entry.powertrain === 'elektrika' ? 'kWh/100km' : 'l/100km'
    if (entry.unit !== expectedUnit) {
      fail(`catalogue: entry ${index} unit ${entry.unit}, expected ${expectedUnit}`)
    }
    const key = `${entry.brand}|${entry.model}|${entry.powertrain}|${entry.consumption}`
    if (seen.has(key)) {
      fail(`catalogue: entry ${index} is a duplicate (${key})`)
    }
    seen.add(key)
  }
  return catalogue
}

function checkSize(): void {
  const raw = statSync('data/catalogue.json').size
  const gzipped = gzipSync(readFileSync('data/catalogue.json')).length
  if (raw > MAX_RAW_BYTES) {
    fail(`catalogue: ${raw} bytes raw, limit ${MAX_RAW_BYTES}`)
  }
  if (gzipped > MAX_GZIP_BYTES) {
    fail(`catalogue: ${gzipped} bytes gzipped, limit ${MAX_GZIP_BYTES}`)
  }
  console.log(`catalogue size ${raw} bytes raw, ${gzipped} bytes gzipped`)
}

const prices = checkPrices()
const catalogue = checkCatalogue()
if (process.argv.includes('--max-size')) {
  checkSize()
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(
  `catalogue ${catalogue.entries.length} entries (${catalogue.asOf}), prices ${prices.validFrom}..${prices.validTo}`,
)
