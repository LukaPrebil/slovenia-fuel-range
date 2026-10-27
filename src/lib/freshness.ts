export type FreshnessInput = {
  validFrom: string
  validTo: string
  catalogueAsOf: string
}

export type Freshness = {
  /** Whole days between the end of the price window and the viewing day. */
  daysOld: number
  stale: boolean
}

export const STALE_AFTER_DAYS = 14

function toUtcDay(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number)
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

/** Whole days since the last day the price window covers. */
export function daysSinceWindowEnd(validTo: string, today: Date): number {
  const day = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.round((day - toUtcDay(validTo)) / 86_400_000)
}

export function freshnessOf(validTo: string, today: Date): Freshness {
  const daysOld = Math.max(0, daysSinceWindowEnd(validTo, today))
  return { daysOld, stale: daysOld > STALE_AFTER_DAYS }
}
