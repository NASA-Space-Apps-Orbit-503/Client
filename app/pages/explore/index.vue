<script setup lang="ts">
import Filters from '~/components/Filters/Filters.vue'
import StatsService from '~/services/stats.service'
import { StatsGranularityEnum } from '~/enums/stats-granularity.enum'

const { t } = useI18n()
const { init } = useFilters()
const { cards } = await useExploreSummary()
const { data: calendar, error: calendarError } = await useAsyncData(
  'explore-calendar',
  () => StatsService.getCalendar({ granularity: StatsGranularityEnum.Month })
)

if (calendarError.value) {
  console.error('Error fetching explore calendar:', calendarError.value)
}

onMounted(() => {
  init()
})
</script>

<template>
  <UPage class="px-4 sm:px-6 lg:px-8">
    <UPageBody>
      <!-- Cards -->
      <UPageGrid>
        <!-- Filters -->
        <Filters />
        <!-- Info Cards -->
        <InfoCard
          v-for="card in cards"
          :key="card.title"
          :card="card"
        />
        <!-- Map -->
        <UCard
          :title="t('explore.map.title')"
          :description="t('explore.map.description')"
          class="col-span-12"
        >
          <MapAreaSelector />
        </UCard>
        <UCard
          :title="t('explore.calendar.title')"
          class="col-span-12"
        >
          <HeatmapCalendar
            v-if="calendar"
            :data="calendar"
          />
          <UAlert
            v-else
            color="error"
            variant="subtle"
            :title="t('explore.calendar.error')"
          />
        </UCard>
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
