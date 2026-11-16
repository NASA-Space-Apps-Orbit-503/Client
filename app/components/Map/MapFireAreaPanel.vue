<script setup lang="ts">
import { INSTRUMENT_COLORS } from '~/constants/instrument-colors'
import { InstrumentEnum } from '~/enums/instrument.enum'

const { t } = useI18n()
const { detections, total, loading, error, refresh, loadMore, loadingMore, canLoadMore } = useMapDetections()
</script>

<template>
  <MapAreaPanel allow-point-selection>
    <template #controls>
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
      <div class="flex flex-wrap gap-4 text-sm">
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
        <span class="text-muted">{{ t('map.detections.clickHint') }}</span>
      </div>
      <UAlert
        v-if="error"
        color="error"
        :title="t('map.detections.error')"
        :actions="[{ label: t('map.detections.retry'), onClick: () => refresh() }]"
      />
    </template>
    <template #layers="{ selectingPoint }">
      <MapDetectionsLayer
        :detections="detections"
        :selecting-point="selectingPoint"
      />
    </template>
    <template #footer>
      <p
        v-if="total > detections.length && !loading"
        class="text-sm text-muted"
      >
        {{ t('map.detections.partial') }}
      </p>
    </template>
  </MapAreaPanel>
</template>
