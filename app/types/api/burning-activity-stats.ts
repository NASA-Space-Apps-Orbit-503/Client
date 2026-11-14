import type { components } from '#open-fetch-schemas/api'
import type { ConfidenceEnum } from '~/enums/confidence.enum'
import type { DayNightEnum } from '~/enums/day-night.enum'
import type { MetricEnum } from '~/enums/metric.enum'

export type BurningActivityStat = components['schemas']['BurningActivityStat']
export type NewBurningActivityStat = components['schemas']['NewBurningActivityStat']
export type BurningActivityStatBulkCreated = components['schemas']['BurningActivityStatBulkCreated']
export type BurningActivityStatPage = components['schemas']['BurningActivityStatPage']

export interface ListStatsQuery {
  year?: number
  month?: number
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
