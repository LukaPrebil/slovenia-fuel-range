import { barWidthPercent } from '../lib/calc.ts'
import type { ChartRow } from '../lib/chart.ts'
import { formatEur, formatKm } from '../lib/format.ts'
import { type Language, translate } from '../lib/i18n.ts'
import { BAR_COLOUR, INK_COLOUR } from './powertrain.ts'

export function BarRow({ row, language }: { row: ChartRow; language: Language }) {
  return (
    <li
      className={`chart-row py-1.5 ${row.personal ? 'bg-raised ring-1 ring-ink/25' : ''}`}
      data-testid="chart-row"
      data-powertrain={row.powertrain}
    >
      <div className="chart-label min-w-0">
        <span className="block truncate text-sm font-semibold">
          {row.model}
          {row.personal && (
            <span className="ml-1 rounded bg-ink px-1 py-0.5 align-middle text-[0.6rem] font-semibold text-surface">
              {translate(language, 'car.personal')}
            </span>
          )}
        </span>
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
      <div className="chart-value text-right tabular-nums">
        <span className="block text-sm font-semibold" data-testid="row-km">
          {formatKm(row.km, language)} km
        </span>
        <span className="block text-xs text-muted">
          {formatEur(row.eurPer100, language)} €/100 km
        </span>
        <span className="block text-[0.65rem] text-muted">
          {translate(language, 'unit.perYear', { eur: formatEur(row.eurPerYear, language) })}
        </span>
      </div>
    </li>
  )
}
