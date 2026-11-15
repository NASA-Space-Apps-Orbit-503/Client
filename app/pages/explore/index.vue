<script setup lang="ts">
/* import StatsService from '~/services/stats.service'
import { StatsGranularityEnum } from '~/enums/stats-granularity.enum'

const { t } = useI18n()
const { statsQuery, searchActive } = useFilters()
const { cards } = await useExploreSummary()
const { data: calendar, error: calendarError } = await useAsyncData(
  'explore-calendar',
  () => searchActive.value ? StatsService.getCalendar({ ...statsQuery.value, granularity: StatsGranularityEnum.Month }) : Promise.resolve(null),
  { watch: [statsQuery, searchActive], server: false }
)

/* if (calendarError.value) {
  console.error('Error fetching explore calendar:', calendarError.value)
} */
</script>

<template>
  <UPage>
    <UPageBody class="mt-0">
      <MapAreaSelector class="h-[calc(100dvh-4rem)]" />
      <!-- <InfoCard
        v-for="card in cards"
        :key="card.title"
        :card="card"
      /> -->
      <!-- <UCard
        v-if="searchActive"
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
      </UCard> -->
    </UPageBody>
  </UPage>
</template>
