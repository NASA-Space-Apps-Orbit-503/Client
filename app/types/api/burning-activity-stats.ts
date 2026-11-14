import type { components } from '#open-fetch-schemas/api'
import type { ConfidenceEnum } from '~/enums/confidence.enum'
import type { DayNightEnum } from '~/enums/day-night.enum'
import type { MetricEnum } from '~/enums/metric.enum'

export type BurningActivityStat = components['schemas']['BurningActivityStat']
export type NewBurningActivityStat = components['schemas']['NewBurningActivityStat']
export type BurningActivityStatBulkCreated = components['schemas']['BurningActivityStatBulkCreated']
export type BurningActivityStatPage = components['schemas']['BurningActivityStatPage']

export interface ListStatsQuery {
  /** One or more comma-separated years, e.g. "2023,2024". */
  year?: string
  /** One or more comma-separated months (1-12). */
  month?: string
  /** One or more comma-separated days of the month (1-31). */
  day?: string
  limit?: number
  offset?: number
}

export interface RebuildQuery {
  bbox?: string
  lat?: number
  lon?: number
  radius_km?: number
  polygon?: string
  from?: string
  to?: string
  date?: string
  year?: string
  month?: string
  day?: string
  instrument?: string
  satellite?: string
  min_confidence?: `${ConfidenceEnum}`
  daynight?: `${DayNightEnum}`
  metric?: `${MetricEnum}`
  cell_deg?: number
}

export type RebuildResponse = {
  rows: number
  metric: `${MetricEnum}`
  cell_deg: number | null
}
