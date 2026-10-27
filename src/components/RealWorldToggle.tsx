import { type Language, translate } from '../lib/i18n.ts'

export function RealWorldToggle({
	value,
	language,
	onChange,
}: {
	value: boolean
	language: Language
	onChange: (value: boolean) => void
}) {
	return (
		<div>
			<label className="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					checked={value}
					onChange={(event) => onChange(event.target.checked)}
					className="size-4 accent-current"
				/>
				<span>{translate(language, 'controls.realWorld')}</span>
			</label>
			<p className="mt-1 text-[0.7rem] text-muted">
				{translate(language, 'controls.realWorldHint')}
			</p>
		</div>
	)
}
