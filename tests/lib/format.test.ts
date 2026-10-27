import { describe, expect, it } from 'vitest'
import {
	formatDate,
	formatEur,
	formatKm,
	formatMonth,
	formatOne,
	formatPercent,
	formatPrice,
} from '../../src/lib/format.ts'

describe('Slovenian formatting', () => {
	it('uses a dot for thousands and a comma for decimals', () => {
		expect(formatKm(4812)).toBe('4.812')
		expect(formatKm(10000)).toBe('10.000')
		expect(formatKm(999)).toBe('999')
		expect(formatKm(1000)).toBe('1.000')
		expect(formatKm(806)).toBe('806')
		expect(formatEur(1220.25)).toBe('1.220,25')
		expect(formatOne(5.49)).toBe('5,5')
	})

	it('keeps three decimals for a fuel price and up to four for electricity', () => {
		expect(formatPrice(1.627)).toBe('1,627')
		expect(formatPrice(0.1807)).toBe('0,181')
	})

	it('rounds km to whole numbers', () => {
		expect(formatKm(1119.4)).toBe('1.119')
		expect(formatKm(1119.5)).toBe('1.120')
	})

	it('formats a share as a whole percentage', () => {
		expect(formatPercent(0.42)).toBe('42')
	})
})

describe('English formatting', () => {
	it('swaps the separators', () => {
		expect(formatKm(4257, 'en')).toBe('4,257')
		expect(formatEur(1073.82, 'en')).toBe('1,073.82')
		expect(formatPrice(1.627, 'en')).toBe('1.627')
		expect(formatPrice(0.1807, 'en')).toBe('0.181')
	})

	it('keeps Slovenian as the default', () => {
		expect(formatKm(4257)).toBe('4.257')
		expect(formatEur(1073.82)).toBe('1.073,82')
	})
})

describe('dates and months', () => {
	it('writes a Slovenian date the way a reader expects', () => {
		expect(formatDate('2026-10-27', 'sl')).toBe('27. 10. 2026')
		expect(formatDate('2026-11-02', 'sl')).toBe('2. 11. 2026')
	})

	it('writes an English date with a short month', () => {
		expect(formatDate('2026-10-27', 'en')).toBe('27 Oct 2026')
		expect(formatDate('2026-11-02', 'en')).toBe('2 Nov 2026')
	})

	it('writes a month name from a month-only stamp', () => {
		expect(formatMonth('2026-06', 'sl')).toBe('junij 2026')
		expect(formatMonth('2026-06', 'en')).toBe('June 2026')
		expect(formatMonth('2026-01', 'sl')).toBe('januar 2026')
		expect(formatMonth('2026-12', 'en')).toBe('December 2026')
	})

	it('passes an unreadable value through untouched', () => {
		expect(formatMonth('neki', 'sl')).toBe('neki')
	})
})
