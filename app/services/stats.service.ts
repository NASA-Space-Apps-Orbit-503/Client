import calendarMock from '~~/data/calendar.json'
import climatologyMock from '~~/data/climatology.json'
import anomalyMock from '~~/data/anomaly.json'
import summaryMock from '~~/data/summary.json'
import type { components } from '#open-fetch-schemas/api'
import { useMocksEnabled } from './config'

type CalendarResponse = components['schemas']['CalendarResponse']
type ClimatologyResponse = components['schemas']['ClimatologyResponse']
type AnomalyResponse = components['schemas']['AnomalyResponse']
type SummaryResponse = components['schemas']['SummaryResponse']
const typedCalendarMock = calendarMock as CalendarResponse
const typedClimatologyMock = climatologyMock as ClimatologyResponse
const typedAnomalyMock = anomalyMock as AnomalyResponse
const typedSummaryMock = summaryMock as SummaryResponse

interface StatsQuery {
  bbox?: string
  lat?: number
  lon?: number
  radius_km?: number
  polygon?: string
  from?: string
  to?: string
  instrument?: string
  satellite?: string
  min_confidence?: 'low' | 'nominal' | 'high'
  daynight?: 'D' | 'N'
  metric?: 'cells' | 'detections'
  cell_deg?: number
}

export async function getCalendar(query?: StatsQuery & { granularity?: 'month' | 'day' }): Promise<CalendarResponse> {
  if (useMocksEnabled()) return typedCalendarMock
  const { $api } = useNuxtApp()
  return $api('/stats/calendar', { query })
}

export async function getClimatology(query?: StatsQuery): Promise<ClimatologyResponse> {
  if (useMocksEnabled()) return typedClimatologyMock
  const { $api } = useNuxtApp()
  return $api('/stats/climatology', { query })
}

export async function getAnomaly(query?: StatsQuery & { year?: number, month?: number }): Promise<AnomalyResponse> {
  if (useMocksEnabled()) return typedAnomalyMock
  const { $api } = useNuxtApp()
  return $api('/stats/anomaly', { query })
}

export async function getSummary(query?: StatsQuery & { top?: number }): Promise<SummaryResponse> {
  if (useMocksEnabled()) return typedSummaryMock
  const { $api } = useNuxtApp()
  return $api('/stats/summary', { query })
}
