import { describe, expect, it } from 'vitest'
import {
  normaliseElectricKwh,
  parseArsoXlsx,
  parseQuantity,
  readAsOf,
  type Quantity,
} from '../../scripts/lib/arso-xlsx.ts'

const FIXTURE = 'tests/fixtures/arso-wltp-2026-06.xlsx'

describe('parseQuantity', () => {
  it('reads a plain number', () => {
    expect(parseQuantity(5.49)).toEqual({ value: 5.49, range: null })
  })

  it('reads a comma decimal', () => {
    expect(parseQuantity('5,5')).toEqual({ value: 5.5, range: null })
  })

  it('turns a range into its midpoint', () => {
    expect(parseQuantity('5,5-5,8')).toEqual({ value: 5.65, range: [5.5, 5.8] })
    expect(parseQuantity('6,712-6,989')).toEqual({ value: 6.8505, range: [6.712, 6.989] })
  })

  it('treats a dash, empty cell and garbage as missing', () => {
    expect(parseQuantity('-')).toBeNull()
    expect(parseQuantity('')).toBeNull()
    expect(parseQuantity(null)).toBeNull()
    expect(parseQuantity('ni podatka')).toBeNull()
  })

  it('rejects a range written high to low', () => {
    expect(parseQuantity('7-5')).toBeNull()
  })
})

describe('normaliseElectricKwh', () => {
  it('divides Wh per km by ten and keeps kWh per 100 km as is', () => {
    expect(normaliseElectricKwh({ value: 181, range: null })?.value).toBeCloseTo(18.1)
    expect(normaliseElectricKwh({ value: 15.5, range: null })?.value).toBe(15.5)
  })

  it('normalises both ends of a range', () => {
    const range: Quantity = { value: 162.5, range: [155, 170] }
    expect(normaliseElectricKwh(range)).toEqual({ value: 16.25, range: [15.5, 17] })
  })

  it('passes null through', () => {
    expect(normaliseElectricKwh(null)).toBeNull()
  })
})

describe('readAsOf', () => {
  it('reads the Slovenian month and year from the sheet title', () => {
    expect(
      readAsOf(
        'Seznam modelov novih osebnih avtomobilov s podatki o varčnosti porabe goriva, junij 2026',
      ),
    ).toBe('2026-06')
    expect(readAsOf('... september 2025')).toBe('2025-09')
  })

  it('throws on a title it cannot read', () => {
    expect(() => readAsOf('Seznam modelov')).toThrow(/Cannot read the month/)
    expect(readAsOf('junij 2026')).toBe('2026-06')
    expect(() => readAsOf('foo 2026')).toThrow(/Unknown Slovenian month/)
  })
})

describe('the June 2026 sheet', () => {
  it('finds the header by name and reads every data row', async () => {
    const sheet = await parseArsoXlsx(FIXTURE)
    expect(sheet.asOf).toBe('2026-06')
    expect(sheet.rows.length).toBe(4170)
    expect(sheet.rows.every((row) => row.brand !== '' && row.model !== '')).toBe(true)
  })

  it('reads an EV whose electricity is written in kWh per 100 km', async () => {
    const sheet = await parseArsoXlsx(FIXTURE)
    const junior = sheet.rows.find((row) => row.model.startsWith('Junior BEV (54 kWh) 156'))
    expect(junior?.fuelCode).toBe('EE')
    expect(junior?.electric?.value).toBeCloseTo(15.5)
  })

  it('reads an EV whose electricity is written in Wh per km', async () => {
    const sheet = await parseArsoXlsx(FIXTURE)
    const zeekr = sheet.rows.find((row) => row.brand === 'ZEEKR')
    expect(zeekr?.electric?.value).toBeGreaterThan(15)
    expect(zeekr?.electric?.value).toBeLessThan(25)
  })

  it('keeps the range of a petrol figure', async () => {
    const sheet = await parseArsoXlsx(FIXTURE)
    const stelvio = sheet.rows.find((row) => row.model.startsWith('Stelvio 2.2 Diesel 16v 160'))
    expect(stelvio?.fuel?.range).toEqual([5.5, 5.8])
    expect(stelvio?.fuel?.value).toBeCloseTo(5.65)
  })
})
