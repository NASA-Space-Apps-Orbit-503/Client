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
}>(), {
  heightClass: 'h-[55vh] min-h-80'
})

const { circle, latitude, longitude, clearArea } = useFilters()
const { t } = useI18n()

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
      <UButton
        v-if="circle || point"
        :label="t('map.area.clear')"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="clearArea"
      />
    </div>

    <slot name="controls" />

    <!--
      Sized wrapper: BaseMap's root is `h-full` (needed by the full-screen explore map), which wins
      over its default `h-[55vh]` in the generated CSS. Inside a card, 100% of an auto-height parent
      collapses the Leaflet map to 0px, so the definite height must live on this parent.
    -->
    <div
      class="w-full overflow-hidden rounded-md"
      :class="heightClass"
    >
      <!-- BaseMap renders map children through named slots only (no default slot) -->
      <BaseMap height-class="h-full">
        <template #draw-controls>
          <MapDrawControl
            v-model="circle"
            :point="point"
          />
        </template>
        <template #detection-layer>
          <slot name="layers" />
        </template>
      </BaseMap>
    </div>

    <slot name="footer" />
  </div>
</template>
