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

defineEmits<{
  'map:loaded': [value: boolean]
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <BaseMap
      class="h-full"
      @ready="$emit('map:loaded', true)"
    >
      <!-- Draw Controls -->
      <template #draw-controls>
        <MapDrawControl
          v-model="circle"
          :point="point"
        />
      </template>
      <!-- Filters -->
      <template #filters>
        <Filters class="w-full flex flex-col gap-2" />
      </template>
      <!-- Area Description -->
      <template #area-description>
        <div class="flex flex-wrap items-center justify-between gap-2 text-sm min-h-1/12">
          <UCard
            class="bg-default/80"
            size="xs"
          >
            <p>
              <UIcon
                name="i-lucide-circle-dashed"
                class="mr-1 align-middle"
              />
              <span class="align-middle">{{ areaLabel ?? t('map.area.none') }}</span>
            </p>
          </UCard>
          <UButton
            v-if="circle || point"
            :label="t('map.area.clear')"
            icon="i-lucide-x"
            color="neutral"
            variant="solid"
            size="sm"
            class="cursor-pointer"
            @click="clearArea"
          />
        </div>
      </template>
    </BaseMap>
  </div>
</template>
