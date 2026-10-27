import type { EnergyPrices } from './calc.ts'
import { isLanguage, type Language } from './i18n.ts'
import { POWERTRAINS, type Powertrain } from './types.ts'

export type PriceKey = keyof EnergyPrices

export const PRICE_KEYS: readonly PriceKey[] = ['bencin', 'dizel', 'elektrika', 'javnoPolnjenje']

export const ANNUAL_KM_MIN = 5000
export const ANNUAL_KM_MAX = 50000
export const ANNUAL_KM_STEP = 1000
export const ANNUAL_KM_DEFAULT = 15000

export type PersonalCar = {
  source: 'catalogue' | 'manual'
  label: string
  detail: string
  powertrain: Powertrain
  consumption: number
}

export type ViewState = {
  language: Language
  prices: EnergyPrices
  overrides: Partial<EnergyPrices>
  annualKm: number
  realWorld: boolean
  car: PersonalCar | null
}

export type Action =
  | { type: 'language'; language: Language }
  | { type: 'price'; key: PriceKey; value: number | null }
  | { type: 'annualKm'; value: number }
  | { type: 'realWorld'; value: boolean }
  | { type: 'resetPrices' }
  | { type: 'car'; car: PersonalCar | null }

export function initialState(defaults: EnergyPrices, language: Language = 'sl'): ViewState {
  return {
    language,
    prices: { ...defaults },
    overrides: {},
    annualKm: ANNUAL_KM_DEFAULT,
    realWorld: false,
    car: null,
  }
}

function isPowertrain(value: string): value is Powertrain {
  return POWERTRAINS.some((powertrain) => powertrain === value)
}

/** A car travels in the link as `kind|label|detail|powertrain|consumption`. */
export function encodeCar(car: PersonalCar): string {
  return [car.source, car.label, car.detail, car.powertrain, String(car.consumption)].join('|')
}

export function decodeCar(raw: string | null): PersonalCar | null {
  if (!raw) {
    return null
  }
  const parts = raw.split('|')
  if (parts.length !== 5) {
    return null
  }
  const [source, label, detail, powertrain, consumption] = parts as [
    string,
    string,
    string,
    string,
    string,
  ]
  const value = Number(consumption.replace(',', '.'))
  if (
    (source !== 'catalogue' && source !== 'manual') ||
    !isPowertrain(powertrain) ||
    !(value > 0)
  ) {
    return null
  }
  return { source, label, detail, powertrain, consumption: value }
}

export function clampAnnualKm(value: number): number {
  if (!Number.isFinite(value)) {
    return ANNUAL_KM_DEFAULT
  }
  const stepped = Math.round(value / ANNUAL_KM_STEP) * ANNUAL_KM_STEP
  return Math.min(ANNUAL_KM_MAX, Math.max(ANNUAL_KM_MIN, stepped))
}

function isPrice(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function reducer(state: ViewState, action: Action, defaults: EnergyPrices): ViewState {
  switch (action.type) {
    case 'language':
      return { ...state, language: action.language }
    case 'price': {
      if (!isPrice(action.value)) {
        const overrides = { ...state.overrides }
        delete overrides[action.key]
        return { ...state, overrides, prices: { ...defaults, ...overrides } }
      }
      const overrides = { ...state.overrides, [action.key]: action.value }
      return { ...state, overrides, prices: { ...defaults, ...overrides } }
    }
    case 'annualKm':
      return { ...state, annualKm: clampAnnualKm(action.value) }
    case 'realWorld':
      return { ...state, realWorld: action.value }
    case 'resetPrices':
      return { ...state, overrides: {}, prices: { ...defaults } }
    case 'car':
      return { ...state, car: action.car }
  }
}

/** Short keys keep a copied link readable: lang, p, d, e, j, km, rw. */
const QUERY_KEYS: Record<PriceKey, string> = {
  bencin: 'p',
  dizel: 'd',
  elektrika: 'e',
  javnoPolnjenje: 'j',
}

export function toQuery(state: ViewState): string {
  const params = new URLSearchParams()
  if (state.language !== 'sl') {
    params.set('lang', state.language)
  }
  for (const key of PRICE_KEYS) {
    const value = state.overrides[key]
    if (value !== undefined) {
      params.set(QUERY_KEYS[key], String(value))
    }
  }
  if (state.annualKm !== ANNUAL_KM_DEFAULT) {
    params.set('km', String(state.annualKm))
  }
  if (state.realWorld) {
    params.set('rw', '1')
  }
  if (state.car) {
    params.set('car', encodeCar(state.car))
  }
  const query = params.toString()
  return query === '' ? '' : `?${query}`
}

function readNumber(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key)
  if (raw === null) {
    return null
  }
  const value = Number(raw.replace(',', '.'))
  return Number.isFinite(value) && value > 0 ? value : null
}

export function fromQuery(
  search: string,
  defaults: EnergyPrices,
  fallbackLanguage: Language = 'sl',
): ViewState {
  const params = new URLSearchParams(search)
  const language = params.get('lang')
  const overrides: Partial<EnergyPrices> = {}
  for (const key of PRICE_KEYS) {
    const value = readNumber(params, QUERY_KEYS[key])
    if (value !== null) {
      overrides[key] = value
    }
  }
  const km = readNumber(params, 'km')
  return {
    language: isLanguage(language) ? language : fallbackLanguage,
    overrides,
    prices: { ...defaults, ...overrides },
    annualKm: km === null ? ANNUAL_KM_DEFAULT : clampAnnualKm(km),
    realWorld: params.get('rw') === '1',
    car: decodeCar(params.get('car')),
  }
}
