<script setup lang="ts">
/**
 * Area-of-interest map for pages that show the map inside a card (anomalies, historical trends).
 * Area label + Clear button, then `BaseMap` with the circle drawing control bound to the shared
 * filters (`useFilters().circle`). Explore keeps its own full-screen `MapAreaSelector`.
 *
 * Slots:
 * - `controls`: page controls between the area label and the map (e.g. sliders, legends).
 * - `layers`: extra renderless map layers (rendered inside `BaseMap`, e.g. markers).
 * - `footer`: notes under the map.
 */
withDefaults(defineProps<{
  /** Height utilities of the map. Must be a definite height (see the template comment). */
  heightClass?: string
  allowPointSelection?: boolean
}>(), {
  heightClass: 'h-[55vh] min-h-80'
})

const { circle, latitude, longitude, radiusKm, searchActive, clearArea: clearAppliedArea } = useFilters()
const { t } = useI18n()
const selectingPoint = ref(false)
watch(searchActive, (active) => {
  if (!active) selectingPoint.value = false
})
function selectPoint(value: { lat: number, lon: number }) {
  latitude.value = value.lat
  longitude.value = value.lon
  radiusKm.value = null
  selectingPoint.value = false
}
async function clearArea() {
  selectingPoint.value = false
  await clearAppliedArea()
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
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
      <p :class="areaLabel ? 'text-highlighted' : 'text-muted'">
        <UIcon
          name="i-lucide-circle-dashed"
          class="mr-1 align-middle"
        />
        <span class="align-middle">{{ areaLabel ?? t('map.area.none') }}</span>
      </p>
      <div class="ml-auto flex flex-wrap justify-end gap-2">
        <UButton
          v-if="circle || point"
          :label="t('map.area.clear')"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="clearArea"
        />
        <UButton
          v-if="allowPointSelection"
          :label="selectingPoint ? t('map.area.cancelPoint') : t('map.area.selectPoint')"
          icon="i-lucide-map-pin"
          :variant="selectingPoint ? 'solid' : 'outline'"
          :aria-pressed="selectingPoint"
          size="sm"
          @click="selectingPoint = !selectingPoint"
        />
      </div>
    </div>

    <p
      v-if="selectingPoint"
      role="status"
      class="text-sm text-primary"
    >
      {{ t('map.area.clickPoint') }}
    </p>
    <slot name="controls" />

    <!--
      Card maps give their wrapper a definite height; BaseMap fills that wrapper.
      The Explore map instead fills its viewport-sized section.
    -->
    <div
      class="w-full overflow-hidden rounded-md"
      :class="heightClass"
    >
      <!-- BaseMap renders map children through named slots only (no default slot) -->
      <BaseMap
        height-class="h-full"
        :class="{ '[&_.leaflet-container]:cursor-crosshair': selectingPoint }"
      >
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
          <slot
            name="layers"
            :selecting-point="selectingPoint"
          />
        </template>
      </BaseMap>
    </div>

    <slot name="footer" />
  </div>
</template>
