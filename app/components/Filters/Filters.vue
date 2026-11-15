<script setup lang="ts">
const { t } = useI18n()
const { dateRange, latitude, longitude, radiusKm, instruments, satellites, getInstrumentsList, getSatellitesList } = useFilters()

/**
 * Coordinates always use `.` as decimal separator, whatever the UI language: with the Spanish
 * locale `13.6929` would be parsed as `136929`. Six decimals keep the precision of the circle
 * drawn on the map (default formatting keeps 3).
 */
const COORDINATE_LOCALE = 'en-US'
const coordinateFormat = { maximumFractionDigits: 6, useGrouping: false }
const radiusFormat = { maximumFractionDigits: 3, useGrouping: false }
</script>

<template>
  <div class="col-span-12 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap">
    <UFormField
      :label="t('filters.dateRange.label')"
      :placeholder="t('filters.dateRange.placeholder')"
      class="min-w-0 sm:col-span-2 lg:flex-1"
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
      class="min-w-0"
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
      class="min-w-0"
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
      size="sm"
      class="min-w-0 sm:col-span-2 lg:min-w-48 lg:flex-1"
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
    <UFormField :label="t('filters.satellites.label')">
      <USelectMenu
        v-model="satellites"
        :items="getSatellitesList"
        :placeholder="t('filters.satellites.placeholder')"
        value-key="id"
        multiple
      />
    </UFormField>
  </div>
</template>
