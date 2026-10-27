import { describe, expect, it } from 'vitest'
import { curatedRows, defaultPrices } from '../../src/data/load.ts'
import { consumptionFor, eurPer100km, kmPer100Eur, priceFor } from '../../src/lib/calc.ts'
import { markersFor, panelRows, toChartRow } from '../../src/lib/chart.ts'

const options = { prices: defaultPrices, realWorld: false, annualKm: 15000 }

describe('chart rows', () => {
	it('derives km and cost per 100 km from the curated row', () => {
		const source = curatedRows[0]!
		const row = toChartRow(source, options)
		const consumption = consumptionFor(source, false)
		const price = priceFor(source.powertrain, defaultPrices)
		expect(row.km).toBeCloseTo(kmPer100Eur(price, consumption))
		expect(row.eurPer100).toBeCloseTo(eurPer100km(price, consumption))
		expect(row.consumption).toBeCloseTo(consumption)
	})

	it('gives electric rows a public charging figure and others none', () => {
		const electric = curatedRows.find((row) => row.powertrain === 'elektrika')!
		const petrol = curatedRows.find((row) => row.powertrain === 'bencin')!
		expect(toChartRow(electric, options).publicKm).toBeGreaterThan(0)
		expect(toChartRow(petrol, options).publicKm).toBeNull()
	})

	it('sorts a panel longest first and keeps panels apart', () => {
		const rows = curatedRows.map((row) => toChartRow(row, options))
		const panelA = panelRows(rows, 'A')
		expect(panelA.every((row) => row.panel === 'A')).toBe(true)
		expect(panelA.map((row) => row.km)).toEqual(
			[...panelA.map((row) => row.km)].sort((a, b) => b - a),
		)
	})

	it('shortens the marker set in the compact layout', () => {
		expect(markersFor(false).map((marker) => marker.city)).toEqual([
			'dunaj',
			'rim',
			'pariz',
			'lizbona',
		])
		expect(markersFor(true).map((marker) => marker.km)).toEqual([1250, 2619])
	})
})
