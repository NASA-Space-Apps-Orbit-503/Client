<script setup lang="ts">
import { FILTERABLE_SEVERITIES } from '~/enums/severity.enum'
import { ANOMALIES_DEFAULT_RADIUS_KM } from '~/composables/useAnomalies'

const { t } = useI18n()
const { init } = useFilters()
const {
  minScore,
  severities,
  appliedQuery,
  applied,
  hasPendingChanges,
  coordinatesError,
  applyFilters,
  applyInitialFilters,
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

onMounted(async () => {
  init()
  // Global filters are restored from the URL by the layout; apply them (or the defaults) once in place
  await nextTick()
  applyInitialFilters()
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
        <!-- Global filters (applied with the Filter button below) -->
        <Filters />
        <!-- Anomaly filters + Filter button -->
        <UCard class="col-span-12">
          <form
            class="flex flex-col gap-3"
            novalidate
            @submit.prevent="applyFilters"
          >
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div class="grid w-full grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap">
                <UFormField
                  :label="t('anomalies.minScore.label')"
                  :hint="t('anomalies.minScore.hint')"
                  size="sm"
                >
                  <UInputNumber
                    v-model="minScore"
                    :min="0"
                    :step="0.5"
                    :format-options="{ maximumFractionDigits: 2 }"
                    class="w-full lg:w-40"
                  />
                </UFormField>
                <UFormField
                  :label="t('anomalies.severity.label')"
                  size="sm"
                  class="min-w-0 lg:min-w-56"
                >
                  <USelectMenu
                    v-model="severities"
                    :items="severityItems"
                    :placeholder="t('anomalies.severity.placeholder')"
                    value-key="value"
                    multiple
                    class="w-full"
                  />
                </UFormField>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span
                  v-if="applied && hasPendingChanges"
                  class="text-xs text-muted"
                  role="status"
                >
                  {{ t('anomalies.apply.pending') }}
                </span>
                <UButton
                  type="submit"
                  :label="t('anomalies.apply.button')"
                  icon="i-lucide-filter"
                  :variant="!applied || hasPendingChanges ? 'solid' : 'outline'"
                  :loading="loading"
                />
              </div>
            </div>
            <UAlert
              v-if="coordinatesError"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :title="t('anomalies.apply.coordinatesError')"
              role="alert"
            />
          </form>
        </UCard>
        <!-- Map: shared area selection + anomalies of the current table page -->
        <UCard
          :title="t('anomalies.map.title')"
          :description="t('anomalies.map.description', { radius: ANOMALIES_DEFAULT_RADIUS_KM })"
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
