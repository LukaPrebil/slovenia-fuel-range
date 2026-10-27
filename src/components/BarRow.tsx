import { barWidthPercent } from '../lib/calc.ts'
import type { ChartRow } from '../lib/chart.ts'
import { formatEur, formatKm } from '../lib/format.ts'
import { BAR_COLOUR, INK_COLOUR } from './powertrain.ts'

export function BarRow({ row }: { row: ChartRow }) {
  return (
    <li
      className={`chart-row py-1.5 ${row.personal ? 'bg-raised' : ''}`}
      data-testid="chart-row"
      data-powertrain={row.powertrain}
    >
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold">{row.model}</span>
        <span className={`block truncate text-xs ${INK_COLOUR[row.powertrain]}`}>
          {row.variant}
        </span>
      </div>
      <div className="chart-track">
        <div
          className={`chart-bar ${BAR_COLOUR[row.powertrain]}`}
          style={{ width: `${barWidthPercent(row.km)}%` }}
          data-testid="bar"
        />
        {row.publicKm !== null && (
          <div
            className={`chart-ghost ${BAR_COLOUR[row.powertrain]} bottom-[-0.35rem]`}
            style={{ width: `${barWidthPercent(row.publicKm)}%` }}
            data-testid="ghost"
          />
        )}
      </div>
      <div className="text-right tabular-nums">
        <span className="block text-sm font-semibold">{formatKm(row.km)} km</span>
        <span className="block text-xs text-muted">{formatEur(row.eurPer100)} €/100 km</span>
      </div>
    </li>
  )
}
