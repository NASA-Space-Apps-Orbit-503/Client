<script setup lang="ts">
defineProps<{
  zoom?: number
  center?: [number, number]
}>()
</script>

<template>
  <LMap
    style="height: 500px"
    :zoom="zoom || 6"
    :center="center || [47.21322, -1.559482]"
    :use-global-leaflet="false"
  >
    <slot name="fallback" />
    <LTileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
      layer-type="base"
      name="OpenStreetMap"
    />
  </LMap>
</template>
