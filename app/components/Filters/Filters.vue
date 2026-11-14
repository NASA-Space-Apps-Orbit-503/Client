<script setup lang="ts">
const { t } = useI18n()
const { dateRange, latitude, longitude, instruments, getInstrumentsList } = useFilters()
</script>

<template>
  <div class="col-span-12 flex justify-start items-center gap-4">
    <UFormField
      :label="t('filters.dateRange.label')"
      :placeholder="t('filters.dateRange.placeholder')"
    >
      <UInputDate
        v-model="dateRange"
        range
      />
    </UFormField>
    <UFormField
      :label="t('filters.latitude.label')"
      :placeholder="t('filters.latitude.placeholder')"
    >
      <UInputNumber
        v-model="latitude"
        :min="-90"
        :max="90"
        :step="0.000001"
      />
    </UFormField>
    <UFormField
      :label="t('filters.longitude.label')"
      :placeholder="t('filters.longitude.placeholder')"
    >
      <UInputNumber
        v-model="longitude"
        :min="-180"
        :max="180"
        :step="0.000001"
      />
    </UFormField>
    <UFormField
      :label="t('filters.instruments.label')"
      :placeholder="t('filters.instruments.placeholder')"
    >
      <USelectMenu
        v-model="instruments"
        :items="getInstrumentsList"
        :placeholder="t('filters.instruments.placeholder')"
        value-key="id"
        multiple
      />
    </UFormField>
  </div>
</template>
