import type { DateValue } from '@internationalized/date'
import type { SatelliteEnum } from '~/enums/satellite.enum'

export interface DateRangeInput {
  start: DateValue | undefined
  end: DateValue | undefined
}

export interface Filters {
  dateRange: DateRangeInput
  instruments: string[]
  satellites: SatelliteEnum[]
  latitude: number | null
  longitude: number | null
  /** Radius of the circle drawn on the map. Only applied together with `latitude`/`longitude`. */
  radiusKm: number | null
}
