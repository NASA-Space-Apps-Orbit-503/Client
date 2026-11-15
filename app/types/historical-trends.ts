import type { TrendSeriesEnum } from '~/enums/trend-series.enum'
import type { InstrumentEnum } from '~/enums/instrument.enum'

/** One month of the calendar series. Months without activity carry `count = 0`. */
export interface MonthlyCount {
  year: number
  month: number
  count: number
}

/** One row of the aggregated historical trends table. */
export interface TrendRow {
  /** `YYYY` for years, `YYYY-MM` for months. Also used as the CSV period value. */
  key: string
  year: number
  /** `null` when the granularity is year. */
  month: number | null
  count: number
  /** Absolute change vs the previous period. `null` for the first period. */
  change: number | null
  /**
   * % change vs the previous period. `null` for the first period and when the previous
   * period is 0 and the current one is not (growth from zero is undefined).
   * 0 → 0 is reported as 0 %.
   */
  changePct: number | null
}

export type TrendSortColumn = 'period' | 'count' | 'change' | 'changePct'

export interface TrendSort {
  id: TrendSortColumn
  desc: boolean
}

/** Counts for a single instrument, independently queried and aggregated. */
export interface InstrumentTrendSeries {
  instrument: InstrumentEnum
  rows: TrendRow[]
}

/** A chart point can be unknown; null must not be replaced by a measured zero. */
export interface TrendLineSeries {
  id: TrendSeriesEnum
  points: Array<{ key: string, count: number | null }>
}
