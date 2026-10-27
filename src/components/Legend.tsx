import { type Language, translate } from '../lib/i18n.ts'
import { POWERTRAINS } from '../lib/types.ts'
import { BAR_COLOUR, INK_COLOUR } from './powertrain.ts'

export function Legend({ language, publicPrice }: { language: Language; publicPrice: string }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
      {POWERTRAINS.map((powertrain) => (
        <li key={powertrain} className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-5 rounded-full ${BAR_COLOUR[powertrain]}`} />
          <span className={`font-semibold ${INK_COLOUR[powertrain]}`}>
            {translate(language, `powertrain.${powertrain}`)}
          </span>
        </li>
      ))}
      <li className="flex items-center gap-2 text-muted">
        <span className="inline-block h-1 w-5 rounded-full bg-elektrika opacity-40" />
        <span>{translate(language, 'page.legendGhost', { price: publicPrice })}</span>
      </li>
    </ul>
  )
}
