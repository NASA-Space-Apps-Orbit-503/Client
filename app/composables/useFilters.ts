import InstrumentsService from '~/services/instruments.service'
import SatellitesService from '~/services/satellites.service'
import { FilterQueryKeyEnum } from '~/enums/filter-query-key.enum'
import type { Instrument } from '~/types/api/instruments'
import type { Satellite } from '~/types/api/satellites'
import type { CircleArea } from '~/types/area'
import type { SelectMenuItem } from '@nuxt/ui'
import { parseDate, type DateValue } from '@internationalized/date'

const filterQueryKeys = Object.values(FilterQueryKeyEnum)

function getQueryValue(value: string | null | Array<string | null> | undefined) {
  const queryValue = Array.isArray(value) ? value[0] : value
  return queryValue ?? undefined
}

function serializeDate(value: DateValue | undefined) {
  return value?.toString()
}

const BBOX_DECIMALS = 4

/** Radius (km) applied around latitude/longitude when the user has not set one. */
export const DEFAULT_RADIUS_KM = 5
/** Limits accepted by the API `radius_km` parameter. */
export const MIN_RADIUS_KM = 0.1
export const MAX_RADIUS_KM = 2000

function parseQueryRadius(value: string | undefined) {
  const radius = Number(value)
  return value !== undefined && Number.isFinite(radius) && radius >= MIN_RADIUS_KM && radius <= MAX_RADIUS_KM
    ? radius
    : DEFAULT_RADIUS_KM
}

function serializeBbox(value: Bbox | null) {
  return value?.map(coordinate => coordinate.toFixed(BBOX_DECIMALS)).join(',')
}

function parseQueryBbox(value: string | undefined): Bbox | null {
  if (!value) return null

  const coordinates = value.split(',').map(Number)
  if (coordinates.length !== 4 || coordinates.some(coordinate => !Number.isFinite(coordinate))) return null

  const [west, south, east, north] = coordinates as Bbox
  const valid = west >= -180 && east <= 180 && south >= -90 && north <= 90 && west < east && south < north
  return valid ? [west, south, east, north] : null
}

function parseQueryDate(value: string | undefined) {
  if (!value) return undefined

  try {
    return parseDate(value.slice(0, 10))
  } catch {
    return undefined
  }
}

export default function useFilters() {
  const route = useRoute()
  const router = useRouter()
  const filters = useState<Filters>('filters', () => ({
    dateRange: {
      start: undefined,
      end: undefined
    },
    latitude: null,
    longitude: null,
    radiusKm: null,
    instruments: [],
    satellites: []
  }))
  const urlSyncInitialized = useState<boolean>('filters-url-sync-initialized', () => false)

  const instrumentsList = useState<SelectMenuItem[]>('instruments', () => [])
  const satellitesList = useState<SelectMenuItem[]>('satellites', () => [])

  const dateRange = computed({
    get: () => filters.value.dateRange,
    set: (value: DateRangeInput) => {
      filters.value.dateRange = value
    }
  })

  const latitude = computed({
    get: () => filters.value.latitude,
    set: (value: number | null) => {
      filters.value.latitude = value
    }
  })

  const longitude = computed({
    get: () => filters.value.longitude,
    set: (value: number | null) => {
      filters.value.longitude = value
    }
  })

  const radiusKm = computed({
    get: () => filters.value.radiusKm,
    set: (value: number | null) => {
      filters.value.radiusKm = value
    }
  })

  /**
   * Circle drawn on the map: `latitude`/`longitude` are its center and `radiusKm` its radius.
   * Setting it fills (or clears) the three filters at once.
   */
  const circle = computed<CircleArea | null>({
    get: () => {
      const { latitude: lat, longitude: lon, radiusKm: radius } = filters.value
      return lat !== null && lon !== null && radius !== null ? { lat, lon, radiusKm: radius } : null
    },
    set: (value) => {
      filters.value.latitude = value ? roundCoordinate(value.lat) : null
      filters.value.longitude = value ? roundCoordinate(value.lon) : null
      filters.value.radiusKm = value ? roundCoordinate(value.radiusKm, RADIUS_PRECISION) : null
    }
  })

  /** `lat` + `lon` + `radius_km` parameters ready for API queries (empty without a full circle). */
  const areaQuery = computed(() => circleToQuery(circle.value))

  const instruments = computed({
    get: () => filters.value.instruments,
    set: (value: string[]) => {
      filters.value.instruments = value
    }
  })

  const satellites = computed({
    get: () => filters.value.satellites,
    set: (value: string[]) => {
      filters.value.satellites = value
    }
  })

  /** Value for the API `satellite` parameter (comma-separated codes). */
  const satelliteQuery = computed(() => filters.value.satellites.length ? filters.value.satellites.join(',') : undefined)

  const getInstrumentsList = computed(() => instrumentsList.value)
  const getSatellitesList = computed(() => satellitesList.value)

  /** Drops satellite codes missing from the loaded catalog (kept as-is until it loads). */
  const onlyKnownSatellites = (codes: string[]) => {
    if (!satellitesList.value.length) return codes
    const known = new Set(satellitesList.value.map(item => item.id))
    return codes.filter(code => known.has(code))
  }

  const hasFilterQuery = (query: typeof route.query) =>
    filterQueryKeys.some(key => query[key] !== undefined)

  const withoutFilterQuery = (query: typeof route.query) =>
    Object.fromEntries(
      Object.entries(query).filter(([key]) => !filterQueryKeys.includes(key as FilterQueryKeyEnum))
    )

  const syncFiltersFromQuery = () => {
    const startDate = getQueryValue(route.query.startDate)
    const endDate = getQueryValue(route.query.endDate)
    const latitudeValue = getQueryValue(route.query.latitude)
    const longitudeValue = getQueryValue(route.query.longitude)
    const radiusValue = getQueryValue(route.query.radiusKm)
    const instrumentsValue = getQueryValue(route.query.instruments)
    const satellitesValue = getQueryValue(route.query.satellites)

    const start = import.meta.client ? parseQueryDate(startDate) : undefined
    const end = import.meta.client ? parseQueryDate(endDate) : undefined

    const latitudeValueAsNumber = latitudeValue === undefined ? null : Number(latitudeValue)
    const longitudeValueAsNumber = longitudeValue === undefined ? null : Number(longitudeValue)
    const radiusValueAsNumber = radiusValue === undefined ? null : Number(radiusValue)

    filters.value = {
      dateRange: { start, end },
      latitude: Number.isFinite(latitudeValueAsNumber) ? latitudeValueAsNumber : null,
      longitude: Number.isFinite(longitudeValueAsNumber) ? longitudeValueAsNumber : null,
      radiusKm: radiusValueAsNumber !== null && Number.isFinite(radiusValueAsNumber) && radiusValueAsNumber > 0
        ? radiusValueAsNumber
        : null,
      instruments: instrumentsValue ? instrumentsValue.split(',').filter(Boolean) : [],
      satellites: satellitesValue ? onlyKnownSatellites([...new Set(satellitesValue.split(',').filter(Boolean))]) : []
    }
  }

  const syncFiltersToUrl = async () => {
    if (!import.meta.client || route.path === '/methodology') return

    const query = withoutFilterQuery(route.query) as Record<string, string | string[]>

    const startDate = serializeDate(filters.value.dateRange.start)
    const endDate = serializeDate(filters.value.dateRange.end)

    if (startDate) query.startDate = startDate
    if (endDate) query.endDate = endDate
    if (filters.value.latitude !== null) query.latitude = String(filters.value.latitude)
    if (filters.value.longitude !== null) query.longitude = String(filters.value.longitude)
    if (filters.value.radiusKm !== null) query.radiusKm = String(filters.value.radiusKm)
    if (filters.value.instruments.length) query.instruments = filters.value.instruments.join(',')
    if (filters.value.satellites.length) query.satellites = filters.value.satellites.join(',')

    const currentQuery = route.query as Record<string, string | string[]>
    const currentKeys = Object.keys(currentQuery)
    const nextKeys = Object.keys(query)
    const queryChanged = currentKeys.length !== nextKeys.length
      || nextKeys.some((key) => {
        const currentValue = currentQuery[key]
        const nextValue = query[key]
        return Array.isArray(currentValue) || Array.isArray(nextValue)
          ? JSON.stringify(currentValue) !== JSON.stringify(nextValue)
          : currentValue !== nextValue
      })

    if (queryChanged) await router.replace({ query })
  }

  const syncUrl = () => {
    if (route.path === '/methodology') {
      if (import.meta.client && hasFilterQuery(route.query)) {
        const query = withoutFilterQuery(route.query)
        void router.replace({ query })
      }
      return
    }

    if (hasFilterQuery(route.query)) {
      syncFiltersFromQuery()
    } else {
      void syncFiltersToUrl()
    }
  }

  syncUrl()

  if (import.meta.client && !urlSyncInitialized.value) {
    urlSyncInitialized.value = true
    onMounted(() => {
      if (route.path !== '/methodology' && hasFilterQuery(route.query)) {
        syncFiltersFromQuery()
      }
    })
    watch(
      () => `${route.path}?${JSON.stringify(route.query)}`,
      syncUrl
    )
    watch(filters, () => {
      void syncFiltersToUrl()
    }, { deep: true })
  }

  /**
   * Fetches the list of instruments from the API and updates the instruments state.
   * If the API call fails, it logs the error to the console.
   */
  const fetchInstruments = async () => {
    try {
      const data = await InstrumentsService.listInstruments()
      instrumentsList.value = data.map((instrument: Instrument) => ({
        id: instrument.code,
        label: instrument.name
      }))
    } catch (error) {
      console.error('Error fetching instruments:', error)
    }
  }

  /**
   * Fetches the list of satellites and updates the satellites state.
   * If the request fails, it logs the error to the console.
   */
  const fetchSatellites = async () => {
    try {
      const data = await SatellitesService.listSatellites()
      satellitesList.value = data.map((satellite: Satellite) => ({
        id: satellite.code,
        label: `${satellite.name} (${satellite.instrument})`
      }))
      const selected = onlyKnownSatellites(filters.value.satellites)
      if (selected.length !== filters.value.satellites.length) filters.value.satellites = selected
    } catch (error) {
      console.error('Error fetching satellites:', error)
    }
  }

  const init = async () => {
    await Promise.all([fetchInstruments(), fetchSatellites()])
  }

  return {
    // Computed properties
    dateRange,
    latitude,
    longitude,
    radiusKm,
    circle,
    areaQuery,
    instruments,
    satellites,
    satelliteQuery,
    getInstrumentsList,
    getSatellitesList,
    // Methods
    init,
    fetchInstruments,
    fetchSatellites
  }
}
