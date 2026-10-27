import { type Language, translate } from '../lib/i18n.ts'
import { POWERTRAINS } from '../lib/types.ts'

export function Legend({ language, publicPrice }: { language: Language; publicPrice: string }) {
	return (
		<ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
			{POWERTRAINS.map((powertrain) => (
				<li key={powertrain} className="flex items-center gap-2" data-powertrain={powertrain}>
					<span className="legend-swatch inline-block h-2.5 w-5 rounded-full" />
					<span className="legend-label font-semibold">
						{translate(language, `powertrain.${powertrain}`)}
					</span>
				</li>
			))}
			<li className="flex items-center gap-2 text-muted" data-powertrain="elektrika">
				<span className="legend-swatch inline-block h-1 w-5 rounded-full opacity-40" />
				<span>{translate(language, 'page.legendGhost', { price: publicPrice })}</span>
			</li>
		</ul>
	)
}
