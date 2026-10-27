import type { Language } from './i18n.ts'

/**
 * Slovenian typography puts a dot between thousands and a comma before decimals;
 * English does the opposite. Grouping is written out rather than delegated to Intl
 * because CLDR suppresses the separator for four-digit Slovenian numbers, while the
 * published chart groups every number above 999 ("1.120 km").
 */
const GROUP: Record<Language, string> = { sl: '.', en: ',' }
const DECIMAL: Record<Language, string> = { sl: ',', en: '.' }

function group(digits: string, language: Language): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP[language])
}

function fixed(value: number, decimals: number, language: Language): string {
  const rounded = Math.abs(value).toFixed(decimals)
  const [whole = '0', fraction] = rounded.split('.')
  const sign = value < 0 ? '-' : ''
  const body =
    fraction === undefined
      ? group(whole, language)
      : `${group(whole, language)}${DECIMAL[language]}${fraction}`
  return `${sign}${body}`
}

/** 4812 -> "4.812" in Slovenian, "4,812" in English. */
export function formatKm(km: number, language: Language = 'sl'): string {
  return fixed(Math.round(km), 0, language)
}

/** 1220.25 -> "1.220,25" or "1,220.25" */
export function formatEur(eur: number, language: Language = 'sl'): string {
  return fixed(eur, 2, language)
}

/** 5.49 -> "5,5" or "5.5" */
export function formatOne(value: number, language: Language = 'sl'): string {
  return fixed(value, 1, language)
}

/** 1.627 -> "1,627" or "1.627"; 0.1807 -> "0,181" or "0.181" */
export function formatPrice(value: number, language: Language = 'sl'): string {
  return fixed(value, 3, language)
}

/** 0.42 -> "42" */
export function formatPercent(ratio: number, language: Language = 'sl'): string {
  return fixed(Math.round(ratio * 100), 0, language)
}

const SL_MONTHS_LONG = [
  'januar',
  'februar',
  'marec',
  'april',
  'maj',
  'junij',
  'julij',
  'avgust',
  'september',
  'oktober',
  'november',
  'december',
]

const EN_MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const EN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function parts(iso: string): { year: string; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(iso.trim())
  if (!match) {
    return null
  }
  return { year: match[1] ?? '', month: Number(match[2]), day: Number(match[3] ?? '1') }
}

/** "2026-10-27" -> "27. 10. 2026" in Slovenian, "27 Oct 2026" in English. */
export function formatDate(iso: string, language: Language = 'sl'): string {
  const parsed = parts(iso)
  if (!parsed) {
    return iso
  }
  const { year, month, day } = parsed
  if (language === 'sl') {
    return `${day}. ${month}. ${year}`
  }
  return `${day} ${EN_MONTHS_SHORT[month - 1] ?? ''} ${year}`
}

/** "2026-06" -> "junij 2026" or "June 2026". */
export function formatMonth(iso: string, language: Language = 'sl'): string {
  const parsed = parts(iso)
  if (!parsed) {
    return iso
  }
  const { year, month } = parsed
  const name = language === 'sl' ? SL_MONTHS_LONG[month - 1] : EN_MONTHS_LONG[month - 1]
  return `${name ?? iso} ${year}`
}
