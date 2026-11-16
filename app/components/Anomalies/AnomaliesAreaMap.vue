<script setup lang="ts">
import { ANOMALY_MARKER_SIZE, SEVERITY_MARKER_COLORS } from '~/constants/anomaly-map'
import { FILTERABLE_SEVERITIES } from '~/enums/severity.enum'
import type { AnomalyItem } from '~/types/api/stats'

/**
 * Anomalies map: the shared area map card (`MapAreaPanel`: area label, circle drawing, sized
 * `BaseMap`) plus the anomalies of the current table page as markers, a size slider and a legend.
 */
defineProps<{
  /** Anomalies of the current table page. */
  items: AnomalyItem[]
}>()

const { t } = useI18n()

const markerSize = ref<number>(ANOMALY_MARKER_SIZE.default)
</script>

<template>
  <MapAreaPanel>
    <template #controls>
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
    </template>

    <template #layers>
      <AnomaliesMapLayer
        :items="items"
        :size="markerSize"
      />
    </template>

    <template #footer>
      <p class="text-xs text-muted">
        {{ t('anomalies.map.pageNote', { count: items.length }, items.length) }}
      </p>
    </template>
  </MapAreaPanel>
</template>
