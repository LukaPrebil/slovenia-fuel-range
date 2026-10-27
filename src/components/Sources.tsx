import { SOURCES } from '../data/sources.ts'
import { translate, type Language } from '../lib/i18n.ts'

export function Sources({ language }: { language: Language }) {
  return (
    <section aria-labelledby="sources-heading" className="mt-8 border-t border-rule pt-4">
      <h2 id="sources-heading" className="text-xs font-bold tracking-wide uppercase">
        {translate(language, 'source.heading')}
      </h2>
      <p className="mt-2 max-w-4xl text-xs text-muted">{translate(language, 'source.method')}</p>
      <p className="mt-1 max-w-4xl text-xs text-muted">{translate(language, 'source.note')}</p>
      <ul className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
        {SOURCES.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted underline decoration-dotted hover:text-ink"
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
