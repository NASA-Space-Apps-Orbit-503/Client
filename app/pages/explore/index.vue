<script setup lang="ts">
/* import StatsService from '~/services/stats.service'
import { StatsGranularityEnum } from '~/enums/stats-granularity.enum'

const { t } = useI18n()
const { statsQuery, searchActive } = useFilters()
const { cards } = await useExploreSummary()
const { data: calendar, error: calendarError } = await useAsyncData(
 */
const { init } = useFilters()
const { t } = useI18n()

const mapSection = ref<HTMLElement | null>(null)
const secondSection = ref<HTMLElement | null>(null)
const isSecondSectionVisible = ref(false)
const isMapLoaded = ref(false)
let sectionObserver: IntersectionObserver | undefined
/* const { cards } = await useExploreSummary() */
/* const { data: calendar, error: calendarError } = await useAsyncData(
  'explore-calendar',
  () => searchActive.value ? StatsService.getCalendar({ ...statsQuery.value, granularity: StatsGranularityEnum.Month }) : Promise.resolve(null),
  { watch: [statsQuery, searchActive], server: false }
)

/* if (calendarError.value) {
  console.error('Error fetching explore calendar:', calendarError.value)
} */

onMounted(() => {
  init()

  sectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry) isSecondSectionVisible.value = entry.isIntersecting
    },
    { threshold: 0.5 }
  )

  if (secondSection.value) sectionObserver.observe(secondSection.value)
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
})

function scrollToVisibleSection() {
  const target = isSecondSectionVisible.value ? mapSection.value : secondSection.value
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <UPage>
    <UPageBody class="mt-0 p-0">
      <section
        ref="mapSection"
        class="relative h-[calc(100dvh-4rem)] scroll-mt-16"
        :aria-label="t('explore.map.title')"
      >
        <MapAreaSelector
          class="h-full"
          @map:loaded="(value) => isMapLoaded = value"
        />
      </section>
      <section
        ref="secondSection"
        class="h-[calc(100dvh-4rem)] scroll-mt-12"
        :aria-label="t('explore.navigation.secondSection')"
      />
      <UButton
        v-if="isMapLoaded"
        :icon="isSecondSectionVisible ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        :aria-label="isSecondSectionVisible
          ? t('explore.navigation.toMap')
          : t('explore.navigation.toSecondSection')"
        color="neutral"
        variant="solid"
        size="xs"
        class="fixed left-4 top-1/2 z-1100 h-11 w-11 -translate-y-1/2 justify-center rounded-full shadow-lg ring-1 ring-default/50 cursor-pointer"
        @click="scrollToVisibleSection"
      />
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
