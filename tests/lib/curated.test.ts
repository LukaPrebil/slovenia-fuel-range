import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseCuratedCsv, splitCsvLine } from '../../src/lib/curated.ts'

const csv = readFileSync('data/curated.csv', 'utf8')

describe('curated rows', () => {
  it('reads 49 rows with a source on every one', () => {
    const rows = parseCuratedCsv(csv)
    expect(rows).toHaveLength(49)
    expect(rows.filter((row) => row.panel === 'A')).toHaveLength(31)
    expect(rows.filter((row) => row.panel === 'B')).toHaveLength(18)
    for (const row of rows) {
      expect(row.sourceUrl).toMatch(/^https:\/\//)
      expect(row.asOf).toMatch(/\d{4}/)
      expect(row.consumption).toBeGreaterThan(0)
    }
  })

  it('keeps every powertrain and unit in the known set', () => {
    const rows = parseCuratedCsv(csv)
    const powertrains = new Set(rows.map((row) => row.powertrain))
    expect([...powertrains].sort()).toEqual(['bencin', 'dizel', 'elektrika', 'hibrid'])
    for (const row of rows) {
      expect(row.unit).toBe(row.powertrain === 'elektrika' ? 'kWh/100km' : 'l/100km')
    }
  })

  it('rejects an unknown powertrain and an empty model', () => {
    const broken = csv.replace(',bencin,', ',plin,')
    expect(() => parseCuratedCsv(broken)).toThrow(/unknown powertrain/)
    const empty = csv.replace('Renault Clio', '')
    expect(() => parseCuratedCsv(empty)).toThrow(/model is empty/)
  })
})

describe('splitCsvLine', () => {
  it('keeps commas inside quotes and unescapes doubled quotes', () => {
    expect(splitCsvLine('a,"b,c",d')).toEqual(['a', 'b,c', 'd'])
    expect(splitCsvLine('a,"say ""hi""",d')).toEqual(['a', 'say "hi"', 'd'])
    expect(splitCsvLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })
})
