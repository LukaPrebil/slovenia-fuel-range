import { translate, type Language } from '../lib/i18n.ts'
import { THEMES, type ThemePreference } from '../lib/theme.ts'

const ICONS: Record<ThemePreference, string> = { light: '☀', dark: '☾', system: '⌂' }

export function ThemeToggle({
  value,
  language,
  onChange,
}: {
  value: ThemePreference
  language: Language
  onChange: (next: ThemePreference) => void
}) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-rule"
      role="group"
      aria-label={translate(language, 'theme.label')}
    >
      {THEMES.map((theme) => (
        <button
          key={theme}
          type="button"
          onClick={() => onChange(theme)}
          aria-pressed={value === theme}
          className={`px-2 py-1 text-xs ${
            value === theme ? 'bg-ink text-surface' : 'text-muted hover:bg-raised'
          }`}
        >
          <span aria-hidden="true">{ICONS[theme]}</span> {translate(language, `theme.${theme}`)}
        </button>
      ))}
    </div>
  )
}
