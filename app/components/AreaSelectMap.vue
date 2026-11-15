<script setup lang="ts">
import { DrawStepEnum } from '~/enums/draw-step.enum'

/**
 * Map-based area of interest selection. Writes the global `bbox` filter.
 * Drawing uses two clicks (opposite corners), which also works on touch devices.
 */
interface LatLng {
  lat: number
  lng: number
}

interface MapMouseEvent {
  latlng: LatLng
}

type LatLngBoundsTuple = [[number, number], [number, number]]

/** Minimal subset of the Leaflet map instance used by this component. */
interface LeafletMapInstance {
  on: (event: 'click' | 'mousemove', handler: (event: MapMouseEvent) => void) => void
  fitBounds: (bounds: LatLngBoundsTuple, options?: { padding?: [number, number] }) => void
}

const DEFAULT_CENTER: [number, number] = [13.7, -88.9]
const DEFAULT_ZOOM = 8
const COORDINATE_DECIMALS = 4

const { bbox, latitude, longitude, radiusKm } = useFilters()
const { t } = useI18n()

const map = shallowRef<LeafletMapInstance>()
const drawStep = ref<DrawStepEnum>(DrawStepEnum.Idle)
const firstCorner = ref<LatLng>()
const pointer = ref<LatLng>()

const isDrawing = computed(() => drawStep.value !== DrawStepEnum.Idle)

const hasPoint = computed(() => latitude.value !== null && longitude.value !== null)

const center = computed<[number, number]>(() =>
  latitude.value !== null && longitude.value !== null
    ? [latitude.value, longitude.value]
    : DEFAULT_CENTER
)

const round = (value: number) => Number(value.toFixed(COORDINATE_DECIMALS))
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function toBbox(a: LatLng, b: LatLng): Bbox {
  return [
    round(clamp(Math.min(a.lng, b.lng), -180, 180)),
    round(clamp(Math.min(a.lat, b.lat), -90, 90)),
    round(clamp(Math.max(a.lng, b.lng), -180, 180)),
    round(clamp(Math.max(a.lat, b.lat), -90, 90))
  ]
}

const toBounds = ([west, south, east, north]: Bbox): LatLngBoundsTuple => [[south, west], [north, east]]

const selectedBounds = computed(() => bbox.value ? toBounds(bbox.value) : undefined)

const previewBounds = computed(() =>
  drawStep.value === DrawStepEnum.SecondCorner && firstCorner.value && pointer.value
    ? toBounds(toBbox(firstCorner.value, pointer.value))
    : undefined
)

const hint = computed(() =>
  drawStep.value === DrawStepEnum.FirstCorner ? t('areaMap.drawingHint') : t('areaMap.drawingHintSecond')
)

function startDrawing() {
  drawStep.value = DrawStepEnum.FirstCorner
  firstCorner.value = undefined
  pointer.value = undefined
}

function cancelDrawing() {
  drawStep.value = DrawStepEnum.Idle
  firstCorner.value = undefined
  pointer.value = undefined
}

function onMapClick({ latlng }: MapMouseEvent) {
  if (drawStep.value === DrawStepEnum.FirstCorner) {
    firstCorner.value = latlng
    drawStep.value = DrawStepEnum.SecondCorner
    return
  }

  if (drawStep.value === DrawStepEnum.SecondCorner && firstCorner.value) {
    const next = toBbox(firstCorner.value, latlng)
    cancelDrawing()
    // Ignore degenerate rectangles (both clicks on the same point)
    if (next[0] < next[2] && next[1] < next[3]) bbox.value = next
  }
}

function fitToSelection() {
  if (map.value && selectedBounds.value) {
    map.value.fitBounds(selectedBounds.value, { padding: [16, 16] })
  }
}

function onReady(instance: LeafletMapInstance) {
  map.value = instance
  instance.on('click', onMapClick)
  instance.on('mousemove', ({ latlng }) => {
    if (drawStep.value === DrawStepEnum.SecondCorner) pointer.value = latlng
  })
  fitToSelection()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isDrawing.value) cancelDrawing()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

// Keep the view on the selection when it changes from elsewhere (URL, filters chip)
watch(bbox, () => fitToSelection())
</script>

<template>
  <UCard
    class="col-span-full"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="font-medium text-highlighted">
            {{ t('areaMap.title') }}
          </p>
          <p class="text-sm text-muted">
            {{ t('areaMap.description') }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            v-if="!isDrawing"
            icon="i-lucide-square-dashed-mouse-pointer"
            :label="t('areaMap.draw')"
            size="sm"
            @click="startDrawing"
          />
          <UButton
            v-else
            icon="i-lucide-x"
            :label="t('areaMap.cancel')"
            color="neutral"
            variant="subtle"
            size="sm"
            @click="cancelDrawing"
          />
          <UButton
            icon="i-lucide-eraser"
            :label="t('areaMap.clear')"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="!bbox"
            @click="bbox = null"
          />
        </div>
      </div>
    </template>

    <div
      class="relative h-72 sm:h-96"
      :class="{ 'cursor-crosshair': isDrawing }"
    >
      <ClientOnly>
        <LMap
          :zoom="DEFAULT_ZOOM"
          :center="center"
          :use-global-leaflet="false"
          class="z-0"
          @ready="onReady"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
            layer-type="base"
            name="OpenStreetMap"
          />
          <LCircle
            v-if="hasPoint"
            :lat-lng="center"
            :radius="radiusKm * 1000"
            :interactive="false"
            color="var(--ui-primary)"
            :weight="2"
            :fill-opacity="0.1"
          />
          <LRectangle
            v-if="selectedBounds"
            :bounds="selectedBounds"
            :interactive="false"
            color="var(--ui-primary)"
            :weight="2"
            :fill-opacity="0.1"
          />
          <LRectangle
            v-if="previewBounds"
            :bounds="previewBounds"
            :interactive="false"
            color="var(--ui-primary)"
            dash-array="6 6"
            :weight="2"
            :fill-opacity="0.05"
          />
        </LMap>
        <template #fallback>
          <div class="h-full animate-pulse bg-muted" />
        </template>
      </ClientOnly>
      <div
        v-if="isDrawing"
        class="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center"
        role="status"
      >
        <UBadge
          :label="hint"
          color="neutral"
          variant="solid"
        />
      </div>
    </div>
  </UCard>
</template>
