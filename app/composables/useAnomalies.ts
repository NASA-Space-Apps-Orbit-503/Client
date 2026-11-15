import StatsService from '~/services/stats.service'
import { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
import { SortOrderEnum } from '~/enums/sort-order.enum'
import type { AnomaliesQuery } from '~/types/api/stats'

/** Same shape as TanStack's SortingState used by UTable. */
export type AnomaliesSorting = { id: string, desc: boolean }[]

export const ANOMALIES_PAGE_SIZES = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 25
const MIN_SCORE_DEBOUNCE_MS = 300

const sortableColumns = Object.values(AnomalySortEnum) as string[]

/**
 * Page state for /anomalies: page filters, server-side sorting and pagination,
 * all combined with the global filters into one API query.
 */
export default function useAnomalies() {
  const { apiQuery } = useFilters()

  // Page-specific filter. `minScoreInput` is bound to the input, `minScore` is applied (debounced).
  const minScoreInput = ref<number | null>(null)
  const minScore = ref<number | null>(null)
  let minScoreTimer: ReturnType<typeof setTimeout> | undefined
  watch(minScoreInput, (value) => {
    clearTimeout(minScoreTimer)
    minScoreTimer = setTimeout(() => {
      minScore.value = value
    }, MIN_SCORE_DEBOUNCE_MS)
  })
  onScopeDispose(() => clearTimeout(minScoreTimer))

  const sorting = ref<AnomaliesSorting>([{ id: AnomalySortEnum.Date, desc: true }])
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  const filterQuery = computed<AnomaliesQuery>(() => {
    const query: AnomaliesQuery = { ...apiQuery.value }
    if (minScore.value !== null) query.min_score = minScore.value
    return query
  })

  // Any filter change sends the user back to the first page
  watch([filterQuery, pageSize], () => {
    page.value = 1
  })

  const query = computed<AnomaliesQuery>(() => {
    const [sort] = sorting.value
    const query: AnomaliesQuery = {
      ...filterQuery.value,
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value
    }

    if (sort && sortableColumns.includes(sort.id)) {
      query.sort = sort.id as AnomalySortEnum
      query.order = sort.desc ? SortOrderEnum.Desc : SortOrderEnum.Asc
    }

    return query
  })

  // Filters are hydrated from the URL on the client, so fetch client-side only
  const { data, status, error, refresh } = useAsyncData(
    'anomalies',
    () => StatsService.listAnomalies(query.value),
    { watch: [query], server: false }
  )

  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const loading = computed(() => status.value === 'pending' || status.value === 'idle')

  return {
    // Page filters
    minScoreInput,
    filterQuery,
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
