import { describe, expect, it } from 'vitest'
import { parseArsoXlsx, type RawCatalogueRow } from '../../scripts/lib/arso-xlsx.ts'
import { buildCatalogue, mapPowertrain } from '../../scripts/lib/catalogue.ts'

const FIXTURE = 'tests/fixtures/arso-wltp-2026-06.xlsx'

function row(overrides: Partial<RawCatalogueRow>): RawCatalogueRow {
	return {
		brand: 'TEST',
		model: 'Model 1.0',
		fuelCode: 'bencin',
		fuel: { value: 5.5, range: null },
		electric: null,
		...overrides,
	}
}

describe('mapPowertrain', () => {
	it('maps the four plain codes', () => {
		expect(mapPowertrain(row({ fuelCode: 'bencin' }))).toBe('bencin')
		expect(mapPowertrain(row({ fuelCode: 'dizel' }))).toBe('dizel')
		expect(mapPowertrain(row({ fuelCode: 'EE', electric: { value: 16, range: null } }))).toBe(
			'elektrika',
		)
	})

	it('keeps a full hybrid and drops a plug-in hybrid', () => {
		expect(mapPowertrain(row({ fuelCode: 'bencin/EE', electric: null }))).toBe('hibrid')
		expect(
			mapPowertrain(row({ fuelCode: 'bencin/EE', electric: { value: 16, range: null } })),
		).toBeNull()
		expect(
			mapPowertrain(row({ fuelCode: 'dizel/EE', electric: { value: 18, range: null } })),
		).toBeNull()
	})

	it('drops LPG, CNG and unknown codes', () => {
		expect(mapPowertrain(row({ fuelCode: 'bencin/UNP' }))).toBeNull()
		expect(mapPowertrain(row({ fuelCode: '' }))).toBeNull()
	})
})

describe('buildCatalogue', () => {
	it('dedupes by brand, model, powertrain and consumption', () => {
		const catalogue = buildCatalogue({
			asOf: '2026-06',
			rows: [row({}), row({}), row({ model: 'Model 1.4', fuel: { value: 6.1, range: null } })],
		})
		expect(catalogue.entries).toHaveLength(2)
		expect(catalogue.entries.map((entry) => entry.consumption)).toEqual([5.5, 6.1])
	})

	it('sorts deterministically', () => {
		const rows = [row({ brand: 'B' }), row({ brand: 'A' }), row({ brand: 'A', model: 'Zeta' })]
		const first = buildCatalogue({ asOf: '2026-06', rows })
		const second = buildCatalogue({ asOf: '2026-06', rows: [...rows].reverse() })
		expect(first).toEqual(second)
	})

	it('skips rows without a consumption figure', () => {
		const catalogue = buildCatalogue({
			asOf: '2026-06',
			rows: [row({ fuel: null }), row({ fuelCode: 'EE', fuel: null, electric: null })],
		})
		expect(catalogue.entries).toHaveLength(0)
	})

	it('never carries a real-world multiplier', () => {
		const catalogue = buildCatalogue({ asOf: '2026-06', rows: [row({})] })
		const serialised = JSON.stringify(catalogue)
		expect(serialised).not.toMatch(/1\.1[89]|1\.20/)
		expect(serialised).not.toContain('realWorld')
	})

	it('reads the real sheet into at least 3000 usable entries', async () => {
		const sheet = await parseArsoXlsx(FIXTURE)
		const catalogue = buildCatalogue(sheet)
		expect(catalogue.asOf).toBe('2026-06')
		expect(catalogue.sourceUrl).toMatch(/^https:\/\//)
		expect(catalogue.entries.length).toBeGreaterThanOrEqual(3000)
		const powertrains = new Set(catalogue.entries.map((entry) => entry.powertrain))
		expect([...powertrains].sort()).toEqual(['bencin', 'dizel', 'elektrika', 'hibrid'])
		for (const entry of catalogue.entries.slice(0, 200)) {
			expect(entry.unit).toBe(entry.powertrain === 'elektrika' ? 'kWh/100km' : 'l/100km')
			expect(entry.consumption).toBeGreaterThan(0)
		}
	})
})
