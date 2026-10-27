import catalogueMeta from '../../data/catalogue-meta.json'
import curatedCsv from '../../data/curated.csv?raw'
import pricesFile from '../../data/prices.json'
import manualPrices from '../../data/prices-manual.json'
import type { EnergyPrices } from '../lib/calc.ts'
import { parseCuratedCsv } from '../lib/curated.ts'
import type { CuratedRow } from '../lib/types.ts'

export const curatedRows: CuratedRow[] = parseCuratedCsv(curatedCsv)

export const fuelWindow = pricesFile.fuel

/** The catalogue itself loads on first search; its edition is tiny and needed up front. */
export const catalogueAsOf: string = catalogueMeta.asOf

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
