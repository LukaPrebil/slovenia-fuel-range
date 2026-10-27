import { useEffect, useMemo } from 'react'
import { ChartPanel } from './components/ChartPanel.tsx'
import { LanguageToggle } from './components/LanguageToggle.tsx'
import { Legend } from './components/Legend.tsx'
import { ThemeToggle } from './components/ThemeToggle.tsx'
import { curatedRows, defaultPrices, fuelWindow } from './data/load.ts'
import { MARKERS, markersFor, panelRows, toChartRow } from './lib/chart.ts'
import { formatKm, formatPrice } from './lib/format.ts'
import { translate } from './lib/i18n.ts'
import { useTheme } from './lib/useTheme.ts'
import { useViewState } from './lib/useViewState.ts'
import './styles/chart.css'

export default function App() {
  const [state, dispatch] = useViewState(defaultPrices)
  const [theme, setTheme] = useTheme()
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
    translate(state.language, key, params)

  useEffect(() => {
    document.documentElement.lang = state.language
    document.title = translate(state.language, 'page.title')
  }, [state.language])

  const rows = useMemo(
    () =>
      curatedRows.map((row) =>
        toChartRow(row, { prices: state.prices, realWorld: state.realWorld }),
      ),
    [state.prices, state.realWorld],
  )

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8">
      <header>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{t('page.title')}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle value={theme} language={state.language} onChange={setTheme} />
            <LanguageToggle
              value={state.language}
              onChange={(language) => dispatch({ type: 'language', language })}
            />
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">{t('page.subtitle')}</p>
        <p className="mt-2 text-xs text-muted">
          {t('page.pricesWindow', { from: fuelWindow.validFrom, to: fuelWindow.validTo })} ·{' '}
          {t('prices.bencin')} {formatPrice(state.prices.bencin)} · {t('prices.dizel')}{' '}
          {formatPrice(state.prices.dizel)} · {t('prices.elektrika')}{' '}
          {formatPrice(state.prices.elektrika)} · {t('prices.javnoPolnjenje')}{' '}
          {formatPrice(state.prices.javnoPolnjenje)}
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ChartPanel
          panel="A"
          title={t('panel.a.title')}
          subtitle={t('panel.a.subtitle')}
          rows={panelRows(rows, 'A')}
          markers={markersFor(true)}
          language={state.language}
        />
        <ChartPanel
          panel="B"
          title={t('panel.b.title')}
          subtitle={t('panel.b.subtitle')}
          rows={panelRows(rows, 'B')}
          markers={markersFor(true)}
          language={state.language}
        />
      </div>

      <footer className="mt-6 space-y-2">
        <Legend language={state.language} publicPrice={formatPrice(state.prices.javnoPolnjenje)} />
        <p className="text-xs text-muted">
          {t('page.distances', {
            list: MARKERS.map(
              (marker) => `${t(`city.${marker.city}`)} ${formatKm(marker.km)} km`,
            ).join(', '),
          })}
        </p>
      </footer>
    </main>
  )
}
