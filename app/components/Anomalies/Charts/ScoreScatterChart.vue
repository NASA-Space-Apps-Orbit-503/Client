<script setup lang="ts">
import { SEVERITY_POINT_SIZE } from '~/constants/anomaly-charts'
import { FILTERABLE_SEVERITIES } from '~/enums/severity.enum'
import type { SeverityPoints } from '~/composables/useAnomaliesCharts'

/**
 * Scatter plot: date (x) vs anomaly score (y). Points are colored by severity (map marker colors)
 * and sized by severity; the labeled threshold lines give the y position meaning too.
 */
const props = defineProps<{
  groups: SeverityPoints[]
}>()

const { t } = useI18n()
const theme = useAnomalyChartTheme()
const context = useAnomalyChartContext()

const sizeLegend = computed(() => FILTERABLE_SEVERITIES.map(severity => ({
  severity,
  size: SEVERITY_POINT_SIZE[severity],
  label: t(`severity.${severity}`)
})))

const option = computed(() => buildScoreScatterOption(context.value, props.groups))
</script>

<template>
  <div class="flex flex-col gap-3">
    <ul
      class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted"
      :aria-label="t('anomalies.charts.scatter.legend')"
    >
      <li
        v-for="item in sizeLegend"
        :key="item.severity"
        class="flex items-center gap-1.5"
      >
        <span
          class="inline-block rounded-full opacity-70"
          :style="{ width: `${item.size}px`, height: `${item.size}px`, backgroundColor: theme.severity[item.severity] }"
          aria-hidden="true"
        />
        {{ item.label }}
      </li>
    </ul>
    <ClientOnly>
      <!-- Sized wrapper: vue-echarts sets its root to height:100% in unlayered CSS, which
           overrides Tailwind utilities (cascade layers), so the size must live on the parent. -->
      <div class="h-96 w-full">
        <VChart
          :option="option"
          autoresize
          role="img"
          :aria-label="t('anomalies.charts.scatter.ariaLabel')"
        />
      </div>
      <template #fallback>
        <div class="h-96 w-full animate-pulse rounded-md bg-muted" />
      </template>
    </ClientOnly>
  </div>
</template>
