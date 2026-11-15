import type { DateValue } from '@internationalized/date'

export interface DateRangeInput {
  start: DateValue | undefined
  end: DateValue | undefined
}

/** Area of interest as [west, south, east, north] in decimal degrees. */
export type Bbox = [number, number, number, number]

export interface Filters {
  dateRange: DateRangeInput
  instruments: string[]
  satellites: string[]
  latitude: number | null
  longitude: number | null
  /** Radius of the circle drawn on the map. Only applied together with `latitude`/`longitude`. */
  radiusKm: number | null
}
