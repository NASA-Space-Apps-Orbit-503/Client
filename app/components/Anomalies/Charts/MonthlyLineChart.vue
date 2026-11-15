<script setup lang="ts">
/**
 * Line chart: anomalies per month (January → December). With `year` null the counts are the
 * aggregate of every year in the filtered data.
 */
const props = defineProps<{
  /** Counts per month, index 0 = January. */
  counts: number[]
  /** Selected year, or null for the aggregate of every year. */
  year: number | null
}>()

const { t } = useI18n()
const context = useAnomalyChartContext()

const option = computed(() => buildMonthlyLineOption(context.value, props.counts, props.year))
</script>

<template>
  <ClientOnly>
    <!-- Sized wrapper: vue-echarts sets its root to height:100% in unlayered CSS, which
         overrides Tailwind utilities (cascade layers), so the size must live on the parent. -->
    <div class="h-72 w-full">
      <VChart
        :option="option"
        autoresize
        role="img"
        :aria-label="t('anomalies.charts.line.ariaLabel')"
      />
    </div>
    <template #fallback>
      <div class="h-72 w-full animate-pulse rounded-md bg-muted" />
    </template>
  </ClientOnly>
</template>
