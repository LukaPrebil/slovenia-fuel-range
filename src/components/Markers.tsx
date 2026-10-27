import { barWidthPercent } from '../lib/calc.ts'
import { formatKm } from '../lib/format.ts'

type Marker = { km: number; label: string }

/**
 * Labels sit on two rows: on a narrow plot the two markers of the compact set are
 * closer together than a label is wide, so they would otherwise collide.
 */
export function Markers({ markers }: { markers: Marker[] }) {
  return (
    <div className="chart-markers" aria-hidden="true" data-testid="markers">
      {markers.map((marker, index) => (
        <div
          key={marker.label}
          className="chart-marker"
          style={{ left: `${barWidthPercent(marker.km)}%` }}
        >
          <span
            className="absolute left-1/2 -translate-x-1/2 text-[0.65rem] whitespace-nowrap text-muted"
            style={{ top: index % 2 === 0 ? '0' : '0.8rem' }}
          >
            {marker.label} {formatKm(marker.km)}
          </span>
        </div>
      ))}
    </div>
  )
}
