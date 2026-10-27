import { barWidthPercent } from '../lib/calc.ts'
import type { Marker } from '../lib/chart.ts'
import { formatKm } from '../lib/format.ts'
import { type Language, translate } from '../lib/i18n.ts'

/**
 * The label is a two-line block centred on its dashed line. A narrow plot cannot
 * fit two of them side by side, so below 640 px the second one drops a row.
 */
export function Markers({ markers, language }: { markers: Marker[]; language: Language }) {
	return (
		<div className="chart-markers" aria-hidden="true" data-testid="markers">
			{markers.map((marker, index) => (
				<div
					key={marker.city}
					className="chart-marker"
					style={{ left: `${barWidthPercent(marker.km)}%` }}
				>
					<span
						className="chart-marker-label"
						style={{ top: index % 2 === 0 ? '0' : 'var(--marker-row)' }}
					>
						<span className="block leading-tight">
							{translate(language, `city.${marker.city}`)}
						</span>
						<span className="block text-[0.6rem] leading-tight opacity-80">
							{formatKm(marker.km, language)} km
						</span>
					</span>
				</div>
			))}
		</div>
	)
}
