import { ANOMALY_CHART_THEME } from '~/constants/anomaly-charts'

/** Chart colors for the active color mode (Nuxt UI color mode: light/dark). */
export default function useAnomalyChartTheme() {
  const colorMode = useColorMode()
  return computed(() => colorMode.value === 'dark' ? ANOMALY_CHART_THEME.dark : ANOMALY_CHART_THEME.light)
}
