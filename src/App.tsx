import { useEffect, useMemo, useState } from 'react'
import { AnnualKmSlider } from './components/AnnualKmSlider.tsx'
import { CarSearch } from './components/CarSearch.tsx'
import { ChartPanel } from './components/ChartPanel.tsx'
import { FreshnessBanner } from './components/FreshnessBanner.tsx'
import { LanguageToggle } from './components/LanguageToggle.tsx'
import { Legend } from './components/Legend.tsx'
import { ManualCarEntry } from './components/ManualCarEntry.tsx'
import { PanelSwitch } from './components/PanelSwitch.tsx'
import { PriceControls } from './components/PriceControls.tsx'
import { RealWorldToggle } from './components/RealWorldToggle.tsx'
import { Sources } from './components/Sources.tsx'
import { ThemeToggle } from './components/ThemeToggle.tsx'
import { catalogueAsOf, curatedRows, defaultPrices, fuelWindow } from './data/load.ts'
import {
	type ChartRow,
	MARKERS,
	markersFor,
	panelRows,
	personalRow,
	toChartRow,
} from './lib/chart.ts'
import { formatKm, formatOne, formatPrice } from './lib/format.ts'
import { freshnessOf } from './lib/freshness.ts'
import { translate } from './lib/i18n.ts'
import type { PanelId } from './lib/types.ts'
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

	const [today] = useState(() => new Date())

	const options = useMemo(
		() => ({ prices: state.prices, realWorld: state.realWorld, annualKm: state.annualKm }),
		[state.prices, state.realWorld, state.annualKm],
	)

	const rows = useMemo(() => curatedRows.map((row) => toChartRow(row, options)), [options])

	const personal = useMemo(
		() => (state.car ? personalRow(state.car, options) : null),
		[state.car, options],
	)

	/** The visitor's car lands on the same scale, so it is placed by reach, not appended. */
	const withPersonal = (list: ChartRow[], panel: PanelId): ChartRow[] =>
		personal ? [...list, { ...personal, panel }].sort((left, right) => right.km - left.km) : list

	return (
		<main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
			<header>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<h1 className="text-xl font-bold sm:text-2xl">{t('page.title')}</h1>
					<div className="flex shrink-0 items-center gap-2">
						<ThemeToggle value={theme} language={state.language} onChange={setTheme} />
						<LanguageToggle
							value={state.language}
							onChange={(language) => dispatch({ type: 'language', language })}
						/>
					</div>
				</div>
				<p className="mt-1 text-sm text-muted">{t('page.subtitle')}</p>
				<FreshnessBanner
					language={state.language}
					freshness={freshnessOf(fuelWindow.validTo, today)}
					validFrom={fuelWindow.validFrom}
					validTo={fuelWindow.validTo}
					catalogueAsOf={catalogueAsOf}
				/>
				<p className="mt-2 text-xs text-muted">
					{t('prices.bencin')} {formatPrice(state.prices.bencin, state.language)} ·{' '}
					{t('prices.dizel')} {formatPrice(state.prices.dizel, state.language)} ·{' '}
					{t('prices.elektrika')} {formatPrice(state.prices.elektrika, state.language)} ·{' '}
					{t('prices.javnoPolnjenje')} {formatPrice(state.prices.javnoPolnjenje, state.language)}
				</p>
			</header>

			<div className="mt-5 grid gap-5 rounded-lg border border-rule bg-raised/40 p-4 sm:grid-cols-2">
				<PriceControls
					prices={state.prices}
					overrides={state.overrides}
					language={state.language}
					onChange={(key, value) => dispatch({ type: 'price', key, value })}
					onResetAll={() => dispatch({ type: 'resetPrices' })}
				/>
				<div className="space-y-4">
					<AnnualKmSlider
						value={state.annualKm}
						language={state.language}
						onChange={(value) => dispatch({ type: 'annualKm', value })}
					/>
					<RealWorldToggle
						value={state.realWorld}
						language={state.language}
						onChange={(value) => dispatch({ type: 'realWorld', value })}
					/>
				</div>
			</div>

			<section className="mt-5 grid gap-5 rounded-lg border border-rule p-4 sm:grid-cols-2">
				<div>
					<h2 className="text-xs font-bold tracking-wide uppercase">{t('car.heading')}</h2>
					<div className="mt-2 space-y-2">
						<CarSearch
							language={state.language}
							onSelect={(hit) =>
								dispatch({
									type: 'car',
									car: {
										source: 'catalogue',
										label: hit.entry.brand,
										detail: hit.entry.model,
										powertrain: hit.entry.powertrain,
										consumption: hit.entry.consumption,
									},
								})
							}
						/>
						{state.car && (
							<p className="flex flex-wrap items-center gap-2 text-xs">
								<span className="font-semibold">
									{t('car.resultLabel', {
										model: state.car.source === 'manual' ? t('car.manualLabel') : state.car.label,
										variant: state.car.detail,
									})}
								</span>
								<button
									type="button"
									onClick={() => dispatch({ type: 'car', car: null })}
									className="text-muted underline decoration-dotted"
								>
									{t('car.clear')}
								</button>
							</p>
						)}
					</div>
				</div>
				<ManualCarEntry
					language={state.language}
					onApply={(car) =>
						dispatch({
							type: 'car',
							car: {
								source: 'manual',
								label: translate(state.language, 'car.personal'),
								detail: `${formatOne(car.consumption, state.language)} ${
									car.powertrain === 'elektrika' ? 'kWh/100 km' : 'l/100 km'
								}`,
								powertrain: car.powertrain,
								consumption: car.consumption,
							},
						})
					}
				/>
			</section>

			<div className="mt-6">
				<PanelSwitch
					value={state.panel}
					language={state.language}
					onChange={(panel) => dispatch({ type: 'panel', panel })}
				/>
			</div>

			<div
				className="panels mt-1 grid items-start gap-4 lg:grid-cols-2 lg:gap-5"
				data-panel={state.panel}
			>
				<ChartPanel
					panel="A"
					title={t('panel.a.title')}
					subtitle={t('panel.a.subtitle')}
					rows={withPersonal(panelRows(rows, 'A'), 'A')}
					markers={markersFor(true)}
					language={state.language}
				/>
				<ChartPanel
					panel="B"
					title={t('panel.b.title')}
					subtitle={t('panel.b.subtitle')}
					rows={withPersonal(panelRows(rows, 'B'), 'B')}
					markers={markersFor(true)}
					language={state.language}
				/>
			</div>

			<footer className="mt-6 space-y-2">
				<Legend
					language={state.language}
					publicPrice={formatPrice(state.prices.javnoPolnjenje, state.language)}
				/>
				<p className="text-xs text-muted">
					{t('page.distances', {
						list: MARKERS.map(
							(marker) => `${t(`city.${marker.city}`)} ${formatKm(marker.km, state.language)} km`,
						).join(', '),
					})}
				</p>
			</footer>

			<Sources language={state.language} />
		</main>
	)
}
