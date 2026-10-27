/**
 * Slovenian typography: a dot groups thousands, a comma separates decimals.
 * Grouping is done here rather than through Intl because CLDR suppresses the
 * separator for four-digit numbers in sl-SI, while the published chart groups
 * every number above 999 ("1.120 km"). Explicit grouping also keeps output
 * identical in Node, in the browser and in tests.
 */
function group(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function fixed(value: number, decimals: number): string {
  const rounded = Math.abs(value).toFixed(decimals)
  const [whole = '0', fraction] = rounded.split('.')
  const sign = value < 0 ? '-' : ''
  const body = fraction === undefined ? group(whole) : `${group(whole)},${fraction}`
  return `${sign}${body}`
}

/** 4812 -> "4.812", 806 -> "806" */
export function formatKm(km: number): string {
  return fixed(Math.round(km), 0)
}

/** 1220.25 -> "1.220,25" */
export function formatEur(eur: number): string {
  return fixed(eur, 2)
}

/** 5.49 -> "5,5" */
export function formatOne(value: number): string {
  return fixed(value, 1)
}

/** 1.627 -> "1,627", 0.1807 -> "0,181" */
export function formatPrice(value: number): string {
  return fixed(value, 3)
}

/** 0.42 -> "42" */
export function formatPercent(ratio: number): string {
  return fixed(Math.round(ratio * 100), 0)
}
