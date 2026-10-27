import { ChartPanel } from './components/ChartPanel.tsx'
import { Legend } from './components/Legend.tsx'
import { curatedRows, defaultPrices, fuelWindow, manualPriceMeta } from './data/load.ts'
import { toChartRow, panelRows, markersFor } from './lib/chart.ts'
import { formatPrice } from './lib/format.ts'
import './styles/chart.css'

const options = { prices: defaultPrices, realWorld: false }
const rows = curatedRows.map((row) => toChartRow(row, options))

export default function App() {
  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">Koliko kilometrov za 100 evrov energije</h1>
        <p className="mt-1 text-sm text-muted">
          Kilometri za 100 € energije v najbolje prodajanih modelih (levo) in v modelih, ki jih
          Slovenci dejansko vozijo (desno). Razvrščeno po dosegu.
        </p>
        <p className="mt-2 text-xs text-muted">
          Cene veljajo od {fuelWindow.validFrom} do {fuelWindow.validTo}. Bencin{' '}
          {formatPrice(defaultPrices.bencin)} €/l, dizel {formatPrice(defaultPrices.dizel)} €/l,
          domača elektrika {formatPrice(defaultPrices.elektrika)} €/kWh, javno polnjenje{' '}
          {formatPrice(defaultPrices.javnoPolnjenje)} €/kWh ({manualPriceMeta.javnoPolnjenje.asOf}).
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ChartPanel
          panel="A"
          title="Najbolje prodajani modeli, 2025"
          subtitle="Prve registracije novih osebnih avtomobilov: 20 najbolje prodajanih + 5 električnih."
          rows={panelRows(rows, 'A')}
          markers={markersFor(true)}
        />
        <ChartPanel
          panel="B"
          title="Kaj dejansko vozimo"
          subtitle="Registrirani vozni park po modelih (ocena, konec 2024) + trije najštevilčnejši električni."
          rows={panelRows(rows, 'B')}
          markers={markersFor(true)}
        />
      </div>

      <footer className="mt-6 space-y-2">
        <Legend publicPrice={formatPrice(defaultPrices.javnoPolnjenje)} />
        <p className="text-xs text-muted">
          Črtkane črte so cestne razdalje od Ljubljane (OSRM): Dunaj 376 km, Rim 756 km, Pariz 1.250
          km, Lizbona 2.619 km.
        </p>
      </footer>
    </main>
  )
}
