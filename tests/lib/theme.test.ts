import { describe, expect, it } from 'vitest'
import {
	isThemePreference,
	readStoredTheme,
	resolveTheme,
	THEME_STORAGE_KEY,
} from '../../src/lib/theme.ts'

function storage(value: string | null): Pick<Storage, 'getItem'> {
	return { getItem: (key: string) => (key === THEME_STORAGE_KEY ? value : null) }
}

describe('theme', () => {
	it('defaults to system when nothing is stored', () => {
		expect(readStoredTheme(null)).toBe('system')
		expect(readStoredTheme(storage(null))).toBe('system')
	})

	it('uses a stored choice and ignores a broken one', () => {
		expect(readStoredTheme(storage('dark'))).toBe('dark')
		expect(readStoredTheme(storage('sepia'))).toBe('system')
	})

	it('resolves system against the media query', () => {
		expect(resolveTheme('system', true)).toBe('dark')
		expect(resolveTheme('system', false)).toBe('light')
		expect(resolveTheme('light', true)).toBe('light')
		expect(resolveTheme('dark', false)).toBe('dark')
	})

	it('only accepts the three preferences', () => {
		expect(isThemePreference('light')).toBe(true)
		expect(isThemePreference('system')).toBe(true)
		expect(isThemePreference('auto')).toBe(false)
	})
})
