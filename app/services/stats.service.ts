import calendarMock from '~~/data/calendar.json'
import climatologyMock from '~~/data/climatology.json'
import anomalyMock from '~~/data/anomaly.json'
import summaryMock from '~~/data/summary.json'
import type {
  AnomalyQuery,
  AnomalyResponse,
  CalendarQuery,
  CalendarResponse,
  ClimatologyResponse,
  StatsQuery,
  SummaryQuery,
  SummaryResponse
} from '~/types/api/stats'
import { useMocksEnabled } from './config'

const typedCalendarMock = calendarMock as CalendarResponse
const typedClimatologyMock = climatologyMock as ClimatologyResponse
const typedAnomalyMock = anomalyMock as AnomalyResponse
const typedSummaryMock = summaryMock as SummaryResponse

const StatsService = {
  async getCalendar(query?: CalendarQuery): Promise<CalendarResponse> {
    if (useMocksEnabled()) return typedCalendarMock
    const { $api } = useNuxtApp()
    return $api('/stats/calendar', { query })
  },

  async getClimatology(query?: StatsQuery): Promise<ClimatologyResponse> {
    if (useMocksEnabled()) return typedClimatologyMock
    const { $api } = useNuxtApp()
    return $api('/stats/climatology', { query })
  },

  async getAnomaly(query?: AnomalyQuery): Promise<AnomalyResponse> {
    if (useMocksEnabled()) return typedAnomalyMock
    const { $api } = useNuxtApp()
    return $api('/stats/anomaly', { query })
  },

  async getSummary(query?: SummaryQuery): Promise<SummaryResponse> {
    if (useMocksEnabled()) return typedSummaryMock
    const { $api } = useNuxtApp()
    return $api('/stats/summary', { query })
  }
}

export default StatsService
