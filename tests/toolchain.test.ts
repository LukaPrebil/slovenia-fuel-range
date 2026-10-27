import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const nvmrc = readFileSync('.nvmrc', 'utf8').trim()
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
	engines?: { node?: string }
	devDependencies?: Record<string, string>
}

/** A Node bump has to move every place that names a version, or CI drifts from local. */
describe('the toolchain version', () => {
	it('is pinned in .nvmrc as a plain major', () => {
		expect(nvmrc).toMatch(/^\d+$/)
	})

	it('matches the engines range', () => {
		expect(pkg.engines?.node).toBe(`>=${nvmrc}`)
	})

	it('matches the @types/node major', () => {
		const types = pkg.devDependencies?.['@types/node'] ?? ''
		expect(types).toMatch(new RegExp(`\\^${nvmrc}\\.`))
	})

	it('is the version the workflows deploy with', () => {
		for (const workflow of [
			'.github/workflows/ci.yml',
			'.github/workflows/pages.yml',
			'.github/workflows/refresh.yml',
		]) {
			const text = readFileSync(workflow, 'utf8')
			expect(text).toContain('node-version-file: .nvmrc')
			expect(text).not.toMatch(/node-version: \d/)
		}
	})
})
