<script setup lang="ts">
const { t } = useI18n()
const { dateRange, latitude, longitude, radiusKm, instruments, satellites, getInstrumentsList, getSatellitesList, init, searchActive, clearFilters, applyFilters, applying, hasPendingChanges, validationMessage } = useFilters()

defineProps<{
  classes?: string
}>()

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
    :class="classes"
    @submit.prevent="applyFilters"
  >
    <div class="col-span-12 w-full flex flex-col gap-2">
      <p
        v-if="!searchActive"
        role="status"
        class="w-full text-xs text-muted sm:col-span-2"
      >
        {{ t('filters.cleared') }}
      </p>
      <p
        v-if="latitude !== null && longitude !== null && radiusKm === null && !validationMessage"
        role="status"
        class="w-full text-xs text-muted sm:col-span-2"
      >
        {{ t('filters.pointOnly') }}
      </p>
      <p
        v-if="validationMessage"
        role="status"
        class="w-full text-xs text-error sm:col-span-2"
      >
        {{ validationMessage }}
      </p>
    </div>
    <UFormField
      :label="t('filters.dateRange.label')"
      :placeholder="t('filters.dateRange.placeholder')"
      class="w-full"
      size="sm"
    >
      <UInputDate
        v-model="dateRange"
        range
        class="w-full"
        variant="subtle"
      />
    </UFormField>
    <UFormField
      :label="t('filters.latitude.label')"
      :placeholder="t('filters.latitude.placeholder')"
      class="w-full"
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
        variant="subtle"
      />
    </UFormField>
    <UFormField
      :label="t('filters.longitude.label')"
      :placeholder="t('filters.longitude.placeholder')"
      class="w-full"
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
        variant="subtle"
      />
    </UFormField>
    <UFormField
      :label="t('filters.radiusKm.label')"
      :hint="t('filters.optional')"
      class="w-full"
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
        variant="subtle"
      />
    </UFormField>
    <UFormField
      :label="t('filters.instruments.label')"
      :placeholder="t('filters.instruments.placeholder')"
      class="w-full"
      size="sm"
    >
      <USelectMenu
        v-model="instruments"
        :items="getInstrumentsList"
        :placeholder="t('filters.instruments.placeholder')"
        value-key="id"
        multiple
        class="w-full"
        variant="subtle"
      />
    </UFormField>
    <UFormField
      :label="t('filters.satellites.label')"
      class="w-full"
      size="sm"
    >
      <USelectMenu
        v-model="satellites"
        :items="getSatellitesList"
        class="w-full"
        :placeholder="t('filters.satellites.placeholder')"
        value-key="id"
        multiple
        variant="subtle"
      />
    </UFormField>
    <div class="w-full flex flex-wrap gap-2 self-end">
      <UButton
        type="submit"
        icon="i-lucide-funnel"
        :loading="applying"
        :disabled="!hasPendingChanges || Boolean(validationMessage)"
        class="justify-center w-fit"
      />
      <UButton
        type="button"
        icon="i-lucide-funnel-x"
        color="neutral"
        variant="outline"
        class="justify-center w-fit"
        @click="clearFilters"
      />
    </div>
  </form>
</template>
