import calendarMock from '~~/data/calendar.json'
import climatologyMock from '~~/data/climatology.json'
import anomalyMock from '~~/data/anomaly.json'
import summaryMock from '~~/data/summary.json'
import anomalyPageMock from '~~/data/anomaly-page.json'
import { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
import { SortOrderEnum } from '~/enums/sort-order.enum'
import type {
  AnomaliesQuery,
  AnomalyItem,
  AnomalyPage,
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
const typedAnomalyPageMock = anomalyPageMock as AnomalyPage

const DEFAULT_ANOMALIES_LIMIT = 100
const EARTH_RADIUS_KM = 6371

/** Great-circle distance in km (haversine). */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (degrees: number) => degrees * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/**
 * Applies the query to the mock anomalies so filters, sorting and paging behave like the API.
 * Only used when mocks are enabled.
 */
function queryAnomaliesMock(query: AnomaliesQuery = {}): AnomalyPage {
  const bbox = query.bbox?.split(',').map(Number)
  const point = query.lat !== undefined && query.lon !== undefined && query.radius_km !== undefined
    ? { lat: query.lat, lon: query.lon, radius: query.radius_km }
    : undefined
  const sortKey = query.sort ?? AnomalySortEnum.Date
  const direction = query.order === SortOrderEnum.Asc ? 1 : -1

  const filtered = typedAnomalyPageMock.items
    .filter((item: AnomalyItem) =>
      (!query.from || item.date >= query.from)
      && (!query.to || item.date <= query.to)
      && (query.min_score === undefined || item.score >= query.min_score)
      && (!point || distanceKm(point.lat, point.lon, item.latitude, item.longitude) <= point.radius)
      && (!bbox || bbox.length !== 4 || (
        item.longitude >= bbox[0]! && item.latitude >= bbox[1]!
        && item.longitude <= bbox[2]! && item.latitude <= bbox[3]!
      ))
    )
    .sort((a, b) => {
      const left = a[sortKey]
      const right = b[sortKey]
      const comparison = typeof left === 'string' && typeof right === 'string'
        ? left.localeCompare(right)
        : Number(left) - Number(right)
      return comparison * direction
    })

  const offset = query.offset ?? 0
  const limit = query.limit ?? DEFAULT_ANOMALIES_LIMIT

  return {
    metric: typedAnomalyPageMock.metric,
    cell_deg: typedAnomalyPageMock.cell_deg,
    total: filtered.length,
    limit,
    offset,
    items: filtered.slice(offset, offset + limit)
  }
}

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

  async listAnomalies(query?: AnomaliesQuery): Promise<AnomalyPage> {
    if (useMocksEnabled()) return queryAnomaliesMock(query)
    const { $api } = useNuxtApp()
    return $api('/stats/anomalies', { query })
  },

  async getSummary(query?: SummaryQuery): Promise<SummaryResponse> {
    if (useMocksEnabled()) return typedSummaryMock
    const { $api } = useNuxtApp()
    return $api('/stats/summary', { query })
  }
}

export default StatsService
