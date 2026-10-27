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

/** Rows can share brand, model and powertrain, so consumption belongs in the key. */
export function keyOf(entry: CatalogueEntry): string {
	return `${entry.brand}|${entry.model}|${entry.powertrain}|${entry.consumption}`
}

export type SearchHit = {
	entry: CatalogueEntry
	/**
	 * How well the entry answers the query. Lower is better:
	 * 0 model name starts with the query, 1 brand starts with it,
	 * 2 a later word starts with it, 3 the query appears inside a word.
	 */
	rank: number
}

const MAX_HITS = 12
/** One model must not fill the list with its trim levels. */
const MAX_PER_FAMILY = 4

/** "Karoq Edition 1.0 TSI" -> "karoq", "KANGOO / 1.3 / 16V" -> "kangoo". */
export function familyOf(model: string): string {
	const head = model.split('/')[0] ?? model
	return normalise(head).split(' ')[0] ?? ''
}

function rankOf(entry: CatalogueEntry, needle: string): number | null {
	const model = normalise(entry.model)
	const brand = normalise(entry.brand)
	if (model.startsWith(needle)) {
		return 0
	}
	if (brand.startsWith(needle)) {
		return 1
	}
	if (model.split(' ').some((word) => word.startsWith(needle))) {
		return 2
	}
	if (`${brand} ${model}`.includes(needle)) {
		return 3
	}
	return null
}

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
		const rank = rankOf(entry, needle)
		if (rank !== null) {
			hits.push({ entry, rank })
		}
	}

	hits.sort(
		(left, right) =>
			left.rank - right.rank ||
			left.entry.model.length - right.entry.model.length ||
			left.entry.brand.localeCompare(right.entry.brand, 'sl') ||
			left.entry.model.localeCompare(right.entry.model, 'sl'),
	)

	const perFamily = new Map<string, number>()
	const picked: SearchHit[] = []
	for (const hit of hits) {
		const family = `${normalise(hit.entry.brand)}|${familyOf(hit.entry.model)}`
		const used = perFamily.get(family) ?? 0
		if (used >= MAX_PER_FAMILY) {
			continue
		}
		perFamily.set(family, used + 1)
		picked.push(hit)
		if (picked.length === limit) {
			break
		}
	}
	return picked
}
