import { CHART_CATEGORICAL, CHART_INK } from '~/constants/chart-palette'

/** Chart colors for the active color mode (dark uses its own validated steps). */
export default function useChartTheme() {
  const colorMode = useColorMode()
  const mode = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

  const series = computed(() => CHART_CATEGORICAL[mode.value])
  const ink = computed(() => CHART_INK[mode.value])

  /** Shared axis styling: recessive axis line and hairline grid. */
  const axisStyle = computed(() => ({
    axisLine: { lineStyle: { color: ink.value.axis } },
    axisTick: { show: false },
    axisLabel: { color: ink.value.muted, hideOverlap: true },
    nameTextStyle: { color: ink.value.secondary },
    splitLine: { lineStyle: { color: ink.value.grid } }
  }))

  const tooltipStyle = computed(() => ({
    backgroundColor: ink.value.surface,
    borderColor: ink.value.axis,
    textStyle: { color: ink.value.primary }
  }))

  return { series, ink, axisStyle, tooltipStyle }
}
