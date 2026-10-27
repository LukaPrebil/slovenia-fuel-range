import { describe, expect, it } from 'vitest'
import {
  ANNUAL_KM_DEFAULT,
  ANNUAL_KM_MAX,
  ANNUAL_KM_MIN,
  clampAnnualKm,
  fromQuery,
  initialState,
  reducer,
  toQuery,
  type ViewState,
} from '../../src/lib/state.ts'
import type { EnergyPrices } from '../../src/lib/calc.ts'

const DEFAULTS: EnergyPrices = {
  bencin: 1.627,
  dizel: 1.935,
  elektrika: 0.1807,
  javnoPolnjenje: 0.47,
}

describe('annual kilometres', () => {
  it('defaults to 15000', () => {
    expect(initialState(DEFAULTS).annualKm).toBe(ANNUAL_KM_DEFAULT)
  })

  it('clamps and snaps to the step', () => {
    expect(clampAnnualKm(1000)).toBe(ANNUAL_KM_MIN)
    expect(clampAnnualKm(90000)).toBe(ANNUAL_KM_MAX)
    expect(clampAnnualKm(17400)).toBe(17000)
    expect(clampAnnualKm(Number.NaN)).toBe(ANNUAL_KM_DEFAULT)
  })
})

describe('price overrides', () => {
  it('records an override and applies it to the effective price', () => {
    const next = reducer(
      initialState(DEFAULTS),
      { type: 'price', key: 'dizel', value: 2.1 },
      DEFAULTS,
    )
    expect(next.overrides).toEqual({ dizel: 2.1 })
    expect(next.prices.dizel).toBe(2.1)
    expect(next.prices.bencin).toBe(DEFAULTS.bencin)
  })

  it('clears an override when the value is null or invalid', () => {
    const overridden = reducer(
      initialState(DEFAULTS),
      { type: 'price', key: 'dizel', value: 2.1 },
      DEFAULTS,
    )
    const cleared = reducer(overridden, { type: 'price', key: 'dizel', value: null }, DEFAULTS)
    expect(cleared.overrides).toEqual({})
    expect(cleared.prices.dizel).toBe(DEFAULTS.dizel)
    const rejected = reducer(overridden, { type: 'price', key: 'dizel', value: -1 }, DEFAULTS)
    expect(rejected.prices.dizel).toBe(DEFAULTS.dizel)
  })

  it('resets every override', () => {
    let state = reducer(
      initialState(DEFAULTS),
      { type: 'price', key: 'bencin', value: 2 },
      DEFAULTS,
    )
    state = reducer(state, { type: 'price', key: 'elektrika', value: 0.3 }, DEFAULTS)
    const reset = reducer(state, { type: 'resetPrices' }, DEFAULTS)
    expect(reset.prices).toEqual(DEFAULTS)
    expect(reset.overrides).toEqual({})
  })
})

describe('the query string', () => {
  const state: ViewState = {
    language: 'en',
    prices: { ...DEFAULTS, dizel: 2.1 },
    overrides: { dizel: 2.1 },
    annualKm: 25000,
    realWorld: true,
    car: null,
    panel: 'b',
  }

  it('is empty for a default view', () => {
    expect(toQuery(initialState(DEFAULTS))).toBe('')
  })

  it('round trips every control', () => {
    const query = toQuery(state)
    expect(query).toBe('?lang=en&d=2.1&km=25000&rw=1&panel=b')
    expect(fromQuery(query, DEFAULTS)).toEqual(state)
  })

  it('falls back to defaults on unknown or hostile values', () => {
    const parsed = fromQuery('?lang=de&p=abc&d=-3&km=999999&rw=yes', DEFAULTS)
    expect(parsed.language).toBe('sl')
    expect(parsed.overrides).toEqual({})
    expect(parsed.prices).toEqual(DEFAULTS)
    expect(parsed.annualKm).toBe(ANNUAL_KM_MAX)
    expect(parsed.realWorld).toBe(false)
  })

  it('accepts a comma decimal in a copied link', () => {
    expect(fromQuery('?d=2,1', DEFAULTS).prices.dizel).toBe(2.1)
  })
})

describe('the panel switch', () => {
  it('defaults to panel A and travels in the link only when changed', () => {
    const base = initialState(DEFAULTS)
    expect(base.panel).toBe('a')
    expect(toQuery(base)).toBe('')
    const switched = reducer(base, { type: 'panel', panel: 'b' }, DEFAULTS)
    expect(toQuery(switched)).toBe('?panel=b')
    expect(fromQuery('?panel=b', DEFAULTS).panel).toBe('b')
    expect(fromQuery('?panel=z', DEFAULTS).panel).toBe('a')
  })
})
