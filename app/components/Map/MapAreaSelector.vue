<script setup lang="ts">
import { INSTRUMENT_COLORS } from '~/constants/instrument-colors'
import { InstrumentEnum } from '~/enums/instrument.enum'

const { circle, latitude, longitude, radiusKm, searchActive, clearArea: clearAppliedArea } = useFilters()
const { t } = useI18n()
const selectingPoint = ref(false)
const areaDescriptionVisible = ref(true)
const { detections, total, loading, error, refresh, loadMore, loadingMore, canLoadMore } = useMapDetections()

function selectPoint(value: { lat: number, lon: number }) {
  latitude.value = value.lat
  longitude.value = value.lon
  radiusKm.value = null
  selectingPoint.value = false
  areaDescriptionVisible.value = true
}

function togglePointSelection(hideFilters: () => void) {
  selectingPoint.value = !selectingPoint.value
  areaDescriptionVisible.value = !selectingPoint.value
  if (selectingPoint.value) hideFilters()
}

/** Coordinates typed in the filters, shown as a point while no circle has been drawn. */
const point = computed(() => latitude.value !== null && longitude.value !== null
  ? { lat: latitude.value, lon: longitude.value }
  : null)

const areaLabel = computed(() => {
  if (circle.value) {
    return t('map.area.circle', {
      lat: roundCoordinate(circle.value.lat),
      lon: roundCoordinate(circle.value.lon),
      radius: circle.value.radiusKm.toFixed(2)
    })
  }
  if (point.value) return t('map.area.point', { lat: point.value.lat, lon: point.value.lon })
  return null
})

watch(searchActive, (active) => {
  if (!active) selectingPoint.value = false
})

async function clearArea() {
  selectingPoint.value = false
  await clearAppliedArea()
}

defineEmits<{
  'map:loaded': [value: boolean]
}>()
</script>

<template>
  <BaseMap
    height-class="h-full"
    :class="{ '[&_.leaflet-container]:cursor-crosshair': selectingPoint }"
    @ready="$emit('map:loaded', true)"
  >
    <!-- Draw Controls -->
    <template #draw-controls>
      <MapDrawControl
        v-model="circle"
        :point="point"
        :selecting-point="selectingPoint"
        @point-selected="selectPoint"
        @drawing-start="selectingPoint = false"
      />
    </template>
    <template #detection-layer>
      <MapDetectionsLayer
        :detections="detections"
        :selecting-point="selectingPoint"
      />
    </template>
    <!-- Filters -->
    <template #filters>
      <Filters stacked />
    </template>
    <!-- Area Description -->
    <template #area-description="{ hideFilters }">
      <div class="flex w-full items-end gap-2">
        <UButton
          :icon="areaDescriptionVisible ? 'i-lucide-minus' : 'i-lucide-plus'"
          :aria-label="areaDescriptionVisible ? t('map.area.hide') : t('map.area.show')"
          variant="solid"
          color="neutral"
          size="sm"
          class="shrink-0 cursor-pointer shadow-md"
          aria-controls="map-area-description"
          :aria-expanded="areaDescriptionVisible"
          @click="areaDescriptionVisible = !areaDescriptionVisible"
        />
        <div
          v-if="selectingPoint && !areaDescriptionVisible"
          class="ml-auto flex items-center gap-2 rounded-md bg-default/95 p-3 text-sm shadow-md"
        >
          <p role="status">
            {{ t('map.area.clickPoint') }}
          </p>
          <UButton
            :label="t('map.area.cancelPoint')"
            size="sm"
            color="neutral"
            variant="outline"
            @click="togglePointSelection(hideFilters)"
          />
        </div>
        <div
          v-show="areaDescriptionVisible"
          id="map-area-description"
          class="min-w-0 flex-1"
        >
          <UCard class="min-h-1/12 border border-default/60 bg-default/85 text-sm shadow-lg backdrop-blur-md">
            <div class="flex flex-col gap-4">
              <div class="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="flex min-w-0 items-center gap-3">
                  <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UIcon
                      name="i-lucide-circle-dashed"
                      class="size-5"
                    />
                  </span>
                  <div class="min-w-0">
                    <p class="text-xs font-medium uppercase tracking-wide text-muted">
                      {{ t('map.area.title') }}
                    </p>
                    <p class="truncate font-medium text-highlighted">
                      {{ areaLabel ?? t('map.area.none') }}
                    </p>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <UButton
                    :label="selectingPoint ? t('map.area.cancelPoint') : t('map.area.selectPoint')"
                    icon="i-lucide-map-pin"
                    :variant="selectingPoint ? 'solid' : 'outline'"
                    :aria-pressed="selectingPoint"
                    size="sm"
                    @click="togglePointSelection(hideFilters)"
                  />
                  <UButton
                    v-if="circle || point"
                    :label="t('map.area.clear')"
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    @click="clearArea"
                  />
                  <UTooltip :text="t('map.detections.clickHint')">
                    <UIcon
                      name="i-lucide-info"
                      class="size-4 text-muted"
                    />
                  </UTooltip>
                  <p
                    v-if="selectingPoint"
                    role="status"
                    class="text-sm text-primary"
                  >
                    {{ t('map.area.clickPoint') }}
                  </p>
                  <div
                    class="flex flex-wrap items-center gap-3 text-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <span v-if="loading">{{ t('map.detections.loading') }}</span>
                    <span v-else-if="!error">{{ t('map.detections.count', { shown: detections.length, total }) }}</span>
                    <UButton
                      v-if="canLoadMore"
                      :label="t('map.detections.more')"
                      :loading="loadingMore"
                      size="sm"
                      variant="outline"
                      @click="loadMore"
                    />
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm">
                <span
                  v-for="instrument in Object.values(InstrumentEnum)"
                  :key="instrument"
                  class="inline-flex items-center gap-2 font-medium"
                  :style="{ color: INSTRUMENT_COLORS[instrument] }"
                >
                  <span
                    class="size-3 rounded-full"
                    :style="{ backgroundColor: INSTRUMENT_COLORS[instrument] }"
                    aria-hidden="true"
                  />
                  {{ instrument }}
                </span>
              </div>
              <UAlert
                v-if="error"
                color="error"
                :title="t('map.detections.error')"
                :actions="[{ label: t('map.detections.retry'), onClick: () => refresh() }]"
              />
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </BaseMap>
  <p
    v-if="total > detections.length && !loading"
    class="text-sm text-muted"
  >
    {{ t('map.detections.partial') }}
  </p>
</template>
