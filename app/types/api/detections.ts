import type { components } from '#open-fetch-schemas/api'
import type { DateRangeQuery } from '~/types/api/date-range'
import type { ConfidenceEnum } from '~/enums/confidence.enum'
import type { DayNightEnum } from '~/enums/day-night.enum'
import type { ResponseFormatEnum } from '~/enums/response-format.enum'

export type Detection = components['schemas']['Detection']
export type NewDetection = components['schemas']['NewDetection']
export type DetectionBulkCreated = components['schemas']['DetectionBulkCreated']
export type DetectionPage = components['schemas']['DetectionPage']
export type ImportResult = components['schemas']['ImportResult']

interface DetectionFilterQuery {
  bbox?: string
  lat?: number
  lon?: number
  radius_km?: number
  polygon?: string
  instrument?: string
  satellite?: string
  min_confidence?: `${ConfidenceEnum}`
  daynight?: `${DayNightEnum}`
  limit?: number
  offset?: number
  format?: `${ResponseFormatEnum}`
}

export type DetectionQuery = DetectionFilterQuery & DateRangeQuery

export interface ImportDetectionsCsvQuery {
  instrument?: string
  skip_invalid?: boolean
  /** Recompute the harmonized series when rows change (default true). */
  harmonize?: boolean
}
