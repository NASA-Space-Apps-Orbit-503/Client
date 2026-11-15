<script setup lang="ts">
const { t } = useI18n()
const { dateRange, latitude, longitude, instruments, getInstrumentsList } = useFilters()
</script>

<template>
  <div class="col-span-12 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap">
    <UFormField
      :label="t('filters.dateRange.label')"
      :placeholder="t('filters.dateRange.placeholder')"
      class="min-w-0 sm:col-span-2 lg:flex-1"
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
    >
      <UInputNumber
        v-model="latitude"
        :min="-90"
        :max="90"
        :step="0.000001"
        class="w-full"
      />
    </UFormField>
    <UFormField
      :label="t('filters.longitude.label')"
      :placeholder="t('filters.longitude.placeholder')"
      class="min-w-0"
    >
      <UInputNumber
        v-model="longitude"
        :min="-180"
        :max="180"
        :step="0.000001"
        class="w-full"
      />
    </UFormField>
    <UFormField
      :label="t('filters.instruments.label')"
      :placeholder="t('filters.instruments.placeholder')"
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
  </div>
</template>
