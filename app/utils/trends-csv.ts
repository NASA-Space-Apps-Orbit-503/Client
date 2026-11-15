import type { TrendLineSeries, TrendRow } from '../types/historical-trends'
import { TrendSeriesEnum } from '../enums/trend-series.enum'
import { buildCsv, trendRowsToCsvRows } from './historical-trends'

export interface TrendsCsvInput {
  sensorRows: Array<{ key: string, modis: number | null, viirs: number | null }>
  rows: TrendRow[]
  lineSeries: TrendLineSeries[]
  headers: string[]
}

/** One rectangular CSV: visible summary, filtered sensors, and explicitly regional values. */
export function buildTrendsCsv(input: TrendsCsvInput) {
  const sensors = new Map(input.sensorRows.map(row => [row.key, row]))
  const regional = new Map(input.lineSeries.map(series => [series.id, new Map(series.points.map(point => [point.key, point.count]))]))
  const summary = trendRowsToCsvRows(input.rows)
  return buildCsv(input.headers, input.rows.map((row, index) => [
    ...summary[index]!,
    sensors.get(row.key)?.modis ?? null,
    sensors.get(row.key)?.viirs ?? null,
    regional.get(TrendSeriesEnum.Modis)?.get(row.key) ?? null,
    regional.get(TrendSeriesEnum.Viirs)?.get(row.key) ?? null,
    regional.get(TrendSeriesEnum.Harmonized)?.get(row.key) ?? null
  ]))
}
