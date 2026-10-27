import { useState } from 'react'
import { loadCatalogue } from '../data/loadCatalogue.ts'
import { translate, type Language } from '../lib/i18n.ts'
import { keyOf, searchCatalogue, type Catalogue, type SearchHit } from '../lib/search.ts'

export function CarSearch({
  language,
  onSelect,
}: {
  language: Language
  onSelect: (hit: SearchHit) => void
}) {
  const [query, setQuery] = useState('')
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  /** Started from the event that needs it, so no effect has to synchronise two renders. */
  const ensureCatalogue = (): void => {
    if (catalogue || loading) {
      return
    }
    setLoading(true)
    loadCatalogue()
      .then(setCatalogue)
      .finally(() => setLoading(false))
  }

  const hits = catalogue ? searchCatalogue(catalogue.entries, query) : []

  return (
    <div className="relative">
      <label htmlFor="car-search" className="block text-xs font-bold tracking-wide uppercase">
        {translate(language, 'car.search')}
      </label>
      <input
        id="car-search"
        type="search"
        autoComplete="off"
        placeholder={translate(language, 'car.searchPlaceholder')}
        value={query}
        onFocus={() => {
          setOpen(true)
          ensureCatalogue()
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          ensureCatalogue()
        }}
        className="mt-1 w-full rounded border border-rule bg-surface px-2 py-1.5 text-sm"
      />
      {open && loading && (
        <p className="mt-1 text-xs text-muted">{translate(language, 'car.loading')}</p>
      )}
      {open && !loading && catalogue && query.length >= 2 && hits.length === 0 && (
        <p className="mt-1 text-xs text-muted">{translate(language, 'car.noResults')}</p>
      )}
      {open && hits.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded border border-rule bg-surface shadow-lg">
          {hits.map((hit) => (
            <li key={keyOf(hit.entry)}>
              <button
                type="button"
                onClick={() => {
                  onSelect(hit)
                  setOpen(false)
                  setQuery('')
                }}
                className="block w-full px-2 py-1.5 text-left text-xs hover:bg-raised"
              >
                <span className="font-semibold">{hit.entry.brand}</span> {hit.entry.model}
                <span className="text-muted">
                  {' '}
                  · {translate(language, `powertrain.${hit.entry.powertrain}`)} ·{' '}
                  {hit.entry.consumption} {hit.entry.unit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
