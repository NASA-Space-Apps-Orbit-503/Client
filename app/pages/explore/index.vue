<script setup lang="ts">
import Filters from '~/components/Filters/Filters.vue'

const { init } = useFilters()
const { cards } = await useExploreSummary()

onMounted(() => {
  init()
})
</script>

<template>
  <UPage class="px-8">
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
          title="Activity grid. April 2024"
          description="Layer: Activity grid (broad zoom). Detections appear when zoomed in"
          class="col-span-10"
        >
          <template #default>
            <LazyLeafletMap
              hydrate-on-visible
              :zoom="6"
              :center="[47.21322, -1.559482]"
            >
              <template #fallback>
                <div class="h-125 animate-pulse rounded bg-muted" />
              </template>
            </LazyLeafletMap>
          </template>
        </UCard>
        <!-- Info -->
        <UCard
          title="Data. April 2024"
          description="El Salvador. All sensors"
          class="col-span-2"
        >
          <template #default>
            <UPageGrid>
              <h1 class="col-span-6">
                <p class="text-highlighted font-semibold">
                  2,244
                </p>
                <p class="mt-1 text-muted text-sm">
                  active fire detections
                </p>
              </h1>
              <h1 class="col-span-6">
                <p class="text-highlighted font-semibold">
                  1,383
                </p>
                <p class="mt-1 text-muted text-sm">
                  typical April (2015-2025)
                </p>
              </h1>
              <p class="col-span-12">
                Detected activity was higher than this area’s typical level for April (162% of the 2015–2025 mean, demo baseline). Detections are satellite thermal anomalies, not confirmed wildfires.
              </p>
              <div>
                Chart
              </div>
              <UButton
                class="col-span-12"
                color="primary"
                label="View detections on map"
              />
            </UPageGrid>
          </template>
        </UCard>
        <UCard
          title="Burning activity calendar"
          class="col-span-12"
        >
          <template #default>
            <UCalendar
              type="month"
              :events="[
                {
                  title: 'Peak activity period',
                  start: '2024-04-01',
                  end: '2024-04-30'
                }
              ]"
            />
          </template>
        </UCard>
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
