import { TrendSeriesEnum } from '../enums/trend-series.enum'
import { TrendGranularityEnum } from '../enums/trend-granularity.enum'
import type { MonthlyCount, TrendRow, TrendSort, TrendLineSeries } from '../types/historical-trends'
import { epochMonth, epochYear } from './epoch'

/*
 * Pure aggregation helpers for the historical trends page. They do not depend on Nuxt so they
 * can be unit tested directly (see `test/historical-trends.spec.ts`).
 */

interface YearMonth {
  year: number
  month: number
}

/**
 * Calendar point as the API may send it. Contract v6 sends `date` (epoch ms, UTC); the server
 * currently deployed still sends `year` + `month`. Both are accepted until the server is updated.
 */
export interface CalendarPointInput {
  date?: number | null
  year?: number | null
  month?: number | null
  count: number
}

/** Accepts epoch ms (contract v6) or a `YYYY-MM[-DD]` string (server currently deployed). */
export type CalendarBound = number | string | null | undefined

function boundToYearMonth(value: CalendarBound): YearMonth | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { year: epochYear(value), month: epochMonth(value) } : null
  }
  const match = value?.match(/^(\d{4})-(\d{2})/)
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null
}

function toIndex({ year, month }: YearMonth) {
  return year * 12 + (month - 1)
}

function fromIndex(index: number): YearMonth {
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

/** Converts calendar points into year/month counts. Points without a usable period are skipped. */
export function calendarToMonthly(items: CalendarPointInput[]): MonthlyCount[] {
  return items.flatMap(({ date, year, month, count }) => {
    if (typeof date === 'number') return [{ year: epochYear(date), month: epochMonth(date), count }]
    if (typeof year === 'number' && typeof month === 'number') return [{ year, month, count }]
    return []
  })
}

/**
 * Returns one entry per month between `from` and `to` (inclusive), filling the months missing
 * from `items` with `count = 0`. Without bounds it uses the first and last item. Repeated months
 * are summed.
 */
export function fillMonthlySeries(
  items: MonthlyCount[],
  from?: CalendarBound,
  to?: CalendarBound
): MonthlyCount[] {
  const counts = new Map<number, number>()
  for (const item of items) {
    const index = toIndex(item)
    counts.set(index, (counts.get(index) ?? 0) + item.count)
  }

  const itemIndexes = [...counts.keys()]
  const fromMonth = boundToYearMonth(from)
  const toMonth = boundToYearMonth(to)
  const start = fromMonth ? toIndex(fromMonth) : Math.min(...itemIndexes)
  const end = toMonth ? toIndex(toMonth) : Math.max(...itemIndexes)

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return []

  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const index = start + offset
    return { ...fromIndex(index), count: counts.get(index) ?? 0 }
  })
}

/**
 * % change from `previous` to `current`.
 * - previous > 0: regular percentage.
 * - previous = 0 and current = 0: 0 (no change).
 * - previous = 0 and current > 0: `null`, growth from zero has no defined percentage.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

/** Rounds to one decimal, the precision shown in the table and written in the CSV. */
export function roundPct(value: number) {
  return Math.round(value * 10) / 10
}

/**
 * Aggregates a zero-filled monthly series per year or month, in chronological order, adding
 * the change vs the previous period.
 */
export function aggregateByPeriod(series: MonthlyCount[], granularity: TrendGranularityEnum): TrendRow[] {
  const periods: Array<Pick<TrendRow, 'key' | 'year' | 'month' | 'count'>> = []

  if (granularity === TrendGranularityEnum.Month) {
    for (const { year, month, count } of series) {
      periods.push({ key: monthKey(year, month), year, month, count })
    }
  } else {
    const totals = new Map<number, number>()
    for (const { year, count } of series) totals.set(year, (totals.get(year) ?? 0) + count)
    for (const [year, count] of [...totals.entries()].sort(([a], [b]) => a - b)) {
      periods.push({ key: String(year), year, month: null, count })
    }
  }

  return periods.map((period, index) => {
    const previous = periods[index - 1]
    return {
      ...period,
      change: previous ? period.count - previous.count : null,
      changePct: previous ? percentChange(period.count, previous.count) : null
    }
  })
}

/** Sorts a copy of the rows. Rows without a value in the sorted column always go last. */
export function sortTrendRows(rows: TrendRow[], sort: TrendSort | null): TrendRow[] {
  if (!sort) return [...rows]

  const direction = sort.desc ? -1 : 1
  const valueOf = (row: TrendRow) => sort.id === 'period' ? row.key : row[sort.id]

  return [...rows].sort((a, b) => {
    const left = valueOf(a)
    const right = valueOf(b)
    if (left === right) return 0
    if (left === null) return 1
    if (right === null) return -1
    return (left < right ? -1 : 1) * direction
  })
}

type CsvValue = string | number | null

function escapeCsvValue(value: CsvValue) {
  if (value === null) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Builds a comma-separated CSV with a UTF-8 BOM (so Excel reads accents) and CRLF line ends. */
export function buildCsv(header: string[], rows: CsvValue[][]) {
  const lines = [header, ...rows].map(line => line.map(escapeCsvValue).join(','))
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

/** CSV rows in the same order and with the same values as the visible table. */
export function trendRowsToCsvRows(rows: TrendRow[]): CsvValue[][] {
  return rows.map(row => [
    row.key,
    row.count,
    row.change,
    row.changePct === null ? null : roundPct(row.changePct)
  ])
}

/** e.g. `historical_trends_monthly_2015-2025.csv` or `historical_trends_yearly_2024.csv`. */
export function trendsCsvFilename(granularity: TrendGranularityEnum, rows: TrendRow[]) {
  const label = granularity === TrendGranularityEnum.Month ? 'monthly' : 'yearly'
  if (!rows.length) return `historical_trends_${label}.csv`

  const years = rows.map(row => row.year)
  const first = Math.min(...years)
  const last = Math.max(...years)
  return `historical_trends_${label}_${first === last ? first : `${first}-${last}`}.csv`
}

/** Align independent sensor counts to the visible time axis, retaining explicit zero periods. */
export function alignTrendCounts(periods: Pick<TrendRow, 'key'>[], rows: TrendRow[]): number[] {
  const counts = new Map(rows.map(row => [row.key, row.count]))
  return periods.map(period => counts.get(period.key) ?? 0)
}

/** Comparable monthly cell-day counts returned by the harmonization endpoint. */
export interface HarmonizedPointInput {
  month: number | string
  modis: number | null
  viirs: number | null
  harmonized: number | null
}

/** Regional chart periods come from the harmonized response, independent of local counts. */
export function harmonizedPeriods(items: HarmonizedPointInput[], from?: CalendarBound, to?: CalendarBound): MonthlyCount[] {
  const months = items.flatMap((item) => {
    const period = boundToYearMonth(item.month)
    return period ? [{ ...period, count: 0 }] : []
  })
  return fillMonthlySeries(months, from, to)
}

/** Preserve unavailable sensor values and incomplete annual coverage as gaps, not zero counts. */
export function harmonizedTrendSeries(
  items: HarmonizedPointInput[],
  periods: MonthlyCount[],
  granularity: TrendGranularityEnum
): TrendLineSeries[] {
  const points = new Map(items.flatMap((item) => {
    const period = boundToYearMonth(item.month)
    return period ? [[monthKey(period.year, period.month), item] as const] : []
  }))
  return [
    { id: TrendSeriesEnum.Modis, field: 'modis' as const },
    { id: TrendSeriesEnum.Viirs, field: 'viirs' as const },
    { id: TrendSeriesEnum.Harmonized, field: 'harmonized' as const }
  ].map(({ id, field }) => {
    const grouped = new Map<string, number | null>()
    for (const period of periods) {
      const key = granularity === TrendGranularityEnum.Month ? monthKey(period.year, period.month) : String(period.year)
      const count = points.get(monthKey(period.year, period.month))?.[field] ?? null
      const previous = grouped.get(key)
      grouped.set(key, count === null || previous === null ? null : (previous ?? 0) + count)
    }
    return { id, points: [...grouped].map(([key, count]) => ({ key, count })) }
  })
}
