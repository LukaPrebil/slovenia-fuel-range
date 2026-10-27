import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../../src/lib/contrast.ts'

const css = readFileSync('src/index.css', 'utf8')

/** Reads the tokens of one block, so both themes are checked from the real stylesheet. */
function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`)
  const end = css.indexOf('}', start)
  const body = css.slice(start, end)
  const found: Record<string, string> = {}
  for (const match of body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)) {
    found[match[1] ?? ''] = match[2] ?? ''
  }
  return found
}

const light = tokens(':root')
const dark = tokens("[data-theme='dark']")

describe.each([
  ['light', light],
  ['dark', dark],
])('contrast in the %s theme', (_name, theme) => {
  const background = theme['surface'] ?? '#ffffff'

  it('keeps body text and muted text at AA', () => {
    expect(contrastRatio(theme['ink'] ?? '', background)).toBeGreaterThanOrEqual(4.5)
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
