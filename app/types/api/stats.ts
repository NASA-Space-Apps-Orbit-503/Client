import type { components } from '#open-fetch-schemas/api'
import type { ConfidenceEnum } from '~/enums/confidence.enum'
import type { DayNightEnum } from '~/enums/day-night.enum'
import type { MetricEnum } from '~/enums/metric.enum'
import type { StatsGranularityEnum } from '~/enums/stats-granularity.enum'

export type CalendarResponse = components['schemas']['CalendarResponse']
export type ClimatologyResponse = components['schemas']['ClimatologyResponse']
export type AnomalyResponse = components['schemas']['AnomalyResponse']
export type SummaryResponse = components['schemas']['SummaryResponse']

export interface StatsQuery {
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

export interface CalendarQuery extends StatsQuery {
  granularity?: `${StatsGranularityEnum}`
}

export interface AnomalyQuery extends StatsQuery {
  year?: number
  month?: number
}

export interface SummaryQuery extends StatsQuery {
  top?: number
}
