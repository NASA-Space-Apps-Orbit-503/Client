import type { AnomalyChartContext } from '~/utils/anomaly-chart-options'

/** Theme colors + locale-aware formatters for the anomaly chart option builders. */
export default function useAnomalyChartContext() {
  const { t } = useI18n()
  const { formatNumber, formatDate, language, monthNames } = useLocaleFormat()
  const theme = useAnomalyChartTheme()

  return computed<AnomalyChartContext>(() => ({
    colors: theme.value,
    t: (key, named, plural) => plural === undefined ? t(key, named ?? {}) : t(key, named ?? {}, plural),
    formatNumber,
    formatDate,
    // Read here so options rebuild when the locale changes
    language: language.value,
    monthNames
  }))
}
