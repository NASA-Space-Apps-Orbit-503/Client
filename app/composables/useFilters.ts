import InstrumentsService from '~/services/instruments.service'
import { FilterQueryKeyEnum } from '~/enums/filter-query-key.enum'
import type { Instrument } from '~/types/api/instruments'
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
    instruments: []
  }))
  const urlSyncInitialized = useState<boolean>('filters-url-sync-initialized', () => false)

  const instrumentsList = useState<SelectMenuItem[]>('instruments', () => [])

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

  const instruments = computed({
    get: () => filters.value.instruments,
    set: (value: string[]) => {
      filters.value.instruments = value
    }
  })

  const getInstrumentsList = computed(() => instrumentsList.value)

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
    const instrumentsValue = getQueryValue(route.query.instruments)

    const start = import.meta.client ? parseQueryDate(startDate) : undefined
    const end = import.meta.client ? parseQueryDate(endDate) : undefined

    const latitudeValueAsNumber = latitudeValue === undefined ? null : Number(latitudeValue)
    const longitudeValueAsNumber = longitudeValue === undefined ? null : Number(longitudeValue)

    filters.value = {
      dateRange: { start, end },
      latitude: Number.isFinite(latitudeValueAsNumber) ? latitudeValueAsNumber : null,
      longitude: Number.isFinite(longitudeValueAsNumber) ? longitudeValueAsNumber : null,
      instruments: instrumentsValue ? instrumentsValue.split(',').filter(Boolean) : []
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
    if (filters.value.instruments.length) query.instruments = filters.value.instruments.join(',')

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

  const init = async () => {
    await fetchInstruments()
  }

  return {
    // Computed properties
    dateRange,
    latitude,
    longitude,
    instruments,
    getInstrumentsList,
    // Methods
    init,
    fetchInstruments
  }
}
