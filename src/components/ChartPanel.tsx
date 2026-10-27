import type { ChartRow, Marker } from '../lib/chart.ts'
import type { Language } from '../lib/i18n.ts'
import type { PanelId } from '../lib/types.ts'
import { BarRow } from './BarRow.tsx'
import { Markers } from './Markers.tsx'

export type ChartPanelProps = {
  panel: PanelId
  title: string
  subtitle: string
  rows: ChartRow[]
  markers: Marker[]
  language: Language
}

export function ChartPanel({ panel, title, subtitle, rows, markers, language }: ChartPanelProps) {
  return (
    <section
      className="chart-panel"
      aria-labelledby={`panel-${panel}`}
      data-testid={`panel-${panel}`}
    >
      <h2 id={`panel-${panel}`} className="text-base font-bold">
        {title}
      </h2>
      <p className="mt-0.5 mb-2 text-xs text-muted">{subtitle}</p>
      <div className="chart-plot pt-9">
        <Markers markers={markers} language={language} />
        <ol>
          {rows.map((row) => (
            <BarRow key={row.key} row={row} language={language} />
          ))}
        </ol>
      </div>
    </section>
  )
}
