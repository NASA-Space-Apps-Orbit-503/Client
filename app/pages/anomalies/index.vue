<script setup lang="ts">
import { FILTERABLE_SEVERITIES } from '~/enums/severity.enum'

const { t } = useI18n()
const {
  minScore,
  severities,
  pagePending,
  applyPageFilters,
  clearPageFilters,
  appliedQuery,
  applied,
  sorting,
  page,
  pageSize,
  items,
  total,
  loading,
  error,
  refresh
} = useAnomalies()

const severityItems = computed(() => FILTERABLE_SEVERITIES.map(severity => ({
  label: t(`severity.${severity}`),
  value: severity
})))

useSeoMeta({
  title: () => t('anomalies.title')
})
</script>

<template>
  <UPage class="px-4 sm:px-6 lg:px-8">
    <UPageHeader
      :title="t('anomalies.title')"
      :description="t('anomalies.description')"
    />
    <UPageBody>
      <UPageGrid>
        <!-- Shared filter bar + the anomaly filters, applied together by its funnel button -->
        <Filters
          class="col-span-12 grid grid-cols-1 md:grid-cols-6 gap-2"
          :page-pending="pagePending"
          @apply="applyPageFilters"
          @clear="clearPageFilters"
        >
          <template #page-filters>
            <UFormField
              :label="t('anomalies.minScore.label')"
              :hint="t('anomalies.minScore.hint')"
              class="w-full"
              size="sm"
            >
              <UInputNumber
                v-model="minScore"
                :min="0"
                :step="0.5"
                :format-options="{ maximumFractionDigits: 2 }"
                class="w-full"
                variant="subtle"
              />
            </UFormField>
            <UFormField
              :label="t('anomalies.severity.label')"
              class="w-full"
              size="sm"
            >
              <USelectMenu
                v-model="severities"
                :items="severityItems"
                :placeholder="t('anomalies.severity.placeholder')"
                value-key="value"
                multiple
                class="w-full"
                variant="subtle"
              />
            </UFormField>
          </template>
        </Filters>
        <!-- Map: shared area selection + anomalies of the current table page -->
        <UCard
          :title="t('anomalies.map.title')"
          :description="t('anomalies.map.description')"
          class="col-span-12"
        >
          <AnomaliesAreaMap :items="items" />
        </UCard>
        <!-- Table -->
        <UCard class="col-span-12">
          <template #header>
            <div class="flex flex-wrap items-center justify-end gap-4">
              <!-- CSV export of every row matching the applied filters -->
              <AnomaliesCsvExport
                :filter-query="appliedQuery ?? {}"
                :total="applied ? total : 0"
                :loading="loading"
              />
            </div>
          </template>
          <AnomaliesTable
            v-model:sorting="sorting"
            v-model:page="page"
            v-model:page-size="pageSize"
            :items="items"
            :total="total"
            :loading="loading"
            :error="error"
            :applied="applied"
            @retry="refresh()"
          />
        </UCard>
        <!-- Charts: same applied filters as the table -->
        <AnomaliesCharts :applied-query="appliedQuery" />
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
