import { describe, expect, it } from 'vitest'
import {
	BAR_MAX_KM,
	barWidthPercent,
	consumptionFor,
	type EnergyPrices,
	eurPer100km,
	eurPerYear,
	kmPer100Eur,
	priceFor,
	REAL_WORLD,
} from '../../src/lib/calc.ts'

const PRICES: EnergyPrices = {
	bencin: 1.627,
	dizel: 1.935,
	elektrika: 0.1807,
	javnoPolnjenje: 0.47,
}

describe('priceFor', () => {
	it('charges a full hybrid the petrol price', () => {
		expect(priceFor('bencin', PRICES)).toBe(1.627)
		expect(priceFor('hibrid', PRICES)).toBe(1.627)
		expect(priceFor('dizel', PRICES)).toBe(1.935)
		expect(priceFor('elektrika', PRICES)).toBe(0.1807)
	})
})

describe('kmPer100Eur', () => {
	it('is 10000 divided by the cost of 100 km', () => {
		expect(kmPer100Eur(1.627, 5.0)).toBeCloseTo(1229.256, 3)
		expect(kmPer100Eur(0.1807, 15.5)).toBeCloseTo(3570.0, 0)
	})

	it('matches the bar printed for the best-selling car', () => {
		// Renault Clio 1.0 TCe 100: 5.49 l/100 km at 1.627 EUR/l, as printed on the chart.
		expect(Math.round(kmPer100Eur(1.627, 5.49))).toBe(1120)
		expect(Math.round(kmPer100Eur(1.935, 5.0))).toBe(1034)
	})
})

describe('eurPer100km', () => {
	it('is the price of 100 km at the given consumption', () => {
		expect(eurPer100km(1.627, 5.0)).toBeCloseTo(8.135, 3)
	})

	it('multiplies back into km', () => {
		expect(kmPer100Eur(1.627, 5.0) * eurPer100km(1.627, 5.0)).toBeCloseTo(10000, 6)
	})
})

describe('eurPerYear', () => {
	it('turns 15000 km at 5.00 l/100 km into 1220.25 EUR', () => {
		expect(eurPerYear(15000, 1.627, 5.0)).toBeCloseTo(1220.25, 2)
	})

	it('scales with distance', () => {
		expect(eurPerYear(30000, 1.627, 5.0)).toBeCloseTo(2440.5, 2)
	})

	it('handles an electric car on home charging', () => {
		expect(eurPerYear(15000, 0.1807, 15.5)).toBeCloseTo(420.13, 2)
	})
})

describe('consumptionFor', () => {
	it('leaves a WLTP figure alone', () => {
		expect(consumptionFor({ consumption: 5.49, basis: 'wltp', powertrain: 'bencin' }, false)).toBe(
			5.49,
		)
	})

	it('converts a NEDC figure once', () => {
		expect(
			consumptionFor({ consumption: 5.0, basis: 'nedc', powertrain: 'bencin' }, false),
		).toBeCloseTo(6.05)
	})

	it('applies the real-world multiplier on top, per powertrain', () => {
		expect(
			consumptionFor({ consumption: 5.0, basis: 'wltp', powertrain: 'bencin' }, true),
		).toBeCloseTo(6.0)
		expect(
			consumptionFor({ consumption: 5.0, basis: 'wltp', powertrain: 'dizel' }, true),
		).toBeCloseTo(5.9)
		expect(
			consumptionFor({ consumption: 5.0, basis: 'wltp', powertrain: 'hibrid' }, true),
		).toBeCloseTo(5.9)
		expect(
			consumptionFor({ consumption: 15.5, basis: 'wltp', powertrain: 'elektrika' }, true),
		).toBeCloseTo(18.445)
	})

	it('keeps the documented multipliers', () => {
		expect(REAL_WORLD).toEqual({ bencin: 1.2, dizel: 1.18, hibrid: 1.18, elektrika: 1.19 })
	})
})

describe('barWidthPercent', () => {
	it('maps the longest bar to the full plot', () => {
		expect(barWidthPercent(BAR_MAX_KM)).toBe(100)
		expect(barWidthPercent(2500)).toBe(50)
	})

	it('caps anything longer than the axis', () => {
		expect(barWidthPercent(9000)).toBe(100)
	})

	it('never returns a negative width', () => {
		expect(barWidthPercent(0)).toBe(0)
	})
})
