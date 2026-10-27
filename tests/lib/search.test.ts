import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
	type Catalogue,
	familyOf,
	keyOf,
	normalise,
	searchCatalogue,
} from '../../src/lib/search.ts'

const catalogue = JSON.parse(readFileSync('data/catalogue.json', 'utf8')) as Catalogue

describe('normalise', () => {
	it('strips diacritics and case', () => {
		expect(normalise('ŠKODA Octavia')).toBe('skoda octavia')
		expect(normalise('Citroën C3')).toBe('citroen c3')
		expect(normalise('  Clio  ')).toBe('clio')
	})
})

describe('familyOf', () => {
	it('takes the first word of the model', () => {
		expect(familyOf('Karoq Edition 1.0 TSI')).toBe('karoq')
		expect(familyOf('KANGOO / 1.3 / 16V')).toBe('kangoo')
		expect(familyOf('Octavia Combi Essence 1.5 TSI')).toBe('octavia')
	})
})

describe('searchCatalogue', () => {
	it('finds a model without diacritics on the query side', () => {
		const hits = searchCatalogue(catalogue.entries, 'skoda octavia')
		expect(hits.length).toBeGreaterThan(0)
		expect(normalise(hits[0]!.entry.brand)).toBe('skoda')
	})

	it('finds a model without diacritics on the data side', () => {
		const hits = searchCatalogue(catalogue.entries, 'citroen')
		expect(hits.some((hit) => hit.entry.brand === 'CITROËN')).toBe(true)
	})

	it('puts a model whose name starts with the query above a mid-word match', () => {
		const hits = searchCatalogue(catalogue.entries, 'karoq')
		expect(hits.length).toBeGreaterThan(0)
		expect(hits.every((hit) => normalise(hit.entry.model).startsWith('karoq'))).toBe(true)
	})

	it('keeps a popular model reachable from a two-letter query', () => {
		// Reported bug: "ka" filled the list with KANGOO and pushed Karoq out entirely.
		const hits = searchCatalogue(catalogue.entries, 'ka')
		const models = hits.map((hit) => familyOf(hit.entry.model))
		expect(models).toContain('karoq')
		expect(models).toContain('kamiq')
		expect(models.filter((model) => model === 'kangoo').length).toBeLessThanOrEqual(4)
	})

	it('never repeats a key, so React can key the list safely', () => {
		for (const query of ['kangoo', 'ka', 'octavia', 'tesla']) {
			const keys = searchCatalogue(catalogue.entries, query).map((hit) => keyOf(hit.entry))
			expect(new Set(keys).size).toBe(keys.length)
		}
	})

	it('ranks a brand match above a mid-word match', () => {
		const hits = searchCatalogue(catalogue.entries, 'tesla')
		expect(hits[0]?.rank).toBe(1)
		expect(hits.every((hit) => hit.rank <= 1)).toBe(true)
	})

	it('ignores a query shorter than two characters and caps the list', () => {
		expect(searchCatalogue(catalogue.entries, 'a')).toEqual([])
		expect(searchCatalogue(catalogue.entries, 'e', 5)).toEqual([])
		expect(searchCatalogue(catalogue.entries, 'model', 5).length).toBeLessThanOrEqual(5)
	})

	it('returns nothing for a phrase nobody sells', () => {
		expect(searchCatalogue(catalogue.entries, 'lada samara')).toEqual([])
	})
})
