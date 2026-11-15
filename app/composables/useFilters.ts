import InstrumentsService from '~/services/instruments.service'
import SatellitesService from '~/services/satellites.service'
import { FilterQueryKeyEnum } from '~/enums/filter-query-key.enum'
import type { Instrument } from '~/types/api/instruments'
import type { Satellite } from '~/types/api/satellites'
import type { Filters, DateRangeInput } from '~/types/filters'
import type { StatsQuery } from '~/types/api/stats'
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

function parseQueryDate(value: string | undefined) {
  if (!value) return undefined

  try {
    return parseDate(value.slice(0, 10))
  } catch {
    return undefined
  }
}

function copyFilters(value: Filters): Filters {
  return { ...value, dateRange: { ...value.dateRange }, instruments: [...value.instruments], satellites: [...value.satellites] }
}

function filterSignature(value: Filters) {
  return JSON.stringify({ ...value, dateRange: {
    start: value.dateRange.start?.toString(), end: value.dateRange.end?.toString()
  } })
}

export default function useFilters() {
  const { t } = useI18n()
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
  const appliedFilters = useState<Filters>('applied-filters', () => copyFilters(filters.value))
  const searchActive = useState<boolean>('filters-search-active', () => true)
  const applying = ref(false)
  const hasPendingChanges = computed(() => !searchActive.value || filterSignature(filters.value) !== filterSignature(appliedFilters.value))
  const validationMessage = computed(() => {
    const { start, end } = filters.value.dateRange
    if (Boolean(start) !== Boolean(end) || (start && end && start.compare(end) > 0)) return t('filters.errors.dateRange')
    const { latitude: lat, longitude: lon, radiusKm: radius } = filters.value
    const hasCoordinates = lat !== null || lon !== null
    if (hasCoordinates && (lat === null || lon === null || !Number.isFinite(lat) || !Number.isFinite(lon)
      || Math.abs(lat) > 90 || Math.abs(lon) > 180)) return t('filters.errors.coordinates')
    if (radius !== null && (!hasCoordinates || !Number.isFinite(radius) || radius <= 0 || radius > 300)) return t('filters.errors.radius')
    return ''
  })

  // API consumers read only this snapshot; editing inputs or drawing on the map is a draft.
  const statsQuery = computed<StatsQuery>(() => {
    const { dateRange, latitude: lat, longitude: lon, radiusKm, instruments, satellites } = appliedFilters.value
    return {
      ...(dateRange.start && dateRange.end ? { startDate: dateRange.start.toString(), endDate: dateRange.end.toString() } : {}),
      ...(lat !== null && lon !== null
        ? radiusKm !== null ? circleToQuery({ lat, lon, radiusKm }) : pointToQuery(lat, lon)
        : {}),
      instrument: instruments.length ? instruments.join(',') : undefined,
      satellite: satellites.length ? satellites.join(',') : undefined
    }
  })
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
    set: (value: number | null | undefined) => {
      filters.value.latitude = value ?? null
    }
  })

  const longitude = computed({
    get: () => filters.value.longitude,
    set: (value: number | null | undefined) => {
      filters.value.longitude = value ?? null
    }
  })

  const radiusKm = computed({
    get: () => filters.value.radiusKm,
    set: (value: number | null | undefined) => {
      filters.value.radiusKm = value ?? null
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

  /** Draft spatial query: an explicit circle or the cell containing a point. */
  const areaQuery = computed(() => circle.value
    ? circleToQuery(circle.value)
    : latitude.value !== null && longitude.value !== null ? pointToQuery(latitude.value, longitude.value) : {})

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

    const fromQuery: Filters = {
      dateRange: { start, end },
      latitude: Number.isFinite(latitudeValueAsNumber) ? latitudeValueAsNumber : null,
      longitude: Number.isFinite(longitudeValueAsNumber) ? longitudeValueAsNumber : null,
      radiusKm: radiusValueAsNumber !== null && Number.isFinite(radiusValueAsNumber) && radiusValueAsNumber > 0
        ? radiusValueAsNumber
        : null,
      instruments: instrumentsValue ? instrumentsValue.split(',').filter(Boolean) : [],
      satellites: satellitesValue ? [...new Set(satellitesValue.split(',').filter(Boolean))] : []
    }
    if (filterSignature(fromQuery) !== filterSignature(appliedFilters.value)) {
      searchActive.value = true
      appliedFilters.value = copyFilters(fromQuery)
      filters.value = copyFilters(fromQuery)
    }
  }

  const syncFiltersToUrl = async () => {
    if (!import.meta.client || route.path.replace(/^\/(en|es)(?=\/)/, '') === '/methodology') return

    const query = withoutFilterQuery(route.query) as Record<string, string | string[]>

    const startDate = serializeDate(appliedFilters.value.dateRange.start)
    const endDate = serializeDate(appliedFilters.value.dateRange.end)

    if (startDate) query.startDate = startDate
    if (endDate) query.endDate = endDate
    if (appliedFilters.value.latitude !== null) query.latitude = String(appliedFilters.value.latitude)
    if (appliedFilters.value.longitude !== null) query.longitude = String(appliedFilters.value.longitude)
    if (appliedFilters.value.radiusKm !== null) query.radiusKm = String(appliedFilters.value.radiusKm)
    if (appliedFilters.value.instruments.length) query.instruments = appliedFilters.value.instruments.join(',')
    if (appliedFilters.value.satellites.length) query.satellites = appliedFilters.value.satellites.join(',')

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
    if (route.path.replace(/^\/(en|es)(?=\/)/, '') === '/methodology') {
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
      if (route.path.replace(/^\/(en|es)(?=\/)/, '') !== '/methodology' && hasFilterQuery(route.query)) {
        syncFiltersFromQuery()
      }
    })
    watch(
      () => `${route.path}?${JSON.stringify(route.query)}`,
      syncUrl
    )
  }

  async function applyFilters() {
    if (validationMessage.value || applying.value) return
    applying.value = true
    appliedFilters.value = copyFilters(filters.value)
    searchActive.value = true
    try {
      await syncFiltersToUrl()
    } finally {
      applying.value = false
    }
  }

  /** Remove only the spatial filter from both the draft and applied search. */
  async function clearArea() {
    filters.value = { ...filters.value, latitude: null, longitude: null, radiusKm: null }
    appliedFilters.value = { ...appliedFilters.value, latitude: null, longitude: null, radiusKm: null }
    await syncFiltersToUrl()
  }

  async function clearFilters() {
    searchActive.value = false
    filters.value = {
      dateRange: { start: undefined, end: undefined },
      latitude: null, longitude: null, radiusKm: null, instruments: [], satellites: []
    }
    appliedFilters.value = copyFilters(filters.value)
    await syncFiltersToUrl()
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
    statsQuery,
    searchActive,
    clearFilters,
    clearArea,
    applyFilters,
    applying,
    hasPendingChanges,
    validationMessage,
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
