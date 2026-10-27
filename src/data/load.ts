import curatedCsv from '../../data/curated.csv?raw'
import manualPrices from '../../data/prices-manual.json'
import pricesFile from '../../data/prices.json'
import type { EnergyPrices } from '../lib/calc.ts'
import { parseCuratedCsv } from '../lib/curated.ts'
import type { CuratedRow } from '../lib/types.ts'

export const curatedRows: CuratedRow[] = parseCuratedCsv(curatedCsv)

export const fuelWindow = pricesFile.fuel

/** Fuel comes from the weekly export; electricity is a hand-maintained snapshot. */
export const defaultPrices: EnergyPrices = {
  bencin: pricesFile.fuel.bencin,
  dizel: pricesFile.fuel.dizel,
  elektrika: manualPrices.elektrika.pricePerKwh,
  javnoPolnjenje: manualPrices.javnoPolnjenje.pricePerKwh,
}

export const manualPriceMeta = {
  elektrika: manualPrices.elektrika,
  javnoPolnjenje: manualPrices.javnoPolnjenje,
}
