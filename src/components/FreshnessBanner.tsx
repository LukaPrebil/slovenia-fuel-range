import { translate, type Language } from '../lib/i18n.ts'
import type { Freshness } from '../lib/freshness.ts'

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
          from: validFrom,
          to: validTo,
          asOf: catalogueAsOf,
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
