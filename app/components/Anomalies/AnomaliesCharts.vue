<script setup lang="ts">
import { ANOMALY_CHARTS_WARNING_ROWS } from '~/constants/anomaly-charts'
import type { AnomalyListQuery } from '~/types/api/stats'

/**
 * Anomaly charts for the applied filters: monthly line (with year selector), yearly stacked bars
 * by month, and date vs score scatter. Handles loading, confirmation, empty and error states.
 */
const props = defineProps<{
  /** Filters applied with the Filter button (null before the first apply). */
  appliedQuery: AnomalyListQuery | null
}>()

/** Sentinel for the "None" option of the year selector (aggregate of every year). */
const NO_YEAR = 'none'

const { t } = useI18n()
const { formatNumber } = useLocaleFormat()

const {
  status,
  rows,
  fetched,
  expected,
  progress,
  pendingTotal,
  confirmLoad,
  retry,
  years,
  selectedYear,
  monthlyCounts,
  yearMonthCounts,
  severityPoints
} = useAnomaliesCharts(toRef(props, 'appliedQuery'))

const yearItems = computed(() => [
  { label: t('anomalies.charts.none'), value: NO_YEAR },
  ...years.value.map(year => ({ label: String(year), value: String(year) }))
])

const yearValue = computed({
  get: () => selectedYear.value === null ? NO_YEAR : String(selectedYear.value),
  set: (value: string) => {
    selectedYear.value = value === NO_YEAR ? null : Number(value)
  }
})
</script>

<template>
  <div class="col-span-12 flex flex-col gap-4">
    <!-- Loading every page -->
    <UCard v-if="status === 'loading'">
      <div
        class="flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        <span class="text-sm text-muted">
          {{ t('anomalies.charts.loading', { done: formatNumber(fetched), total: formatNumber(expected) }) }}
        </span>
        <UProgress
          :model-value="expected ? progress : null"
          size="sm"
        />
      </div>
    </UCard>

    <!-- Large result: confirm before loading everything -->
    <UAlert
      v-else-if="status === 'confirm'"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="t('anomalies.charts.confirmTitle')"
      :description="t('anomalies.charts.confirmDescription', { count: formatNumber(pendingTotal), limit: formatNumber(ANOMALY_CHARTS_WARNING_ROWS) })"
      :actions="[{ label: t('anomalies.charts.confirm'), color: 'warning', variant: 'solid', onClick: confirmLoad }]"
    />

    <UAlert
      v-else-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('anomalies.charts.error')"
      :actions="[{ label: t('anomalies.error.retry'), color: 'error', variant: 'outline', onClick: retry }]"
    />

    <UCard v-else-if="status === 'idle' || !rows.length">
      <UEmpty
        icon="i-lucide-chart-line"
        :title="status === 'idle' ? t('anomalies.apply.promptTitle') : t('anomalies.charts.emptyTitle')"
        :description="status === 'idle' ? t('anomalies.apply.promptDescription') : t('anomalies.empty.description')"
        variant="naked"
      />
    </UCard>

    <template v-else>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Line: anomalies per month -->
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-medium text-highlighted">
                  {{ t('anomalies.charts.line.title') }}
                </p>
                <p class="text-sm text-muted">
                  {{ selectedYear === null ? t('anomalies.charts.line.descriptionAll') : t('anomalies.charts.line.descriptionYear', { year: selectedYear }) }}
                </p>
              </div>
              <UFormField
                :label="t('anomalies.charts.yearSelect')"
                size="sm"
                orientation="horizontal"
              >
                <USelect
                  v-model="yearValue"
                  :items="yearItems"
                  class="w-28"
                />
              </UFormField>
            </div>
          </template>
          <AnomaliesChartsMonthlyLineChart
            :counts="monthlyCounts"
            :year="selectedYear"
          />
        </UCard>

        <!-- Stacked bars: anomalies per year, by month -->
        <UCard>
          <template #header>
            <p class="font-medium text-highlighted">
              {{ t('anomalies.charts.bar.title') }}
            </p>
            <p class="text-sm text-muted">
              {{ t('anomalies.charts.bar.description') }}
            </p>
          </template>
          <AnomaliesChartsYearlyStackedChart
            :years="years"
            :counts="yearMonthCounts"
          />
        </UCard>
      </div>

      <!-- Heatmap: anomalies per year (rows) and month (columns) -->
      <UCard>
        <template #header>
          <p class="font-medium text-highlighted">
            {{ t('anomalies.charts.heatmap.title') }}
          </p>
          <p class="text-sm text-muted">
            {{ t('anomalies.charts.heatmap.description') }}
          </p>
        </template>
        <AnomaliesChartsMonthlyHeatmap
          :years="years"
          :counts="yearMonthCounts"
        />
      </UCard>

      <!-- Scatter: date vs score -->
      <UCard>
        <template #header>
          <p class="font-medium text-highlighted">
            {{ t('anomalies.charts.scatter.title') }}
          </p>
          <p class="text-sm text-muted">
            {{ t('anomalies.charts.scatter.description') }}
          </p>
        </template>
        <AnomaliesChartsScoreScatterChart :groups="severityPoints" />
      </UCard>

      <p class="text-xs text-muted">
        {{ t('anomalies.charts.basis', { count: formatNumber(rows.length) }, rows.length) }}
      </p>
    </template>
  </div>
</template>
