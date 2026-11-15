import type { components } from '#open-fetch-schemas/api'
import type { DateRangeQuery } from '~/types/api/date-range'
import type { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
import type { ConfidenceEnum } from '~/enums/confidence.enum'
import type { DayNightEnum } from '~/enums/day-night.enum'
import type { MetricEnum } from '~/enums/metric.enum'
import type { StatsGranularityEnum } from '~/enums/stats-granularity.enum'

export type CalendarResponse = components['schemas']['CalendarResponse']
export type ClimatologyResponse = components['schemas']['ClimatologyResponse']
export type SummaryResponse = components['schemas']['SummaryResponse']
export type AnomalyItem = components['schemas']['AnomalyItem']
export type AnomalyLocation = components['schemas']['AnomalyLocation']
export type AnomalyPage = components['schemas']['AnomalyPage']
export type AnomalySeverity = components['schemas']['Severity']

export interface AreaQuery {
  bbox?: string
  lat?: number
  lon?: number
  radius_km?: number
  polygon?: string
  instrument?: string
  satellite?: string
  min_confidence?: `${ConfidenceEnum}`
  daynight?: `${DayNightEnum}`
}

interface MetricQuery extends AreaQuery {
  metric?: `${MetricEnum}`
  cell_deg?: number
}

export type StatsQuery = MetricQuery & DateRangeQuery

export type CalendarQuery = StatsQuery & {
  granularity?: `${StatsGranularityEnum}`
}

export type SummaryQuery = StatsQuery & {
  top?: number
}

export interface AnomalyQuery extends AreaQuery {
  min_baseline_years?: number
}

export type AnomalyListQuery = AnomalyQuery & DateRangeQuery & {
  cell_deg?: number
  min_score?: number
  /** One or more comma-separated severities, e.g. "high,extreme". */
  severity?: string
  sort?: `${AnomalySortEnum}`
  limit?: number
  offset?: number
}
