import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { FUEL_SOURCE_URL, parseFuelCsv, type FuelPrices } from './lib/fuel-csv.ts'

const HERE = new URL('.', import.meta.url).pathname
const ROOT = dirname(HERE)

type Mode = { fixtures: boolean }

function readMode(argv: string[]): Mode {
  return { fixtures: argv.includes('--fixtures') }
}

function writeJson(relativePath: string, value: unknown): void {
  const path = `${ROOT}/${relativePath}`
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
  console.log(`wrote ${relativePath}`)
}

async function fetchFuel(mode: Mode): Promise<FuelPrices> {
  if (mode.fixtures) {
    const text = readFileSync(`${ROOT}/tests/fixtures/fuel-prices.csv`, 'utf8')
    return parseFuelCsv(text)
  }
  const response = await fetch(FUEL_SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Fuel price export failed: ${response.status} ${response.statusText}`)
  }
  return parseFuelCsv(await response.text())
}

async function main(): Promise<void> {
  const mode = readMode(process.argv.slice(2))
  mkdirSync(`${ROOT}/data`, { recursive: true })

  const fuel = await fetchFuel(mode)
  writeJson('data/prices.json', { fuel })
  console.log(`fuel window ${fuel.validFrom} to ${fuel.validTo}`)
}

await main()
