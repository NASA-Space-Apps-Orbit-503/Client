<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import Filters from '~/components/Filters/Filters.vue'
import { TrendGranularityEnum } from '~/enums/trend-granularity.enum'
import { CHART_MAX_SERIES } from '~/constants/chart-palette'

const { t } = useI18n()
const {
  granularity,
  sort,
  loading,
  error,
  refresh,
  rows,
  sortedRows,
  regionalRows,
  lineUnavailable,
  refreshLine,
  lineSeries,
  lineCountLabel,
  lineNotice,
  lineLoading,
  countLabel,
  comparedYears,
  comparedMonths,
  yearSlots,
  yearItems,
  monthItems,
  downloadCsv,
  exporting
} = useHistoricalTrends()

useHead({ title: () => t('historicalTrends.title') })

const granularityItems = computed<TabsItem[]>(() => [
  { label: t('historicalTrends.granularity.year'), value: TrendGranularityEnum.Year, icon: 'i-lucide-calendar' },
  { label: t('historicalTrends.granularity.month'), value: TrendGranularityEnum.Month, icon: 'i-lucide-calendar-days' }
])

const isMonthly = computed(() => granularity.value === TrendGranularityEnum.Month)
const hasTableData = computed(() => rows.value.length > 0)
const hasData = computed(() => rows.value.length > 0 || regionalRows.value.length > 0)
const showEmpty = computed(() => !loading.value && !lineLoading.value && !error.value && !hasData.value)

/** Charts follow the comparison selection; the table and CSV keep every filtered period. */
const lineRows = computed(() => regionalRows.value.filter(row =>
  comparedYears.value.includes(row.year)
  && (row.month === null || comparedMonths.value.includes(row.month))
))
const hasComparison = computed(() => comparedYears.value.length > 0 && (!isMonthly.value || comparedMonths.value.length > 0))
</script>

<template>
  <UPage class="px-4 sm:px-6 lg:px-8">
    <UPageHeader
      :title="t('historicalTrends.title')"
      :description="t('historicalTrends.description')"
    />
    <UPageBody>
      <UPageGrid>
        <Filters />

        <!-- Period controls -->
        <div class="col-span-12 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <UFormField :label="t('historicalTrends.granularity.label')">
            <UTabs
              v-model="granularity"
              :items="granularityItems"
              :content="false"
              size="sm"
              class="w-full sm:w-64"
            />
          </UFormField>
          <UFormField
            :label="t('historicalTrends.compare.years')"
            :hint="t('historicalTrends.compare.yearsHint', { max: CHART_MAX_SERIES })"
            class="min-w-0 lg:min-w-56 lg:flex-1"
          >
            <USelectMenu
              v-model="comparedYears"
              :items="yearItems"
              :placeholder="t('historicalTrends.compare.yearsPlaceholder')"
              :disabled="!hasData"
              value-key="value"
              multiple
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-if="isMonthly"
            :label="t('historicalTrends.compare.months')"
            class="min-w-0 lg:min-w-56 lg:flex-1"
          >
            <USelectMenu
              v-model="comparedMonths"
              :items="monthItems"
              :placeholder="t('historicalTrends.compare.monthsPlaceholder')"
              :disabled="!hasData"
              value-key="value"
              multiple
              class="w-full"
            />
          </UFormField>
          <UButton
            :label="t('historicalTrends.csv.download')"
            icon="i-lucide-download"
            color="neutral"
            variant="outline"
            :loading="exporting"
            :disabled="!hasTableData || loading || lineLoading"
            class="justify-center lg:ml-auto"
            @click="downloadCsv"
          />
        </div>

        <!-- Error -->
        <UAlert
          v-if="error"
          class="col-span-12"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="t('historicalTrends.error.title')"
          :description="t('historicalTrends.error.description')"
          :actions="[{ label: t('historicalTrends.error.retry'), icon: 'i-lucide-refresh-cw', color: 'error', variant: 'outline', onClick: () => refresh() }]"
        />

        <!-- Empty -->
        <UEmpty
          v-if="showEmpty"
          class="col-span-12"
          icon="i-lucide-chart-no-axes-combined"
          :title="t('historicalTrends.empty.title')"
          :description="t('historicalTrends.empty.description')"
        />

        <template v-else>
          <!-- Charts -->
          <UCard
            class="col-span-12 lg:col-span-6"
            :ui="{ header: 'space-y-1' }"
          >
            <template #header>
              <h2 class="font-semibold text-highlighted">
                {{ t('historicalTrends.charts.line.title') }}
              </h2>
              <p class="text-sm text-muted">
                {{ t('historicalTrends.charts.line.description') }}
              </p>
              <p class="text-sm text-muted">
                {{ lineNotice }}
              </p>
            </template>
            <USkeleton
              v-if="lineLoading"
              class="h-80 w-full"
            />
            <UAlert
              v-else-if="lineUnavailable"
              color="warning"
              variant="subtle"
              :title="t('historicalTrends.charts.line.harmonizedUnavailable')"
              :actions="[{ label: t('historicalTrends.error.retry'), onClick: () => refreshLine() }]"
            />
            <HistoricalTrendsLineChart
              v-else-if="hasComparison"
              :rows="lineRows"
              :line-series="lineSeries"
              :granularity="granularity"
              :count-label="lineCountLabel"
            />
            <p
              v-else
              class="flex h-80 items-center justify-center text-center text-sm text-muted"
            >
              {{ t('historicalTrends.compare.empty') }}
            </p>
          </UCard>
          <UCard
            class="col-span-12 lg:col-span-6"
            :ui="{ header: 'space-y-1' }"
          >
            <template #header>
              <h2 class="font-semibold text-highlighted">
                {{ isMonthly ? t('historicalTrends.charts.bar.titleMonthly') : t('historicalTrends.charts.bar.titleYearly') }}
              </h2>
              <p class="text-sm text-muted">
                {{ isMonthly ? t('historicalTrends.charts.bar.descriptionMonthly') : t('historicalTrends.charts.bar.descriptionYearly') }}
              </p>
            </template>
            <USkeleton
              v-if="loading"
              class="h-80 w-full"
            />
            <HistoricalTrendsBarChart
              v-else-if="hasComparison"
              :rows="rows"
              :granularity="granularity"
              :count-label="countLabel"
              :years="comparedYears"
              :months="comparedMonths"
              :year-slots="yearSlots"
            />
            <p
              v-else
              class="flex h-80 items-center justify-center text-center text-sm text-muted"
            >
              {{ t('historicalTrends.compare.empty') }}
            </p>
          </UCard>

          <!-- Table -->
          <UCard
            class="col-span-12"
            :ui="{ header: 'space-y-1', body: 'p-0 sm:p-0' }"
          >
            <template #header>
              <h2 class="font-semibold text-highlighted">
                {{ t('historicalTrends.table.title') }}
              </h2>
              <p class="text-sm text-muted">
                {{ t('historicalTrends.table.description') }}
              </p>
            </template>
            <HistoricalTrendsTable
              v-model:sort="sort"
              :rows="sortedRows"
              :loading="loading"
              :count-label="countLabel"
            />
          </UCard>
        </template>
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
