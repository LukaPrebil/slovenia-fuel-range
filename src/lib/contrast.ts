export type Rgb = { r: number; g: number; b: number }

export function parseHex(hex: string): Rgb {
	const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
	if (!match) {
		throw new Error(`Not a six digit hex colour: ${hex}`)
	}
	const value = match[1] ?? ''
	return {
		r: parseInt(value.slice(0, 2), 16),
		g: parseInt(value.slice(2, 4), 16),
		b: parseInt(value.slice(4, 6), 16),
	}
}

function channel(value: number): number {
	const scaled = value / 255
	return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex: string): number {
	const { r, g, b } = parseHex(hex)
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG 2.1 contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number {
	const one = relativeLuminance(foreground)
	const two = relativeLuminance(background)
	const lighter = Math.max(one, two)
	const darker = Math.min(one, two)
	return (lighter + 0.05) / (darker + 0.05)
}
