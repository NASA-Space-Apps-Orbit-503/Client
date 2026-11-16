<script setup lang="ts">
import { TrendSeriesEnum } from '~/enums/trend-series.enum'
import { TrendGranularityEnum } from '~/enums/trend-granularity.enum'
import type { TrendLineSeries, TrendRow } from '~/types/historical-trends'

const props = withDefaults(defineProps<{
  /** Chronological rows to plot (already limited to the compared years and months). */
  rows?: TrendRow[]
  lineSeries?: TrendLineSeries[]
  granularity: TrendGranularityEnum
  countLabel?: string
}>(), {
  rows: () => [],
  lineSeries: () => [],
  countLabel: ''
})

const { t } = useI18n()
const { formatNumber, periodLabel } = useTrendFormat()
const { series, ink, axisStyle, tooltipStyle } = useChartTheme()

const ariaLabel = computed(() => t('historicalTrends.charts.line.ariaLabel', {
  metric: props.countLabel,
  periods: props.rows.length
}))

const option = computed<ECOption>(() => ({
  grid: { left: 16, right: 24, top: 64, bottom: 16 },
  legend: {
    top: 0,
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { color: ink.value.secondary }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'line' },
    valueFormatter: value => value === null || value === undefined ? t('historicalTrends.charts.noData') : formatNumber(Number(value)),
    ...tooltipStyle.value
  },
  xAxis: {
    type: 'category',
    name: props.granularity === TrendGranularityEnum.Year
      ? t('historicalTrends.charts.axis.year')
      : t('historicalTrends.charts.axis.month'),
    nameLocation: 'middle',
    nameGap: 32,
    boundaryGap: false,
    data: props.rows.map(row => periodLabel(row)),
    ...axisStyle.value,
    splitLine: { show: false }
  },
  yAxis: {
    type: 'value',
    name: props.countLabel,
    minInterval: 1,
    ...axisStyle.value,
    axisLabel: { ...axisStyle.value.axisLabel, formatter: (value: number) => formatNumber(value) }
  },
  series: props.lineSeries.map(({ id, points }) => {
    const slot = id === TrendSeriesEnum.Modis ? 0 : id === TrendSeriesEnum.Viirs ? 1 : 2
    const counts = new Map(points.map(point => [point.key, point.count]))
    return {
      type: 'line',
      name: id === TrendSeriesEnum.Harmonized ? t('historicalTrends.charts.line.harmonized') : id,
      data: props.rows.map(row => counts.get(row.key) ?? null),
      color: series.value[slot],
      lineStyle: { width: slot === 2 ? 3 : 2, type: slot === 1 ? 'dashed' : 'solid' },
      symbol: slot === 0 ? 'circle' : slot === 1 ? 'diamond' : 'triangle',
      symbolSize: 8,
      showSymbol: props.rows.length <= 36,
      connectNulls: false,
      emphasis: { focus: 'series' }
    }
  })
}))
</script>

<template>
  <ClientOnly>
    <!-- Height lives on the wrapper: vue-echarts' unlayered `height: 100%` beats Tailwind utilities. -->
    <div class="h-80 w-full">
      <VChart
        style="display: block; width: 100%; height: 100%"
        :option="option"
        autoresize
        role="img"
        :aria-label="ariaLabel"
      />
    </div>
    <template #fallback>
      <div class="h-80 animate-pulse rounded bg-muted" />
    </template>
  </ClientOnly>
</template>
