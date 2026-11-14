<script setup lang="ts">
const { dateRange, latitude, longitude, instruments, getInstrumentsList } = useFilters()
</script>

<template>
  <div class="col-span-12 flex justify-start items-center gap-4">
    <UFormField label="Date range">
      <UInputDate
        v-model="dateRange"
        range
      />
    </UFormField>
    <UFormField label="Latitude">
      <UInputNumber
        v-model="latitude"
        :min="-90"
        :max="90"
        :step="0.000001"
      />
    </UFormField>
    <UFormField label="Longitude">
      <UInputNumber
        v-model="longitude"
        :min="-180"
        :max="180"
        :step="0.000001"
      />
    </UFormField>
    <UFormField label="Instruments">
      <USelectMenu
        v-model="instruments"
        :items="getInstrumentsList"
        placeholder="Select instruments"
        value-key="id"
        multiple
      />
    </UFormField>
  </div>
</template>
