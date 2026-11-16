<script setup lang="ts">
import { InstrumentEnum } from '~/enums/instrument.enum'
import { INSTRUMENT_COLORS } from '~/constants/instrument-colors'
import type { Detection } from '~/types/api/detections'

const props = defineProps<{ detections: Detection[], selectingPoint: boolean }>()
const map = useBaseMap()
const { t, locale } = useI18n()

watch([map, () => props.detections, () => props.selectingPoint, locale], ([instance], _previous, onCleanup) => {
  if (!instance) return
  const L = window.L
  // Keep detections above drawn areas so a circle's fill cannot intercept marker clicks.
  const paneName = 'fire-detections'
  const pane = instance.getPane(paneName) ?? instance.createPane(paneName)
  pane.style.zIndex = '450'
  const renderer = L.canvas({ padding: 0.5, pane: paneName, tolerance: 5 })
  const layer = L.layerGroup().addTo(instance)
  for (const point of props.detections) {
    if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) continue
    const color = point.instrument === InstrumentEnum.Modis ? INSTRUMENT_COLORS.MODIS : INSTRUMENT_COLORS.VIIRS
    const marker = L.circleMarker([point.latitude, point.longitude], {
      renderer,
      pane: paneName,
      radius: 5,
      color,
      fillColor: color,
      weight: 1,
      fillOpacity: 0.7,
      interactive: !props.selectingPoint,
      bubblingMouseEvents: false
    })
    const content = document.createElement('div')
    const heading = document.createElement('strong')
    heading.textContent = `${point.instrument} · ${point.satellite}`
    heading.style.color = color
    content.append(heading)
    const date = new Date(point.acq_date)
    const lines = [
      `${t('map.detections.date')}: ${Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)}`,
      `${t('map.detections.time')}: ${point.acq_time?.padStart(4, '0').replace(/^(\d{2})(\d{2})$/, '$1:$2') ?? '—'} UTC`,
      `${t('filters.latitude.label')}: ${point.latitude}`,
      `${t('filters.longitude.label')}: ${point.longitude}`,
      `${t('map.detections.frp')}: ${point.frp === null || point.frp === undefined ? '—' : new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(point.frp) + ' MW'}`,
      `${t('map.detections.confidence')}: ${point.confidence ? t(`map.detections.confidenceLevels.${point.confidence}`) : '—'}`
    ]
    for (const text of lines) {
      const row = document.createElement('div')
      row.textContent = text
      content.append(row)
    }
    marker.bindPopup(content).addTo(layer)
  }
  onCleanup(() => {
    layer.clearLayers()
    layer.remove()
    renderer.remove()
  })
}, { immediate: true, flush: 'sync' })
</script>

<template>
  <span hidden />
</template>
