<script setup lang="ts">
import { TrendGranularityEnum } from '~/enums/trend-granularity.enum'
import type { TrendRow } from '~/types/historical-trends'

const props = defineProps<{
  /** All chronological rows for the active granularity. */
  rows: TrendRow[]
  granularity: TrendGranularityEnum
  countLabel: string
  years: number[]
  months: number[]
  /** Color slot of each compared year, so a year keeps its color when the selection changes. */
  yearSlots: Record<number, number>
}>()

const { t } = useI18n()
const { formatNumber, monthName } = useTrendFormat()
const { series, ink, axisStyle, tooltipStyle } = useChartTheme()

const isMonthly = computed(() => props.granularity === TrendGranularityEnum.Month)

const countByKey = computed(() => new Map(props.rows.map(row => [row.key, row.count])))

/** `null` (no bar) means the period is outside the data range; 0 is a real period without activity. */
function countFor(year: number, month: number | null) {
  return countByKey.value.get(month === null ? String(year) : monthKey(year, month)) ?? null
}

const categories = computed(() => isMonthly.value
  ? props.months.map(month => monthName(month))
  : props.years.map(String))

const chartSeries = computed(() => {
  const bar = {
    type: 'bar' as const,
    barMaxWidth: 32,
    barGap: '10%',
    itemStyle: { borderRadius: [4, 4, 0, 0], borderColor: ink.value.surface, borderWidth: 1 },
    emphasis: { focus: 'series' as const }
  }

  if (!isMonthly.value) {
    return [{
      ...bar,
      name: props.countLabel,
      color: series.value[0],
      data: props.years.map(year => countFor(year, null))
    }]
  }

  // Same month across the compared years: one series per year.
  return props.years.map(year => ({
    ...bar,
    name: String(year),
    color: series.value[props.yearSlots[year] ?? 0],
    data: props.months.map(month => countFor(year, month))
  }))
})

const ariaLabel = computed(() => isMonthly.value
  ? t('historicalTrends.charts.bar.ariaLabelMonthly', { metric: props.countLabel, years: props.years.join(', ') })
  : t('historicalTrends.charts.bar.ariaLabelYearly', { metric: props.countLabel, years: props.years.join(', ') }))

const option = computed<ECOption>(() => ({
  grid: { left: 16, right: 24, top: isMonthly.value ? 64 : 40, bottom: 16 },
  legend: isMonthly.value && props.years.length > 1
    ? { top: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 12, textStyle: { color: ink.value.secondary } }
    : undefined,
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: value => value === null || value === undefined ? t('historicalTrends.charts.noData') : formatNumber(Number(value)),
    ...tooltipStyle.value
  },
  xAxis: {
    type: 'category',
    name: isMonthly.value ? t('historicalTrends.charts.axis.month') : t('historicalTrends.charts.axis.year'),
    nameLocation: 'middle',
    nameGap: 32,
    data: categories.value,
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
  series: chartSeries.value
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
