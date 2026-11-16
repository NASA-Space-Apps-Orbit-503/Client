<script setup lang="ts">
/**
 * Stacked bar chart: one bar per year, stacked by month (January at the base).
 * Twelve months exceed the categorical cap, so hue encodes the quarter (validated slots 1-4) and
 * the month is given by its fixed stack position, a surface gap between segments and the tooltip.
 */
const props = defineProps<{
  years: number[]
  /** `counts[month][yearIndex]`, month 0 = January, aligned with `years`. */
  counts: number[][]
}>()

const { t } = useI18n()
const { monthNames } = useLocaleFormat()
const theme = useAnomalyChartTheme()

/** Quarter legend: hue + the months it covers. */
const quarters = computed(() => {
  const months = monthNames('short')
  return theme.value.quarters.map((color, quarter) => ({
    color,
    label: t('anomalies.charts.quarter', {
      quarter: quarter + 1,
      from: months[quarter * 3],
      to: months[quarter * 3 + 2]
    })
  }))
})

const context = useAnomalyChartContext()

const option = computed(() => buildYearlyStackedOption(context.value, props.years, props.counts))
</script>

<template>
  <div class="flex flex-col gap-3">
    <ul
      class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted"
      :aria-label="t('anomalies.charts.bar.legend')"
    >
      <li
        v-for="quarter in quarters"
        :key="quarter.label"
        class="flex items-center gap-1.5"
      >
        <span
          class="size-3 rounded-sm"
          :style="{ backgroundColor: quarter.color }"
          aria-hidden="true"
        />
        {{ quarter.label }}
      </li>
    </ul>
    <ClientOnly>
      <!-- Sized wrapper: vue-echarts sets its root to height:100% in unlayered CSS, which
           overrides Tailwind utilities (cascade layers), so the size must live on the parent. -->
      <div class="h-72 w-full">
        <VChart
          :option="option"
          autoresize
          role="img"
          :aria-label="t('anomalies.charts.bar.ariaLabel')"
        />
      </div>
      <template #fallback>
        <div class="h-72 w-full animate-pulse rounded-md bg-muted" />
      </template>
    </ClientOnly>
  </div>
</template>
