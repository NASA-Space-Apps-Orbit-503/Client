import modisCalendarMock from '~~/data/calendar-modis.json'
import viirsCalendarMock from '~~/data/calendar-viirs.json'
import { InstrumentEnum } from '~/enums/instrument.enum'
import calendarMock from '~~/data/calendar.json'
import climatologyMock from '~~/data/climatology.json'
import anomaliesMock from '~~/data/anomalies.json'
import summaryMock from '~~/data/summary.json'
import type {
  AnomalyItem,
  AnomalyListQuery,
  AnomalyPage,
  AnomalyQuery,
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
const typedAnomaliesMock = anomaliesMock as AnomalyPage
const firstAnomalyMock = typedAnomaliesMock.items[0]!
const typedSummaryMock = summaryMock as SummaryResponse

const StatsService = {
  async getCalendar(query?: CalendarQuery): Promise<CalendarResponse> {
    if (useMocksEnabled()) {
      if (query?.instrument === InstrumentEnum.Modis) return modisCalendarMock as CalendarResponse
      if (query?.instrument === InstrumentEnum.Viirs) return viirsCalendarMock as CalendarResponse
      return typedCalendarMock
    }
    const { $api } = useNuxtApp()
    return $api('/stats/calendar', { query })
  },

  async getClimatology(query?: StatsQuery): Promise<ClimatologyResponse> {
    if (useMocksEnabled()) return typedClimatologyMock
    const { $api } = useNuxtApp()
    return $api('/stats/climatology', { query })
  },

  async listAnomalies(query?: AnomalyListQuery): Promise<AnomalyPage> {
    if (useMocksEnabled()) return typedAnomaliesMock
    const { $api } = useNuxtApp()
    return $api('/stats/anomalies', { query })
  },

  async getAnomaly(id: string, query?: AnomalyQuery): Promise<AnomalyItem> {
    if (useMocksEnabled()) return typedAnomaliesMock.items.find(anomaly => anomaly.id === id) ?? firstAnomalyMock
    const { $api } = useNuxtApp()
    return $api('/stats/anomalies/{id}', { path: { id }, query })
  },

  async getSummary(query?: SummaryQuery): Promise<SummaryResponse> {
    if (useMocksEnabled()) return typedSummaryMock
    const { $api } = useNuxtApp()
    return $api('/stats/summary', { query })
  }
}

export default StatsService
