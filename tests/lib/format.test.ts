import { describe, expect, it } from 'vitest'
import { formatEur, formatKm, formatOne, formatPercent, formatPrice } from '../../src/lib/format.ts'

describe('Slovenian formatting', () => {
  it('uses a dot for thousands and a comma for decimals', () => {
    expect(formatKm(4812)).toBe('4.812')
    expect(formatKm(10000)).toBe('10.000')
    expect(formatKm(999)).toBe('999')
    expect(formatKm(1000)).toBe('1.000')
    expect(formatKm(806)).toBe('806')
    expect(formatEur(1220.25)).toBe('1.220,25')
    expect(formatOne(5.49)).toBe('5,5')
  })

  it('keeps three decimals for a fuel price and up to four for electricity', () => {
    expect(formatPrice(1.627)).toBe('1,627')
    expect(formatPrice(0.1807)).toBe('0,181')
  })

  it('rounds km to whole numbers', () => {
    expect(formatKm(1119.4)).toBe('1.119')
    expect(formatKm(1119.5)).toBe('1.120')
  })

  it('formats a share as a whole percentage', () => {
    expect(formatPercent(0.42)).toBe('42')
  })
})
