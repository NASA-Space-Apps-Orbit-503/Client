import calendarMock from '~~/data/calendar.json'
import climatologyMock from '~~/data/climatology.json'
import anomaliesMock from '~~/data/anomalies.json'
import summaryMock from '~~/data/summary.json'
import anomalyPageMock from '~~/data/anomaly-page.json'
import { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
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
const typedAnomalyPageMock = anomalyPageMock as AnomalyPage

const DEFAULT_ANOMALIES_LIMIT = 100
/** Contract defaults for `/stats/anomalies`. */
const DEFAULT_ANOMALIES_MIN_SCORE = 2
const DEFAULT_ANOMALIES_SORT = AnomalySortEnum.ScoreDesc
const EARTH_RADIUS_KM = 6371

/** Great-circle distance in km (haversine). */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (degrees: number) => degrees * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

/** `YYYY-MM-DD` (inclusive day) to epoch ms at 00:00 UTC. */
const dayStartMs = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`)

/**
 * Applies the query to the mock anomalies so filters, sorting and paging behave like the API.
 * Only used when mocks are enabled.
 */
function queryAnomaliesMock(query: AnomalyListQuery = {}): AnomalyPage {
  const bbox = query.bbox?.split(',').map(Number)
  const point = query.lat !== undefined && query.lon !== undefined && query.radius_km !== undefined
    ? { lat: query.lat, lon: query.lon, radius: query.radius_km }
    : undefined
  const from = query.startDate ? dayStartMs(query.startDate) : undefined
  const to = query.endDate ? dayStartMs(query.endDate) : undefined
  const minScore = query.min_score ?? DEFAULT_ANOMALIES_MIN_SCORE
  const severities = query.severity?.split(',').filter(Boolean)

  const sort = query.sort ?? DEFAULT_ANOMALIES_SORT
  const direction = sort.startsWith('-') ? -1 : 1
  const sortKey = sort.replace(/^-/, '') as 'score' | 'date' | 'observed'

  const filtered = typedAnomalyPageMock.items
    .filter(({ date, score, severity, location }: AnomalyItem) =>
      (from === undefined || date >= from)
      && (to === undefined || date <= to)
      && score >= minScore
      && (!severities?.length || severities.includes(severity))
      && (!point || distanceKm(point.lat, point.lon, location.latitude, location.longitude) <= point.radius)
      && (!bbox || bbox.length !== 4 || (
        location.longitude >= bbox[0]! && location.latitude >= bbox[1]!
        && location.longitude <= bbox[2]! && location.latitude <= bbox[3]!
      ))
    )
    .sort((a, b) => (a[sortKey] - b[sortKey]) * direction)

  const offset = query.offset ?? 0
  const limit = query.limit ?? DEFAULT_ANOMALIES_LIMIT

  return {
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

  async listAnomalies(query?: AnomalyListQuery): Promise<AnomalyPage> {
    if (useMocksEnabled()) return queryAnomaliesMock(query)
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
