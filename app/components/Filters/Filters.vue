<script setup lang="ts">
import { MAX_RADIUS_KM, MIN_RADIUS_KM } from '~/composables/useFilters'

const { dateRange, latitude, longitude, radiusKm, instruments, bbox, getInstrumentsList } = useFilters()
const { t } = useI18n()
const { formatNumber } = useLocaleFormat()

const bboxLabel = computed(() => {
  if (!bbox.value) return t('filters.noArea')
  return bbox.value
    .map(coordinate => formatNumber(coordinate, { maximumFractionDigits: 2 }))
    .join(', ')
})
</script>

<template>
  <div class="col-span-full flex flex-wrap items-end gap-4">
    <UFormField :label="t('filters.dateRange')">
      <UInputDate
        v-model="dateRange"
        range
      />
    </UFormField>
    <UFormField :label="t('filters.latitude')">
      <UInputNumber
        v-model="latitude"
        :min="-90"
        :max="90"
        :step="0.000001"
      />
    </UFormField>
    <UFormField :label="t('filters.longitude')">
      <UInputNumber
        v-model="longitude"
        :min="-180"
        :max="180"
        :step="0.000001"
      />
    </UFormField>
    <UFormField
      :label="t('filters.radius')"
      :hint="latitude === null || longitude === null ? t('filters.radiusHint') : undefined"
    >
      <UInputNumber
        v-model="radiusKm"
        :min="MIN_RADIUS_KM"
        :max="MAX_RADIUS_KM"
        :step="1"
        :format-options="{ maximumFractionDigits: 1 }"
        class="w-32"
      />
    </UFormField>
    <UFormField :label="t('filters.instruments')">
      <USelectMenu
        v-model="instruments"
        :items="getInstrumentsList"
        :placeholder="t('filters.instrumentsPlaceholder')"
        value-key="id"
        multiple
        class="min-w-48"
      />
    </UFormField>
    <UFormField :label="t('filters.area')">
      <div class="flex h-8 items-center gap-1">
        <UBadge
          :label="bboxLabel"
          color="neutral"
          variant="subtle"
          icon="i-lucide-square-dashed"
        />
        <UButton
          v-if="bbox"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          :aria-label="t('filters.clearArea')"
          @click="bbox = null"
        />
      </div>
    </UFormField>
  </div>
</template>
