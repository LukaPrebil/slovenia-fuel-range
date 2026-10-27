import { formatDate, formatMonth } from '../lib/format.ts'
import type { Freshness } from '../lib/freshness.ts'
import { type Language, translate } from '../lib/i18n.ts'

export function FreshnessBanner({
  language,
  freshness,
  validFrom,
  validTo,
  catalogueAsOf,
}: {
  language: Language
  freshness: Freshness
  validFrom: string
  validTo: string
  catalogueAsOf: string
}) {
  return (
    <div className="mt-3 space-y-1">
      <p className="text-xs text-muted">
        {translate(language, 'freshness.window', {
          from: formatDate(validFrom, language),
          to: formatDate(validTo, language),
          asOf: formatMonth(catalogueAsOf, language),
        })}
      </p>
      {freshness.stale && (
        <p
          role="status"
          className="rounded border border-hibrid/60 bg-hibrid/10 px-2 py-1 text-xs text-ink-hibrid"
        >
          {translate(language, 'freshness.stale')}
        </p>
      )}
    </div>
  )
}
