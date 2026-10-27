import type { Powertrain } from '../lib/types.ts'

export const POWERTRAIN_ORDER: readonly Powertrain[] = ['bencin', 'dizel', 'hibrid', 'elektrika']

/**
 * Colours are CSS custom properties keyed by `data-powertrain` (see index.css), so
 * no class name is assembled at runtime and the palette lives in one place.
 */
export const POWERTRAIN_LABEL: Record<Powertrain, string> = {
	bencin: 'bencin',
	dizel: 'dizel',
	hibrid: 'hibrid',
	elektrika: 'elektrika',
}
