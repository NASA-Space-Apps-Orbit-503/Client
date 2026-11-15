<script setup lang="ts">
import type { CircleMarker, LayerGroup, Map as LeafletMap } from 'leaflet'
import { ANOMALY_COORDINATE_FORMAT, SEVERITY_MARKER_COLORS } from '~/constants/anomaly-map'
import type { SeverityEnum } from '~/enums/severity.enum'
import type { AnomalyItem } from '~/types/api/stats'

/**
 * Draws anomalies as circle markers colored by severity. Clicking a marker opens a popup with
 * its date, score, counts and severity in the active locale.
 * Renderless: must be placed inside `<BaseMap />`.
 */
const props = defineProps<{
  items: AnomalyItem[]
  /** Marker radius in px. */
  size: number
}>()

const map = useBaseMap()
const { t, locale } = useI18n()
const { formatDate, formatNumber } = useLocaleFormat()

/** Popup content built with DOM nodes (text only, never HTML strings). */
function buildPopup(item: AnomalyItem) {
  const root = document.createElement('div')
  root.className = 'flex flex-col gap-0.5 text-sm'

  const title = document.createElement('strong')
  title.textContent = formatDate(formatEpochDate(item.date))
  root.append(title)

  const lines: [string, string][] = [
    [t('anomalies.columns.severity'), t(`severity.${item.severity}`)],
    [t('anomalies.columns.score'), formatNumber(item.score, { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
    [t('anomalies.columns.observed'), formatNumber(item.observed)],
    [t('anomalies.columns.expected'), formatNumber(item.expected, { maximumFractionDigits: 2 })],
    [t('anomalies.columns.location'), `${formatNumber(item.location.latitude, ANOMALY_COORDINATE_FORMAT)}, ${formatNumber(item.location.longitude, ANOMALY_COORDINATE_FORMAT)}`]
  ]
  for (const [label, value] of lines) {
    const line = document.createElement('span')
    line.textContent = `${label}: ${value}`
    root.append(line)
  }

  return root
}

/** Adds the markers to `instance`; returns the teardown that removes them. */
function setup(instance: LeafletMap) {
  const L = window.L
  const layer: LayerGroup = L.layerGroup().addTo(instance)
  let markers: CircleMarker[] = []

  const render = () => {
    layer.clearLayers()
    // Lowest scores first so the most severe markers are drawn on top
    markers = [...props.items]
      .sort((a, b) => a.score - b.score)
      .map((item) => {
        const color = SEVERITY_MARKER_COLORS[item.severity as SeverityEnum]
        return L.circleMarker([item.location.latitude, item.location.longitude], {
          radius: props.size,
          color: '#ffffff',
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.85
        })
          .bindPopup(() => buildPopup(item))
          .addTo(layer)
      })
  }

  render()

  const stopItemsWatch = watch(() => props.items, render)
  const stopLocaleWatch = watch(locale, () => {
    // Popups are rebuilt on open; close any open one so it does not show the previous language
    instance.closePopup()
  })
  const stopSizeWatch = watch(() => props.size, (size) => {
    for (const marker of markers) marker.setRadius(size)
  })

  return () => {
    stopItemsWatch()
    stopLocaleWatch()
    stopSizeWatch()
    layer.clearLayers()
    instance.removeLayer(layer)
  }
}

watch(map, (instance, _previous, onCleanup) => {
  if (!instance) return
  onCleanup(setup(instance))
}, { immediate: true, flush: 'sync' })
</script>

<template>
  <span hidden />
</template>
