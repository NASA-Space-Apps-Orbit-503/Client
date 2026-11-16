import type { AnomalyItem, AnomalyListQuery } from '~/types/api/stats'

/** Above this many rows the user is asked to confirm the export. */
export const ANOMALIES_EXPORT_WARNING_ROWS = 50_000

/** CSV separators per UI locale: Excel uses the regional list separator to split columns. */
const CSV_FORMAT_BY_LOCALE: Record<string, { delimiter: string, decimalSeparator: string }> = {
  en: { delimiter: ',', decimalSeparator: '.' },
  es: { delimiter: ';', decimalSeparator: ',' }
}
const DEFAULT_CSV_FORMAT = { delimiter: ',', decimalSeparator: '.' }

/** CSV columns, in file order: every API field, `location` split in three. */
const CSV_COLUMNS = [
  { key: 'id', value: (item: AnomalyItem) => item.id },
  { key: 'date', value: (item: AnomalyItem) => formatEpochDate(item.date) },
  { key: 'latitude', value: (item: AnomalyItem) => item.location.latitude },
  { key: 'longitude', value: (item: AnomalyItem) => item.location.longitude },
  { key: 'cellDeg', value: (item: AnomalyItem) => item.location.cell_deg },
  { key: 'observed', value: (item: AnomalyItem) => item.observed },
  { key: 'expected', value: (item: AnomalyItem) => item.expected },
  { key: 'ratio', value: (item: AnomalyItem) => item.ratio },
  { key: 'score', value: (item: AnomalyItem) => item.score },
  { key: 'severity', value: (item: AnomalyItem) => item.severity },
  { key: 'maxFrp', value: (item: AnomalyItem) => item.max_frp },
  { key: 'baselineYears', value: (item: AnomalyItem) => item.baseline_years }
] as const

/**
 * CSV export of every anomaly matching the current filters (all pages, not only the visible one).
 * `filterQuery` must hold the filters without paging or sorting; `total` is the current result count.
 */
export default function useAnomaliesExport(filterQuery: Ref<AnomalyListQuery>, total: Ref<number>) {
  const { t, locale } = useI18n()
  const toast = useToast()
  // Captured in setup: the export starts from a click handler (outside setup)
  const nuxtApp = useNuxtApp()

  const exporting = ref(false)
  const exportedRows = ref(0)
  const expectedRows = ref(0)
  const confirmOpen = ref(false)
  let cancelRequested = false

  const canExport = computed(() => total.value > 0 && !exporting.value)
  const progress = computed(() => expectedRows.value ? Math.min(100, Math.round((exportedRows.value / expectedRows.value) * 100)) : 0)

  /** Every page of the filters (shared helper), reporting progress and honoring Cancel. */
  function fetchAll(query: AnomalyListQuery): Promise<AnomalyItem[]> {
    return fetchAllAnomalies(query, {
      runInContext: fn => nuxtApp.runWithContext(fn),
      shouldStop: () => cancelRequested,
      onProgress: (fetched, total) => {
        exportedRows.value = fetched
        expectedRows.value = total
      }
    })
  }

  /** `anomalies_<start>_to_<end>.csv`: the filter dates, or the first and last day in the data. */
  function buildFilename(query: AnomalyListQuery, rows: AnomalyItem[]) {
    if (query.startDate && query.endDate) return `anomalies_${query.startDate}_to_${query.endDate}.csv`

    // A loop instead of Math.min(...dates): spreading very large arrays overflows the call stack
    let first = Infinity
    let last = -Infinity
    for (const { date } of rows) {
      if (date < first) first = date
      if (date > last) last = date
    }
    return `anomalies_${formatEpochDate(first)}_to_${formatEpochDate(last)}.csv`
  }

  function buildCsv(rows: AnomalyItem[]) {
    const format = CSV_FORMAT_BY_LOCALE[locale.value] ?? DEFAULT_CSV_FORMAT
    const headers = CSV_COLUMNS.map(column => t(`anomalies.csv.columns.${column.key}`))
    const values = rows.map(row => CSV_COLUMNS.map(column => column.value(row)))
    return UTF8_BOM + toCsv(headers, values, format)
  }

  async function runExport() {
    confirmOpen.value = false
    if (!canExport.value) return

    // Snapshot the filters so a change during the export cannot mix result sets
    const query = { ...filterQuery.value }
    exporting.value = true
    cancelRequested = false
    exportedRows.value = 0
    expectedRows.value = total.value

    try {
      const rows = await fetchAll(query)
      if (!rows.length) {
        toast.add({ title: t('anomalies.csv.emptyTitle'), color: 'warning', icon: 'i-lucide-file-x' })
        return
      }
      downloadTextFile(buildCsv(rows), buildFilename(query, rows), 'text/csv;charset=utf-8')
      toast.add({
        title: t('anomalies.csv.successTitle'),
        description: t('anomalies.csv.successDescription', { count: rows.length }, rows.length),
        color: 'success',
        icon: 'i-lucide-file-check'
      })
    } catch (error) {
      if (error instanceof AnomaliesFetchCancelledError) {
        toast.add({ title: t('anomalies.csv.cancelledTitle'), color: 'neutral', icon: 'i-lucide-circle-slash' })
      } else {
        console.error('Error exporting anomalies:', error)
        toast.add({ title: t('anomalies.csv.errorTitle'), color: 'error', icon: 'i-lucide-circle-alert' })
      }
    } finally {
      exporting.value = false
      cancelRequested = false
    }
  }

  /** Entry point for the button: asks for confirmation on large exports. */
  function requestExport() {
    if (!canExport.value) return
    if (total.value > ANOMALIES_EXPORT_WARNING_ROWS) {
      confirmOpen.value = true
      return
    }
    void runExport()
  }

  function cancelExport() {
    cancelRequested = true
  }

  return {
    canExport,
    exporting,
    exportedRows,
    expectedRows,
    progress,
    confirmOpen,
    requestExport,
    runExport,
    cancelExport
  }
}
