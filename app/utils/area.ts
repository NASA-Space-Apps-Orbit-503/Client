import { EL_SALVADOR_BBOX } from '~/constants/el-salvador'
import type { AreaQuery, CircleArea } from '~/types/area'

export const COORDINATE_PRECISION = 6
export const RADIUS_PRECISION = 3
const KM_PER_DEGREE_LAT = 111.32

export function roundCoordinate(value: number, precision = COORDINATE_PRECISION) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export function isPointInsideElSalvador(lat: number, lon: number) {
  return lat >= EL_SALVADOR_BBOX.south
    && lat <= EL_SALVADOR_BBOX.north
    && lon >= EL_SALVADOR_BBOX.west
    && lon <= EL_SALVADOR_BBOX.east
}

/** True when the whole circle envelope lies inside the El Salvador bounding box. */
export function isCircleInsideElSalvador({ lat, lon, radiusKm }: CircleArea) {
  const latDelta = radiusKm / KM_PER_DEGREE_LAT
  const lonDelta = radiusKm / (KM_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180))
  return isPointInsideElSalvador(lat - latDelta, lon - lonDelta)
    && isPointInsideElSalvador(lat + latDelta, lon + lonDelta)
}

export function isSameCircle(a: CircleArea | null, b: CircleArea | null) {
  if (!a || !b) return a === b
  return roundCoordinate(a.lat) === roundCoordinate(b.lat)
    && roundCoordinate(a.lon) === roundCoordinate(b.lon)
    && roundCoordinate(a.radiusKm, RADIUS_PRECISION) === roundCoordinate(b.radiusKm, RADIUS_PRECISION)
}

/** Converts the circle into the `lat` + `lon` + `radius_km` parameters accepted by the API. */
export function circleToQuery(circle: CircleArea | null): AreaQuery {
  if (!circle) return {}
  return {
    lat: roundCoordinate(circle.lat),
    lon: roundCoordinate(circle.lon),
    radius_km: roundCoordinate(circle.radiusKm, RADIUS_PRECISION)
  }
}
