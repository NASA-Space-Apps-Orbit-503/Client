import DetectionsService from '~/services/detections.service'
import { EL_SALVADOR_BBOX } from '~/constants/el-salvador'
import type { Detection, DetectionQuery } from '~/types/api/detections'

const PAGE_SIZE = 500
const MAX_MAP_POINTS = 5000

/** Only applied filters fetch points; selecting or drawing a draft area never triggers a request. */
export default function useMapDetections() {
  const { statsQuery, searchActive } = useFilters()
  const nuxtApp = useNuxtApp()
  const query = computed<DetectionQuery>(() => {
    const { west, south, east, north } = EL_SALVADOR_BBOX
    return {
      ...(!statsQuery.value.bbox && statsQuery.value.radius_km === undefined ? { bbox: `${west},${south},${east},${north}` } : {}),
      ...statsQuery.value,
      limit: PAGE_SIZE,
      offset: 0
    }
  })
  const { data, status, error, refresh } = useAsyncData('map-detections', async () => {
    if (!searchActive.value) return { items: [], total: 0, limit: PAGE_SIZE, offset: 0 }
    const page = await DetectionsService.searchDetections(query.value)
    if (typeof page === 'string') throw new Error('Expected a JSON detection page')
    return page
  }, { watch: [query, searchActive], server: false })

  const extra = ref<Detection[]>([])
  const loadingMore = ref(false)
  const exhausted = ref(false)
  const moreError = shallowRef<unknown>(null)
  watch(data, () => {
    extra.value = []
    exhausted.value = false
  })
  watch([query, searchActive], () => {
    moreError.value = null
  })
  const loading = computed(() => searchActive.value && (status.value === 'idle' || status.value === 'pending'))
  const detections = computed(() => !searchActive.value || loading.value || error.value ? [] : [...(data.value?.items ?? []), ...extra.value])
  const total = computed(() => searchActive.value && !loading.value ? data.value?.total ?? 0 : 0)
  const canLoadMore = computed(() => searchActive.value && !loading.value && !error.value && !exhausted.value && detections.value.length < total.value && detections.value.length < MAX_MAP_POINTS)

  async function loadMore() {
    if (!canLoadMore.value || loadingMore.value) return
    const original = data.value
    loadingMore.value = true
    moreError.value = null
    try {
      const page = await nuxtApp.runWithContext(() => DetectionsService.searchDetections({
        ...query.value,
        offset: detections.value.length,
        limit: Math.min(PAGE_SIZE, MAX_MAP_POINTS - detections.value.length)
      }))
      if (!searchActive.value || data.value !== original || loading.value) return
      if (typeof page === 'string') throw new Error('Expected a JSON detection page')
      const seen = new Set(detections.value.map(point => point.id))
      const added = page.items.filter(point => !seen.has(point.id))
      if (!added.length) exhausted.value = true
      extra.value.push(...added)
    } catch (cause) {
      if (searchActive.value && data.value === original) moreError.value = cause
    } finally {
      loadingMore.value = false
    }
  }

  return { detections, total, loading, error: computed(() => searchActive.value ? error.value || moreError.value : null), refresh, loadMore, loadingMore, canLoadMore }
}
