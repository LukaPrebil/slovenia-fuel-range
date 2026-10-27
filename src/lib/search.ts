import type { CatalogueEntry } from './types.ts'

export type Catalogue = {
  sourceUrl: string
  asOf: string
  entries: CatalogueEntry[]
}

/** Accent- and case-insensitive, so "skoda" finds "ŠKODA" and "citroen" finds "CITROËN". */
export function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export type SearchHit = {
  entry: CatalogueEntry
  /** Lower is better: 0 for a prefix hit, 1 for a word start, 2 for anywhere. */
  rank: number
}

const MAX_HITS = 12

export function searchCatalogue(
  entries: CatalogueEntry[],
  query: string,
  limit = MAX_HITS,
): SearchHit[] {
  const needle = normalise(query)
  if (needle.length < 2) {
    return []
  }
  const hits: SearchHit[] = []
  for (const entry of entries) {
    const haystack = normalise(`${entry.brand} ${entry.model}`)
    const at = haystack.indexOf(needle)
    if (at === -1) {
      continue
    }
    const rank = at === 0 ? 0 : haystack[at - 1] === ' ' ? 1 : 2
    hits.push({ entry, rank })
  }
  return hits
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        left.entry.brand.localeCompare(right.entry.brand, 'sl') ||
        left.entry.model.localeCompare(right.entry.model, 'sl'),
    )
    .slice(0, limit)
}
