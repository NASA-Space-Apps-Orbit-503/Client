<script setup lang="ts">
const { t } = useI18n()
const { dateRange, latitude, longitude, radiusKm, instruments, satellites, getInstrumentsList, getSatellitesList, init, searchActive, clearFilters, applyFilters, applying, hasPendingChanges, validationMessage } = useFilters()

/**
 * Coordinates always use `.` as decimal separator, whatever the UI language: with the Spanish
 * locale `13.6929` would be parsed as `136929`. Six decimals keep the precision of the circle
 * drawn on the map (default formatting keeps 3).
 */
const COORDINATE_LOCALE = 'en-US'
const coordinateFormat = { maximumFractionDigits: 6, useGrouping: false }
const radiusFormat = { maximumFractionDigits: 3, useGrouping: false }

onMounted(() => {
  void init()
})
</script>

<template>
  <form
    class="col-span-12 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap"
    @submit.prevent="applyFilters"
  >
    <UFormField
      :label="t('filters.dateRange.label')"
      :placeholder="t('filters.dateRange.placeholder')"
      class="min-w-0 sm:col-span-2 lg:w-80 lg:flex-none"
      size="sm"
    >
      <UInputDate
        v-model="dateRange"
        range
        class="w-full"
      />
    </UFormField>
    <UFormField
      :label="t('filters.latitude.label')"
      :placeholder="t('filters.latitude.placeholder')"
      class="min-w-0 lg:w-40 lg:flex-none"
      size="sm"
    >
      <UInputNumber
        v-model="latitude"
        :min="-90"
        :max="90"
        :step="0.000001"
        :format-options="coordinateFormat"
        :locale="COORDINATE_LOCALE"
        class="w-full"
      />
    </UFormField>
    <UFormField
      :label="t('filters.longitude.label')"
      :placeholder="t('filters.longitude.placeholder')"
      class="min-w-0 lg:w-40 lg:flex-none"
      size="sm"
    >
      <UInputNumber
        v-model="longitude"
        :min="-180"
        :max="180"
        :step="0.000001"
        :format-options="coordinateFormat"
        :locale="COORDINATE_LOCALE"
        class="w-full"
      />
    </UFormField>
    <UFormField
      :label="t('filters.radiusKm.label')"
      :hint="t('filters.optional')"
      class="min-w-0 lg:w-40 lg:flex-none"
      size="sm"
    >
      <UInputNumber
        v-model="radiusKm"
        :min="0.001"
        :max="300"
        :step="0.001"
        :format-options="radiusFormat"
        :locale="COORDINATE_LOCALE"
        class="w-full"
      />
    </UFormField>
    <UFormField
      :label="t('filters.instruments.label')"
      :placeholder="t('filters.instruments.placeholder')"
      class="min-w-0 lg:min-w-40 lg:flex-1"
      size="sm"
    >
      <USelectMenu
        v-model="instruments"
        :items="getInstrumentsList"
        :placeholder="t('filters.instruments.placeholder')"
        value-key="id"
        multiple
        class="w-full"
      />
    </UFormField>
    <UFormField
      :label="t('filters.satellites.label')"
      class="min-w-0 lg:min-w-44 lg:flex-1"
      size="sm"
    >
      <USelectMenu
        v-model="satellites"
        :items="getSatellitesList"
        class="w-full"
        :placeholder="t('filters.satellites.placeholder')"
        value-key="id"
        multiple
      />
    </UFormField>
    <UButton
      type="submit"
      :label="t('filters.apply')"
      icon="i-lucide-check"
      :loading="applying"
      :disabled="!hasPendingChanges || Boolean(validationMessage)"
      class="justify-center lg:shrink-0"
    />
    <UButton
      type="button"
      :label="t('filters.clear')"
      icon="i-lucide-rotate-ccw"
      color="neutral"
      variant="outline"
      class="justify-center lg:shrink-0"
      @click="clearFilters"
    />
    <p
      v-if="!searchActive"
      role="status"
      class="w-full text-sm text-muted sm:col-span-2"
    >
      {{ t('filters.cleared') }}
    </p>
    <p
      v-if="latitude !== null && longitude !== null && radiusKm === null && !validationMessage"
      role="status"
      class="w-full text-sm text-muted sm:col-span-2"
    >
      {{ t('filters.pointOnly') }}
    </p>
    <p
      v-if="validationMessage"
      role="status"
      class="w-full text-sm text-error sm:col-span-2"
    >
      {{ validationMessage }}
    </p>
  </form>
</template>
