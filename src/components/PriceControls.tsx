import type { EnergyPrices } from '../lib/calc.ts'
import { type Language, translate } from '../lib/i18n.ts'
import { PRICE_KEYS, type PriceKey } from '../lib/state.ts'

const LABEL_KEY: Record<PriceKey, Parameters<typeof translate>[1]> = {
  bencin: 'prices.bencin',
  dizel: 'prices.dizel',
  elektrika: 'prices.elektrika',
  javnoPolnjenje: 'prices.javnoPolnjenje',
}

const STEP: Record<PriceKey, number> = {
  bencin: 0.001,
  dizel: 0.001,
  elektrika: 0.0001,
  javnoPolnjenje: 0.01,
}

export function PriceControls({
  prices,
  overrides,
  language,
  onChange,
  onResetAll,
}: {
  prices: EnergyPrices
  overrides: Partial<EnergyPrices>
  language: Language
  onChange: (key: PriceKey, value: number | null) => void
  onResetAll: () => void
}) {
  const anyOverride = Object.keys(overrides).length > 0
  return (
    <section aria-labelledby="prices-heading">
      <div className="flex items-center justify-between">
        <h2 id="prices-heading" className="text-xs font-bold tracking-wide uppercase">
          {translate(language, 'prices.heading')}
        </h2>
        <button
          type="button"
          onClick={onResetAll}
          disabled={!anyOverride}
          className="rounded px-1 text-xs text-muted hover:text-ink disabled:opacity-40"
        >
          {translate(language, 'prices.reset')}
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {PRICE_KEYS.map((key) => {
          const overridden = overrides[key] !== undefined
          const label = translate(language, LABEL_KEY[key])
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between gap-1">
                <label htmlFor={`price-${key}`} className="block text-[0.7rem] text-muted">
                  {label}
                </label>
                {overridden && (
                  <button
                    type="button"
                    onClick={() => onChange(key, null)}
                    aria-label={translate(language, 'prices.resetOne')}
                    title={translate(language, 'prices.overridden')}
                    className="rounded px-0.5 text-[0.7rem] text-ink underline decoration-dotted"
                  >
                    ↺
                  </button>
                )}
              </div>
              <input
                id={`price-${key}`}
                type="number"
                inputMode="decimal"
                min={0}
                step={STEP[key]}
                value={prices[key]}
                aria-label={label}
                onChange={(event) => {
                  const raw = event.target.value
                  const value = Number(raw.replace(',', '.'))
                  onChange(key, raw === '' || !Number.isFinite(value) ? null : value)
                }}
                className={`mt-0.5 w-full rounded border px-2 py-1 text-sm tabular-nums ${
                  overridden ? 'border-ink font-semibold' : 'border-rule'
                } bg-surface`}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
