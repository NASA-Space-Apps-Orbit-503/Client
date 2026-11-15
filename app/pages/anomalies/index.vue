<script setup lang="ts">
const { t } = useI18n()
const { init } = useFilters()
const {
  minScoreInput,
  sorting,
  page,
  pageSize,
  items,
  total,
  loading,
  error,
  refresh
} = useAnomalies()

useSeoMeta({
  title: () => t('anomalies.title')
})

onMounted(() => {
  init()
})
</script>

<template>
  <UPage class="px-4 sm:px-6 lg:px-8">
    <UPageBody>
      <UPageGrid>
        <!-- Global filters -->
        <Filters />
        <!-- Map-based area selection (global bbox filter) -->
        <AreaSelectMap />
        <!-- Table -->
        <UCard class="col-span-full">
          <template #header>
            <div class="flex flex-wrap items-end gap-4">
              <UFormField
                :label="t('anomalies.minScore')"
                :hint="t('anomalies.minScoreHelp')"
              >
                <UInputNumber
                  v-model="minScoreInput"
                  :min="0"
                  :max="100"
                  :step="1"
                  class="w-40"
                />
              </UFormField>
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
            @retry="refresh()"
          />
        </UCard>
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
