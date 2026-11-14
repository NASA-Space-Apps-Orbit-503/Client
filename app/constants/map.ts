import type { InjectionKey, ShallowRef } from 'vue'
import type { Map as LeafletMap } from 'leaflet'

/** Provided by `<BaseMap />` so child controls and layers can reach the Leaflet map instance. */
export const BASE_MAP_KEY: InjectionKey<Readonly<ShallowRef<LeafletMap | null>>> = Symbol('base-map')

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'

export const AREA_SHAPE_OPTIONS = {
  color: '#00A155',
  weight: 2,
  fillColor: '#00C16A',
  fillOpacity: 0.15
} as const
