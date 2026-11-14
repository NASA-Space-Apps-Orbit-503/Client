<script setup lang="ts">
import type { Circle, CircleMarker, Control, DrawEvents, FeatureGroup, LeafletEvent, Map as LeafletMap } from 'leaflet'
import { EL_SALVADOR_BBOX } from '~/constants/el-salvador'
import { AREA_SHAPE_OPTIONS } from '~/constants/map'
import { LEAFLET_DRAW_LOCALES } from '~/constants/leaflet-draw-locale'
import { LocaleEnum } from '~/enums/locale.enum'
import type { CircleArea } from '~/types/area'

/**
 * Leaflet.draw toolbar limited to a single circle (`v-model`). When only a point is known
 * (latitude/longitude typed in the filters without a radius) it is shown as a marker.
 * Renderless: must be placed inside `<BaseMap />`.
 */
const circle = defineModel<CircleArea | null>({ default: null })

const props = withDefaults(defineProps<{
  /** Center typed in the filters. Shown as a marker while there is no circle. */
  point?: { lat: number, lon: number } | null
}>(), {
  point: null
})

const POINT_ZOOM = 12
const FLY_DEBOUNCE_MS = 300

const map = useBaseMap()
const { t, locale } = useI18n()
const toast = useToast()

function toCircleArea(layer: Circle): CircleArea {
  const center = layer.getLatLng()
  return { lat: center.lat, lon: center.lng, radiusKm: layer.getRadius() / 1000 }
}

function notifyCircleOutside() {
  toast.add({
    title: t('map.area.outsideTitle'),
    description: t('map.area.outsideDescription'),
    color: 'warning',
    icon: 'i-lucide-map-pin-off'
  })
}

function notifyRadiusOutside() {
  toast.add({
    title: t('map.area.outsideTitle'),
    description: t('map.area.radiusOutsideDescription'),
    color: 'warning',
    icon: 'i-lucide-map-pin-off'
  })
}

function notifyPointOutside() {
  toast.add({
    title: t('map.area.pointOutsideTitle'),
    description: t('map.area.pointOutsideDescription', { ...EL_SALVADOR_BBOX }),
    color: 'warning',
    icon: 'i-lucide-map-pin-off'
  })
}

function applyDrawLocale() {
  const strings = LEAFLET_DRAW_LOCALES[locale.value as LocaleEnum] ?? LEAFLET_DRAW_LOCALES[LocaleEnum.En]
  window.L.drawLocal.draw = strings.draw
  window.L.drawLocal.edit = strings.edit
}

/** Wires Leaflet.draw to `instance`; returns the teardown that removes everything it added. */
function setup(instance: LeafletMap) {
  const L = window.L
  const drawnItems: FeatureGroup = L.featureGroup().addTo(instance)
  let control: Control.Draw | undefined
  let pointMarker: CircleMarker | undefined
  let flyTimer: ReturnType<typeof setTimeout> | undefined
  /** Circle currently drawn, to tell map edits apart from changes typed in the filters. */
  let drawnCircle: CircleArea | null = null

  const renderCircle = (value: CircleArea | null) => {
    drawnItems.clearLayers()
    drawnCircle = value
    if (value) {
      drawnItems.addLayer(L.circle([value.lat, value.lon], { ...AREA_SHAPE_OPTIONS, radius: value.radiusKm * 1000 }))
    }
  }

  const renderPoint = (value: { lat: number, lon: number } | null) => {
    pointMarker?.remove()
    pointMarker = value
      ? L.circleMarker([value.lat, value.lon], { ...AREA_SHAPE_OPTIONS, radius: 7, fillOpacity: 0.8 }).addTo(instance)
      : undefined
  }

  /** Moves the map to coordinates typed in the filters (debounced while the user types). */
  const flyTo = (target: CircleArea | { lat: number, lon: number }) => {
    if (flyTimer) clearTimeout(flyTimer)
    flyTimer = setTimeout(() => {
      if (!isPointInsideElSalvador(target.lat, target.lon)) {
        notifyPointOutside()
        return
      }
      if ('radiusKm' in target && drawnItems.getLayers().length) {
        instance.flyToBounds(drawnItems.getBounds(), { padding: [24, 24], maxZoom: POINT_ZOOM })
      } else {
        instance.flyTo([target.lat, target.lon], Math.max(instance.getZoom(), POINT_ZOOM))
      }
    }, FLY_DEBOUNCE_MS)
  }

  const mountControl = () => {
    if (control) instance.removeControl(control)
    applyDrawLocale()
    control = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polyline: false,
        polygon: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
        circle: { showRadius: true, metric: true, shapeOptions: { ...AREA_SHAPE_OPTIONS } }
      },
      edit: { featureGroup: drawnItems, remove: true }
    })
    instance.addControl(control)
  }

  const onCreated = (event: LeafletEvent) => {
    const { layer } = event as DrawEvents.Created
    if (!(layer instanceof L.Circle)) return
    const created = toCircleArea(layer)
    if (!isCircleInsideElSalvador(created)) {
      notifyCircleOutside()
      return
    }
    // Only one circle at a time: the new one replaces the previous one.
    renderCircle(created)
    circle.value = created
  }

  const onEdited = () => {
    const [layer] = drawnItems.getLayers()
    if (!(layer instanceof L.Circle)) return
    const edited = toCircleArea(layer)
    if (!isCircleInsideElSalvador(edited)) {
      notifyCircleOutside()
      renderCircle(drawnCircle)
      return
    }
    drawnCircle = edited
    circle.value = edited
  }

  const onDeleted = () => {
    if (drawnItems.getLayers().length) return
    drawnCircle = null
    // Clears latitude, longitude and radius in the filters.
    circle.value = null
  }

  const disableTouchBridge = enableDrawTouchBridge(instance)
  instance.on(L.Draw.Event.CREATED, onCreated)
  instance.on(L.Draw.Event.EDITED, onEdited)
  instance.on(L.Draw.Event.DELETED, onDeleted)

  mountControl()
  renderCircle(circle.value)
  renderPoint(circle.value ? null : props.point)

  // Fit the map to the circle or point restored from the URL.
  if (circle.value && drawnItems.getLayers().length) {
    instance.fitBounds(drawnItems.getBounds(), { padding: [24, 24] })
  } else if (props.point && isPointInsideElSalvador(props.point.lat, props.point.lon)) {
    instance.setView([props.point.lat, props.point.lon], POINT_ZOOM)
  }

  const stopCircleWatch = watch(circle, (value) => {
    if (isSameCircle(value, drawnCircle)) return
    renderCircle(value)
    if (!value) return
    flyTo(value)
    // Typed in the filters: the center is checked by `flyTo`, the radius here.
    if (isPointInsideElSalvador(value.lat, value.lon) && !isCircleInsideElSalvador(value)) notifyRadiusOutside()
  })

  const stopPointWatch = watch(() => (circle.value ? null : props.point), (value, previous) => {
    renderPoint(value)
    if (value && (value.lat !== previous?.lat || value.lon !== previous?.lon)) flyTo(value)
  })

  const stopLocaleWatch = watch(locale, mountControl)

  return () => {
    if (flyTimer) clearTimeout(flyTimer)
    stopCircleWatch()
    stopPointWatch()
    stopLocaleWatch()
    instance.off(L.Draw.Event.CREATED, onCreated)
    instance.off(L.Draw.Event.EDITED, onEdited)
    instance.off(L.Draw.Event.DELETED, onDeleted)
    disableTouchBridge()
    if (control) instance.removeControl(control)
    pointMarker?.remove()
    drawnItems.clearLayers()
    instance.removeLayer(drawnItems)
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
