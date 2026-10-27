import { describe, expect, it } from 'vitest'
import { isLanguage, keySets, translate } from '../../src/lib/i18n.ts'

describe('translations', () => {
	it('keeps both languages on the same key set', () => {
		const { sl, en } = keySets()
		expect(en).toEqual(sl)
	})

	it('interpolates named parameters and leaves unknown ones alone', () => {
		expect(translate('sl', 'unit.km', { km: '4.257' })).toBe('4.257 km')
		expect(translate('en', 'unit.perYear', { eur: '1,220.25' })).toBe('1,220.25 €/year')
		expect(translate('sl', 'unit.perYear', {})).toBe('{eur} €/leto')
	})

	it('reads a page in each language', () => {
		expect(translate('sl', 'panel.a.title')).toBe('Najbolje prodajani modeli, 2025')
		expect(translate('en', 'panel.a.title')).toBe('Best-selling models, 2025')
	})

	it('recognises only the two supported languages', () => {
		expect(isLanguage('sl')).toBe(true)
		expect(isLanguage('en')).toBe(true)
		expect(isLanguage('hr')).toBe(false)
		expect(isLanguage(null)).toBe(false)
	})
})
