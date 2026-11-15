import HarmonizationService from '~/services/harmonization.service'
import { InstrumentEnum } from '~/enums/instrument.enum'
import StatsService from '~/services/stats.service'
import { StatsGranularityEnum } from '~/enums/stats-granularity.enum'
import { TrendGranularityEnum } from '~/enums/trend-granularity.enum'
import { CHART_MAX_SERIES } from '~/constants/chart-palette'
import type { CalendarQuery } from '~/types/api/stats'
import type { TrendLineSeries, TrendSort } from '~/types/historical-trends'

const DEFAULT_COMPARED_YEARS = 5
const ALL_MONTHS = Array.from({ length: 12 }, (_, index) => index + 1)

/**
 * Data and state of the historical trends page: fetches the monthly calendar series with the
 * global filters, aggregates it per year or month, and keeps the periods selected to compare.
 */
export default function useHistoricalTrends() {
  const { t } = useI18n()
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const exporting = ref(false)
  const { statsQuery, searchActive } = useFilters()
  const { monthName, metricLabel } = useTrendFormat()

  const granularity = ref<TrendGranularityEnum>(TrendGranularityEnum.Month)
  const sort = ref<TrendSort | null>(null)

  /** The calendar is always requested per month; years are aggregated on the client. */
  const query = computed<CalendarQuery>(() => ({
    ...statsQuery.value,
    granularity: StatsGranularityEnum.Month
  }))

  const { data: calendars, status, error, refresh } = useAsyncData(
    'historical-trends-calendar',
    async () => {
      if (!searchActive.value) return { calendar: null }
      const calendar = await StatsService.getCalendar({ ...query.value })
      return { calendar }
    },
    { watch: [query, searchActive], server: false, lazy: true }
  )

  // This comparison is explicitly regional: only dates affect all three comparable series.
  const harmonizedQuery = computed(() => ({
    active: searchActive.value,
    startDate: statsQuery.value.startDate,
    endDate: statsQuery.value.endDate
  }))
  const harmonizedKey = computed(() => JSON.stringify(harmonizedQuery.value))
  const { data: harmonized, status: harmonizedStatus, error: harmonizedError, refresh: refreshLine } = useAsyncData(
    'historical-trends-harmonized',
    async () => ({ series: harmonizedQuery.value.active
      ? await HarmonizationService.getHarmonizedSeries({ startDate: harmonizedQuery.value.startDate, endDate: harmonizedQuery.value.endDate })
      : null }),
    { watch: [harmonizedKey], server: false, lazy: true }
  )

  const loading = computed(() => searchActive.value && (status.value === 'idle' || status.value === 'pending'))

  const calendar = computed(() => searchActive.value ? calendars.value?.calendar : null)

  const monthlySeries = computed(() => {
    if (!calendar.value) return []
    const { items, from, to } = calendar.value
    return fillMonthlySeries(calendarToMonthly(items), from, to)
  })

  /** Chronological rows (used by the charts). */
  const rows = computed(() => aggregateByPeriod(monthlySeries.value, granularity.value))
  /** Rows in the order shown by the table (and written in the CSV). */
  const sortedRows = computed(() => sortTrendRows(rows.value, sort.value))

  const countLabel = computed(() => metricLabel(calendar.value?.metric))

  const regionalMonths = computed(() => searchActive.value
    ? harmonizedPeriods(harmonized.value?.series?.items ?? [], statsQuery.value.startDate, statsQuery.value.endDate)
    : [])
  const regionalRows = computed(() => aggregateByPeriod(regionalMonths.value, granularity.value))
  const lineLoading = computed(() => searchActive.value && (harmonizedStatus.value === 'idle' || harmonizedStatus.value === 'pending'))
  const lineCountLabel = computed(() => t('historicalTrends.charts.line.cellDays'))
  const lineNotice = computed(() => t('historicalTrends.charts.line.harmonizedScope'))
  const lineUnavailable = computed(() => Boolean(harmonizedError.value) || !harmonized.value?.series?.items.length)
  const lineSeries = computed<TrendLineSeries[]>(() => harmonizedTrendSeries(
    searchActive.value ? harmonized.value?.series?.items ?? [] : [], regionalMonths.value, granularity.value
  ))

  const availableYears = computed(() => [...new Set([...monthlySeries.value, ...regionalMonths.value].map(point => point.year))].sort((a, b) => a - b))

  const selectedYears = ref<number[]>([])
  const selectedMonths = ref<number[]>([...ALL_MONTHS])

  /**
   * Color slot per selected year. A year keeps its color while it stays selected, so changing
   * the selection never repaints the other years.
   */
  const yearSlots = ref<Record<number, number>>({})

  watch(selectedYears, (years) => {
    const slots: Record<number, number> = {}
    for (const year of years) {
      const slot = yearSlots.value[year]
      if (slot !== undefined) slots[year] = slot
    }
    const used = new Set(Object.values(slots))
    for (const year of years) {
      if (slots[year] !== undefined) continue
      const free = Array.from({ length: CHART_MAX_SERIES }, (_, index) => index).find(index => !used.has(index)) ?? 0
      slots[year] = free
      used.add(free)
    }
    yearSlots.value = slots
  }, { immediate: true })

  // Keep the selection valid when the data changes; default to the most recent years.
  watch(availableYears, (years) => {
    const kept = selectedYears.value.filter(year => years.includes(year))
    selectedYears.value = kept.length ? kept : years.slice(-DEFAULT_COMPARED_YEARS)
  }, { immediate: true })

  /** Selected years, capped to the number of distinguishable series colors. */
  const comparedYears = computed({
    get: () => selectedYears.value,
    set: (years: number[]) => {
      selectedYears.value = [...years].sort((a, b) => a - b).slice(0, CHART_MAX_SERIES)
    }
  })

  const comparedMonths = computed({
    get: () => selectedMonths.value,
    set: (months: number[]) => {
      selectedMonths.value = [...months].sort((a, b) => a - b)
    }
  })

  const yearItems = computed(() => availableYears.value.map(year => ({ label: String(year), value: year })))
  const monthItems = computed(() => ALL_MONTHS.map(month => ({ label: monthName(month, 'long'), value: month })))

  async function downloadCsv() {
    if (exporting.value || loading.value || lineLoading.value || !searchActive.value) return
    exporting.value = true
    const snapshot = {
      query: { ...query.value },
      granularity: granularity.value,
      rows: sortedRows.value.map(row => ({ ...row })),
      periods: rows.value.map(row => ({ ...row })),
      lineSeries: lineSeries.value.map(series => ({ ...series, points: series.points.map(point => ({ ...point })) })),
      scope: `${lineNotice.value}${lineUnavailable.value ? ' ' + t('historicalTrends.charts.line.harmonizedUnavailable') : ''}`,
      filename: trendsCsvFilename(granularity.value, rows.value),
      headers: [
        t('historicalTrends.table.period'), countLabel.value,
        t('historicalTrends.table.change'), t('historicalTrends.table.changePct'),
        `MODIS (${countLabel.value})`, `VIIRS (${countLabel.value})`,
        `${t('historicalTrends.csv.regionalModis')} (${lineCountLabel.value})`,
        `${t('historicalTrends.csv.regionalViirs')} (${lineCountLabel.value})`,
        `${t('historicalTrends.csv.regionalHarmonized')} (${lineCountLabel.value})`,
        t('historicalTrends.csv.filters'), t('historicalTrends.csv.regionalScope')
      ],
      filters: [
        `${t('filters.dateRange.label')}: ${statsQuery.value.startDate ?? '—'} / ${statsQuery.value.endDate ?? '—'}`,
        `${t('filters.latitude.label')}: ${statsQuery.value.lat ?? '—'}`,
        `${t('filters.longitude.label')}: ${statsQuery.value.lon ?? '—'}`,
        `${t('filters.radiusKm.label')}: ${statsQuery.value.radius_km ?? '—'}`,
        ...(statsQuery.value.bbox ? [`${t('historicalTrends.csv.bounds')}: ${statsQuery.value.bbox}`] : []),
        `${t('filters.instruments.label')}: ${statsQuery.value.instrument ?? t('historicalTrends.csv.all')}`,
        `${t('filters.satellites.label')}: ${statsQuery.value.satellite ?? t('historicalTrends.csv.all')}`,
        t('historicalTrends.csv.sensorScope'),
        t('historicalTrends.table.fromZeroHint')
      ].join(' · ')
    }
    try {
      const selected = snapshot.query.instrument?.split(',') ?? []
      const calendars = await Promise.all(Object.values(InstrumentEnum).map(async (instrument) => {
        if (selected.length && !selected.includes(instrument)) return { instrument, counts: null }
        const response = await nuxtApp.runWithContext(() => StatsService.getCalendar({ ...snapshot.query, instrument }))
        const monthly = fillMonthlySeries(calendarToMonthly(response.items), snapshot.query.startDate ?? response.from, snapshot.query.endDate ?? response.to)
        return { instrument, counts: new Map(aggregateByPeriod(monthly, snapshot.granularity).map(row => [row.key, row.count])) }
      }))
      const sensorCounts = new Map(calendars.map(({ instrument, counts }) => [instrument, counts]))
      const sensorRows = snapshot.periods.map(row => ({
        key: row.key,
        modis: sensorCounts.get(InstrumentEnum.Modis)?.get(row.key) ?? null,
        viirs: sensorCounts.get(InstrumentEnum.Viirs)?.get(row.key) ?? null
      }))
      const csv = buildTrendsCsv({ ...snapshot, sensorRows })
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = snapshot.filename
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (cause) {
      console.error('Error exporting historical trends:', cause)
      toast.add({ title: t('historicalTrends.csv.error'), color: 'error' })
    } finally {
      exporting.value = false
    }
  }

  return {
    granularity,
    sort,
    loading,
    error,
    refresh,
    rows,
    sortedRows,
    regionalRows,
    lineUnavailable,
    refreshLine,
    lineSeries,
    lineCountLabel,
    lineNotice,
    lineLoading,
    countLabel,
    comparedYears,
    comparedMonths,
    yearSlots,
    yearItems,
    monthItems,
    downloadCsv,
    exporting
  }
}
