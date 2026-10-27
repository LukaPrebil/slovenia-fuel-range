import { en } from '../i18n/en.ts'
import { sl, type MessageKey, type Messages } from '../i18n/sl.ts'

export type Language = 'sl' | 'en'

export const LANGUAGES: readonly Language[] = ['sl', 'en']

const CATALOGUES: Record<Language, Messages> = { sl, en }

export function isLanguage(value: string | null | undefined): value is Language {
  return value === 'sl' || value === 'en'
}

function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

export function translate(
  language: Language,
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  return fill(CATALOGUES[language][key], params)
}

export function translateAll(language: Language): Messages {
  return CATALOGUES[language]
}

/** Both files must stay in step; the test asserts this over the union of keys. */
export function keySets(): { sl: MessageKey[]; en: MessageKey[] } {
  return {
    sl: Object.keys(sl).sort() as MessageKey[],
    en: Object.keys(en).sort() as MessageKey[],
  }
}
