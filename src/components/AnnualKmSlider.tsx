import { formatKm } from '../lib/format.ts'
import { type Language, translate } from '../lib/i18n.ts'
import { ANNUAL_KM_MAX, ANNUAL_KM_MIN, ANNUAL_KM_STEP } from '../lib/state.ts'

export function AnnualKmSlider({
  value,
  language,
  onChange,
}: {
  value: number
  language: Language
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-xs">
        <span className="font-bold tracking-wide uppercase">
          {translate(language, 'controls.annualKm')}
        </span>
        <span className="tabular-nums">{formatKm(value, language)} km</span>
      </span>
      <input
        type="range"
        min={ANNUAL_KM_MIN}
        max={ANNUAL_KM_MAX}
        step={ANNUAL_KM_STEP}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={translate(language, 'controls.annualKm')}
        className="mt-2 w-full accent-current"
      />
    </label>
  )
}
