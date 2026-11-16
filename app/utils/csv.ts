/** Byte order mark: makes Excel read the file as UTF-8 (accents intact). */
export const UTF8_BOM = '﻿'

export type CsvValue = string | number | null | undefined

export interface CsvOptions {
  /** Field separator. Default `,`. */
  delimiter?: string
  /** Decimal separator used for non-integer numbers. Default `.`. */
  decimalSeparator?: string
}

/** Characters that make spreadsheet apps evaluate a text cell as a formula. */
const FORMULA_PREFIX = /^[=+@\t\r]/

function formatCell(value: CsvValue, delimiter: string, decimalSeparator: string): string {
  if (value === null || value === undefined) return ''

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return ''
    return decimalSeparator === '.' ? String(value) : String(value).replace('.', decimalSeparator)
  }

  // Neutralize formula injection in text cells, then quote when needed (RFC 4180)
  const text = FORMULA_PREFIX.test(value) ? `'${value}` : value
  const needsQuotes = text.includes(delimiter) || text.includes('"') || text.includes('\n') || text.includes('\r')
  return needsQuotes ? `"${text.replaceAll('"', '""')}"` : text
}

/**
 * Builds RFC 4180 CSV text (CRLF line endings) with a header row.
 * The UTF-8 BOM is not included; prepend `UTF8_BOM` when the file is meant for Excel.
 */
export function toCsv(headers: string[], rows: CsvValue[][], options: CsvOptions = {}): string {
  const delimiter = options.delimiter ?? ','
  const decimalSeparator = options.decimalSeparator ?? '.'
  const format = (row: CsvValue[]) => row.map(value => formatCell(value, delimiter, decimalSeparator)).join(delimiter)
  return [headers, ...rows].map(format).join('\r\n') + '\r\n'
}
