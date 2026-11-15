<script setup lang="ts">
import type { LatLngBoundsExpression, Map as LeafletMap } from 'leaflet'
import {
  EL_SALVADOR_BOUNDS,
  EL_SALVADOR_CENTER,
  EL_SALVADOR_DEFAULT_ZOOM,
  EL_SALVADOR_MIN_ZOOM
} from '~/constants/el-salvador'
import { BASE_MAP_KEY } from '~/constants/map'

const props = withDefaults(defineProps<{
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  /** Area the user cannot pan out of. Pass `null` to disable. */
  maxBounds?: LatLngBoundsExpression | null
  /** Defaults to `NUXT_PUBLIC_MAP_TILE_URL`. */
  tileUrl?: string
  /** Defaults to `NUXT_PUBLIC_MAP_ATTRIBUTION`. */
  attribution?: string
  /** Height utilities for the map container. */
  heightClass?: string
}>(), {
  center: () => EL_SALVADOR_CENTER,
  zoom: EL_SALVADOR_DEFAULT_ZOOM,
  minZoom: EL_SALVADOR_MIN_ZOOM,
  maxZoom: 18,
  maxBounds: () => EL_SALVADOR_BOUNDS,
  heightClass: 'h-[55vh] min-h-80 max-h-full'
})

const emit = defineEmits<{
  ready: [map: LeafletMap]
}>()

const { t } = useI18n()
const slots = useSlots()
const { mapTileUrl, mapAttribution } = useRuntimeConfig().public
const tileUrl = computed(() => props.tileUrl ?? mapTileUrl)
const attribution = computed(() => props.attribution ?? mapAttribution)
const filtersVisible = ref(true)
const hasFilters = computed(() => Boolean(slots.filters))

const container = useTemplateRef<HTMLDivElement>('container')
const leafletLoaded = ref(false)
const map = shallowRef<LeafletMap | null>(null)

provide(BASE_MAP_KEY, map)

let resizeObserver: ResizeObserver | undefined
let unmounted = false

onMounted(async () => {
  await loadLeaflet()
  if (!unmounted) leafletLoaded.value = true
})

function onReady(instance: LeafletMap) {
  if (unmounted) return
  map.value = instance

  if (container.value) {
    resizeObserver = new ResizeObserver(() => instance.invalidateSize())
    resizeObserver.observe(container.value)
  }

  emit('ready', instance)
}

// `<LMap>` removes the Leaflet map before its children unmount, so the map is released here
// first: children watching it (`flush: 'sync'`) tear down their controls while it is still alive.
onBeforeUnmount(() => {
  unmounted = true
  resizeObserver?.disconnect()
  resizeObserver = undefined
  map.value = null
})

defineExpose({ map })
</script>

<template>
  <div
    ref="container"
    class="relative isolate w-full h-full overflow-hidden"
    :class="heightClass"
    role="region"
    :aria-label="t('map.ariaLabel')"
  >
    <!-- Map -->
    <LMap
      v-if="leafletLoaded"
      :zoom="props.zoom"
      :center="props.center"
      :min-zoom="props.minZoom"
      :max-zoom="props.maxZoom"
      :max-bounds="props.maxBounds ?? undefined"
      :max-bounds-viscosity="props.maxBounds ? 1 : undefined"
      :use-global-leaflet="true"
      @ready="onReady"
    >
      <LTileLayer
        :url="tileUrl"
        :attribution="attribution"
        layer-type="base"
        name="OpenStreetMap"
      />
      <!-- Draw Controls -->
      <slot
        v-if="map"
        name="draw-controls"
      />
      <!-- Filters -->
      <div
        v-if="map && hasFilters"
        class="max-w-1/2 md:max-w-1/4 absolute top-4 right-4 z-1000 flex flex-col"
      >
        <UButton
          :icon="filtersVisible ? 'i-lucide-chevron-up' : 'i-lucide-sliders-horizontal'"
          :label="filtersVisible ? t('map.filters.hide') : t('map.filters.show')"
          variant="solid"
          color="neutral"
          size="sm"
          :aria-expanded="filtersVisible"
          aria-controls="map-filters"
          class="cursor-pointer mr-0 ml-auto"
          @click="filtersVisible = !filtersVisible"
        />
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-[-8px] opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-[-8px] opacity-0"
        >
          <UCard
            v-if="filtersVisible"
            id="map-filters"
            class="pointer-events-auto mt-2 p-4 bg-default/80"
          >
            <slot name="filters" />
          </UCard>
        </Transition>
      </div>
      <!-- Area Description -->
      <div class="absolute bottom-4 left-0 px-4 z-1000 w-full">
        <slot name="area-description" />
      </div>
    </LMap>

    <!-- Loading -->
    <div
      v-else
      class="absolute inset-0 flex animate-pulse items-center justify-center text-muted text-sm"
    >
      {{ t('map.loading') }}
    </div>
  </div>
</template>
