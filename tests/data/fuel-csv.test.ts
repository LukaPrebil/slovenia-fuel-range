import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FUEL_SOURCE_URL, parseFuelCsv, parsePeriod } from '../../scripts/lib/fuel-csv.ts'

const fixture = readFileSync('tests/fixtures/fuel-prices.csv', 'utf8')

describe('parseFuelCsv', () => {
	it('parses the current window and both prices', () => {
		const prices = parseFuelCsv(fixture)
		expect(prices).toEqual({
			validFrom: '2026-10-27',
			validTo: '2026-11-02',
			bencin: 1.627,
			dizel: 1.935,
			sourceUrl: FUEL_SOURCE_URL,
		})
	})

	it('survives a BOM, quoted fields and a trailing space in the header', () => {
		expect(fixture.charCodeAt(0)).toBe(0xfeff)
		expect(() => parseFuelCsv(fixture)).not.toThrow()
	})

	it('carries the window across new year', () => {
		expect(parsePeriod('od 30. 12. do 5. 1. 2027')).toEqual({
			validFrom: '2026-12-30',
			validTo: '2027-01-05',
		})
	})

	it('throws on an unparseable period', () => {
		expect(() => parsePeriod('27.10.2026 - 2.11.2026')).toThrow(/Cannot read the price period/)
		expect(() => parsePeriod('od 32. 13. do 2. 11. 2026')).toThrow(/Month out of range/)
	})

	it('throws when a price column is missing', () => {
		const broken = fixture.split('\n').slice(0, 2).join('\n').replace('"1.935"', '""')
		expect(() => parseFuelCsv(broken)).toThrow(/diesel price/)
	})

	it('throws when the export has no rows', () => {
		expect(() => parseFuelCsv('"Datum veljavnosti "\n')).toThrow(/no rows/)
	})
})
