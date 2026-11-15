/**
 * Geographic limits used to keep the map, geocoding and drawn areas inside El Salvador.
 * The box is slightly padded around the national boundary so coastal and border areas fit.
 */
export const EL_SALVADOR_COUNTRY_CODE = 'sv'

export const EL_SALVADOR_BBOX = {
  west: -90.2,
  south: 13.1,
  east: -87.6,
  north: 14.5
} as const

export const EL_SALVADOR_CENTER: [number, number] = [13.79, -88.9]

export const EL_SALVADOR_DEFAULT_ZOOM = 8

export const EL_SALVADOR_MIN_ZOOM = 8

/** Leaflet `[[south, west], [north, east]]` bounds. */
export const EL_SALVADOR_BOUNDS: [[number, number], [number, number]] = [
  [EL_SALVADOR_BBOX.south, EL_SALVADOR_BBOX.west],
  [EL_SALVADOR_BBOX.north, EL_SALVADOR_BBOX.east]
]
