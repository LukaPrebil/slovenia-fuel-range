import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../src/App.tsx'
import { ANNUAL_KM_DEFAULT } from '../../src/lib/state.ts'

function rowTexts(panel: HTMLElement): string[] {
	return within(panel)
		.getAllByTestId('chart-row')
		.map((row) => row.textContent ?? '')
}

function firstKm(panel: HTMLElement): number {
	const text = within(panel).getAllByTestId('row-km')[0]?.textContent ?? '0'
	return Number(text.replace(/\D/g, ''))
}

describe('the controls', () => {
	beforeEach(() => {
		window.history.replaceState(null, '', '/')
		window.localStorage.clear()
	})

	it('starts from the published prices and 15000 km', () => {
		render(<App />)
		expect(screen.getByLabelText('Bencin 95 (€/l)')).toHaveValue(1.627)
		expect(screen.getByLabelText('Letni prevoženi kilometri')).toHaveValue(
			String(ANNUAL_KM_DEFAULT),
		)
	})

	it('redraws the bars when the diesel price changes', () => {
		render(<App />)
		const panelA = screen.getByTestId('panel-A')
		const before = firstKm(panelA)
		const diesel = screen.getByLabelText('Dizel (€/l)')
		fireEvent.change(diesel, { target: { value: '3' } })
		const after = firstKm(panelA)
		// Longer diesel price means every bar is shorter, so the top car can change,
		// but the printed top value must never grow.
		expect(after).toBeLessThanOrEqual(before)
		expect(window.location.search).toContain('d=3')
	})

	it('shows the overridden price in the header line', () => {
		render(<App />)
		fireEvent.change(screen.getByLabelText('Dizel (€/l)'), { target: { value: '2.5' } })
		expect(screen.getByText(/Dizel \(€\/l\) 2,50/)).toBeInTheDocument()
	})

	it('clears an override with its reset button', () => {
		render(<App />)
		fireEvent.change(screen.getByLabelText('Dizel (€/l)'), { target: { value: '2.5' } })
		fireEvent.click(screen.getByRole('button', { name: 'Ponastavi to ceno' }))
		expect(screen.getByLabelText('Dizel (€/l)')).toHaveValue(1.935)
		expect(window.location.search).not.toContain('d=')
	})

	it('drives the yearly figure with the kilometre slider', () => {
		render(<App />)
		const panelA = screen.getByTestId('panel-A')
		const before = rowTexts(panelA)[0] ?? ''
		fireEvent.change(screen.getByLabelText('Letni prevoženi kilometri'), {
			target: { value: '30000' },
		})
		const after = rowTexts(panelA)[0] ?? ''
		expect(after).not.toBe(before)
		expect(after).toMatch(/€\/leto/)
		expect(window.location.search).toContain('km=30000')
	})

	it('raises consumption and lowers reach when real-world figures are on', () => {
		render(<App />)
		const panelA = screen.getByTestId('panel-A')
		const before = firstKm(panelA)
		fireEvent.click(screen.getByLabelText('Realna poraba'))
		expect(firstKm(panelA)).toBeLessThan(before)
		expect(window.location.search).toContain('rw=1')
	})

	it('restores the whole view from the query string', () => {
		window.history.replaceState(null, '', '/?lang=en&e=0.3&km=20000&rw=1')
		render(<App />)
		expect(screen.getByLabelText('Home electricity (€/kWh)')).toHaveValue(0.3)
		expect(screen.getByLabelText('Kilometres driven per year')).toHaveValue('20000')
		expect(screen.getByLabelText('Real-world consumption')).toBeChecked()
	})
})
