/** Circular area of interest. Its center is the `latitude`/`longitude` filter. */
export interface CircleArea {
  lat: number
  lon: number
  radiusKm: number
}

/** Area query parameters accepted by `/detections` and `/stats/*` (a bbox or `lat` + `lon` + `radius_km`). */
export interface AreaQuery {
  bbox?: string
  lat?: number
  lon?: number
  radius_km?: number
}
