import type { CuratedRow, Powertrain } from './types.ts'

/** EC correlation factor: the pre-2018 generation figure was measured as NEDC. */
export const NEDC_TO_WLTP = 1.21

/** Consumption overrun against WLTP, from the EC/TNO monitoring reports. */
export const REAL_WORLD: Record<Powertrain, number> = {
	bencin: 1.2,
	dizel: 1.18,
	hibrid: 1.18,
	elektrika: 1.19,
}

/** The axis stops here: the longest bar in the curated set is 4812 km. */
export const BAR_MAX_KM = 5000

export type EnergyPrices = {
	bencin: number
	dizel: number
	elektrika: number
	javnoPolnjenje: number
}

/** A full hybrid burns petrol, so it pays the petrol price. */
export function priceFor(powertrain: Powertrain, prices: EnergyPrices): number {
	switch (powertrain) {
		case 'bencin':
		case 'hibrid':
			return prices.bencin
		case 'dizel':
			return prices.dizel
		case 'elektrika':
			return prices.elektrika
	}
}

/** NEDC conversion happens on read, never in the stored data. */
export function consumptionFor(
	row: Pick<CuratedRow, 'consumption' | 'basis' | 'powertrain'>,
	realWorld: boolean,
): number {
	const wltp = row.basis === 'nedc' ? row.consumption * NEDC_TO_WLTP : row.consumption
	return realWorld ? wltp * REAL_WORLD[row.powertrain] : wltp
}

export function kmPer100Eur(pricePerUnit: number, consumption: number): number {
	return 10000 / (pricePerUnit * consumption)
}

export function eurPer100km(pricePerUnit: number, consumption: number): number {
	return pricePerUnit * consumption
}

export function eurPerYear(annualKm: number, pricePerUnit: number, consumption: number): number {
	return (annualKm / 100) * consumption * pricePerUnit
}

/** Share of the plot a bar fills, capped so the longest bar cannot overflow. */
export function barWidthPercent(km: number, maxKm = BAR_MAX_KM): number {
	return Math.min(100, (km / maxKm) * 100)
}
