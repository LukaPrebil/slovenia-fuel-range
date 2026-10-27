import type { Basis, ConsumptionUnit, CuratedRow, PanelId, Powertrain } from './types.ts'
import { POWERTRAINS } from './types.ts'

/**
 * The curated file is a fixed snapshot: 49 rows, no commas inside fields, no
 * escapes. A full CSV reader would add weight to the bundle for nothing, so the
 * splitter only understands quoted fields and falls back to a plain split.
 */
export function splitCsvLine(line: string): string[] {
  if (!line.includes('"')) {
    return line.split(',')
  }
  const fields: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      fields.push(field)
      field = ''
    } else {
      field += char
    }
  }
  fields.push(field)
  return fields
}

function asNumber(value: string | undefined, column: string, row: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${row}: ${column} is not a number (${JSON.stringify(value)})`)
  }
  return parsed
}

function asPowertrain(value: string | undefined, row: number): Powertrain {
  const match = POWERTRAINS.find((powertrain) => powertrain === value)
  if (!match) {
    throw new Error(`Row ${row}: unknown powertrain ${JSON.stringify(value)}`)
  }
  return match
}

function asPanel(value: string | undefined, row: number): PanelId {
  if (value !== 'A' && value !== 'B') {
    throw new Error(`Row ${row}: unknown panel ${JSON.stringify(value)}`)
  }
  return value
}

function asUnit(value: string | undefined, row: number): ConsumptionUnit {
  if (value !== 'l/100km' && value !== 'kWh/100km') {
    throw new Error(`Row ${row}: unknown unit ${JSON.stringify(value)}`)
  }
  return value
}

function asBasis(value: string | undefined, row: number): Basis {
  if (value !== 'wltp' && value !== 'nedc') {
    throw new Error(`Row ${row}: unknown basis ${JSON.stringify(value)}`)
  }
  return value
}

function asText(value: string | undefined, column: string, row: number): string {
  if (!value || value.trim() === '') {
    throw new Error(`Row ${row}: ${column} is empty`)
  }
  return value.trim()
}

export function parseCuratedCsv(text: string): CuratedRow[] {
  const lines = text.trim().split(/\r?\n/)
  const header = splitCsvLine(lines[0] ?? '')
  const column = (name: string): number => {
    const index = header.indexOf(name)
    if (index === -1) {
      throw new Error(`Missing column ${name}`)
    }
    return index
  }
  const at = (fields: string[], name: string): string | undefined => fields[column(name)]

  return lines.slice(1).map((line, offset) => {
    const row = offset + 2
    const fields = splitCsvLine(line)
    return {
      panel: asPanel(at(fields, 'panel'), row),
      rank: asNumber(at(fields, 'rank'), 'rank', row),
      model: asText(at(fields, 'model'), 'model', row),
      variant: asText(at(fields, 'variant'), 'variant', row),
      powertrain: asPowertrain(at(fields, 'powertrain'), row),
      count: asNumber(at(fields, 'count'), 'count', row),
      consumption: asNumber(at(fields, 'consumption'), 'consumption', row),
      unit: asUnit(at(fields, 'unit'), row),
      basis: asBasis(at(fields, 'basis'), row),
      sourceUrl: asText(at(fields, 'source_url'), 'source_url', row),
      asOf: asText(at(fields, 'as_of'), 'as_of', row),
    }
  })
}
