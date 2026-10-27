export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEMES: readonly ThemePreference[] = ['light', 'dark', 'system']
export const THEME_STORAGE_KEY = 'fuel-range-theme'

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * The page never relies on the media query alone: the resolved value is written
 * to `data-theme`, so light, dark and system share one switch in the stylesheet.
 */
export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light'
  }
  return preference
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'> | null): ThemePreference {
  const stored = storage?.getItem(THEME_STORAGE_KEY)
  return isThemePreference(stored) ? stored : 'system'
}
