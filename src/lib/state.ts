import type { EnergyPrices } from './calc.ts'
import { isLanguage, type Language } from './i18n.ts'

export type PriceKey = keyof EnergyPrices

export const PRICE_KEYS: readonly PriceKey[] = ['bencin', 'dizel', 'elektrika', 'javnoPolnjenje']

export const ANNUAL_KM_MIN = 5000
export const ANNUAL_KM_MAX = 50000
export const ANNUAL_KM_STEP = 1000
export const ANNUAL_KM_DEFAULT = 15000

export type ViewState = {
  language: Language
  prices: EnergyPrices
  overrides: Partial<EnergyPrices>
  annualKm: number
  realWorld: boolean
}

export type Action =
  | { type: 'language'; language: Language }
  | { type: 'price'; key: PriceKey; value: number | null }
  | { type: 'annualKm'; value: number }
  | { type: 'realWorld'; value: boolean }
  | { type: 'resetPrices' }

export function initialState(defaults: EnergyPrices, language: Language = 'sl'): ViewState {
  return {
    language,
    prices: { ...defaults },
    overrides: {},
    annualKm: ANNUAL_KM_DEFAULT,
    realWorld: false,
  }
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
  }
}
