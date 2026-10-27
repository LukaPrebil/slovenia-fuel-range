import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../../src/lib/contrast.ts'

const css = readFileSync('src/index.css', 'utf8')

/** Reads the tokens of one block, so both themes are checked from the real stylesheet. */
function tokens(block: RegExp): Record<string, string> {
	const match = block.exec(css)
	if (!match) {
		throw new Error(`No block matching ${block}`)
	}
	const end = css.indexOf('}', match.index)
	const body = css.slice(match.index, end)
	const found: Record<string, string> = {}
	for (const match of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)) {
		found[match[1] ?? ''] = match[2] ?? ''
	}
	return found
}

const light = tokens(/^:root\s*\{/m)
const dark = tokens(/^\[data-theme=["']dark["']\]\s*\{/m)

describe.each([
	['light', light],
	['dark', dark],
])('contrast in the %s theme', (_name, theme) => {
	const background = theme.surface ?? '#ffffff'

	it('keeps body text and muted text at AA', () => {
		expect(contrastRatio(theme.ink ?? '', background)).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(theme['ink-muted'] ?? '', background)).toBeGreaterThanOrEqual(4.5)
	})

	it('keeps every powertrain label at AA', () => {
		for (const powertrain of ['bencin', 'dizel', 'hibrid', 'elektrika']) {
			expect(contrastRatio(theme[`ink-${powertrain}`] ?? '', background)).toBeGreaterThanOrEqual(
				4.5,
			)
		}
	})

	it('keeps every bar at the 3:1 needed for a graphic', () => {
		for (const powertrain of ['bencin', 'dizel', 'hibrid', 'elektrika']) {
			expect(contrastRatio(theme[`bar-${powertrain}`] ?? '', background)).toBeGreaterThanOrEqual(3)
		}
	})
})
