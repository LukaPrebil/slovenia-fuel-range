import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe('shell', () => {
	it('renders the Slovenian page title', () => {
		render(<App />)
		expect(
			screen.getByRole('heading', { name: 'Koliko kilometrov za 100 evrov energije' }),
		).toBeInTheDocument()
	})
})
