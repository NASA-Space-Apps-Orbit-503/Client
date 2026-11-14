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
          class="col-span-12"
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
