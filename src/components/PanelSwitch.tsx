import { type Language, translate } from '../lib/i18n.ts'
import type { PanelView } from '../lib/state.ts'

/** Only phones need this: a wide screen fits both panels side by side. */
export function PanelSwitch({
  value,
  language,
  onChange,
}: {
  value: PanelView
  language: Language
  onChange: (panel: PanelView) => void
}) {
  return (
    <fieldset
      className="m-0 mb-2 inline-flex min-w-0 overflow-hidden rounded-md border border-rule p-0 lg:hidden"
      aria-label={translate(language, 'panel.switch')}
    >
      {(['a', 'b'] as const).map((panel) => (
        <button
          key={panel}
          type="button"
          onClick={() => onChange(panel)}
          aria-pressed={value === panel}
          className={`px-3 py-1.5 text-xs ${
            value === panel ? 'bg-ink text-surface' : 'text-muted hover:bg-raised'
          }`}
        >
          {translate(language, `panel.${panel}.title`)}
        </button>
      ))}
    </fieldset>
  )
}
