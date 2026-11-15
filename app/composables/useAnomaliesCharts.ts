import { ANOMALY_CHARTS_WARNING_ROWS } from '~/constants/anomaly-charts'
import { SeverityEnum } from '~/enums/severity.enum'
import type { AnomalyItem, AnomalyListQuery } from '~/types/api/stats'

export type AnomalyChartsStatus = 'idle' | 'loading' | 'confirm' | 'ready' | 'error'

const MONTHS = 12

/** Rows of one severity, kept together so a scatter series and its tooltip share the same index. */
export interface SeverityPoints {
  severity: SeverityEnum
  rows: AnomalyItem[]
}

/**
 * Data for the anomaly charts: every row matching the applied filters (all pages), loaded once per
 * apply, plus the aggregations each chart needs. Counts are anomaly rows (one cell on one day).
 * Results above `ANOMALY_CHARTS_WARNING_ROWS` wait for `confirmLoad()`.
 */
export default function useAnomaliesCharts(appliedQuery: Ref<AnomalyListQuery | null>) {
  // shallowRef: tens of thousands of rows do not need deep reactivity
  const rows = shallowRef<AnomalyItem[]>([])
  const status = ref<AnomalyChartsStatus>('idle')
  const fetched = ref(0)
  const expected = ref(0)
  /** Total waiting for confirmation when above the warning threshold. */
  const pendingTotal = ref(0)

  let runId = 0
  let lastConfirmed = false

  async function load(confirmed: boolean) {
    const query = appliedQuery.value
    const id = ++runId
    lastConfirmed = confirmed

    if (!query) {
      rows.value = []
      status.value = 'idle'
      return
    }

    status.value = 'loading'
    fetched.value = 0
    expected.value = 0

    try {
      const result = await fetchAllAnomalies(query, {
        maxRows: confirmed ? undefined : ANOMALY_CHARTS_WARNING_ROWS,
        // A newer apply supersedes this load
        shouldStop: () => id !== runId,
        onProgress: (done, total) => {
          if (id !== runId) return
          fetched.value = done
          expected.value = total
        }
      })
      if (id !== runId) return
      rows.value = result
      status.value = 'ready'
    } catch (error) {
      if (id !== runId || error instanceof AnomaliesFetchCancelledError) return
      if (error instanceof AnomaliesTooManyRowsError) {
        rows.value = []
        pendingTotal.value = error.total
        status.value = 'confirm'
        return
      }
      console.error('Error loading anomaly charts:', error)
      rows.value = []
      status.value = 'error'
    }
  }

  watch(appliedQuery, () => load(false), { immediate: true })

  const confirmLoad = () => load(true)
  const retry = () => load(lastConfirmed)

  const progress = computed(() => expected.value ? Math.min(100, Math.round((fetched.value / expected.value) * 100)) : 0)

  /** Years present in the data, ascending. */
  const years = computed(() => [...new Set(rows.value.map(row => epochYear(row.date)))].sort((a, b) => a - b))

  /** Year for the line chart; `null` = "None" (aggregate of every year). */
  const selectedYear = ref<number | null>(null)
  watch(years, (available) => {
    if (selectedYear.value !== null && !available.includes(selectedYear.value)) selectedYear.value = null
  })

  /** Anomalies per month (index 0 = January) for `selectedYear`, or summed over every year. */
  const monthlyCounts = computed(() => {
    const counts = Array.from({ length: MONTHS }, () => 0)
    for (const row of rows.value) {
      if (selectedYear.value !== null && epochYear(row.date) !== selectedYear.value) continue
      counts[epochMonth(row.date) - 1]! += 1
    }
    return counts
  })

  /** Anomalies per year and month: `counts[month][yearIndex]`, aligned with `years`. */
  const yearMonthCounts = computed(() => {
    const yearIndex = new Map(years.value.map((year, index) => [year, index]))
    const counts = Array.from({ length: MONTHS }, () => years.value.map(() => 0))
    for (const row of rows.value) {
      counts[epochMonth(row.date) - 1]![yearIndex.get(epochYear(row.date))!]! += 1
    }
    return counts
  })

  /** Rows grouped by severity (ascending), for one scatter series each. */
  const severityPoints = computed<SeverityPoints[]>(() => {
    const order = Object.values(SeverityEnum)
    const groups = new Map<SeverityEnum, AnomalyItem[]>(order.map(severity => [severity, []]))
    for (const row of rows.value) groups.get(row.severity as SeverityEnum)?.push(row)
    return order
      .map(severity => ({ severity, rows: groups.get(severity)! }))
      .filter(group => group.rows.length)
  })

  return {
    status,
    rows,
    fetched,
    expected,
    progress,
    pendingTotal,
    confirmLoad,
    retry,
    years,
    selectedYear,
    monthlyCounts,
    yearMonthCounts,
    severityPoints
  }
}
