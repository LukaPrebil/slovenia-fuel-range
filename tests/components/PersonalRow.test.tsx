import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../src/App.tsx'
import { loadCatalogue } from '../../src/data/loadCatalogue.ts'

/** Role queries with an accessible name do not resolve in this DOM, so match on text. */
async function findResultButton(pattern: RegExp): Promise<HTMLElement> {
  let found: HTMLElement | undefined
  await waitFor(() => {
    found = screen.getAllByRole('button').find((button) => pattern.test(button.textContent ?? ''))
    expect(found).toBeDefined()
  })
  if (!found) {
    throw new Error(`No result button matching ${pattern}`)
  }
  return found
}

/** The badge also appears in the picker summary, so count chart rows instead. */
function personalRows(): HTMLElement[] {
  return screen
    .queryAllByTestId('chart-row')
    .filter((row) => row.textContent?.includes('tvoj avto') ?? false)
}

describe('your own car', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    window.localStorage.clear()
  })

  it('inserts a car picked from the catalogue at its place in the chart', async () => {
    await loadCatalogue()
    render(<App />)
    const search = screen.getByLabelText('Poišči model')
    fireEvent.focus(search)
    fireEvent.change(search, { target: { value: 'octavia' } })

    fireEvent.click(await findResultButton(/octavia/i))

    await waitFor(() => {
      expect(personalRows()).toHaveLength(2)
    })

    const panelA = screen.getByTestId('panel-A')
    const rows = within(panelA).getAllByTestId('chart-row')
    const personalIndex = rows.findIndex((row) => row.textContent?.includes('tvoj avto'))
    expect(personalIndex).toBeGreaterThan(-1)

    const km = within(panelA)
      .getAllByTestId('row-km')
      .map((cell) => Number((cell.textContent ?? '').replace(/\D/g, '')))
    expect(km).toEqual([...km].sort((left, right) => right - left))
    expect(window.location.search).toContain('car=')
  })

  it('accepts a consumption typed by hand', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Poraba (na 100 km)'), { target: { value: '6.4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Prikaži moj avto' }))

    await waitFor(() => {
      expect(personalRows()).toHaveLength(2)
    })
    expect(window.location.search).toContain('car=manual')
  })

  it('removes the row again', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Poraba (na 100 km)'), { target: { value: '6.4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Prikaži moj avto' }))
    await waitFor(() => expect(personalRows()).toHaveLength(2))
    fireEvent.click(screen.getByRole('button', { name: 'Odstrani svoj avto' }))
    await waitFor(() => {
      expect(personalRows()).toHaveLength(0)
    })
    expect(window.location.search).not.toContain('car=')
  })
})
