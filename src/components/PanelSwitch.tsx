import { translate, type Language } from '../lib/i18n.ts'
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
    <div
      className="mb-2 inline-flex overflow-hidden rounded-md border border-rule lg:hidden"
      role="group"
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
    </div>
  )
}
