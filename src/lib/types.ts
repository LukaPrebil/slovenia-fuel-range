export type Powertrain = 'bencin' | 'dizel' | 'hibrid' | 'elektrika'

export type ConsumptionUnit = 'l/100km' | 'kWh/100km'

export type Basis = 'wltp' | 'nedc'

export type PanelId = 'A' | 'B'

export type CuratedRow = {
	panel: PanelId
	rank: number
	model: string
	variant: string
	powertrain: Powertrain
	count: number
	consumption: number
	unit: ConsumptionUnit
	basis: Basis
	sourceUrl: string
	asOf: string
}

export const POWERTRAINS: readonly Powertrain[] = ['bencin', 'dizel', 'hibrid', 'elektrika']

/** One row of the searchable catalogue built from the ARSO list. */
export type CatalogueEntry = {
	brand: string
	model: string
	powertrain: Powertrain
	consumption: number
	unit: ConsumptionUnit
}
