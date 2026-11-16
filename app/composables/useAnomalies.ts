import StatsService from '~/services/stats.service'
import { AnomalySortEnum } from '~/enums/anomaly-sort.enum'
import type { FilterableSeverity } from '~/enums/severity.enum'
import type { AnomalyListQuery } from '~/types/api/stats'

/** Same shape as TanStack's SortingState used by UTable. */
export type AnomaliesSorting = { id: string, desc: boolean }[]

export const ANOMALIES_PAGE_SIZES = [25, 50, 100]
/** Contract default for `min_score`: below it a day is `normal` and is not listed. */
export const DEFAULT_MIN_SCORE = 2

const DEFAULT_PAGE_SIZE = 25

/** Table column id → API `sort` value, ascending and descending. */
const SORT_BY_COLUMN: Record<string, { asc: AnomalySortEnum, desc: AnomalySortEnum }> = {
  date: { asc: AnomalySortEnum.DateAsc, desc: AnomalySortEnum.DateDesc },
  score: { asc: AnomalySortEnum.ScoreAsc, desc: AnomalySortEnum.ScoreDesc },
  observed: { asc: AnomalySortEnum.ObservedAsc, desc: AnomalySortEnum.ObservedDesc }
}

export const SORTABLE_ANOMALY_COLUMNS = Object.keys(SORT_BY_COLUMN)

/** Filters that only exist on /anomalies (shown in the `#page-filters` slot of `<Filters>`). */
interface AnomalyPageFilters {
  minScore: number | null
  severities: FilterableSeverity[]
}

const defaultPageFilters = (): AnomalyPageFilters => ({ minScore: DEFAULT_MIN_SCORE, severities: [] })

const copyPageFilters = (value: AnomalyPageFilters): AnomalyPageFilters => ({ ...value, severities: [...value.severities] })

/** Drops `undefined` entries so equal queries compare (and serialize) equal. */
const compact = <T extends object>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T

/**
 * Page state for /anomalies. The global filters use the shared draft/applied model of
 * `useFilters()` (applied with the funnel button of `<Filters>`, validated there); the page's own
 * filters (minimum score, severity) follow the same model: edited as a draft, applied on the
 * `<Filters>` `apply` event and reset on `clear`. Requests only use the applied values.
 */
export default function useAnomalies() {
  const { statsQuery, searchActive } = useFilters()

  // Page filters: draft (bound to the inputs) and applied snapshot
  const pageDraft = ref<AnomalyPageFilters>(defaultPageFilters())
  const pageApplied = ref<AnomalyPageFilters>(defaultPageFilters())

  const minScore = computed({
    get: () => pageDraft.value.minScore,
    set: (value: number | null | undefined) => {
      pageDraft.value.minScore = value ?? null
    }
  })
  const severities = computed({
    get: () => pageDraft.value.severities,
    set: (value: FilterableSeverity[]) => {
      pageDraft.value.severities = value
    }
  })

  /** True when the page filters differ from the applied ones (enables the shared apply button). */
  const pagePending = computed(() => JSON.stringify(pageDraft.value) !== JSON.stringify(pageApplied.value))

  /** `<Filters @apply>`: the global filters were applied; apply the page filters with them. */
  function applyPageFilters() {
    pageApplied.value = copyPageFilters(pageDraft.value)
  }

  /** `<Filters @clear>`: reset the page filters too. */
  function clearPageFilters() {
    pageDraft.value = defaultPageFilters()
    pageApplied.value = defaultPageFilters()
  }

  const sorting = ref<AnomaliesSorting>([{ id: 'date', desc: true }])
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  /**
   * Applied filters (shared + page), without paging or sorting. `null` while the search is
   * cleared (`searchActive` false). Reused by the table, the map markers, the CSV and the charts.
   */
  const appliedQuery = computed<AnomalyListQuery | null>(() => {
    if (!searchActive.value) return null
    const { minScore: score, severities: selected } = pageApplied.value
    return compact({
      ...statsQuery.value,
      min_score: score ?? undefined,
      severity: selected.length ? selected.join(',') : undefined
    }) as AnomalyListQuery
  })

  // New applied filters or page size start from the first page
  watch([appliedQuery, pageSize], () => {
    page.value = 1
  })

  /** Request for the current page, or null while there is no active search. */
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

  const applied = computed(() => appliedQuery.value !== null)
  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const loading = computed(() => applied.value && status.value === 'pending')

  return {
    // Page filters
    minScore,
    severities,
    pagePending,
    applyPageFilters,
    clearPageFilters,
    // Applied state
    appliedQuery,
    applied,
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
