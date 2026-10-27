import { barWidthPercent } from '../lib/calc.ts'
import type { Marker } from '../lib/chart.ts'
import { formatKm } from '../lib/format.ts'
import { translate, type Language } from '../lib/i18n.ts'

/**
 * Labels sit on two rows: on a narrow plot the two markers of the compact set are
 * closer together than a label is wide, so they would otherwise collide.
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
            className="absolute left-1/2 -translate-x-1/2 text-[0.65rem] whitespace-nowrap text-muted"
            style={{ top: index % 2 === 0 ? '0' : '0.8rem' }}
          >
            {translate(language, `city.${marker.city}`)} {formatKm(marker.km, language)}
          </span>
        </div>
      ))}
    </div>
  )
}
