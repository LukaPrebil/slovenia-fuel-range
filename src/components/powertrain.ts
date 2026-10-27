import type { Powertrain } from '../lib/types.ts'

export const BAR_COLOUR: Record<Powertrain, string> = {
  bencin: 'bg-bencin',
  dizel: 'bg-dizel',
  hibrid: 'bg-hibrid',
  elektrika: 'bg-elektrika',
}

export const INK_COLOUR: Record<Powertrain, string> = {
  bencin: 'text-ink-bencin',
  dizel: 'text-ink-dizel',
  hibrid: 'text-ink-hibrid',
  elektrika: 'text-ink-elektrika',
}

export const POWERTRAIN_LABEL: Record<Powertrain, string> = {
  bencin: 'bencin',
  dizel: 'dizel',
  hibrid: 'hibrid',
  elektrika: 'elektrika',
}
