<script setup lang="ts">
import StatsService from '~/services/stats.service'
import { StatsGranularityEnum } from '~/enums/stats-granularity.enum'

const { init, statsQuery, searchActive } = useFilters()
const { t } = useI18n()
const { cards } = await useExploreSummary()
const { data: calendar, error: calendarError } = await useAsyncData(
  'explore-calendar',
  () => searchActive.value
    ? StatsService.getCalendar({ ...statsQuery.value, granularity: StatsGranularityEnum.Month })
    : Promise.resolve(null),
  { watch: [statsQuery, searchActive], server: false }
)

const mapSection = ref<HTMLElement | null>(null)
const secondSection = ref<HTMLElement | null>(null)
const isSecondSectionVisible = ref(false)
const isMapLoaded = ref(false)
// Use the section's position so navigation also works when its content is taller
// than the viewport (a percentage visibility threshold may never be reached).
function updateVisibleSection() {
  if (secondSection.value) {
    isSecondSectionVisible.value = secondSection.value.getBoundingClientRect().top <= window.innerHeight / 2
  }
}

watch(calendarError, (error) => {
  if (error) console.error('Error fetching explore calendar:', error)
}, { immediate: true })

onMounted(() => {
  init()

  updateVisibleSection()
  window.addEventListener('scroll', updateVisibleSection, { passive: true })
  window.addEventListener('resize', updateVisibleSection)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisibleSection)
  window.removeEventListener('resize', updateVisibleSection)
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
        class="relative flex scroll-mt-16 flex-col"
        :aria-label="t('explore.map.title')"
      >
        <ExploreIntro />
        <div class="h-[calc(100dvh-4rem)] min-h-[36rem] shrink-0">
          <MapAreaSelector
            @map:loaded="(value) => isMapLoaded = value"
          />
        </div>
      </section>
      <section
        ref="secondSection"
        class="min-h-[calc(100dvh-4rem)] scroll-mt-12 px-4 py-8 sm:px-6 lg:px-8"
        :aria-label="t('explore.navigation.secondSection')"
      >
        <UPageGrid>
          <InfoCard
            v-for="card in cards"
            :key="card.title"
            :card="card"
          />
          <UCard
            v-if="searchActive"
            :title="t('explore.calendar.title')"
            class="col-span-12"
          >
            <HeatmapCalendar
              v-if="calendar"
              :data="calendar"
            />
            <UAlert
              v-else-if="calendarError"
              color="error"
              variant="subtle"
              :title="t('explore.calendar.error')"
            />
          </UCard>
        </UPageGrid>
      </section>
      <UButton
        v-if="isMapLoaded"
        :icon="isSecondSectionVisible ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        :aria-label="isSecondSectionVisible
          ? t('explore.navigation.toMap')
          : t('explore.navigation.toSecondSection')"
        color="neutral"
        variant="solid"
        size="xs"
        class="fixed left-16 top-1/2 z-1100 h-11 w-11 -translate-y-1/2 justify-center rounded-full shadow-lg ring-1 ring-default/50 cursor-pointer"
        @click="scrollToVisibleSection"
      />
    </UPageBody>
  </UPage>
</template>
