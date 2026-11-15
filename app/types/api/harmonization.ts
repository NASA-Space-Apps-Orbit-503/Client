import type { components } from '#open-fetch-schemas/api'
import type { DateRangeQuery } from '~/types/api/date-range'

export type HarmonizationRun = components['schemas']['HarmonizationRun']
export type HarmonizationParams = components['schemas']['HarmonizationParams']
export type HarmonizationStatus = components['schemas']['HarmonizationStatus']
export type HarmonizationFactor = components['schemas']['HarmonizationFactor']
export type HarmonizationValidationYear = components['schemas']['HarmonizationValidationYear']
export type HarmonizationReport = components['schemas']['HarmonizationReport']
export type HarmonizedMonth = components['schemas']['HarmonizedMonth']
export type HarmonizedSeries = components['schemas']['HarmonizedSeries']
export type HarmonizedAnomalyLevel = components['schemas']['HarmonizedAnomalyLevel']

/** Dates select whole months: the month of `startDate` through the month of `endDate`. */
export type HarmonizedSeriesQuery = DateRangeQuery & {
  /** Only complete months. */
  complete?: boolean
}
