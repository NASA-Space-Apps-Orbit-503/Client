import { describe, expect, it } from 'vitest'
import calendarSample from '../data/calendar.json'
import modisSample from '../data/calendar-modis.json'
import viirsSample from '../data/calendar-viirs.json'
import { TrendGranularityEnum } from '../app/enums/trend-granularity.enum'
import {
  aggregateByPeriod,
  harmonizedTrendSeries,
  harmonizedPeriods,
  alignTrendCounts,
  calendarToMonthly,
  buildCsv,
  fillMonthlySeries,
  percentChange,
  sortTrendRows,
  trendRowsToCsvRows,
  trendsCsvFilename
} from '../app/utils/historical-trends'

/*
 * Known sample: `data/calendar.json` (2020-01-01 → 2024-12-31 as epoch ms, 16 months with activity).
 * Expected yearly totals, computed by hand from the file:
 *   2020: 42 + 98 + 24        = 164
 *   2021: 67 + 124 + 39       = 230
 *   2022: 51 + 155 + 73       = 279
 *   2023: 84 + 112 + 31       = 227
 *   2024: 76 + 140 + 58 + 19  = 293
 */
const sampleSeries = fillMonthlySeries(calendarToMonthly(calendarSample.items), calendarSample.from, calendarSample.to)

describe('fillMonthlySeries', () => {
  it('returns every month of the range and fills missing months with 0', () => {
    expect(sampleSeries).toHaveLength(60)
    expect(sampleSeries[0]).toEqual({ year: 2020, month: 1, count: 42 })
    expect(sampleSeries[1]).toEqual({ year: 2020, month: 2, count: 0 })
    expect(sampleSeries.at(-1)).toEqual({ year: 2024, month: 12, count: 0 })
    expect(sampleSeries.filter(point => point.count > 0)).toHaveLength(16)
  })

  it('uses the first and last item when there are no bounds', () => {
    const series = fillMonthlySeries([
      { year: 2023, month: 11, count: 5 },
      { year: 2024, month: 2, count: 7 }
    ])
    expect(series.map(point => point.count)).toEqual([5, 0, 0, 7])
  })

  it('sums repeated months and returns [] without data or bounds', () => {
    expect(fillMonthlySeries([{ year: 2024, month: 1, count: 2 }, { year: 2024, month: 1, count: 3 }]))
      .toEqual([{ year: 2024, month: 1, count: 5 }])
    expect(fillMonthlySeries([])).toEqual([])
  })

  it('keeps zero periods when the range has no activity at all', () => {
    const from = Date.UTC(2024, 0, 1)
    const to = Date.UTC(2024, 2, 31)
    expect(fillMonthlySeries([], from, to).map(point => point.count)).toEqual([0, 0, 0])
  })

  it('accepts the format of the server currently deployed (year/month and YYYY-MM-DD bounds)', () => {
    const items = calendarToMonthly([
      { year: 2024, month: 1, count: 16 },
      { year: 2024, month: 3, count: 33 }
    ])
    expect(fillMonthlySeries(items, '2024-01-01', '2024-04-30').map(point => point.count)).toEqual([16, 0, 33, 0])
  })

  it('reads month starts in UTC, whatever the local offset', () => {
    // 2024-03-01T00:00Z is still February in UTC-6; it must count as March.
    expect(calendarToMonthly([{ date: Date.UTC(2024, 2, 1), count: 4 }])).toEqual([{ year: 2024, month: 3, count: 4 }])
  })
})

describe('percentChange', () => {
  it('computes the percentage vs the previous value', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
  })

  it('defines the behavior when the previous value is 0', () => {
    expect(percentChange(0, 0)).toBe(0)
    expect(percentChange(10, 0)).toBeNull()
  })
})

describe('aggregateByPeriod', () => {
  it('aggregates the sample per year with absolute and % change', () => {
    const rows = aggregateByPeriod(sampleSeries, TrendGranularityEnum.Year)

    expect(rows.map(row => [row.key, row.count, row.change])).toEqual([
      ['2020', 164, null],
      ['2021', 230, 66],
      ['2022', 279, 49],
      ['2023', 227, -52],
      ['2024', 293, 66]
    ])
    expect(rows[0]!.changePct).toBeNull()
    expect(rows[1]!.changePct).toBeCloseTo(40.24, 2)
    expect(rows[2]!.changePct).toBeCloseTo(21.30, 2)
    expect(rows[3]!.changePct).toBeCloseTo(-18.64, 2)
    expect(rows[4]!.changePct).toBeCloseTo(29.07, 2)
  })

  it('keeps one row per month, including zeros, with the yearly total intact', () => {
    const rows = aggregateByPeriod(sampleSeries, TrendGranularityEnum.Month)

    expect(rows).toHaveLength(60)
    expect(rows.reduce((total, row) => total + row.count, 0)).toBe(164 + 230 + 279 + 227 + 293)
    // 2020-01 (42) → 2020-02 (0) → 2020-03 (98): drop to zero, then growth from zero.
    expect(rows[1]).toMatchObject({ key: '2020-02', count: 0, change: -42, changePct: -100 })
    expect(rows[2]).toMatchObject({ key: '2020-03', count: 98, change: 98, changePct: null })
    // 0 → 0 is no change.
    expect(rows[4]).toMatchObject({ key: '2020-05', count: 0, change: 0, changePct: 0 })
  })
})

describe('sortTrendRows', () => {
  const rows = aggregateByPeriod(sampleSeries, TrendGranularityEnum.Year)

  it('sorts by count in both directions without mutating the input', () => {
    expect(sortTrendRows(rows, { id: 'count', desc: true }).map(row => row.key))
      .toEqual(['2024', '2022', '2021', '2023', '2020'])
    expect(sortTrendRows(rows, { id: 'count', desc: false }).map(row => row.key))
      .toEqual(['2020', '2023', '2021', '2022', '2024'])
    expect(rows[0]!.key).toBe('2020')
  })

  it('puts rows without change last in either direction', () => {
    expect(sortTrendRows(rows, { id: 'change', desc: true }).at(-1)!.key).toBe('2020')
    expect(sortTrendRows(rows, { id: 'change', desc: false }).at(-1)!.key).toBe('2020')
  })
})

describe('CSV export', () => {
  const rows = aggregateByPeriod(sampleSeries, TrendGranularityEnum.Year)

  it('writes a BOM, the localized header and the rows of the table', () => {
    const csv = buildCsv(['Período', 'Celdas activas', 'Cambio', 'Cambio %'], trendRowsToCsvRows(rows))
    const lines = csv.slice(1).trimEnd().split('\r\n')

    expect(csv.startsWith('﻿')).toBe(true)
    expect(lines[0]).toBe('Período,Celdas activas,Cambio,Cambio %')
    expect(lines[1]).toBe('2020,164,,')
    expect(lines[2]).toBe('2021,230,66,40.2')
    expect(lines[4]).toBe('2023,227,-52,-18.6')
  })

  it('escapes separators and quotes', () => {
    expect(buildCsv(['a, "b"'], [['x\ny']])).toBe('﻿"a, ""b"""\r\n"x\ny"\r\n')
  })

  it('builds a descriptive filename', () => {
    expect(trendsCsvFilename(TrendGranularityEnum.Month, rows)).toBe('historical_trends_monthly_2020-2024.csv')
    expect(trendsCsvFilename(TrendGranularityEnum.Year, rows.slice(0, 1))).toBe('historical_trends_yearly_2020.csv')
    expect(trendsCsvFilename(TrendGranularityEnum.Year, [])).toBe('historical_trends_yearly.csv')
  })
})

describe('independent instrument series', () => {
  it('aggregates the distinct synthetic MODIS and VIIRS fixtures independently', () => {
    const annual = [modisSample, viirsSample].map(sample => aggregateByPeriod(
      fillMonthlySeries(calendarToMonthly(sample.items), sample.from, sample.to),
      TrendGranularityEnum.Year
    ).map(row => row.count))
    expect(annual).toEqual([[44, 60, 79, 67, 83], [120, 170, 200, 160, 210]])
  })

  it('aligns instruments by period key and fills absent periods with zero', () => {
    const periods = aggregateByPeriod(fillMonthlySeries([], '2024-01', '2024-03'), TrendGranularityEnum.Month)
    const sensor = aggregateByPeriod([{ year: 2024, month: 3, count: 7 }], TrendGranularityEnum.Month)
    expect(alignTrendCounts(periods, sensor)).toEqual([0, 0, 7])
    expect(alignTrendCounts(periods.filter(row => row.month !== 2), sensor)).toEqual([0, 7])
  })

  it('preserves instrument counts when switching from monthly to annual totals', () => {
    const modis = fillMonthlySeries([
      { year: 2023, month: 12, count: 2 },
      { year: 2024, month: 1, count: 3 },
      { year: 2024, month: 3, count: 4 }
    ], '2023-12', '2024-03')
    const viirs = fillMonthlySeries([{ year: 2024, month: 2, count: 8 }], '2023-12', '2024-03')
    const annual = aggregateByPeriod(modis, TrendGranularityEnum.Year)
    expect(alignTrendCounts(annual, annual)).toEqual([2, 7])
    expect(alignTrendCounts(annual, aggregateByPeriod(viirs, TrendGranularityEnum.Year))).toEqual([0, 8])
  })
})

describe('harmonized comparison', () => {
  const periods = fillMonthlySeries([], '2024-01', '2024-03')
  const items = [
    { month: Date.UTC(2024, 0, 1), modis: 3, viirs: 5, harmonized: 3.5 },
    { month: Date.UTC(2024, 1, 1), modis: 0, viirs: null, harmonized: 0 },
    { month: Date.UTC(2024, 2, 1), modis: 4, viirs: 8, harmonized: 4.5 }
  ]
  it('keeps three independent series, fractions, measured zeros and unavailable values', () => {
    const series = harmonizedTrendSeries(items, periods, TrendGranularityEnum.Month)
    expect(series.map(line => line.id)).toEqual(['MODIS', 'VIIRS', 'harmonized'])
    expect(series.map(line => line.points.map(point => point.count))).toEqual([[3, 0, 4], [5, null, 8], [3.5, 0, 4.5]])
  })
  it('does not report a partial annual count when one sensor month is unknown', () => {
    const series = harmonizedTrendSeries(items, periods, TrendGranularityEnum.Year)
    expect(series.map(line => line.points)).toEqual([
      [{ key: '2024', count: 7 }], [{ key: '2024', count: null }], [{ key: '2024', count: 8 }]
    ])
  })
  it('keeps gaps for periods absent from the harmonized response', () => {
    const series = harmonizedTrendSeries([], periods, TrendGranularityEnum.Month)
    expect(series.every(line => line.points.every(point => point.count === null))).toBe(true)
  })
})

describe('regional chart periods', () => {
  it('builds periods from regional data even if the local table has no records', () => {
    const items = [{ month: '2024-02-01', modis: 10, viirs: 20, harmonized: 11.5 }]
    const periods = harmonizedPeriods(items, '2024-01-01', '2024-03-31')
    expect(periods.map(p => p.month)).toEqual([1, 2, 3])
    const lines = harmonizedTrendSeries(items, periods, TrendGranularityEnum.Month)
    expect(lines.map(line => line.points[1]?.count)).toEqual([10, 20, 11.5])
    expect(lines.every(line => line.points[0]?.count === null)).toBe(true)
  })

  it('uses the regional response extent without date filters', () => {
    expect(harmonizedPeriods([
      { month: '2023-12', modis: 1, viirs: 2, harmonized: 1.1 },
      { month: '2024-02', modis: 3, viirs: 4, harmonized: 3.1 }
    ]).map(p => [p.year, p.month])).toEqual([[2023, 12], [2024, 1], [2024, 2]])
  })
})
