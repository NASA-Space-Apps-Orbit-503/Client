import StatsService from '~/services/stats.service'
import { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
import type { FilterableSeverity } from '~/enums/severity.enum'
import type { DateRangeQuery } from '~/types/api/date-range'
import type { AnomalyListQuery } from '~/types/api/stats'
import type { AreaQuery } from '~/types/area'

/** Same shape as TanStack's SortingState used by UTable. */
export type AnomaliesSorting = { id: string, desc: boolean }[]

export const ANOMALIES_PAGE_SIZES = [25, 50, 100]
/** Contract default for `min_score`: below it a day is `normal` and is not listed. */
export const DEFAULT_MIN_SCORE = 2
/** Radius used on /anomalies when latitude/longitude are set without a radius. */
export const ANOMALIES_DEFAULT_RADIUS_KM = 5

const DEFAULT_PAGE_SIZE = 25

/** Table column id → API `sort` value, ascending and descending. */
const SORT_BY_COLUMN: Record<string, { asc: AnomalySortEnum, desc: AnomalySortEnum }> = {
  date: { asc: AnomalySortEnum.DateAsc, desc: AnomalySortEnum.DateDesc },
  score: { asc: AnomalySortEnum.ScoreAsc, desc: AnomalySortEnum.ScoreDesc },
  observed: { asc: AnomalySortEnum.ObservedAsc, desc: AnomalySortEnum.ObservedDesc }
}

export const SORTABLE_ANOMALY_COLUMNS = Object.keys(SORT_BY_COLUMN)

/**
 * Page state for /anomalies. Filters (global + page) are edited freely but only reach the API
 * when `applyFilters()` runs (the Filter button), as a snapshot (`appliedQuery`). Sorting and
 * pagination act on that snapshot immediately. Shared filter state is never modified here.
 */
export default function useAnomalies() {
  const { dateRange, latitude, longitude, areaQuery, instruments, satelliteQuery } = useFilters()

  // Page filters
  const minScore = ref<number | null>(DEFAULT_MIN_SCORE)
  const severities = ref<FilterableSeverity[]>([])

  const sorting = ref<AnomaliesSorting>([{ id: 'date', desc: true }])
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  /** Shared circle; falls back to a point + default radius when only coordinates are typed. */
  const anomaliesAreaQuery = computed<AreaQuery>(() => {
    if (areaQuery.value.lat !== undefined) return areaQuery.value
    if (latitude.value === null || longitude.value === null) return {}
    return circleToQuery({ lat: latitude.value, lon: longitude.value, radiusKm: ANOMALIES_DEFAULT_RADIUS_KM })
  })

  /** Filters as currently edited (not yet applied). */
  const pendingQuery = computed<AnomalyListQuery>(() => {
    const startDate = dateRange.value.start?.toString()
    const endDate = dateRange.value.end?.toString()

    // The API requires both dates or neither
    const dates: DateRangeQuery = startDate && endDate ? { startDate, endDate } : {}
    const query: AnomalyListQuery = { ...dates, ...anomaliesAreaQuery.value }

    if (instruments.value.length) query.instrument = instruments.value.join(',')
    if (satelliteQuery.value) query.satellite = satelliteQuery.value
    if (minScore.value !== null) query.min_score = minScore.value
    if (severities.value.length) query.severity = severities.value.join(',')

    return query
  })

  /** Last applied filters, without paging or sorting. `null` until the first apply. Reused by the CSV export. */
  const appliedQuery = ref<AnomalyListQuery | null>(null)

  /** True when the edited filters differ from the applied ones. */
  const hasPendingChanges = computed(() =>
    JSON.stringify(pendingQuery.value) !== JSON.stringify(appliedQuery.value)
  )

  // Validation: latitude and longitude must be both set or both empty
  const coordinatesError = ref(false)
  const coordinatesValid = () => (latitude.value === null) === (longitude.value === null)
  watch([latitude, longitude], () => {
    if (coordinatesError.value && coordinatesValid()) coordinatesError.value = false
  })

  // A new page size starts from the first page
  watch(pageSize, () => {
    page.value = 1
  })

  /** Request for the current page, or null while no filters have been applied. */
  const query = computed<AnomalyListQuery | null>(() => {
    if (!appliedQuery.value) return null
    const [sort] = sorting.value
    const sortValues = sort ? SORT_BY_COLUMN[sort.id] : undefined

    return {
      ...appliedQuery.value,
      ...(sortValues ? { sort: sort!.desc ? sortValues.desc : sortValues.asc } : {}),
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value
    }
  })

  // Filters are hydrated from the URL on the client, so fetch client-side only
  const { data, status, error, refresh } = useAsyncData(
    'anomalies',
    () => query.value ? StatsService.listAnomalies(query.value) : Promise.resolve(null),
    { watch: [query], server: false }
  )

  /**
   * Applies the edited filters (Filter button). Returns false when validation fails.
   * Applying the same filters again refreshes the results.
   */
  function applyFilters(): boolean {
    if (!coordinatesValid()) {
      coordinatesError.value = true
      return false
    }
    coordinatesError.value = false

    // Always a new object: even with the same filters the request is rebuilt, so results refresh
    appliedQuery.value = { ...pendingQuery.value }
    page.value = 1
    return true
  }

  /**
   * Initial state on load, so the table and map are never empty on arrival:
   * - Filters restored from the URL (shared link, reload, coming from another page) are applied.
   * - Without URL filters, the defaults are applied (whole dataset, `min_score` 2, newest first).
   * If the URL filters are invalid (latitude without longitude), the validation error is shown
   * and the page waits for the Filter button.
   */
  function applyInitialFilters() {
    applyFilters()
  }

  const applied = computed(() => appliedQuery.value !== null)
  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const loading = computed(() => applied.value && status.value === 'pending')

  return {
    // Page filters
    minScore,
    severities,
    // Apply flow
    appliedQuery,
    applied,
    hasPendingChanges,
    coordinatesError,
    applyFilters,
    applyInitialFilters,
    // Table state
    sorting,
    page,
    pageSize,
    // Data
    items,
    total,
    loading,
    error,
    refresh
  }
}
