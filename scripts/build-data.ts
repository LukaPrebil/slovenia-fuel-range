import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { ARSO_SOURCE_URL, parseArsoXlsx } from './lib/arso-xlsx.ts'
import { buildCatalogue, type CatalogueFile } from './lib/catalogue.ts'
import { FUEL_SOURCE_URL, type FuelPrices, parseFuelCsv } from './lib/fuel-csv.ts'

const HERE = new URL('.', import.meta.url).pathname
const ROOT = dirname(HERE)

type Mode = { fixtures: boolean; fuelOnly: boolean }

function readMode(argv: string[]): Mode {
	return {
		fixtures: argv.includes('--fixtures'),
		fuelOnly: argv.includes('--fuel-only'),
	}
}

function writeJson(relativePath: string, value: unknown): void {
	writeFileSync(`${ROOT}/${relativePath}`, `${JSON.stringify(value, null, 2)}\n`)
	console.log(`wrote ${relativePath}`)
}

/**
 * One entry per line keeps the file diffable without paying two-space indentation
 * on five fields times 3000 rows.
 */
function writeCatalogue(catalogue: CatalogueFile): void {
	const entries = catalogue.entries.map((entry) => `    ${JSON.stringify(entry)}`).join(',\n')
	const body = [
		'{',
		`  "sourceUrl": ${JSON.stringify(catalogue.sourceUrl)},`,
		`  "asOf": ${JSON.stringify(catalogue.asOf)},`,
		`  "entries": [`,
		entries,
		'  ]',
		'}',
		'',
	].join('\n')
	writeFileSync(`${ROOT}/data/catalogue.json`, body)
	console.log('wrote data/catalogue.json')
}

async function download(url: string, label: string): Promise<Buffer> {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`${label} download failed: ${response.status} ${response.statusText}`)
	}
	return Buffer.from(await response.arrayBuffer())
}

async function fetchFuel(mode: Mode): Promise<FuelPrices> {
	if (mode.fixtures) {
		return parseFuelCsv(readFileSync(`${ROOT}/tests/fixtures/fuel-prices.csv`, 'utf8'))
	}
	return parseFuelCsv((await download(FUEL_SOURCE_URL, 'Fuel price export')).toString('utf8'))
}

async function main(): Promise<void> {
	const mode = readMode(process.argv.slice(2))
	mkdirSync(`${ROOT}/data`, { recursive: true })

	const fuel = await fetchFuel(mode)
	writeJson('data/prices.json', { fuel })
	console.log(`fuel window ${fuel.validFrom} to ${fuel.validTo}`)

	if (mode.fuelOnly) {
		return
	}

	const source = mode.fixtures
		? `${ROOT}/tests/fixtures/arso-wltp-2026-06.xlsx`
		: await download(ARSO_SOURCE_URL, 'ARSO catalogue')
	const sheet = await parseArsoXlsx(source)
	const catalogue = buildCatalogue(sheet)
	writeCatalogue(catalogue)
	writeJson('data/catalogue-meta.json', {
		sourceUrl: catalogue.sourceUrl,
		asOf: catalogue.asOf,
		count: catalogue.entries.length,
	})
	console.log(`catalogue ${catalogue.entries.length} entries, ${catalogue.asOf}`)
}

await main()
