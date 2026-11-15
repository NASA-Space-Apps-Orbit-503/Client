<script setup lang="ts">
import { ANOMALY_MARKER_SIZE, SEVERITY_MARKER_COLORS } from '~/constants/anomaly-map'
import { FILTERABLE_SEVERITIES } from '~/enums/severity.enum'
import type { AnomalyItem } from '~/types/api/stats'

/**
 * Anomalies map: the shared area selection (`BaseMap` + `MapDrawControl`, same behavior as
 * `MapAreaSelector`) plus the anomalies of the current table page as markers.
 */
defineProps<{
  /** Anomalies of the current table page. */
  items: AnomalyItem[]
}>()

const { circle, latitude, longitude } = useFilters()
const { t } = useI18n()

const markerSize = ref<number>(ANOMALY_MARKER_SIZE.default)

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

    <div class="flex flex-wrap items-end justify-between gap-4">
      <UFormField
        :label="t('anomalies.map.markerSize', { size: markerSize })"
        size="sm"
        class="w-full sm:w-64"
      >
        <USlider
          v-model="markerSize"
          :min="ANOMALY_MARKER_SIZE.min"
          :max="ANOMALY_MARKER_SIZE.max"
          :step="ANOMALY_MARKER_SIZE.step"
          :aria-label="t('anomalies.map.markerSizeAria')"
        />
      </UFormField>
      <ul
        class="flex flex-wrap items-center gap-3 text-xs text-muted"
        :aria-label="t('anomalies.map.legend')"
      >
        <li
          v-for="severity in FILTERABLE_SEVERITIES"
          :key="severity"
          class="flex items-center gap-1.5"
        >
          <span
            class="size-3 rounded-full ring-1 ring-white"
            :style="{ backgroundColor: SEVERITY_MARKER_COLORS[severity] }"
            aria-hidden="true"
          />
          {{ t(`severity.${severity}`) }}
        </li>
      </ul>
    </div>

    <BaseMap>
      <MapDrawControl
        v-model="circle"
        :point="point"
      />
      <AnomaliesMapLayer
        :items="items"
        :size="markerSize"
      />
    </BaseMap>

    <p class="text-xs text-muted">
      {{ t('anomalies.map.pageNote', { count: items.length }, items.length) }}
    </p>
  </div>
</template>
