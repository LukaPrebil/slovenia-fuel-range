import { barWidthPercent } from '../lib/calc.ts'
import type { ChartRow } from '../lib/chart.ts'
import { formatEur, formatKm } from '../lib/format.ts'
import { type Language, translate } from '../lib/i18n.ts'

export function BarRow({ row, language }: { row: ChartRow; language: Language }) {
	const model = row.personalSource === 'manual' ? translate(language, 'car.manualLabel') : row.model

	return (
		<li
			className="chart-row py-1.5"
			data-testid="chart-row"
			data-powertrain={row.powertrain}
			data-personal={row.personal || undefined}
		>
			<div className="chart-label min-w-0">
				<span className="block truncate text-sm font-semibold">
					{model}
					{row.personal && (
						<span className="chart-badge ml-1 rounded bg-ink px-1 py-0.5 align-middle font-semibold text-surface">
							{translate(language, 'car.personal')}
						</span>
					)}
				</span>
				<span className="chart-variant block truncate text-xs">{row.variant}</span>
			</div>
			<div className="chart-track">
				<div
					className="chart-bar"
					style={{ width: `${barWidthPercent(row.km)}%` }}
					data-testid="bar"
				/>
				{row.publicKm !== null && (
					<div
						className="chart-ghost"
						style={{ width: `${barWidthPercent(row.publicKm)}%` }}
						data-testid="ghost"
					/>
				)}
			</div>
			<div className="chart-value text-right tabular-nums">
				<span className="block text-sm font-semibold" data-testid="row-km">
					{formatKm(row.km, language)} km
				</span>
				<span className="block text-xs text-muted">
					{formatEur(row.eurPer100, language)} €/100 km
				</span>
				<span className="chart-year block text-muted">
					{translate(language, 'unit.perYear', { eur: formatEur(row.eurPerYear, language) })}
				</span>
			</div>
		</li>
	)
}
