import type { Catalogue } from '../lib/search.ts'

let cached: Promise<Catalogue> | null = null

/**
 * The catalogue is 24 KB gzipped and only needed once someone searches, so it
 * arrives in its own chunk instead of the first paint.
 */
export function loadCatalogue(): Promise<Catalogue> {
  cached ??= import('../../data/catalogue.json').then((module) => module.default as Catalogue)
  return cached
}
