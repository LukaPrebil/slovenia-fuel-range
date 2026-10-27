import { describe, expect, it } from 'vitest'
import { daysSinceWindowEnd, freshnessOf, STALE_AFTER_DAYS } from '../../src/lib/freshness.ts'

const TODAY = new Date('2026-10-30T09:00:00Z')

describe('data age', () => {
  it('counts whole days since the window ended', () => {
    expect(daysSinceWindowEnd('2026-11-02', TODAY)).toBe(-3)
    expect(daysSinceWindowEnd('2026-10-29', TODAY)).toBe(1)
    expect(daysSinceWindowEnd('2026-10-28', TODAY)).toBe(2)
  })

  it('is not stale inside the window', () => {
    const fresh = freshnessOf('2026-11-02', TODAY)
    expect(fresh.stale).toBe(false)
    expect(fresh.daysOld).toBe(0)
  })

  it('warns after fourteen days', () => {
    expect(freshnessOf('2026-10-16', TODAY).stale).toBe(false)
    expect(freshnessOf('2026-10-15', TODAY).stale).toBe(true)
    expect(STALE_AFTER_DAYS).toBe(14)
  })

  it('reports the age in whole days', () => {
    expect(freshnessOf('2026-10-01', TODAY).daysOld).toBe(29)
  })
})
