<script setup lang="ts">
const { t } = useI18n()
const { dateRange, latitude, longitude, radiusKm, instruments, satellites, getInstrumentsList, getSatellitesList, init, searchActive, clearFilters, applyFilters, applying, hasPendingChanges, validationMessage } = useFilters()

const props = defineProps<{
  classes?: string
  /** Compact vertical layout for the Explore map overlay. */
  stacked?: boolean
  /**
   * True when the page's own filters (`#page-filters` slot) differ from the ones last applied,
   * so the apply button is enabled even if the global filters did not change.
   */
  pagePending?: boolean
}>()

const emit = defineEmits<{
  /** Emitted after a successful apply: pages snapshot their own filters here. */
  apply: []
  /** Emitted after clearing: pages reset their own filters here. */
  clear: []
}>()

const canApply = computed(() => (hasPendingChanges.value || props.pagePending) && !validationMessage.value)

async function onSubmit() {
  // Same guard as `applyFilters()`, so submitting behaves as before on pages without page filters
  if (validationMessage.value || applying.value) return
  await applyFilters()
  emit('apply')
}

async function onClear() {
  await clearFilters()
  emit('clear')
}

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
    :class="[stacked ? 'flex w-full flex-col gap-3' : 'col-span-12 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap', classes]"
    @submit.prevent="onSubmit"
  >
    <div class="col-span-full flex w-full flex-col gap-2">
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
      :class="stacked ? 'w-full' : 'min-w-0 sm:col-span-2 lg:w-80 lg:flex-none'"
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
      :class="stacked ? 'w-full' : 'min-w-0 lg:w-40 lg:flex-none'"
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
      :class="stacked ? 'w-full' : 'min-w-0 lg:w-40 lg:flex-none'"
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
      :class="stacked ? 'w-full' : 'min-w-0 lg:w-40 lg:flex-none'"
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
      :class="stacked ? 'w-full' : 'min-w-0 lg:min-w-40 lg:flex-1'"
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
      :class="stacked ? 'w-full' : 'min-w-0 lg:min-w-44 lg:flex-1'"
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
    <!-- Page-specific filters: applied together with the global ones by the same button -->
    <slot name="page-filters" />
    <div :class="['flex flex-wrap gap-2 self-end', stacked ? 'w-full' : 'lg:shrink-0']">
      <UButton
        type="submit"
        :label="t('filters.apply')"
        icon="i-lucide-funnel"
        :loading="applying"
        :disabled="!canApply"
        class="justify-center w-fit"
      />
      <UButton
        type="button"
        :label="t('filters.clear')"
        icon="i-lucide-funnel-x"
        color="neutral"
        variant="outline"
        class="justify-center w-fit"
        @click="onClear"
      />
    </div>
  </form>
</template>
