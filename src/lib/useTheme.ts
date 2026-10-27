import { useEffect, useState } from 'react'
import { readStoredTheme, resolveTheme, THEME_STORAGE_KEY, type ThemePreference } from './theme.ts'

export function useTheme(): [ThemePreference, (next: ThemePreference) => void] {
	const [preference, setPreference] = useState<ThemePreference>(() =>
		readStoredTheme(window.localStorage),
	)

	useEffect(() => {
		const query = window.matchMedia('(prefers-color-scheme: dark)')
		const apply = (): void => {
			const resolved = resolveTheme(preference, query.matches)
			document.documentElement.dataset.theme = resolved
			document.documentElement.style.colorScheme = resolved
			window.localStorage.setItem(THEME_STORAGE_KEY, preference)
		}
		apply()
		query.addEventListener('change', apply)
		return () => query.removeEventListener('change', apply)
	}, [preference])

	return [preference, setPreference]
}
