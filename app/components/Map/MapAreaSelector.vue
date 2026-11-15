<script setup lang="ts">
import { INSTRUMENT_COLORS } from '~/constants/instrument-colors'
import { InstrumentEnum } from '~/enums/instrument.enum'

const { circle, latitude, longitude, radiusKm, clearArea: clearAppliedArea } = useFilters()
const { t } = useI18n()
const selectingPoint = ref(false)
const { detections, total, loading, error, refresh, loadMore, loadingMore, canLoadMore } = useMapDetections()

function selectPoint(value: { lat: number, lon: number }) {
  latitude.value = value.lat
  longitude.value = value.lon
  radiusKm.value = null
  selectingPoint.value = false
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

async function clearArea() {
  selectingPoint.value = false
  await clearAppliedArea()
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
      <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
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
      <span
        v-if="!selectingPoint"
        class="text-muted"
      >{{ t('map.detections.clickHint') }}</span>
    </div>
    <UAlert
      v-if="error"
      color="error"
      :title="t('map.detections.error')"
      :actions="[{ label: t('map.detections.retry'), onClick: () => refresh() }]"
    />
    <BaseMap :class="{ '[&_.leaflet-container]:cursor-crosshair': selectingPoint }">
      <MapDrawControl
        v-model="circle"
        :point="point"
        :selecting-point="selectingPoint"
        @point-selected="selectPoint"
        @drawing-start="selectingPoint = false"
      />
      <MapDetectionsLayer
        :detections="detections"
        :selecting-point="selectingPoint"
      />
    </BaseMap>
    <p
      v-if="total > detections.length && !loading"
      class="text-sm text-muted"
    >
      {{ t('map.detections.partial') }}
    </p>
  </div>
</template>
