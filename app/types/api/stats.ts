import type { components } from '#open-fetch-schemas/api'
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

export interface TimeQuery {
  from?: string
  to?: string
  date?: string
  /** One or more comma-separated years, e.g. "2023,2024". */
  year?: string
  /** One or more comma-separated months (1-12), e.g. "3,4". */
  month?: string
  /** One or more comma-separated days of the month (1-31), e.g. "1,15". */
  day?: string
}

export interface StatsQuery extends AreaQuery, TimeQuery {
  metric?: `${MetricEnum}`
  cell_deg?: number
}

export interface CalendarQuery extends StatsQuery {
  granularity?: `${StatsGranularityEnum}`
}

export interface SummaryQuery extends StatsQuery {
  top?: number
}

export interface AnomalyQuery extends AreaQuery {
  min_baseline_years?: number
}

export interface AnomalyListQuery extends AnomalyQuery, TimeQuery {
  cell_deg?: number
  min_score?: number
  /** One or more comma-separated severities, e.g. "high,extreme". */
  severity?: string
  sort?: `${AnomalySortEnum}`
  limit?: number
  offset?: number
}
