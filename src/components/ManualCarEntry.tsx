import { useState } from 'react'
import { type Language, translate } from '../lib/i18n.ts'
import { POWERTRAINS, type Powertrain } from '../lib/types.ts'

export function ManualCarEntry({
	language,
	onApply,
}: {
	language: Language
	onApply: (car: { powertrain: Powertrain; consumption: number }) => void
}) {
	const [powertrain, setPowertrain] = useState<Powertrain>('bencin')
	const [consumption, setConsumption] = useState('')

	const value = Number(consumption.replace(',', '.'))
	const valid = Number.isFinite(value) && value > 0

	return (
		<form
			className="space-y-2"
			onSubmit={(event) => {
				event.preventDefault()
				if (valid) {
					onApply({ powertrain, consumption: value })
					setConsumption('')
				}
			}}
		>
			<h3 className="text-xs font-bold tracking-wide uppercase">
				{translate(language, 'car.manualHeading')}
			</h3>
			<div className="flex flex-wrap items-end gap-2">
				<label className="text-xs">
					<span className="block text-muted">{translate(language, 'car.manualPowertrain')}</span>
					<select
						value={powertrain}
						onChange={(event) => setPowertrain(event.target.value as Powertrain)}
						className="mt-1 rounded border border-rule bg-surface px-2 py-1 text-sm"
					>
						{POWERTRAINS.map((option) => (
							<option key={option} value={option}>
								{translate(language, `powertrain.${option}`)}
							</option>
						))}
					</select>
				</label>
				<label className="text-xs">
					<span className="block text-muted">{translate(language, 'car.manualConsumption')}</span>
					<input
						type="number"
						inputMode="decimal"
						min={0}
						step={0.1}
						value={consumption}
						onChange={(event) => setConsumption(event.target.value)}
						className="mt-1 w-28 rounded border border-rule bg-surface px-2 py-1 text-sm tabular-nums"
					/>
				</label>
				<button
					type="submit"
					disabled={!valid}
					className="rounded border border-ink px-2 py-1 text-xs font-semibold disabled:opacity-40"
				>
					{translate(language, 'car.manualApply')}
				</button>
			</div>
		</form>
	)
}
