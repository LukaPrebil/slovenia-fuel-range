import { LANGUAGES, type Language, translate } from '../lib/i18n.ts'

export function LanguageToggle({
	value,
	onChange,
}: {
	value: Language
	onChange: (next: Language) => void
}) {
	return (
		<fieldset
			className="m-0 inline-flex min-w-0 overflow-hidden rounded-md border border-rule p-0"
			aria-label={translate(value, 'language.label')}
		>
			{LANGUAGES.map((language) => (
				<button
					key={language}
					type="button"
					onClick={() => onChange(language)}
					aria-pressed={value === language}
					className={`px-2 py-1 text-xs uppercase ${
						value === language ? 'bg-ink text-surface' : 'text-muted hover:bg-raised'
					}`}
				>
					{language}
				</button>
			))}
		</fieldset>
	)
}
