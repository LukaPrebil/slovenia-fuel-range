import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { normalise, searchCatalogue, type Catalogue } from '../../src/lib/search.ts'

const catalogue = JSON.parse(readFileSync('data/catalogue.json', 'utf8')) as Catalogue

describe('normalise', () => {
  it('strips diacritics and case', () => {
    expect(normalise('ŠKODA Octavia')).toBe('skoda octavia')
    expect(normalise('Citroën C3')).toBe('citroen c3')
    expect(normalise('  Clio  ')).toBe('clio')
  })
})

describe('searchCatalogue', () => {
  it('finds a model without diacritics on the query side', () => {
    const hits = searchCatalogue(catalogue.entries, 'skoda octavia')
    expect(hits.length).toBeGreaterThan(0)
    expect(normalise(hits[0]!.entry.brand)).toBe('skoda')
  })

  it('finds a model without diacritics on the data side', () => {
    const hits = searchCatalogue(catalogue.entries, 'citroen')
    expect(hits.some((hit) => hit.entry.brand === 'CITROËN')).toBe(true)
  })

  it('ranks a prefix hit above a word-start hit', () => {
    const hits = searchCatalogue(catalogue.entries, 'golf')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0]!.rank).toBeLessThanOrEqual(1)
  })

  it('ignores a query shorter than two characters and caps the list', () => {
    expect(searchCatalogue(catalogue.entries, 'a')).toEqual([])
    expect(searchCatalogue(catalogue.entries, 'e', 5)).toEqual([])
    expect(searchCatalogue(catalogue.entries, 'model', 5).length).toBeLessThanOrEqual(5)
  })

  it('returns nothing for a phrase nobody sells', () => {
    expect(searchCatalogue(catalogue.entries, 'lada samara')).toEqual([])
  })
})
