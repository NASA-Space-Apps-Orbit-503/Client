<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const cards = ref([
  {
    title: '62,563',
    description: 'Active fire detections',
    footer: '2015-2025. All sensors',
    class: 'col-span-1 md:col-span-3 lg:col-span-3'
  },
  {
    title: 'Apr 2024',
    description: 'Peak activity period',
    footer: '2,244 detections',
    class: 'col-span-1 md:col-span-3 lg:col-span-3'
  },
  {
    title: '2',
    description: 'Unusual periods',
    footer: 'months >= 1.4* their baseline (demo rule)',
    class: 'col-span-1 md:col-span-3 lg:col-span-3'
  },
  {
    title: 'MODIS + VIIRS',
    description: 'Sensors represented',
    footer: 'Counts not directly comparable across sensors',
    class: 'col-span-1 md:col-span-3 lg:col-span-3'
  }
])

const countries = ref([
  'El Salvador',
  'Brazil',
  'United States'
])

const sensors = ref([
  'MODIS',
  'VIIRS'
])

const aggregationLevels = ref([
  'Daily',
  'Weekly',
  'Monthly',
  'Yearly'
])

const selectedCountry = ref('El Salvador')
const selectedDateRange = ref({
  start: new CalendarDate(2022, 2, 3),
  end: new CalendarDate(2024, 4, 30)
})
const selectedSensors = ref(['MODIS', 'VIIRS'])
const selectedAggregationLevel = ref('Monthly')
</script>

<template>
  <UPage class="px-8">
    <UPageBody>
      <!-- Cards -->
      <UPageGrid>
        <div class="col-span-12 flex justify-start items-center gap-4">
          <USelect
            v-model="selectedCountry"
            :items="countries"
            label="Country"
          />
          <UInputDate
            v-model="selectedDateRange"
            range
          />
          <USelectMenu
            v-model="selectedSensors"
            :items="sensors"
            label="Sensors"
            multiple
          />
          <USelect
            v-model="selectedAggregationLevel"
            :items="aggregationLevels"
            label="Aggregation level"
          />
        </div>
        <UCard
          v-for="card in cards"
          :key="card.title"
          :title="card.title"
          :description="card.description"
          :class="card.class"
        >
          <!-- Information -->
          <template #footer>
            <div class="relative pr-6">
              <UIcon
                name="i-carbon-information"
                class="mr-2 absolute right-0 top-0 text-gray-400 hover:cursor-pointer"
              />
              <p class="text-sm text-gray-500">
                {{ card.footer }}
              </p>
            </div>
          </template>
        </UCard>
        <!-- Map -->
        <UCard
          title="Activity grid. April 2024"
          description="Layer: Activity grid (broad zoom). Detections appear when zoomed in"
          class="col-span-10"
        >
          <template #default>
            <LMap
              style="height: 500px"
              :zoom="6"
              :center="[47.21322, -1.559482]"
              :use-global-leaflet="false"
            >
              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                layer-type="base"
                name="OpenStreetMap"
              />
            </LMap>
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
