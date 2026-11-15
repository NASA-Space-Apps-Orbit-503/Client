<script setup lang="ts">
const { circle, latitude, longitude } = useFilters()
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

function clearArea() {
  circle.value = null
}
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

    <BaseMap>
      <MapDrawControl
        v-model="circle"
        :point="point"
      />
    </BaseMap>
  </div>
</template>
