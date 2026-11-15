import type { MetricEnum } from '~/enums/metric.enum'
import type { TrendRow } from '~/types/historical-trends'

type MonthStyle = 'short' | 'long'

/**
 * Locale-aware formatting for the historical trends page (numbers, % and month names follow
 * the active language). Dates are built in UTC so a month never shifts to the previous one.
 */
export default function useTrendFormat() {
  const { t, locale } = useI18n()

  const numberFormat = computed(() => new Intl.NumberFormat(locale.value))
  const changeFormat = computed(() => new Intl.NumberFormat(locale.value, { signDisplay: 'exceptZero' }))
  const pctFormat = computed(() => new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero'
  }))

  function formatNumber(value: number) {
    return numberFormat.value.format(value)
  }

  function formatChange(value: number) {
    return changeFormat.value.format(value)
  }

  /** Same one-decimal rounding as the CSV. */
  function formatPct(value: number) {
    return `${pctFormat.value.format(roundPct(value))} %`
  }

  function monthName(month: number, style: MonthStyle = 'short') {
    return new Intl.DateTimeFormat(locale.value, { month: style, timeZone: 'UTC' })
      .format(new Date(Date.UTC(2024, month - 1, 1)))
  }

  function periodLabel(row: Pick<TrendRow, 'year' | 'month'>, style: MonthStyle = 'short') {
    if (row.month === null) return String(row.year)
    return new Intl.DateTimeFormat(locale.value, { month: style, year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(row.year, row.month - 1, 1)))
  }

  /** Name of the counted value, which depends on the metric returned by the API. */
  function metricLabel(metric: `${MetricEnum}` | undefined) {
    return t(`historicalTrends.metric.${metric ?? 'cells'}`)
  }

  return {
    formatNumber,
    formatChange,
    formatPct,
    monthName,
    periodLabel,
    metricLabel
  }
}
